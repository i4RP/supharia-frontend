<template>
    <div class="fixed inset-0 top-0 flex flex-col" style="background: #120e23">
        <!-- Game Canvas -->
        <canvas
            ref="game_canvas"
            class="w-full flex-1 cursor-crosshair"
            @click="handleClick"
        />

        <!-- HUD Overlay (top left) -->
        <div class="absolute top-2 left-4 flex items-center gap-4 text-sm font-mono">
            <span class="text-white/60">
                Price:
                <span class="text-white font-bold">${{ game_store.current_price.toFixed(2) }}</span>
            </span>
            <span class="text-white/60">
                Balance:
                <span class="text-[#ffdf3d] font-bold">${{ game_store.balance.toFixed(0) }}</span>
            </span>
            <span :class="game_store.is_connected ? 'text-green-400' : 'text-red-400'">
                {{ game_store.is_connected ? "LIVE" : "OFFLINE" }}
            </span>
        </div>

        <!-- Controls (top right) -->
        <div class="absolute top-2 right-4 flex items-center gap-2">
            <span
                class="px-2 py-1 rounded-lg text-xs font-mono"
                style="background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2)"
            >
                PRACTICE
            </span>
            <NuxtLink
                to="/game"
                class="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-xs font-mono hover:bg-white/20 transition-colors"
            >
                BACK
            </NuxtLink>
            <button
                class="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-xs font-mono hover:bg-white/20 transition-colors"
                @click="resetAndRestart"
            >
                RESET
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: "game",
})

const game_canvas = useTemplateRef<HTMLCanvasElement>("game_canvas")
const game_store = useGameStoreC()
const { connect, disconnect } = useGameStreamC()
const { start, stop, handleClick, handleResize } = useGameCanvasC(game_canvas)

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
