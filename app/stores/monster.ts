import { defineStore } from "pinia"
import type { MonsterElement, MonsterInstance, Egg, MonsterBoxState } from "~/types/monster"
import {
    INITIAL_MONSTERS,
    MONSTER_MAX_LEVEL,
    calculateMonsterStats,
    calculateFusionLevels,
    getMonsterTemplate,
    getBoxMultiplier,
    GACHA_COST_STONES,
    BET_TIERS,
} from "~/constants/monsters"

const STORAGE_KEY = "mpara_monster_box"

function createDefaultState(): MonsterBoxState {
    return {
        selected_tier: 5,
        monsters: INITIAL_MONSTERS.map(t => ({
            template_id: t.id,
            level: 1,
            stats: { ...t.base_stats },
            obtained_at: Date.now(),
        })),
        eggs: [],
        magic_stones: 0,
        equipped: {
            1: "pino_dragon",
            5: "wave",
            20: "radon",
        } as Record<MonsterElement, string | null>,
    }
}

function loadFromStorage(): MonsterBoxState {
    if (typeof window === "undefined") return createDefaultState()
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw) as MonsterBoxState
            // Ensure all tiers have defaults
            for (const tier of BET_TIERS) {
                if (parsed.equipped[tier] === undefined) {
                    parsed.equipped[tier] = null
                }
            }
            return parsed
        }
    } catch { /* ignore */ }
    return createDefaultState()
}

function saveToStorage(state: MonsterBoxState) {
    if (typeof window === "undefined") return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* ignore */ }
}

export const useMonsterStore = defineStore("monster", () => {
    const box_state = ref<MonsterBoxState>(loadFromStorage())

    // Persist on every change
    watch(box_state, (val) => saveToStorage(val), { deep: true })

    // ============ Getters ============

    const selected_tier = computed(() => box_state.value.selected_tier)
    const monsters = computed(() => box_state.value.monsters)
    const eggs = computed(() => box_state.value.eggs)
    const magic_stones = computed(() => box_state.value.magic_stones)
    const equipped = computed(() => box_state.value.equipped)

    /** Get the bet cost based on selected tier */
    const bet_cost = computed(() => box_state.value.selected_tier)

    /** Get the currently equipped monster for the selected tier */
    const active_monster = computed(() => {
        const tid = box_state.value.equipped[box_state.value.selected_tier]
        if (!tid) return null
        return box_state.value.monsters.find(m => m.template_id === tid) ?? null
    })

    /** Get the template for active monster */
    const active_template = computed(() => {
        if (!active_monster.value) return null
        return getMonsterTemplate(active_monster.value.template_id) ?? null
    })

    /** Box multiplier based on active monster level */
    const box_multiplier = computed(() => {
        if (!active_monster.value) return 1.0
        return getBoxMultiplier(active_monster.value.level)
    })

    /** Get monsters for a specific tier */
    function getMonstersForTier(tier: MonsterElement): (MonsterInstance & { template_name: string; icon: string })[] {
        return box_state.value.monsters
            .filter(m => {
                const t = getMonsterTemplate(m.template_id)
                return t && t.element === tier
            })
            .map(m => {
                const t = getMonsterTemplate(m.template_id)!
                return { ...m, template_name: t.name, icon: t.icon_emoji }
            })
    }

    /** Get all unrevealed eggs */
    const unrevealed_eggs = computed(() => box_state.value.eggs.filter(e => !e.revealed))

    // ============ Actions ============

    function selectTier(tier: MonsterElement) {
        box_state.value.selected_tier = tier
    }

    function equipMonster(tier: MonsterElement, template_id: string) {
        box_state.value.equipped[tier] = template_id
    }

    function addMagicStones(count: number) {
        box_state.value.magic_stones += count
    }

    function addEgg(rarity: Egg["rarity"]) {
        box_state.value.eggs.push({
            id: `egg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            rarity,
            obtained_at: Date.now(),
            revealed: false,
        })
    }

    /** Reveal an egg - returns the monster template_id */
    function revealEgg(egg_id: string): string | null {
        const egg = box_state.value.eggs.find(e => e.id === egg_id)
        if (!egg || egg.revealed) return null

        // Determine which monster based on rarity
        const pool = INITIAL_MONSTERS // For now, gacha pool = initial monsters
        const idx = Math.floor(Math.random() * pool.length)
        const template = pool[idx]

        egg.revealed = true
        egg.monster_id = template.id

        // Add monster instance
        box_state.value.monsters.push({
            template_id: template.id,
            level: 1,
            stats: { ...template.base_stats },
            obtained_at: Date.now(),
        })

        return template.id
    }

    /** Spend magic stones for gacha */
    function pullGacha(): string | null {
        if (box_state.value.magic_stones < GACHA_COST_STONES) return null
        box_state.value.magic_stones -= GACHA_COST_STONES

        // Gacha gives an egg
        const roll = Math.random()
        const rarity: Egg["rarity"] = roll < 0.05 ? "legendary" : roll < 0.25 ? "rare" : "common"
        addEgg(rarity)

        return box_state.value.eggs[box_state.value.eggs.length - 1].id
    }

    /** Fuse two same-template monsters (level up the target, remove the source) */
    function fuseMonsters(target_idx: number, source_idx: number): boolean {
        const monsters_list = box_state.value.monsters
        if (target_idx === source_idx) return false
        if (target_idx >= monsters_list.length || source_idx >= monsters_list.length) return false

        const target = monsters_list[target_idx]
        const source = monsters_list[source_idx]
        if (target.template_id !== source.template_id) return false
        if (target.level >= MONSTER_MAX_LEVEL) return false

        const levels_gained = calculateFusionLevels(source.stats.power)
        const new_level = Math.min(MONSTER_MAX_LEVEL, target.level + levels_gained)
        const template = getMonsterTemplate(target.template_id)
        if (!template) return false

        target.level = new_level
        target.stats = calculateMonsterStats(template.base_stats, new_level)

        // Remove source monster
        box_state.value.monsters.splice(source_idx, 1)

        return true
    }

    /** Award magic stones + chance for egg drop on boss defeat */
    function onBossDefeat() {
        // Award 3 magic stones
        addMagicStones(3)

        // 30% chance to drop an egg
        if (Math.random() < 0.3) {
            const roll = Math.random()
            const rarity: Egg["rarity"] = roll < 0.03 ? "legendary" : roll < 0.2 ? "rare" : "common"
            addEgg(rarity)
            return { stones: 3, egg_rarity: rarity }
        }
        return { stones: 3, egg_rarity: null }
    }

    return {
        // State
        box_state,
        // Getters
        selected_tier,
        monsters,
        eggs,
        magic_stones,
        equipped,
        bet_cost,
        active_monster,
        active_template,
        box_multiplier,
        unrevealed_eggs,
        // Methods
        selectTier,
        equipMonster,
        addMagicStones,
        addEgg,
        revealEgg,
        pullGacha,
        fuseMonsters,
        onBossDefeat,
        getMonstersForTier,
    }
})
