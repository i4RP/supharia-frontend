<template>
    <div :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-6">

            <!-- Header -->
            <div>
                <h1 :class="text">Analytics</h1>
                <p :class="`text-sm ${text_muted} mt-1`">Protocol-wide statistics and pool performance metrics.</p>
            </div>

            <!-- Overview -->
            <div class="space-y-3">
                <h2 :class="text">Overview</h2>
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div
                        v-for="stat in overview_stats"
                        :key="stat.label"
                        :class="`rounded-2xl border ${border} p-4`"
                    >
                        <p :class="`text-xs ${text_muted} mb-1`">{{ stat.label }}</p>
                        <p :class="text" style="font-size: 18px; font-weight: 700">{{ stat.value }}</p>
                        <p :class="`text-xs mt-1 flex items-center gap-1 ${stat.up ? 'text-green-400' : 'text-red-400'}`">
                            <component :is="stat.up ? TrendingUp : TrendingDown" :size="10" />
                            {{ stat.change }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="space-y-3">
                <h2 :class="text">Charts</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div :class="`border ${border} rounded-2xl p-4`">
                        <p :class="`text-xs ${text_muted} mb-3`">24h Volume</p>
                        <div style="height: 180px">
                            <Bar :data="volume_chart_data" :options="bar_chart_options" />
                        </div>
                    </div>
                    <div :class="`border ${border} rounded-2xl p-4`">
                        <p :class="`text-xs ${text_muted} mb-3`">Total TVL</p>
                        <div style="height: 180px">
                            <Line :data="tvl_chart_data" :options="line_chart_options" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pool Rankings -->
            <div class="space-y-3">
                <div class="flex items-center gap-2">
                    <BarChart2 :size="16" class="text-white/50" />
                    <h2 :class="text">Pool Rankings</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead>
                            <tr :class="text_muted">
                                <th v-for="header in ranking_headers" :key="header" class="text-left py-2 pr-4">{{ header }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(pool, index) in pool_rankings" :key="index" :class="`border-t ${border}`">
                                <td :class="`py-2.5 pr-4 ${text_muted}`">{{ index + 1 }}</td>
                                <td :class="`py-2.5 pr-4 ${text}`">{{ pool.pair }}</td>
                                <td :class="`py-2.5 pr-4 ${text}`">{{ pool.tvl }}</td>
                                <td :class="`py-2.5 pr-4 ${text}`">{{ pool.vol_24h }}</td>
                                <td class="py-2.5 pr-4 text-green-400">{{ pool.fees_24h }}</td>
                                <td :class="`py-2.5 pr-4 ${text}`">{{ pool.price }}</td>
                                <td :class="`py-2.5 pr-4 ${parseFloat(pool.change) >= 0 ? 'text-green-400' : 'text-red-400'}`">
                                    {{ parseFloat(pool.change) >= 0 ? "+" : "" }}{{ pool.change }}%
                                </td>
                                <td :class="`py-2.5 ${text_muted}`">{{ pool.txns.toLocaleString() }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from "chart.js"
import { BarChart2, TrendingDown, TrendingUp } from "lucide-vue-next"
import { Bar, Line } from "vue-chartjs"

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Filler)

const { is_dark, bg, border, text, text_muted } = useTheme()

const overview_stats = [
    { label: "Total TVL", value: "$2.41M", change: "+4.2%", up: true },
    { label: "24h Volume", value: "$183.2K", change: "+12.1%", up: true },
    { label: "24h Fees", value: "$1,832", change: "+12.1%", up: true },
    { label: "Total Pools", value: "12", change: "+1", up: true },
    { label: "Total Transactions", value: "4,821", change: "+234", up: true },
]

const pool_rankings = [
    {
        pair: "BSV / DSTAS",
        tvl: "$1.24M",
        vol_24h: "$83.2K",
        fees_24h: "$832",
        price: "47.23",
        change: "+2.1",
        txns: 1823,
    },
    {
        pair: "BSV / wUSDC",
        tvl: "$890K",
        vol_24h: "$52.1K",
        fees_24h: "$521",
        price: "62.10",
        change: "-0.8",
        txns: 1124,
    },
    {
        pair: "DSTAS / DXS",
        tvl: "$280K",
        vol_24h: "$28.7K",
        fees_24h: "$287",
        price: "0.382",
        change: "+5.3",
        txns: 628,
    },
    {
        pair: "BSV / GOLD",
        tvl: "$142K",
        vol_24h: "$10.4K",
        fees_24h: "$104",
        price: "0.00214",
        change: "-1.2",
        txns: 312,
    },
    {
        pair: "wUSDC / USD",
        tvl: "$98K",
        vol_24h: "$8.8K",
        fees_24h: "$88",
        price: "1.0012",
        change: "+0.01",
        txns: 187,
    },
]

const ranking_headers = ["#", "Pair", "TVL", "Volume 24h", "Fees 24h", "Price", "24h Change", "Txns"]

const VOL_DATA = Array.from({ length: 14 }, (_, i) => ({
    day: `Feb ${12 + i}`,
    volume: 80000 + Math.sin(i * 0.8) * 40000 + Math.random() * 20000,
    tvl: 2000000 + Math.sin(i * 0.3) * 200000,
}))

const chart_tick_color = computed(() => (is_dark.value ? "#9ca3af" : "#6b7280"))

const volume_chart_data = computed(() => ({
    labels: VOL_DATA.map((d) => d.day),
    datasets: [
        {
            label: "Volume",
            data: VOL_DATA.map((d) => d.volume),
            backgroundColor: "#6366f1",
            borderRadius: 3,
        },
    ],
}))

const bar_chart_options = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        tooltip: {
            backgroundColor: "#0a0a0a",
            borderColor: "#1a1a1a",
            borderWidth: 1,
            titleFont: { size: 11 },
            bodyFont: { size: 11 },
            callbacks: {
                label: (context: { parsed: { y: number } }) => `$${(context.parsed.y / 1000).toFixed(1)}K`,
            },
        },
    },
    scales: {
        x: {
            ticks: { color: chart_tick_color.value, font: { size: 9 }, maxTicksLimit: 5 },
            grid: { display: false },
        },
        y: {
            ticks: {
                color: chart_tick_color.value,
                font: { size: 9 },
                callback: (value: number) => `$${(value / 1000).toFixed(0)}K`,
            },
            grid: { color: is_dark.value ? "#1a1a1a" : "#e5e7eb" },
        },
    },
}))

const tvl_chart_data = computed(() => ({
    labels: VOL_DATA.map((d) => d.day),
    datasets: [
        {
            label: "TVL",
            data: VOL_DATA.map((d) => d.tvl),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
        },
    ],
}))

const line_chart_options = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        tooltip: {
            backgroundColor: "#0a0a0a",
            borderColor: "#1a1a1a",
            borderWidth: 1,
            titleFont: { size: 11 },
            bodyFont: { size: 11 },
            callbacks: {
                label: (context: { parsed: { y: number } }) => `$${(context.parsed.y / 1000000).toFixed(2)}M`,
            },
        },
    },
    scales: {
        x: {
            ticks: { color: chart_tick_color.value, font: { size: 9 }, maxTicksLimit: 5 },
            grid: { display: false },
        },
        y: {
            ticks: {
                color: chart_tick_color.value,
                font: { size: 9 },
                callback: (value: number) => `$${(value / 1000000).toFixed(1)}M`,
            },
            grid: { color: is_dark.value ? "#1a1a1a" : "#e5e7eb" },
        },
    },
}))
</script>
