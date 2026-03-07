<template>
    <div :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-6">

            <!-- Header -->
            <div>
                <h1 :class="text">Liquidity Pools</h1>
                <p :class="`text-sm ${text_muted} mt-1`">Provide liquidity and earn trading fees on BSV Mainnet.</p>
            </div>

            <!-- Pool Selector -->
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <h2 :class="text">Select Pool</h2>
                    <div class="flex items-center gap-2">
                        <div :class="`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${is_live ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10'}`">
                            <div :class="`w-1.5 h-1.5 rounded-full ${is_live ? 'bg-green-400' : 'bg-red-400'} animate-pulse`" />
                            {{ is_live ? "LIVE" : "OFF" }}
                        </div>
                        <button :class="`p-1.5 rounded-lg border ${border} ${text_muted}`" @click="toggleLive">
                            <RefreshCw :size="12" />
                        </button>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="pool in POOLS"
                        :key="pool.id"
                        :class="`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${ selected_pool === pool.id ? 'border-white/20 bg-white/8 text-white' : `${border} ${text_muted} hover:bg-[#111]` }`"
                        @click="selected_pool = pool.id"
                    >
                        <span
                            role="button"
                            :class="`cursor-pointer ${favorites.has(pool.id) ? 'text-amber-400' : text_muted}`"
                            @click.stop="toggleFav(pool.id)"
                        >
                            <Star :size="12" :fill="favorites.has(pool.id) ? 'currentColor' : 'none'" />
                        </span>
                        <span class="text-sm">{{ pool.label }}</span>
                        <span :class="`text-xs ${text_muted}`">{{ pool.tvl }}</span>
                    </button>
                </div>
            </div>

            <!-- Pool Actions -->
            <div class="space-y-0">
                <div :class="`border ${border} rounded-2xl overflow-hidden`">
                    <div :class="`flex border-b ${border} overflow-x-auto`">
                        <button
                            v-for="tab in SUB_TABS"
                            :key="tab.id"
                            :class="`shrink-0 px-4 py-3 text-sm transition-colors ${ sub_tab === tab.id ? 'text-white border-b-2 border-white bg-white/5' : text_muted }`"
                            @click="sub_tab = tab.id"
                        >
                            {{ tab.label }}
                        </button>
                    </div>

                    <div class="p-4">
                        <!-- DASHBOARD -->
                        <div v-if="sub_tab === 'dashboard'" class="space-y-4">
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div
                                    v-for="stat in dashboard_stats"
                                    :key="stat.label"
                                    :class="`rounded-xl p-3 border ${border}`"
                                >
                                    <p :class="`text-xs ${text_muted}`">{{ stat.label }}</p>
                                    <p :class="`text-sm ${text} mt-0.5`">{{ stat.value }}</p>
                                </div>
                            </div>

                            <div v-if="wallet_connected">
                                <p :class="`text-xs ${text_muted} mb-2`">My LP Position</p>
                                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div v-for="item in lp_position_items" :key="item[0]">
                                        <p :class="`text-xs ${text_muted}`">{{ item[0] }}</p>
                                        <p :class="`text-sm ${text}`">{{ item[1] }}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p :class="`text-xs ${text_muted} mb-2`">Price History</p>
                                <div class="h-[150px]">
                                    <Line :data="chart_data" :options="chart_options" />
                                </div>
                            </div>

                            <div>
                                <p :class="`text-xs ${text_muted} mb-2`">Recent Transactions</p>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-xs">
                                        <thead>
                                            <tr :class="text_muted">
                                                <th v-for="header in tx_headers" :key="header" class="text-left py-1.5 pr-4">{{ header }}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(tx, index) in POOL_TX_DATA" :key="index" :class="`border-t ${border}`">
                                                <td :class="`py-2 pr-4 ${text}`">{{ tx.type }}</td>
                                                <td :class="`py-2 pr-4 ${text}`">{{ tx.in }}</td>
                                                <td :class="`py-2 pr-4 ${text_muted}`">{{ tx.out }}</td>
                                                <td :class="`py-2 pr-4 ${text_muted}`">{{ tx.fee }}</td>
                                                <td class="py-2 pr-4"><span class="text-green-400">{{ tx.status }}</span></td>
                                                <td :class="`py-2 ${text_muted}`">{{ tx.time }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- SWAP -->
                        <div v-if="sub_tab === 'swap'" class="max-w-md space-y-3">
                            <div class="flex rounded-xl border overflow-hidden" :style="{ borderColor: is_dark ? '#1a1a1a' : '#e5e7eb' }">
                                <button
                                    v-for="dir in swap_directions"
                                    :key="dir.id"
                                    :class="`flex-1 py-2 text-sm transition-colors ${swap_dir === dir.id ? 'bg-white text-black' : text_muted}`"
                                    @click="swap_dir = dir.id"
                                >
                                    {{ dir.label }}
                                </button>
                            </div>
                            <div>
                                <label :class="`text-xs ${text_muted} mb-1.5 block`">Amount</label>
                                <input placeholder="0.00" :class="input_cls">
                            </div>
                            <div :class="`rounded-xl p-3 border ${border} space-y-1.5`">
                                <div v-for="item in swap_details" :key="item[0]" class="flex justify-between">
                                    <span :class="`text-xs ${text_muted}`">{{ item[0] }}</span>
                                    <span :class="`text-xs ${text}`">{{ item[1] }}</span>
                                </div>
                            </div>
                            <button class="w-full py-3 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors">Swap via Pool</button>
                        </div>

                        <!-- ADD LIQUIDITY -->
                        <div v-if="sub_tab === 'add'" class="max-w-md space-y-3">
                            <div :class="`${bg} rounded-xl p-3 border ${border} grid grid-cols-2 gap-2 text-xs`">
                                <div :class="text_muted">Reserve A: <span :class="text">28,412 BSV</span></div>
                                <div :class="text_muted">Reserve B: <span :class="text">1,343,980 DSTAS</span></div>
                            </div>
                            <div>
                                <label :class="`text-xs ${text_muted} mb-1.5 block`">Amount A (BSV)</label>
                                <input placeholder="0.00" :class="input_cls">
                            </div>
                            <div>
                                <label :class="`text-xs ${text_muted} mb-1.5 block`">Amount B (DSTAS)</label>
                                <input placeholder="0.00" :class="input_cls">
                            </div>
                            <button class="w-full py-3 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                                <Plus :size="14" /> Add Liquidity
                            </button>
                        </div>

                        <!-- REMOVE -->
                        <div v-if="sub_tab === 'remove'" class="max-w-md space-y-3">
                            <div>
                                <label :class="`text-xs ${text_muted} mb-1.5 block`">Remove: {{ remove_percent }}%</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    :value="remove_percent"
                                    class="w-full accent-red-500"
                                    @input="remove_percent = Number(($event.target as HTMLInputElement).value)"
                                >
                                <div class="flex gap-2 mt-2">
                                    <button
                                        v-for="pct in remove_presets"
                                        :key="pct"
                                        :class="`flex-1 py-1 text-xs rounded-lg border ${border} ${text_muted} hover:bg-[#111] transition-colors`"
                                        @click="remove_percent = pct"
                                    >
                                        {{ pct }}%
                                    </button>
                                </div>
                            </div>
                            <div :class="`rounded-xl p-3 border ${border} space-y-1.5`">
                                <div v-for="item in remove_details" :key="item[0]" class="flex justify-between">
                                    <span :class="`text-xs ${text_muted}`">{{ item[0] }}</span>
                                    <span :class="`text-xs ${text}`">{{ item[1] }}</span>
                                </div>
                            </div>
                            <button class="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm transition-colors">
                                Remove Liquidity
                            </button>
                        </div>

                        <!-- CREATE POOL -->
                        <div v-if="sub_tab === 'create'" class="max-w-md space-y-3">
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label :class="`text-xs ${text_muted} mb-1.5 block`">Token A Symbol</label>
                                    <input placeholder="BSV" :class="input_cls">
                                </div>
                                <div>
                                    <label :class="`text-xs ${text_muted} mb-1.5 block`">Token A ID</label>
                                    <input placeholder="Token ID..." :class="input_cls">
                                </div>
                                <div>
                                    <label :class="`text-xs ${text_muted} mb-1.5 block`">Token B Symbol</label>
                                    <input placeholder="DSTAS" :class="input_cls">
                                </div>
                                <div>
                                    <label :class="`text-xs ${text_muted} mb-1.5 block`">Token B ID</label>
                                    <input placeholder="Token ID..." :class="input_cls">
                                </div>
                            </div>
                            <div :class="`rounded-xl p-3 border ${border} flex justify-between items-center`">
                                <span :class="`text-sm ${text_muted}`">Fee Rate</span>
                                <span class="text-sm text-white/60">1% (fixed)</span>
                            </div>
                            <button class="w-full py-3 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors">
                                Create Pool
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { CategoryScale, Chart as ChartJS, Filler, LinearScale, LineElement, PointElement, Tooltip } from "chart.js"
import { Plus, RefreshCw, Star } from "lucide-vue-next"
import { Line } from "vue-chartjs"
import { POOL_TX_DATA, POOLS } from "~/constants/pools"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

type SubTab = "dashboard" | "swap" | "add" | "remove" | "create"
type SwapDir = "ab" | "ba"

const { is_dark, bg, border, text, text_muted, input_cls } = useTheme()
const { wallet_connected } = useWallet()

const selected_pool = ref(POOLS[0].id)
const sub_tab = ref<SubTab>("dashboard")
const favorites = ref(new Set<string>(["pool1"]))
const is_live = ref(true)
const remove_percent = ref(50)
const swap_dir = ref<SwapDir>("ab")

const SUB_TABS: { id: SubTab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "swap", label: "Swap" },
    { id: "add", label: "Add Liquidity" },
    { id: "remove", label: "Remove" },
    { id: "create", label: "+ New Pool" },
]

const dashboard_stats = [
    { label: "Token A Reserve", value: "28,412 BSV" },
    { label: "Token B Reserve", value: "1,343,980 DSTAS" },
    { label: "TVL", value: "$1.24M" },
    { label: "Total LP Shares", value: "189,234" },
    { label: "Fee Rate", value: "1%" },
    { label: "24h Volume", value: "$83.2K" },
    { label: "Pool Address", value: "1DXS...f4aB" },
]

const lp_position_items = [
    ["LP Shares", "1,234"],
    ["Pool Share", "0.65%"],
    ["Deposited A", "184.2 BSV"],
    ["Deposited B", "8,712 DSTAS"],
    ["Current Value A", "186.1 BSV"],
    ["Earned Fees", "+2.3 BSV"],
]

const tx_headers = ["Type", "In", "Out", "Fee", "Status", "Time"]

const swap_directions = [
    { id: "ab" as SwapDir, label: "BSV → DSTAS" },
    { id: "ba" as SwapDir, label: "DSTAS → BSV" },
]

const swap_details = [
    ["Output", "47.23 DSTAS"],
    ["Fee", "0.47 DSTAS"],
    ["Price Impact", "0.12%"],
    ["Min Received", "47.0 DSTAS"],
]

const remove_presets = [25, 50, 75, 100]

const remove_details = computed(() => [
    ["You Receive A", `${((1.842 * remove_percent.value) / 100).toFixed(3)} BSV`],
    ["You Receive B", `${((87.12 * remove_percent.value) / 100).toFixed(2)} DSTAS`],
])

const CHART_DATA = Array.from({ length: 20 }, (_, i) => ({
    t: `${i}:00`,
    price: 45 + Math.sin(i * 0.5) * 8 + Math.random() * 4,
}))

const chart_data = computed(() => ({
    labels: CHART_DATA.map((d) => d.t),
    datasets: [
        {
            label: "Price",
            data: CHART_DATA.map((d) => d.price),
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.15)",
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
        },
    ],
}))

const chart_options = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        tooltip: {
            backgroundColor: "#0a0a0a",
            borderColor: "#1a1a1a",
            borderWidth: 1,
            titleFont: { size: 11 },
            bodyFont: { size: 11 },
        },
    },
    scales: {
        x: {
            ticks: { color: is_dark.value ? "#9ca3af" : "#6b7280", font: { size: 10 } },
            grid: { display: false },
        },
        y: {
            ticks: { color: is_dark.value ? "#9ca3af" : "#6b7280", font: { size: 10 } },
            grid: { color: is_dark.value ? "#1a1a1a" : "#e5e7eb" },
        },
    },
}))

function toggleFav(pool_id: string) {
    const next_favorites = new Set(favorites.value)
    if (next_favorites.has(pool_id)) {
        next_favorites.delete(pool_id)
    } else {
        next_favorites.add(pool_id)
    }
    favorites.value = next_favorites
}

function toggleLive() {
    is_live.value = !is_live.value
}
</script>
