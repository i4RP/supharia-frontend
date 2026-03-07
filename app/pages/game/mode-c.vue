<template>
    <div class="fixed inset-0 top-0 flex flex-col" style="background: #1a0a14">
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
                    <NuxtLink to="/game" class="p-1 text-white/60 hover:text-white transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </NuxtLink>
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

        <!-- Bottom Nav Bar -->
        <div class="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom,8px)]" style="background: rgba(20,8,16,0.95); border-top: 1px solid rgba(212,96,154,0.2)">
            <button class="flex flex-col items-center gap-0.5 p-2 rounded-xl" style="background: rgba(255,105,180,0.15)">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff69b4" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </button>
            <NuxtLink to="/game" class="flex flex-col items-center gap-0.5 p-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            </NuxtLink>
            <NuxtLink to="/game" class="flex flex-col items-center gap-0.5 p-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { GAME_C_BALANCE } from "~/constants/game_c"

definePageMeta({
    layout: "game",
})

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
    connect()
    nextTick(() => {
        start()
    })
    window.addEventListener("resize", handleResize)
})

onUnmounted(() => {
    stop()
    disconnect()
    window.removeEventListener("resize", handleResize)
})
</script>
