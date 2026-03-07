<template>
    <div class="fixed inset-0 flex flex-col" style="background: #1a0a14">
        <NuxtPage />

        <!-- Shared Bottom Nav Bar -->
        <div
            class="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
            style="background: rgba(20,8,16,0.95); border-top: 1px solid rgba(212,96,154,0.2); padding-bottom: env(safe-area-inset-bottom, 8px)"
        >
            <!-- Chart (Game) -->
            <NuxtLink
                to="/game/mode-c"
                class="flex-1 flex items-center justify-center py-4"
                :style="isGameRoute ? 'background: rgba(255,105,180,0.12)' : ''"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="isGameRoute ? '#ff69b4' : 'rgba(255,255,255,0.4)'" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </NuxtLink>

            <!-- Star (Ranking) -->
            <NuxtLink
                to="/game/ranking"
                class="flex-1 flex items-center justify-center py-4"
                :style="isRankingRoute ? 'background: rgba(255,105,180,0.12)' : ''"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="isRankingRoute ? '#ff69b4' : 'rgba(255,255,255,0.4)'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            </NuxtLink>

            <!-- Profile (Wallet) -->
            <NuxtLink
                to="/game/wallet"
                class="flex-1 flex items-center justify-center py-4"
                :style="isWalletRoute ? 'background: rgba(255,105,180,0.12)' : ''"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="isWalletRoute ? '#ff69b4' : 'rgba(255,255,255,0.4)'" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
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
</script>
