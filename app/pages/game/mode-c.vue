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

            <!-- Monster Box -->
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background: rgba(5,13,26,0.9); border: 1px solid rgba(0,212,255,0.3)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18" /><circle cx="12" cy="7.5" r="1.5" fill="#00D4FF" /></svg>
                <span class="text-[10px] font-mono" style="color: #00D4FF">MONSTER BOX</span>
                <span class="text-white font-bold text-sm font-mono">${{ bet_cost }}</span>
            </div>
        </div>

        <!-- Bottom nav is in parent game.vue -->
    </div>
</template>

<script setup lang="ts">
import { GAME_C_BALANCE } from "~/constants/game_c"

const game_canvas = useTemplateRef<HTMLCanvasElement>("game_canvas")
const game_store = useGameStoreC()
const { connect, disconnect } = useGameStreamC()
const { start, stop, handleClick, handleResize } = useGameCanvasC(game_canvas)
const bet_cost = GAME_C_BALANCE.BET_COST

// Ender Dragon HP: starts at 100%, decreases with each win
const DRAGON_MAX_HP = 20 // wins needed to defeat
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
