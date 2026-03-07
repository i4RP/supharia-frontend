<template>
    <div class="absolute inset-0 flex flex-col" style="background: #1a0a14">
        <!-- Header -->
        <div class="px-4 pt-[env(safe-area-inset-top,12px)] pb-3">
            <h1 class="text-lg font-bold tracking-wider" style="color: #ff69b4">RANKING</h1>
            <p class="text-[11px] font-mono mt-0.5" style="color: rgba(255,255,255,0.35)">Top players this week</p>
        </div>

        <!-- Leaderboard List -->
        <div class="flex-1 overflow-y-auto px-4 pb-[80px]">
            <div
                v-for="(player, i) in leaderboard"
                :key="i"
                class="flex items-center gap-3 py-3 border-b"
                style="border-color: rgba(212,96,154,0.1)"
            >
                <!-- Rank -->
                <div
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold shrink-0"
                    :style="rankStyle(i)"
                >
                    {{ i + 1 }}
                </div>

                <!-- Avatar + Name -->
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-bold truncate" style="color: #e8e8ff">{{ player.name }}</div>
                    <div class="text-[10px] font-mono" style="color: rgba(255,255,255,0.3)">{{ player.address }}</div>
                </div>

                <!-- Score -->
                <div class="text-right shrink-0">
                    <div class="text-sm font-bold font-mono" style="color: #ff69b4">${{ player.pnl }}</div>
                    <div class="text-[10px] font-mono" :style="{ color: player.winRate >= 50 ? '#22c55e' : '#ef4444' }">
                        {{ player.winRate }}% win
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const leaderboard = [
    { name: "whale.eth", address: "0x1a2b...3c4d", pnl: "2,450.00", winRate: 72 },
    { name: "trader_x", address: "0x5e6f...7g8h", pnl: "1,830.50", winRate: 68 },
    { name: "megaeth_og", address: "0x9i0j...1k2l", pnl: "1,215.00", winRate: 65 },
    { name: "degen_42", address: "0x3m4n...5o6p", pnl: "980.75", winRate: 61 },
    { name: "supharia_fan", address: "0x7q8r...9s0t", pnl: "750.20", winRate: 58 },
    { name: "anon_trader", address: "0xab12...cd34", pnl: "620.00", winRate: 55 },
    { name: "eth_maxi", address: "0xef56...gh78", pnl: "480.30", winRate: 53 },
    { name: "moon_boy", address: "0xij90...kl12", pnl: "350.00", winRate: 51 },
    { name: "paper_hands", address: "0xmn34...op56", pnl: "220.50", winRate: 48 },
    { name: "newbie_01", address: "0xqr78...st90", pnl: "95.00", winRate: 42 },
]

function rankStyle(index: number) {
    if (index === 0) return "background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a0a14"
    if (index === 1) return "background: linear-gradient(135deg, #C0C0C0, #A0A0A0); color: #1a0a14"
    if (index === 2) return "background: linear-gradient(135deg, #CD7F32, #A0522D); color: #1a0a14"
    return "background: rgba(212,96,154,0.1); color: rgba(255,255,255,0.5)"
}
</script>
