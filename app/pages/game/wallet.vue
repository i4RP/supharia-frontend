<template>
    <div class="absolute inset-0 flex flex-col" style="background: #1a0a14">
        <!-- Header -->
        <div class="px-4 pt-[env(safe-area-inset-top,12px)] pb-3">
            <h1 class="text-lg font-bold tracking-wider" style="color: #ff69b4">WALLET</h1>
            <p class="text-[11px] font-mono mt-0.5" style="color: rgba(255,255,255,0.35)">Your balances &amp; activity</p>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-4 pb-[80px]">
            <!-- Total Balance Card -->
            <div
                class="rounded-2xl p-5 mb-4"
                style="background: rgba(255,105,180,0.08); border: 1px solid rgba(212,96,154,0.25)"
            >
                <div class="text-[11px] font-mono tracking-wider mb-1" style="color: rgba(255,255,255,0.4)">TOTAL BALANCE</div>
                <div class="text-3xl font-bold font-mono" style="color: #ff69b4">${{ game_store.balance.toFixed(2) }}</div>
                <div class="text-[11px] font-mono mt-1" style="color: rgba(255,255,255,0.3)">{{ (game_store.total_pnl / 100).toFixed(2) }} P&amp;L</div>
            </div>

            <!-- Balance Breakdown -->
            <div class="flex gap-3 mb-6">
                    <!-- Game Balance -->
                    <div
                        class="flex-1 rounded-xl p-4"
                        style="background: rgba(30,15,25,0.8); border: 1px solid rgba(212,96,154,0.15)"
                    >
                        <div class="flex items-center gap-2 mb-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff69b4" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                            <span class="text-[10px] font-mono tracking-wider" style="color: rgba(255,255,255,0.4)">GAME</span>
                        </div>
                        <div class="text-lg font-bold font-mono" style="color: #e8e8ff">${{ game_store.balance.toFixed(2) }}</div>
                    </div>

                <!-- On-Chain Balance -->
                <div
                    class="flex-1 rounded-xl p-4"
                    style="background: rgba(30,15,25,0.8); border: 1px solid rgba(212,96,154,0.15)"
                >
                    <div class="flex items-center gap-2 mb-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff69b4" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 10H18a2 2 0 0 0 0 4h4" /></svg>
                        <span class="text-[10px] font-mono tracking-wider" style="color: rgba(255,255,255,0.4)">ON-CHAIN</span>
                    </div>
                    <div class="text-lg font-bold font-mono" style="color: #e8e8ff">0.00 ETH</div>
                </div>
            </div>

            <!-- Stats -->
            <div class="mb-6">
                <div class="text-[11px] font-mono tracking-wider mb-3" style="color: rgba(255,255,255,0.4)">STATS</div>
                <div
                    v-for="stat in stats"
                    :key="stat.label"
                    class="flex items-center justify-between py-2.5 border-b"
                    style="border-color: rgba(212,96,154,0.1)"
                >
                    <span class="text-xs font-mono" style="color: rgba(255,255,255,0.5)">{{ stat.label }}</span>
                    <span class="text-xs font-bold font-mono" :style="{ color: stat.color || '#e8e8ff' }">{{ stat.value }}</span>
                </div>
            </div>

            <!-- Recent Activity (Placeholder) -->
            <div>
                <div class="text-[11px] font-mono tracking-wider mb-3" style="color: rgba(255,255,255,0.4)">RECENT ACTIVITY</div>
                <div class="text-center py-8">
                    <svg class="mx-auto mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(212,96,154,0.3)" stroke-width="1.5">
                        <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
                    </svg>
                    <p class="text-[11px] font-mono" style="color: rgba(255,255,255,0.25)">No recent activity</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const game_store = useGameStoreC()

// Load balance if not already loaded
onMounted(() => {
    if (!game_store.balance_loaded) {
        game_store.loadBalance()
    }
})

const stats = computed(() => [
    { label: "Total Bets", value: String(game_store.total_bets) },
    { label: "Wins", value: String(game_store.total_wins), color: "#22c55e" },
    { label: "Losses", value: String(game_store.total_losses), color: "#ef4444" },
    { label: "Win Rate", value: `${game_store.win_rate}%`, color: "#ff69b4" },
    { label: "Best Streak", value: String(game_store.best_streak) },
    { label: "Total P&L", value: `$${(game_store.total_pnl / 100).toFixed(2)}`, color: game_store.total_pnl >= 0 ? "#22c55e" : "#ef4444" },
])
</script>
