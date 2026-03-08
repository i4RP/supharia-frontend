<template>
    <div class="absolute inset-0 flex flex-col" style="background: #03080F">
        <!-- Header -->
        <div class="px-4 pt-[env(safe-area-inset-top,12px)] pb-3">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-lg font-bold tracking-wider" style="color: #1B8DFF">RANKING</h1>
                    <p class="text-[11px] font-mono mt-0.5" style="color: rgba(255,255,255,0.35)">On-chain leaderboard (<a href="https://megaeth-testnet-v2.blockscout.com/address/0x3f781931748e20cd5537f0f223d0ceaa310b9338" target="_blank" rel="noopener noreferrer" class="underline" style="color: #1B8DFF">MegaETH</a>)</p>
                </div>
                <button
                    class="p-2 rounded-lg transition-colors"
                    style="background: rgba(27,141,255,0.1); border: 1px solid rgba(27,141,255,0.2)"
                    :disabled="loading"
                    @click="loadLeaderboard"
                >
                    <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="2"
                        :class="loading ? 'animate-spin' : ''"
                    >
                        <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && leaderboard.length === 0" class="flex-1 flex items-center justify-center">
            <div class="text-center">
                <svg class="mx-auto mb-3 animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="2">
                    <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                <p class="text-[11px] font-mono" style="color: rgba(255,255,255,0.4)">Loading from MegaETH...</p>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && leaderboard.length === 0" class="flex-1 flex items-center justify-center">
            <div class="text-center">
                <svg class="mx-auto mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(27,141,255,0.3)" stroke-width="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <p class="text-[11px] font-mono" style="color: rgba(255,255,255,0.25)">No players yet</p>
                <p class="text-[10px] font-mono mt-1" style="color: rgba(255,255,255,0.15)">Play the game to appear on the leaderboard</p>
            </div>
        </div>

        <!-- Leaderboard List -->
        <div v-else class="flex-1 overflow-y-auto px-4 pb-[80px]">
            <!-- Error Banner -->
            <div v-if="error" class="mb-3 px-3 py-2 rounded-lg text-[11px] font-mono" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444">
                {{ error }}
            </div>

            <div
                v-for="(player, i) in leaderboard"
                :key="player.address"
                class="flex items-center gap-3 py-3 border-b"
                style="border-color: rgba(27,141,255,0.1)"
            >
                <!-- Rank -->
                <div
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold shrink-0"
                    :style="rankStyle(i)"
                >
                    {{ i + 1 }}
                </div>

                <!-- Address + Stats -->
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-bold truncate font-mono" style="color: #E0EEFF">
                        {{ shortAddr(player.address) }}
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[10px] font-mono" style="color: rgba(255,255,255,0.3)">
                            {{ player.totalBets }} bets
                        </span>
                        <span class="text-[10px] font-mono" style="color: rgba(255,255,255,0.3)">
                            {{ player.wins }}W
                        </span>
                        <span class="text-[10px] font-mono" :style="{ color: player.winRate >= 50 ? '#22c55e' : '#ef4444' }">
                            {{ player.winRate }}%
                        </span>
                    </div>
                </div>

                <!-- PnL -->
                <div class="text-right shrink-0">
                    <div
                        class="text-sm font-bold font-mono"
                        :style="{ color: player.pnl >= 0 ? '#22c55e' : '#ef4444' }"
                    >
                        {{ player.pnl >= 0 ? '+' : '' }}${{ (player.pnl / 100).toFixed(2) }}
                    </div>
                    <div class="text-[9px] font-mono mt-0.5" style="color: rgba(255,255,255,0.25)">SCORE</div>
                </div>

                <!-- Rewards -->
                <div class="text-right shrink-0 pl-2 border-l" style="border-color: rgba(27,141,255,0.15); min-width: 70px">
                    <div class="text-[11px] font-bold font-mono" style="color: #1B8DFF">
                        {{ formatRewardRusd(player.rewardRusd) }} <span class="text-[9px] font-normal" style="color: rgba(27,141,255,0.6)">rUSD</span>
                    </div>
                    <div class="text-[10px] font-mono mt-0.5" style="color: rgba(255,255,255,0.4)">
                        {{ formatRewardEth(player.rewardEth) }} <span class="text-[9px]" style="color: rgba(255,255,255,0.25)">ETH</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnChain } from "~/composables/useOnChain"
import type { LeaderboardEntry } from "~/composables/useOnChain"

const { fetchLeaderboard } = useOnChain()

const leaderboard = ref<LeaderboardEntry[]>([])
const loading = ref(false)
const error = ref("")

function shortAddr(addr: string): string {
    if (addr.length <= 10) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function formatRewardRusd(val: number): string {
    if (val === 0) return "0.00"
    if (val < 0.01) return val.toFixed(4)
    return val.toFixed(2)
}

function formatRewardEth(val: number): string {
    if (val === 0) return "0"
    if (val < 0.0001) return val.toFixed(6)
    return val.toFixed(4)
}

function rankStyle(index: number) {
    if (index === 0) return "background: linear-gradient(135deg, #FFD700, #FFA500); color: #03080F"
    if (index === 1) return "background: linear-gradient(135deg, #C0C0C0, #A0A0A0); color: #03080F"
    if (index === 2) return "background: linear-gradient(135deg, #CD7F32, #A0522D); color: #03080F"
    return "background: rgba(27,141,255,0.1); color: rgba(255,255,255,0.5)"
}

async function loadLeaderboard() {
    loading.value = true
    error.value = ""
    try {
        const all = await fetchLeaderboard()
        // Filter out dummy/test addresses (repeating hex patterns)
        const DUMMY_ADDRESSES = new Set([
            "0x1111111111111111111111111111111111111111",
            "0x2222222222222222222222222222222222222222",
            "0x3333333333333333333333333333333333333333",
            "0x4444444444444444444444444444444444444444",
            "0x5555555555555555555555555555555555555555",
            "0x6666666666666666666666666666666666666666",
            "0x7777777777777777777777777777777777777777",
            "0x8888888888888888888888888888888888888888",
            "0x9999999999999999999999999999999999999999",
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            "0xcccccccccccccccccccccccccccccccccccccccc",
            "0xdddddddddddddddddddddddddddddddddddddd",
            "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "0x0000000000000000000000000000000000000000",
        ])
        leaderboard.value = all.filter(p => !DUMMY_ADDRESSES.has(p.address.toLowerCase()))
    }
    catch (e) {
        console.error("[Ranking] Failed to load leaderboard:", e)
        error.value = "Failed to load leaderboard from chain"
    }
    finally {
        loading.value = false
    }
}

onMounted(() => {
    loadLeaderboard()
})
</script>
