/** Monster system constants */
import type { MonsterTemplate, MonsterElement } from "~/types/monster"

export const MONSTER_MAX_LEVEL = 99

/** Level-up multiplier for stats: stats = base_stats * (1 + (level-1) * LEVEL_SCALE) */
export const MONSTER_LEVEL_SCALE = 0.02 // +2% per level

/** Fusion: merging same monster gives 1-3 level ups based on source stats */
export const FUSION_MIN_LEVELS = 1
export const FUSION_MAX_LEVELS = 3

/** Gacha cost in magic stones */
export const GACHA_COST_STONES = 5

/** XP system constants */
export const XP_PER_TAP = 10          // base XP for placing a bet
export const XP_WIN_BONUS = 25         // bonus XP for winning
export const XP_HIGH_MULT_BONUS = 15   // bonus XP for winning at 3x+ multiplier

/** XP needed to reach the next level from current level */
export function xpToNextLevel(level: number): number {
    return level * 100
}

/** Total XP needed from level 1 to reach target level */
export function totalXpForLevel(target_level: number): number {
    let total = 0
    for (let l = 1; l < target_level; l++) total += xpToNextLevel(l)
    return total
}

/** Box multiplier bonus per level: base 1.01x, increases with level */
export function getBoxMultiplier(level: number): number {
    return 1.0 + level * 0.01
}

/** Dragon max HP (wins needed to defeat) */
export const DRAGON_MAX_HP = 20

/** Available bet tiers */
export const BET_TIERS: MonsterElement[] = [1, 5, 20]

/** Initial monsters - one per tier */
export const INITIAL_MONSTERS: MonsterTemplate[] = [
    {
        id: "radon",
        name: "Radon",
        element: 20,
        base_stats: {
            recovery: 350,
            power: 1807,
            luck: 280,
        },
        skill: {
            name: "Mega Blast",
            description: "10 sec: ATK x2",
            duration_ms: 10000,
            multiplier: 2.0,
        },
        leader_skill: {
            name: "Combo Master",
            description: "Combo +ATK up",
        },
        icon_emoji: "\uD83D\uDC32", // dragon
    },
    {
        id: "wave",
        name: "Wave",
        element: 5,
        base_stats: {
            recovery: 230,
            power: 1200,
            luck: 350,
        },
        skill: {
            name: "Tidal Surge",
            description: "8 sec: ATK x1.5",
            duration_ms: 8000,
            multiplier: 1.5,
        },
        leader_skill: {
            name: "Lucky Tide",
            description: "Drop rate +15%",
        },
        icon_emoji: "\uD83C\uDF0A", // wave
    },
    {
        id: "pino_dragon",
        name: "Pino Dragon",
        element: 1,
        base_stats: {
            recovery: 150,
            power: 800,
            luck: 500,
        },
        skill: {
            name: "Tiny Flame",
            description: "5 sec: ATK x1.3",
            duration_ms: 5000,
            multiplier: 1.3,
        },
        leader_skill: {
            name: "Fortune Seeker",
            description: "Bonus panel +20%",
        },
        icon_emoji: "\uD83D\uDC23", // hatching chick
    },
]

/** Get monster template by ID */
export function getMonsterTemplate(id: string): MonsterTemplate | undefined {
    return INITIAL_MONSTERS.find(m => m.id === id)
}

/** Calculate stats for a monster at a given level */
export function calculateMonsterStats(base: MonsterTemplate["base_stats"], level: number): MonsterTemplate["base_stats"] {
    const scale = 1 + (level - 1) * MONSTER_LEVEL_SCALE
    return {
        recovery: Math.min(9999, Math.round(base.recovery * scale)),
        power: Math.min(9999, Math.round(base.power * scale)),
        luck: Math.min(9999, Math.round(base.luck * scale)),
    }
}

/** Calculate fusion level gain based on source monster stats */
export function calculateFusionLevels(source_power: number): number {
    // Higher power = more levels gained
    if (source_power >= 5000) return FUSION_MAX_LEVELS
    if (source_power >= 2000) return 2
    return FUSION_MIN_LEVELS
}
