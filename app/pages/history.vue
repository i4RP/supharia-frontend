<template>
    <!-- Not Connected -->
    <div v-if="!wallet_connected" :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6 flex items-center justify-center`">
        <div class="text-center max-w-sm mx-4">
            <p :class="`text-sm ${text_muted} mb-5`">Connect your wallet to view transaction history.</p>
            <button class="px-6 py-3 bg-white text-black rounded-xl text-sm hover:bg-[#e8e8e8] transition-colors" @click="openWalletModal">Connect Wallet</button>
        </div>
    </div>

    <!-- Connected -->
    <div v-else :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-6">

            <!-- Header -->
            <div class="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 :class="text">Transaction History</h1>
                    <p :class="`text-sm ${text_muted} mt-1`">All on-chain activity for your connected wallet.</p>
                </div>
                <div class="flex gap-2">
                    <button :class="`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${border} text-xs ${text_muted} ${hover_bg} transition-colors`">
                        <Download :size="12" /> CSV
                    </button>
                    <button :class="`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${border} text-xs ${text_muted} ${hover_bg} transition-colors`">
                        <Download :size="12" /> JSON
                    </button>
                </div>
            </div>

            <!-- Transactions -->
            <div class="space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <h2 :class="text">Transactions</h2>
                    <div class="flex gap-2 overflow-x-auto">
                        <button
                            v-for="filter_option in FILTERS"
                            :key="filter_option.id"
                            :class="`shrink-0 px-3 py-1.5 rounded-xl text-xs transition-colors ${ active_filter === filter_option.id ? 'bg-white text-black' : `border ${border} ${text_muted} ${hover_bg}` }`"
                            @click="active_filter = filter_option.id"
                        >
                            {{ filter_option.label }}
                        </button>
                    </div>
                </div>

                <div class="space-y-2">
                    <div
                        v-for="(tx, index) in filtered_transactions"
                        :key="index"
                        :class="`rounded-xl p-3 border ${border} flex items-center justify-between flex-wrap gap-2`"
                    >
                        <div class="flex items-center gap-3">
                            <span :class="`text-xs px-2 py-0.5 rounded-full border ${getTypeColor(tx.type)}`">
                                {{ tx.type }}
                            </span>
                            <span :class="`text-sm ${text}`">{{ tx.detail }}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span :class="`text-xs px-2 py-0.5 rounded-full ${tx.status === 'confirmed' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`">
                                {{ tx.status }}
                            </span>
                            <span :class="`text-xs ${text_muted}`">{{ tx.time }}</span>
                            <a href="#" :class="`${text_muted} hover:text-[#ededed] transition-colors`">
                                <ExternalLink :size="12" />
                            </a>
                        </div>
                    </div>
                </div>

                <div :class="`flex justify-between items-center text-xs ${text_muted}`">
                    <span>Showing {{ filtered_transactions.length }} transactions</span>
                    <div class="flex gap-2">
                        <button :class="`px-3 py-1 rounded-lg border ${border} ${hover_bg} transition-colors`">Pool TX CSV</button>
                        <button :class="`px-3 py-1 rounded-lg border ${border} ${hover_bg} transition-colors`">Pool TX JSON</button>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { Download, ExternalLink } from "lucide-vue-next"

type FilterType = "all" | "swap" | "liquidity" | "mainnet"

const { bg, border, text, text_muted, hover_bg } = useTheme()
const { wallet_connected, openWalletModal } = useWallet()

const active_filter = ref<FilterType>("all")

const TX_HISTORY = [
    {
        type: "Swap",
        detail: "0.5 BSV → 23.61 DSTAS",
        status: "confirmed",
        time: "2026-02-25 10:23",
        txid: "a1b2...001",
    },
    {
        type: "Add Liquidity",
        detail: "1.0 BSV + 47.23 DSTAS",
        status: "confirmed",
        time: "2026-02-24 15:10",
        txid: "c3d4...002",
    },
    { type: "Swap", detail: "100 DSTAS → 2.11 BSV", status: "confirmed", time: "2026-02-24 09:22", txid: "e5f6...003" },
    {
        type: "Remove Liquidity",
        detail: "50 LP shares",
        status: "confirmed",
        time: "2026-02-23 18:41",
        txid: "g7h8...004",
    },
    { type: "Issue", detail: "1,000,000 DXS", status: "confirmed", time: "2026-02-22 12:00", txid: "i9j0...005" },
    {
        type: "Transfer",
        detail: "500 DSTAS → 1BVP...3xK",
        status: "confirmed",
        time: "2026-02-21 14:30",
        txid: "k1l2...006",
    },
    { type: "Swap", detail: "0.1 BSV → 4.72 DSTAS", status: "confirmed", time: "2026-02-21 09:15", txid: "m3n4...007" },
    { type: "Freeze", detail: "DSTAS token", status: "confirmed", time: "2026-02-20 16:00", txid: "o5p6...008" },
    { type: "Swap", detail: "50 DXS → 0.44 BSV", status: "failed", time: "2026-02-20 11:30", txid: "q7r8...009" },
    {
        type: "Add Liquidity",
        detail: "0.5 BSV + 23.6 DSTAS",
        status: "confirmed",
        time: "2026-02-19 20:15",
        txid: "s9t0...010",
    },
]

const TYPE_COLORS: Record<string, string> = {
    Swap: "text-[#ededed] bg-white/10 border-white/20",
    "Add Liquidity": "text-green-400 bg-green-500/10 border-green-500/30",
    "Remove Liquidity": "text-red-400 bg-red-500/10 border-red-500/30",
    Issue: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    Transfer: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    Freeze: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    Unfreeze: "text-teal-400 bg-teal-500/10 border-teal-500/30",
}

const FILTERS: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "swap", label: "Swaps" },
    { id: "liquidity", label: "Liquidity" },
    { id: "mainnet", label: "Mainnet" },
]

const filtered_transactions = computed(() => {
    return TX_HISTORY.filter((tx) => {
        if (active_filter.value === "all") return true
        if (active_filter.value === "swap") return tx.type === "Swap"
        if (active_filter.value === "liquidity") return tx.type.includes("Liquidity")
        return ["Issue", "Transfer", "Freeze", "Unfreeze"].includes(tx.type)
    })
})

function getTypeColor(tx_type: string): string {
    return TYPE_COLORS[tx_type] || "text-[#888] bg-white/5 border-white/10"
}
</script>
