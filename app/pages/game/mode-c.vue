<template>
    <div class="absolute inset-0 top-0 flex flex-col" style="background: #1a0a14">
        <!-- Top Bar -->
        <div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 pt-[env(safe-area-inset-top,8px)] pb-1">
            <!-- ETH Price Pill -->
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full" style="background: rgba(30,15,25,0.9); border: 1px solid rgba(212,96,154,0.3)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="9" fill="#627EEA" />
                    <path d="M9 2.5L9 7.5L13 9L9 2.5Z" fill="#C0CBF6" />
                    <path d="M9 2.5L5 9L9 7.5V2.5Z" fill="white" />
                    <path d="M9 12.5L13 9.5L9 11V12.5Z" fill="#C0CBF6" />
                    <path d="M9 12.5V11L5 9.5L9 12.5Z" fill="white" />
                    <path d="M9 15.5L13 10L9 12V15.5Z" fill="#8A99CC" />
                    <path d="M9 15.5V12L5 10L9 15.5Z" fill="#B8C8EF" />
                </svg>
                <span class="text-white font-bold text-sm font-mono">${{ game_store.current_price.toFixed(2) }}</span>
            </div>

            <!-- Right: Status + Icons -->
            <div class="flex items-center gap-2">
                <span
                    :class="game_store.is_connected ? 'text-green-400' : 'text-red-400'"
                    class="text-xs font-mono"
                >
                    {{ game_store.is_connected ? "LIVE" : "OFFLINE" }}
                </span>
                <div class="flex items-center gap-1 px-2 py-1.5 rounded-full" style="background: rgba(30,15,25,0.9); border: 1px solid rgba(212,96,154,0.3)">
                    <button class="p-1 text-white/60 hover:text-white transition-colors" @click="resetAndRestart">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Game Canvas -->
        <canvas
            ref="game_canvas"
            class="w-full flex-1 cursor-crosshair"
            style="margin-top: 44px; margin-bottom: 100px"
            @click="handleClick"
        />

        <!-- Bottom Controls -->
        <div class="absolute bottom-[52px] left-0 right-0 z-10 flex items-center justify-between px-3 pb-1">
            <!-- Balance Pill -->
            <div class="flex items-center gap-2 px-4 py-2 rounded-full" style="background: rgba(30,15,25,0.9); border: 1px solid rgba(212,96,154,0.3)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff69b4" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 10H18a2 2 0 0 0 0 4h4" /></svg>
                <span class="text-white font-bold text-sm font-mono">${{ game_store.balance.toFixed(2) }}</span>
            </div>

            <!-- Bet Cost Pill -->
            <div class="flex items-center gap-2 px-4 py-2 rounded-full" style="background: rgba(30,15,25,0.9); border: 1px solid rgba(212,96,154,0.3)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff69b4" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 10h8M8 14h8" /></svg>
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

function resetAndRestart() {
    stop()
    disconnect()
    game_store.resetGame()
    connect()
    nextTick(() => {
        start()
    })
}

onMounted(() => {
    // Restore balance from on-chain + pending results
    game_store.loadBalance()
    // Start batch settlement timer (flushes results every 5s)
    game_store.startSettlement()
    connect()
    nextTick(() => {
        start()
    })
    window.addEventListener("resize", handleResize)
})

onUnmounted(() => {
    stop()
    disconnect()
    // Stop batch settlement and flush remaining results
    game_store.stopSettlement()
    window.removeEventListener("resize", handleResize)
})
</script>
