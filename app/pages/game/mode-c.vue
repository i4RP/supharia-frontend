<template>
    <div class="absolute inset-0 top-0 flex flex-col" style="background: #03080F">
        <!-- Top Bar: Ender Dragon HP + Status -->
        <div class="absolute top-0 left-0 right-0 z-10 px-3 pt-[env(safe-area-inset-top,8px)] pb-1">
            <div class="flex items-center gap-2">
                <!-- Dragon Icon + Name -->
                <div class="flex items-center gap-1.5 flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                        <path d="M18 6L8 14L11 26H25L28 14L18 6Z" stroke="#ef4444" stroke-width="1.5" fill="rgba(239,68,68,0.15)" />
                        <circle cx="14" cy="15" r="1.5" fill="#ef4444" />
                        <circle cx="22" cy="15" r="1.5" fill="#ef4444" />
                    </svg>
                    <span class="text-white font-bold text-xs">Ender Dragon</span>
                </div>

                <!-- HP Bar -->
                <div class="flex-1 h-5 rounded-full overflow-hidden relative" style="background: rgba(5,13,26,0.9); border: 1px solid rgba(239,68,68,0.3)">
                    <div
                        class="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                        :style="{
                            width: dragon_hp_pct + '%',
                            background: dragon_hp_pct > 50 ? 'linear-gradient(90deg, #ef4444, #f97316)' : dragon_hp_pct > 20 ? 'linear-gradient(90deg, #f97316, #eab308)' : 'linear-gradient(90deg, #eab308, #22c55e)',
                        }"
                    />
                    <span class="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold font-mono z-10">
                        HP {{ dragon_hp_pct.toFixed(0) }}%
                    </span>
                </div>

                <!-- Status + Reset -->
                <div class="flex items-center gap-1.5 flex-shrink-0">
                    <span
                        :class="game_store.is_connected ? 'text-green-400' : 'text-red-400'"
                        class="text-[10px] font-mono"
                    >
                        {{ game_store.is_connected ? "LIVE" : "OFF" }}
                    </span>
                    <button class="p-1 text-white/60 hover:text-white transition-colors" @click="resetAndRestart">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Game Canvas (Battle Field) -->
        <canvas
            ref="game_canvas"
            class="w-full flex-1 cursor-crosshair"
            style="margin-top: 44px; margin-bottom: 100px"
            @click="handleClick"
        />

        <!-- Ender Strike flash overlay -->
        <div
            v-if="show_strike"
            class="absolute inset-0 z-20 pointer-events-none"
            :style="{ background: strike_color, transition: 'opacity 0.3s' }"
        />

        <!-- Bottom Controls: Monster Box -->
        <div class="absolute bottom-[52px] left-0 right-0 z-10 flex items-center justify-between px-3 pb-1">
            <!-- Game Score -->
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full" style="background: rgba(5,13,26,0.9); border: 1px solid rgba(27,141,255,0.3)">
                <span class="text-[10px] font-mono" style="color: #7A8AA0">SCORE</span>
                <span class="text-white font-bold text-sm font-mono">${{ game_store.balance.toFixed(0) }}</span>
            </div>

            <!-- Monster Box (tappable) -->
            <button
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style="background: rgba(5,13,26,0.9); border: 1px solid rgba(0,212,255,0.3)"
                @click="show_monster_box = true"
            >
                <span class="text-base">{{ active_icon }}</span>
                <span class="text-[10px] font-mono" style="color: #00D4FF">MONSTER BOX</span>
                <span class="text-white font-bold text-sm font-mono">${{ monster_store.bet_cost }}</span>
            </button>
        </div>

        <!-- Monster Box Modal -->
        <Teleport to="body">
            <div
                v-if="show_monster_box"
                class="fixed inset-0 z-[100] flex items-end justify-center"
                @click.self="show_monster_box = false"
            >
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/60" @click="show_monster_box = false" />

                <!-- Modal Panel -->
                <div
                    class="relative w-full max-w-[420px] rounded-t-2xl overflow-hidden"
                    style="background: #0A1628; border: 1px solid rgba(0,212,255,0.2); border-bottom: none; max-height: 70vh"
                >
                    <!-- Header -->
                    <div class="flex items-center justify-between px-4 py-3" style="border-bottom: 1px solid rgba(0,212,255,0.15)">
                        <div class="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18" /><circle cx="12" cy="7.5" r="1.5" fill="#00D4FF" /></svg>
                            <span class="text-sm font-bold font-mono" style="color: #00D4FF">MONSTER BOX</span>
                        </div>
                        <button class="p-1" @click="show_monster_box = false">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>

                    <!-- Tier Tabs -->
                    <div class="flex px-4 pt-3 gap-2">
                        <button
                            v-for="tier in tiers"
                            :key="tier"
                            class="flex-1 py-2 rounded-lg text-center font-mono font-bold text-sm transition-all"
                            :style="monster_store.selected_tier === tier
                                ? 'background: rgba(0,212,255,0.2); border: 1px solid rgba(0,212,255,0.5); color: #00D4FF'
                                : 'background: rgba(5,13,26,0.8); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4)'"
                            @click="monster_store.selectTier(tier)"
                        >
                            ${{ tier }}
                        </button>
                    </div>

                    <!-- Monster Card for Selected Tier -->
                    <div class="px-4 py-3">
                        <div
                            v-if="tier_monster"
                            class="rounded-xl p-4"
                            style="background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.2)"
                        >
                            <!-- Monster Header -->
                            <div class="flex items-center gap-3 mb-3">
                                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3)">
                                    {{ tier_template?.icon_emoji }}
                                </div>
                                <div class="flex-1">
                                    <div class="text-white font-bold font-mono text-sm">{{ tier_template?.name }}</div>
                                    <div class="flex items-center gap-2 mt-0.5">
                                        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded" style="background: rgba(0,212,255,0.15); color: #00D4FF">Lv.{{ tier_monster.level }}</span>
                                        <span class="text-[10px] font-mono" style="color: rgba(255,255,255,0.35)">${{ monster_store.selected_tier }} tier</span>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-[10px] font-mono" style="color: rgba(255,255,255,0.35)">BOX MULT</div>
                                    <div class="text-sm font-bold font-mono" style="color: #00D4FF">x{{ monster_store.box_multiplier.toFixed(2) }}</div>
                                </div>
                            </div>

                            <!-- Stats Grid -->
                            <div class="grid grid-cols-3 gap-2 mb-3">
                                <div class="rounded-lg p-2 text-center" style="background: rgba(0,0,0,0.3)">
                                    <div class="text-[8px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">POWER</div>
                                    <div class="text-xs font-bold font-mono" style="color: #ef4444">{{ tier_monster.stats.power }}</div>
                                </div>
                                <div class="rounded-lg p-2 text-center" style="background: rgba(0,0,0,0.3)">
                                    <div class="text-[8px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">RECOVERY</div>
                                    <div class="text-xs font-bold font-mono" style="color: #22c55e">{{ tier_monster.stats.recovery }}</div>
                                </div>
                                <div class="rounded-lg p-2 text-center" style="background: rgba(0,0,0,0.3)">
                                    <div class="text-[8px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">LUCK</div>
                                    <div class="text-xs font-bold font-mono" style="color: #eab308">{{ tier_monster.stats.luck }}</div>
                                </div>
                            </div>

                            <!-- Skills -->
                            <div class="flex gap-2">
                                <div class="flex-1 rounded-lg p-2" style="background: rgba(0,0,0,0.3)">
                                    <div class="text-[8px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">SKILL</div>
                                    <div class="text-[10px] font-mono mt-0.5" style="color: #E0EEFF">{{ tier_template?.skill.name }}</div>
                                    <div class="text-[9px] font-mono" style="color: rgba(255,255,255,0.3)">{{ tier_template?.skill.description }}</div>
                                </div>
                                <div class="flex-1 rounded-lg p-2" style="background: rgba(0,0,0,0.3)">
                                    <div class="text-[8px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">LEADER</div>
                                    <div class="text-[10px] font-mono mt-0.5" style="color: #E0EEFF">{{ tier_template?.leader_skill.name }}</div>
                                    <div class="text-[9px] font-mono" style="color: rgba(255,255,255,0.3)">{{ tier_template?.leader_skill.description }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- No monster for this tier -->
                        <div v-else class="rounded-xl p-6 text-center" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1)">
                            <div class="text-2xl mb-2">?</div>
                            <div class="text-[11px] font-mono" style="color: rgba(255,255,255,0.35)">No monster for this tier</div>
                        </div>
                    </div>

                    <!-- Magic Stones + Eggs -->
                    <div class="px-4 pb-3 flex gap-3">
                        <div class="flex-1 rounded-lg p-2 flex items-center gap-2" style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.25)">
                            <span class="text-base">&#x1F48E;</span>
                            <div>
                                <div class="text-[8px] font-mono" style="color: rgba(255,255,255,0.35)">MAGIC STONES</div>
                                <div class="text-sm font-bold font-mono" style="color: #a855f7">{{ monster_store.magic_stones }}</div>
                            </div>
                        </div>
                        <div class="flex-1 rounded-lg p-2 flex items-center gap-2" style="background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.25)">
                            <span class="text-base">&#x1F95A;</span>
                            <div>
                                <div class="text-[8px] font-mono" style="color: rgba(255,255,255,0.35)">EGGS</div>
                                <div class="text-sm font-bold font-mono" style="color: #eab308">{{ monster_store.unrevealed_eggs.length }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Select Button -->
                    <div class="px-4 pb-4">
                        <button
                            class="w-full py-3 rounded-xl font-bold font-mono text-sm tracking-wider"
                            style="background: linear-gradient(135deg, rgba(0,212,255,0.3), rgba(27,141,255,0.3)); border: 1px solid rgba(0,212,255,0.4); color: #00D4FF"
                            @click="show_monster_box = false"
                        >
                            BATTLE WITH ${{ monster_store.bet_cost }} BET
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Bottom nav is in parent game.vue -->
    </div>
</template>

<script setup lang="ts">
import type { MonsterElement } from "~/types/monster"
import { DRAGON_MAX_HP, getMonsterTemplate } from "~/constants/monsters"

const game_canvas = useTemplateRef<HTMLCanvasElement>("game_canvas")
const game_store = useGameStoreC()
const monster_store = useMonsterStore()
const { connect, disconnect } = useGameStreamC()
const { start, stop, handleClick, handleResize } = useGameCanvasC(game_canvas)

const show_monster_box = ref(false)
const tiers: MonsterElement[] = [20, 5, 1]

// Get monster info for the currently selected tier
const tier_monster = computed(() => {
    const tid = monster_store.equipped[monster_store.selected_tier]
    if (!tid) return null
    return monster_store.monsters.find(m => m.template_id === tid) ?? null
})

const tier_template = computed(() => {
    if (!tier_monster.value) return null
    return getMonsterTemplate(tier_monster.value.template_id) ?? null
})

const active_icon = computed(() => {
    const t = monster_store.active_template
    return t ? t.icon_emoji : "?"
})

// Ender Dragon HP: starts at 100%, decreases with each win
const dragon_hp_pct = computed(() => {
    const hits = game_store.session_stats.wins
    const hp = Math.max(0, DRAGON_MAX_HP - hits)
    return (hp / DRAGON_MAX_HP) * 100
})

// Flash overlay on strike
const show_strike = ref(false)
const strike_color = ref("rgba(34,197,94,0.15)")
let last_wins = 0
let last_losses = 0

watch(() => game_store.session_stats.wins, (val) => {
    if (val > last_wins) {
        strike_color.value = "rgba(34,197,94,0.15)"
        show_strike.value = true
        setTimeout(() => { show_strike.value = false }, 300)

        // Check if dragon defeated
        const hp_remaining = DRAGON_MAX_HP - val
        if (hp_remaining <= 0 && DRAGON_MAX_HP - last_wins > 0) {
            monster_store.onBossDefeat()
        }
    }
    last_wins = val
})

watch(() => game_store.session_stats.losses, (val) => {
    if (val > last_losses) {
        strike_color.value = "rgba(239,68,68,0.08)"
        show_strike.value = true
        setTimeout(() => { show_strike.value = false }, 200)
    }
    last_losses = val
})

function resetAndRestart() {
    stop()
    disconnect()
    game_store.resetGame()
    last_wins = 0
    last_losses = 0
    connect()
    nextTick(() => {
        start()
    })
}

onMounted(() => {
    game_store.loadBalance()
    game_store.startSettlement()
    last_wins = game_store.session_stats.wins
    last_losses = game_store.session_stats.losses
    connect()
    nextTick(() => {
        start()
    })
    window.addEventListener("resize", handleResize)
})

onUnmounted(() => {
    stop()
    disconnect()
    game_store.stopSettlement()
    window.removeEventListener("resize", handleResize)
})
</script>
