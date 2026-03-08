<template>
    <!-- Not Connected -->
    <div v-if="!wallet_connected" :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6 flex items-center justify-center`">
        <div class="text-center max-w-sm mx-4">
            <TrendingUp :size="40" :class="`${text_muted} mx-auto mb-4`" />
            <h1 :class="`${text} mb-2`">Portfolio</h1>
            <p :class="`text-sm ${text_muted} mb-5`">Connect your wallet to view your portfolio and PnL tracking.</p>
            <button class="px-6 py-3 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors" @click="openWalletModal">
                Connect Wallet
            </button>
        </div>
    </div>

    <!-- Connected -->
    <div v-else :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-6">

            <!-- Header -->
            <div>
                <h1 :class="text">Portfolio</h1>
                <p :class="`text-sm ${text_muted} mt-1`">Your token holdings, LP positions, and PnL overview.</p>
            </div>

            <!-- Summary -->
            <div class="space-y-3">
                <h2 :class="text">Summary</h2>
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div
                        v-for="stat in portfolio_summary"
                        :key="stat.label"
                        :class="`rounded-2xl border ${border} p-4`"
                    >
                        <p :class="`text-xs ${text_muted} mb-1`">{{ stat.label }}</p>
                        <p :class="`text-sm ${stat.color || text}`" style="font-weight: 700">{{ stat.value }}</p>
                        <p v-if="stat.sub" :class="`text-xs ${text_muted} mt-1`">{{ stat.sub }}</p>
                    </div>
                </div>
            </div>

            <!-- Token Holdings -->
            <div class="space-y-3">
                <h2 :class="text">Token Holdings</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead>
                            <tr :class="text_muted">
                                <th v-for="header in token_headers" :key="header" class="text-left py-2 pr-4">{{ header }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="holding in TOKEN_HOLDINGS" :key="holding.symbol" :class="`border-t ${border}`">
                                <td :class="`py-2.5 pr-4 ${text}`">{{ holding.symbol }}</td>
                                <td :class="`py-2.5 pr-4 ${text_muted}`">{{ holding.balance }}</td>
                                <td :class="`py-2.5 pr-4 ${text}`">{{ holding.price }}</td>
                                <td :class="`py-2.5 pr-4 ${text}`">{{ holding.value }}</td>
                                <td :class="`py-2.5 ${holding.up ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`">
                                    <component :is="holding.up ? TrendingUp : TrendingDown" :size="10" />
                                    {{ holding.change }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- LP Positions -->
            <div class="space-y-3">
                <h2 :class="text">LP Positions</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead>
                            <tr :class="text_muted">
                                <th v-for="header in lp_headers" :key="header" class="text-left py-2 pr-4">{{ header }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="position in LP_POSITIONS" :key="position.pool" :class="`border-t ${border}`">
                                <td :class="`py-2.5 pr-4 ${text}`">{{ position.pool }}</td>
                                <td :class="`py-2.5 pr-4 ${text_muted}`">{{ position.shares }}</td>
                                <td :class="`py-2.5 pr-4 ${text_muted}`">{{ position.pct }}</td>
                                <td :class="`py-2.5 pr-4 ${text}`">{{ position.value }}</td>
                                <td class="py-2.5 text-green-400">{{ position.apy }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { TrendingDown, TrendingUp } from "lucide-vue-next"
import type { LpPosition, TokenHolding } from "~/types/portfolio"

const { bg, border, text, text_muted } = useTheme()
const { wallet_connected, openWalletModal } = useWallet()

const TOKEN_HOLDINGS: TokenHolding[] = [
    { symbol: "BSV", balance: "1.2341", price: "$62.10", value: "$76.64", change: "+2.3%", up: true },
    { symbol: "DSTAS", balance: "234.50", price: "$1.31", value: "$307.20", change: "+5.1%", up: true },
    { symbol: "DXS", balance: "1,000", price: "$0.089", value: "$89.00", change: "-1.2%", up: false },
    { symbol: "wUSDC", balance: "50.00", price: "$1.00", value: "$50.00", change: "+0.01%", up: true },
    { symbol: "USD", balance: "100.00", price: "$1.00", value: "$100.00", change: "0.0%", up: true },
]

const LP_POSITIONS: LpPosition[] = [
    { pool: "BSV / DSTAS", shares: "1,234", pct: "0.65%", value: "$8,140", apy: "1.2%" },
    { pool: "BSV / wUSDC", shares: "452", pct: "0.28%", value: "$2,490", apy: "0.9%" },
]

const portfolio_summary = [
    { label: "Total Value", value: "$11,252.84", sub: "+$412.20 today", color: "text-green-400" },
    { label: "Token Value", value: "$622.84", sub: "5.5% of total", color: "" },
    { label: "LP Value", value: "$10,630.00", sub: "94.5% of total", color: "" },
    { label: "24h PnL", value: "+$412.20", sub: "+3.8%", color: "text-green-400" },
    { label: "Transactions", value: "47", sub: "all time", color: "" },
]

const token_headers = ["Symbol", "Balance", "Price", "Value (USD)", "24h Change"]
const lp_headers = ["Pool", "LP Shares", "Share %", "Value (USD)", "APY"]
</script>
