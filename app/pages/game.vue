<template>
    <div class="fixed inset-0 flex flex-col" style="background: #03080F">
        <NuxtPage />

        <!-- Shared Bottom Nav Bar -->
        <div
            class="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
            style="background: rgba(3,8,15,0.95); border-top: 1px solid rgba(27,141,255,0.2); padding-bottom: env(safe-area-inset-bottom, 8px)"
        >
            <!-- Chart (Game) -->
            <NuxtLink
                to="/game/mode-c"
                class="nav-btn flex-1 flex items-center justify-center py-4"
                :class="{ 'nav-active': isGameRoute, 'nav-tapped': tapped === 'game' }"
                @pointerdown="flashTap('game')"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="isGameRoute || tapped === 'game' ? '#1B8DFF' : 'rgba(255,255,255,0.4)'" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </NuxtLink>

            <!-- Star (Ranking) -->
            <NuxtLink
                to="/game/ranking"
                class="nav-btn flex-1 flex items-center justify-center py-4"
                :class="{ 'nav-active': isRankingRoute, 'nav-tapped': tapped === 'ranking' }"
                @pointerdown="flashTap('ranking')"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="isRankingRoute || tapped === 'ranking' ? '#1B8DFF' : 'rgba(255,255,255,0.4)'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            </NuxtLink>

            <!-- Profile (Wallet) -->
            <NuxtLink
                to="/game/wallet"
                class="nav-btn flex-1 flex items-center justify-center py-4"
                :class="{ 'nav-active': isWalletRoute, 'nav-tapped': tapped === 'wallet' }"
                @pointerdown="flashTap('wallet')"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="isWalletRoute || tapped === 'wallet' ? '#1B8DFF' : 'rgba(255,255,255,0.4)'" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: "game",
})

const route = useRoute()

const isGameRoute = computed(() => {
    const p = route.path
    return p === "/game/mode-c" || p === "/game/mode-a" || p === "/game"
})

const isRankingRoute = computed(() => route.path === "/game/ranking")

const isWalletRoute = computed(() => route.path === "/game/wallet")

// Tap flash feedback
const tapped = ref<string | null>(null)
let tapTimer: ReturnType<typeof setTimeout> | null = null

function flashTap(name: string) {
    if (tapTimer) clearTimeout(tapTimer)
    tapped.value = name
    tapTimer = setTimeout(() => { tapped.value = null }, 400)
}
</script>

<style scoped>
.nav-btn {
    background: transparent;
    transition: background 0.5s ease-out;
}
.nav-btn.nav-tapped {
    background: rgba(27, 141, 255, 0.25) !important;
    transition: background 0s;
}
.nav-btn.nav-active:not(.nav-tapped) {
    background: rgba(27, 141, 255, 0.12);
}
</style>
