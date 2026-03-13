/** Monster system types */

export type MonsterElement = 1 | 5 | 20 // Dollar tier the monster can be used for

export interface MonsterSkill {
    name: string
    description: string
    duration_ms?: number // e.g. 10000 for "10 seconds"
    multiplier?: number  // e.g. 2.0 for "2x attack"
}

export interface MonsterLeaderSkill {
    name: string
    description: string
}

export interface MonsterStats {
    recovery: number   // 0-9999: partial bet refund on failed panels
    power: number      // 0-9999: boss attack efficiency
    luck: number       // 0-9999: drop rate & bonus panel appearance
}

export interface MonsterTemplate {
    id: string
    name: string
    element: MonsterElement
    base_stats: MonsterStats
    skill: MonsterSkill
    leader_skill: MonsterLeaderSkill
    icon_emoji: string // placeholder until real art
}

export interface MonsterInstance {
    template_id: string
    level: number       // 1-99
    xp: number          // current XP within this level
    stats: MonsterStats // scaled by level
    obtained_at: number // timestamp
}

export type EggRarity = "common" | "rare" | "legendary"

export interface Egg {
    id: string
    rarity: EggRarity
    obtained_at: number
    revealed: boolean
    monster_id?: string // set after reveal
}

export interface MonsterBoxState {
    selected_tier: MonsterElement
    monsters: MonsterInstance[]
    eggs: Egg[]
    magic_stones: number
    equipped: Record<MonsterElement, string | null> // template_id per tier
    /** Accumulated training tap counts per monster (from auto-learning) */
    training_taps: Record<string, number>
}
