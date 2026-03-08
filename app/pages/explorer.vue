<template>
    <div :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-6">

            <!-- Header -->
            <div>
                <h1 :class="text">BSV Explorer</h1>
                <p :class="`text-sm ${text_muted} mt-1`">Look up transactions, addresses, and application data on BSV Mainnet.</p>
            </div>

            <!-- Search -->
            <div class="space-y-3">
                <h2 :class="text">Search</h2>
                <div class="flex gap-2">
                    <div class="relative flex-1">
                        <Search :size="16" :class="`absolute left-3 top-1/2 -translate-y-1/2 ${text_muted}`" />
                        <input
                            v-model="search_query"
                            placeholder="Enter TxID (64-char hex) or BSV address..."
                            :class="`w-full pl-9 pr-3 py-2.5 rounded-xl border ${is_dark ? 'bg-black border-[#1a1a1a] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-gray-900'} text-sm outline-none`"
                            @keydown.enter="handleSearch"
                        >
                    </div>
                    <button class="px-4 py-2.5 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors" @click="handleSearch">
                        Search
                    </button>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="!is_searched" class="text-center py-12">
                <Search :size="32" :class="`${text_muted} mx-auto mb-3`" />
                <p :class="`text-sm ${text_muted}`">Enter a TxID or BSV address to explore</p>
            </div>

            <!-- Results -->
            <div v-if="is_searched" class="space-y-0">
                <div :class="`border ${border} rounded-2xl overflow-hidden`">
                    <div :class="`flex border-b ${border} overflow-x-auto`">
                        <button
                            v-for="tab in filtered_sub_tabs"
                            :key="tab.id"
                            :class="`shrink-0 px-4 py-3 text-sm transition-colors ${sub_tab === tab.id ? 'text-white border-b-2 border-white' : text_muted}`"
                            @click="sub_tab = tab.id"
                        >
                            {{ tab.label }}
                        </button>
                    </div>

                    <div class="p-4">
                        <!-- TX Overview -->
                        <div v-if="sub_tab === 'overview' && search_type === 'tx'" class="space-y-3">
                            <div class="grid grid-cols-2 gap-3">
                                <div
                                    v-for="item in tx_overview_items"
                                    :key="item[0]"
                                    :class="`rounded-xl p-3 border ${border}`"
                                >
                                    <p :class="`text-xs ${text_muted}`">{{ item[0] }}</p>
                                    <p :class="`text-xs ${text} mt-0.5 break-all`">{{ item[1] }}</p>
                                </div>
                            </div>
                            <div :class="`rounded-xl p-3 border ${border}`">
                                <p :class="`text-xs ${text_muted} mb-2`">Inputs</p>
                                <p v-for="(input_item, index) in MOCK_TX.inputs" :key="index" :class="`text-xs ${text} font-mono`">
                                    {{ input_item.txid }}:{{ input_item.vout }}
                                </p>
                            </div>
                            <div :class="`rounded-xl p-3 border ${border}`">
                                <p :class="`text-xs ${text_muted} mb-2`">Outputs</p>
                                <div v-for="(output_item, index) in MOCK_TX.outputs" :key="index" class="flex justify-between">
                                    <span class="text-xs text-white/50">{{ output_item.address }}</span>
                                    <span :class="`text-xs ${text}`">{{ output_item.value }} BSV</span>
                                </div>
                            </div>
                            <a href="#" class="flex items-center gap-1 text-xs text-white/50">
                                View on WhatsOnChain <ExternalLink :size="11" />
                            </a>
                        </div>

                        <!-- Address Overview -->
                        <div v-if="sub_tab === 'overview' && search_type === 'address'" class="space-y-3">
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div
                                    v-for="item in address_overview_items"
                                    :key="item[0]"
                                    :class="`rounded-xl p-3 border ${border}`"
                                >
                                    <p :class="`text-xs ${text_muted}`">{{ item[0] }}</p>
                                    <p :class="`text-xs ${text} mt-0.5 break-all`">{{ item[1] }}</p>
                                </div>
                            </div>
                            <a href="#" class="flex items-center gap-1 text-xs text-white/50">
                                View on WhatsOnChain <ExternalLink :size="11" />
                            </a>
                        </div>

                        <!-- UTXOs -->
                        <div v-if="sub_tab === 'utxos'" class="overflow-x-auto">
                            <table class="w-full text-xs">
                                <thead>
                                    <tr :class="text_muted">
                                        <th v-for="header in utxo_headers" :key="header" class="text-left py-1.5 pr-4">{{ header }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(utxo, index) in MOCK_UTXOS" :key="index" :class="`border-t ${border}`">
                                        <td class="py-2 pr-4 text-white/50">{{ utxo.txhash }}</td>
                                        <td :class="`py-2 pr-4 ${text}`">{{ utxo.index }}</td>
                                        <td :class="`py-2 pr-4 ${text}`">{{ utxo.value.toLocaleString() }}</td>
                                        <td :class="`py-2 ${text_muted}`">{{ utxo.height }}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div :class="`flex justify-between items-center mt-3 text-xs ${text_muted}`">
                                <span>Page 1 of 1</span>
                                <div class="flex gap-2">
                                    <button :class="`p-1.5 rounded border ${border}`"><ChevronLeft :size="12" /></button>
                                    <button :class="`p-1.5 rounded border ${border}`"><ChevronRight :size="12" /></button>
                                </div>
                            </div>
                        </div>

                        <!-- Transactions -->
                        <div v-if="sub_tab === 'transactions'" class="overflow-x-auto">
                            <table class="w-full text-xs">
                                <thead>
                                    <tr :class="text_muted">
                                        <th class="text-left py-1.5 pr-4">TxHash</th>
                                        <th class="text-left py-1.5 pr-4">Block Height</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="(row, index) in mock_tx_rows"
                                        :key="index"
                                        :class="`border-t ${border} cursor-pointer hover:bg-[#111]`"
                                    >
                                        <td class="py-2 pr-4 text-white/50">{{ row.tx }}</td>
                                        <td :class="`py-2 ${text_muted}`">{{ row.height }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- App Data -->
                        <div v-if="sub_tab === 'appdata'" class="space-y-3">
                            <div :class="`rounded-xl p-3 border ${border}`">
                                <p :class="`text-xs ${text_muted} mb-2`">Related Pools</p>
                                <div class="text-xs text-white/40">BSV / DSTAS — TVL: $1.24M</div>
                            </div>
                            <div :class="`rounded-xl p-3 border ${border}`">
                                <p :class="`text-xs ${text_muted} mb-2`">LP Positions</p>
                                <div class="text-xs">
                                    <span :class="text">BSV/DSTAS Pool</span>
                                    <span :class="`${text_muted} ml-2`">1,234 LP shares</span>
                                </div>
                            </div>
                            <div :class="`rounded-xl p-3 border ${border}`">
                                <p :class="`text-xs ${text_muted} mb-2`">Swap Transactions (3)</p>
                                <div v-for="(swap_item, index) in app_data_swaps" :key="index" class="flex justify-between py-0.5">
                                    <span :class="`text-xs ${text}`">{{ swap_item.amounts }}</span>
                                    <span class="text-xs text-green-400">{{ swap_item.status }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-vue-next"

type SubTab = "overview" | "utxos" | "transactions" | "appdata"

const { is_dark, bg, border, text, text_muted } = useTheme()

const search_query = ref("")
const is_searched = ref(false)
const search_type = ref<"tx" | "address">("address")
const sub_tab = ref<SubTab>("overview")

const MOCK_TX = {
    txid: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    confirmations: 1243,
    block_height: 871234,
    size: 226,
    inputs: [{ txid: "0000...0001", vout: 0 }],
    outputs: [
        { value: 0.00045, address: "1A1z...FNa" },
        { value: 0.5, address: "1BVP...3xK" },
    ],
}

const MOCK_ADDRESS = {
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    balance: 1.2341,
    unconfirmed: 0.0,
    utxos: 3,
    tx_count: 28,
}

const MOCK_UTXOS = [
    { txhash: "a1b2...0001", index: 0, value: 80000, height: 871200 },
    { txhash: "c3d4...0002", index: 1, value: 45000, height: 871100 },
    { txhash: "e5f6...0003", index: 0, value: 99000, height: 870900 },
]

const SUB_TABS: { id: SubTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "utxos", label: "UTXOs" },
    { id: "transactions", label: "Transactions" },
    { id: "appdata", label: "App Data" },
]

const filtered_sub_tabs = computed(() => {
    if (search_type.value === "tx") {
        return SUB_TABS.filter((tab) => ["overview", "appdata"].includes(tab.id))
    }
    return SUB_TABS
})

const tx_overview_items = [
    ["TxID", MOCK_TX.txid.slice(0, 32) + "..."],
    ["Confirmations", MOCK_TX.confirmations.toString()],
    ["Block Height", MOCK_TX.block_height.toString()],
    ["Size", `${MOCK_TX.size} bytes`],
]

const address_overview_items = [
    ["Address", MOCK_ADDRESS.address],
    ["Balance", `${MOCK_ADDRESS.balance} BSV`],
    ["Unconfirmed", `${MOCK_ADDRESS.unconfirmed} BSV`],
    ["UTXO Count", MOCK_ADDRESS.utxos.toString()],
    ["TX History", MOCK_ADDRESS.tx_count.toString()],
]

const utxo_headers = ["TxHash", "Index", "Value (sats)", "Height"]

const mock_tx_rows = Array.from({ length: 5 }, (_, i) => ({
    tx: `tx${i + 1}abc...${(1000 + i).toString(16)}`,
    height: 871234 - i * 10,
}))

const app_data_swaps = [
    { amounts: "0.5 BSV → 23.6 DSTAS", status: "confirmed" },
    { amounts: "0.1 BSV → 4.7 DSTAS", status: "confirmed" },
]

function handleSearch() {
    if (!search_query.value) return
    search_type.value = search_query.value.length === 64 ? "tx" : "address"
    is_searched.value = true
    sub_tab.value = "overview"
}
</script>
