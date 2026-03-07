<template>
    <div :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-6">
            <!-- Title -->
            <div>
                <h1 :class="text">Swap</h1>
                <p :class="`text-sm ${text_muted} mt-1`">
                    Trade tokens instantly on BSV Mainnet.
                </p>
            </div>

            <!-- Protocol Stats -->
            <div class="grid grid-cols-3 gap-3">
                <div
                    v-for="stat in protocol_stats"
                    :key="stat.label"
                    :class="`rounded-xl p-3 border ${border} text-center`"
                >
                    <p :class="`text-xs ${text_muted}`">{{ stat.label }}</p>
                    <p :class="`text-sm ${text} mt-0.5`">{{ stat.value }}</p>
                </div>
            </div>

            <!-- Swap Form -->
            <div
                :class="`${is_dark ? 'bg-[#0a0a0a]' : 'bg-white'} border ${border} rounded-2xl p-4`"
            >
                <div class="flex items-center justify-between mb-4">
                    <h2 :class="`text-sm ${text}`">Swap</h2>
                    <button
                        :class="`p-2 rounded-lg ${hover_bg} ${text_muted} transition-colors`"
                        @click="toggleSlippage"
                    >
                        <Settings :size="16" />
                    </button>
                </div>

                <!-- Slippage Panel -->
                <div
                    v-if="show_slippage"
                    :class="`rounded-xl p-3 border ${border} mb-4`"
                >
                    <p :class="`text-xs ${text_muted} mb-2`">
                        Slippage Tolerance
                    </p>
                    <div class="flex gap-2 flex-wrap">
                        <button
                            v-for="s in SLIPPAGES"
                            :key="s"
                            :class="`px-3 py-1 rounded-lg text-xs transition-colors ${ slippage === s ? 'bg-white text-black' : `border ${border} ${text_muted} ${hover_bg}` }`"
                            @click="slippage = s"
                        >
                            {{ s }}%
                        </button>
                        <input
                            v-model="custom_slippage"
                            placeholder="Custom"
                            :class="`w-16 px-2 py-1 rounded-lg text-xs border ${border} ${inner_bg} ${text} outline-none`"
                        />
                    </div>
                    <p
                        v-if="parseFloat(slippage || custom_slippage) > 5"
                        class="text-amber-400 text-xs mt-2"
                    >
                        High slippage. Your trade may be frontrun.
                    </p>
                </div>

                <!-- From Section -->
                <div
                    :class="`${inner_bg} rounded-xl p-3 border ${border} mb-2`"
                >
                    <div class="flex items-center justify-between mb-2">
                        <span :class="`text-xs ${text_muted}`">From</span>
                        <span :class="`text-xs ${text_muted}`">
                            Balance: 1.2341 {{ from_token.symbol }}
                        </span>
                    </div>
                    <div class="flex items-center gap-3">
                        <button
                            :class="`flex items-center gap-2 px-3 py-2 rounded-xl ${hover_bg} border ${border} transition-colors shrink-0`"
                            @click="selecting_for = 'from'"
                        >
                            <div
                                class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                                :style="{ backgroundColor: from_token.color }"
                            >
                                {{ from_token.symbol[0] }}
                            </div>
                            <span :class="`text-sm ${text}`">{{
                                from_token.symbol
                            }}</span>
                            <ChevronDown :size="14" :class="text_muted" />
                        </button>
                        <input
                            v-model="from_amount"
                            placeholder="0.00"
                            :class="`flex-1 bg-transparent text-right text-xl ${text} outline-none`"
                        />
                    </div>
                    <div class="flex justify-end mt-1">
                        <div class="flex gap-2">
                            <button
                                v-for="pct in percentage_buttons"
                                :key="pct"
                                :class="`text-xs text-white/50 ${hover_bg} px-1.5 py-0.5 rounded`"
                            >
                                {{ pct }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Swap Direction Button -->
                <div class="flex justify-center my-2">
                    <button
                        :class="`p-2 rounded-xl border ${border} ${hover_bg} ${text_muted} transition-all hover:rotate-180`"
                        @click="handleSwapTokens"
                    >
                        <ArrowUpDown :size="16" />
                    </button>
                </div>

                <!-- To Section -->
                <div
                    :class="`${inner_bg} rounded-xl p-3 border ${border} mb-4`"
                >
                    <div class="flex items-center justify-between mb-2">
                        <span :class="`text-xs ${text_muted}`">To</span>
                        <span :class="`text-xs ${text_muted}`">
                            Balance: 0.0000 {{ to_token.symbol }}
                        </span>
                    </div>
                    <div class="flex items-center gap-3">
                        <button
                            :class="`flex items-center gap-2 px-3 py-2 rounded-xl ${hover_bg} border ${border} transition-colors shrink-0`"
                            @click="selecting_for = 'to'"
                        >
                            <div
                                class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                                :style="{ backgroundColor: to_token.color }"
                            >
                                {{ to_token.symbol[0] }}
                            </div>
                            <span :class="`text-sm ${text}`">{{
                                to_token.symbol
                            }}</span>
                            <ChevronDown :size="14" :class="text_muted" />
                        </button>
                        <div
                            :class="`flex-1 text-right text-xl ${to_amount ? text : text_muted}`"
                        >
                            {{ to_amount || "0.00" }}
                        </div>
                    </div>
                </div>

                <!-- Rate Display -->
                <div
                    v-if="from_amount"
                    :class="`text-xs ${text_muted} text-center mb-4`"
                >
                    {{ rate }}
                </div>

                <!-- Action Button -->
                <button
                    v-if="!wallet_connected"
                    class="w-full py-3.5 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                    @click="openWalletModal"
                >
                    <Wallet :size="16" />
                    Connect Wallet
                </button>
                <button
                    v-else-if="!from_amount"
                    class="w-full py-3.5 bg-[#111] text-[#555] rounded-xl text-sm cursor-not-allowed"
                >
                    Enter Amount
                </button>
                <button
                    v-else
                    class="w-full py-3.5 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                    <Zap :size="16" />
                    Swap
                </button>

                <!-- Details Accordion -->
                <div v-if="from_amount" class="mt-3">
                    <button
                        :class="`w-full flex items-center justify-between text-xs ${text_muted} py-2`"
                        @click="toggleDetails"
                    >
                        <div class="flex items-center gap-1">
                            <Info :size="12" />
                            <span
                                >1 {{ from_token.symbol }} ≈ 47.23
                                {{ to_token.symbol }}</span
                            >
                        </div>
                        <ChevronUp v-if="show_details" :size="12" />
                        <ChevronDown v-else :size="12" />
                    </button>

                    <div
                        v-if="show_details"
                        :class="`rounded-xl p-3 border ${border} space-y-2 mt-1`"
                    >
                        <div
                            v-for="detail in detail_rows"
                            :key="detail.label"
                            class="flex items-center justify-between"
                        >
                            <span :class="`text-xs ${text_muted}`">{{
                                detail.label
                            }}</span>
                            <span :class="`text-xs ${detail.color}`">{{
                                detail.value
                            }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Token Selector Modal -->
        <ModalTokenSelectorModal
            :model-value="selecting_for !== null"
            @update:model-value="(val: boolean) => { if (!val) selecting_for = null }"
            @select="handleTokenSelect"
        />
    </div>
</template>

<script setup lang="ts">
import { ArrowUpDown, ChevronDown, ChevronUp, Info, Settings, Wallet, Zap } from "lucide-vue-next"
import { SLIPPAGES, TOKENS } from "~/constants/tokens"
import type { Token } from "~/types/token"

const { is_dark, bg, border, text, text_muted, hover_bg } = useTheme()
const { wallet_connected, openWalletModal } = useWallet()

const from_token = ref<Token>(TOKENS[0])
const to_token = ref<Token>(TOKENS[1])
const from_amount = ref("")
const slippage = ref("0.5")
const custom_slippage = ref("")
const show_details = ref(false)
const show_slippage = ref(false)
const selecting_for = ref<"from" | "to" | null>(null)

const inner_bg = computed(() => (is_dark.value ? "bg-black" : "bg-gray-50"))

const to_amount = computed(() => (from_amount.value ? (parseFloat(from_amount.value) * 47.23).toFixed(6) : ""))

const rate = "1 BSV = 47.2300 DSTAS"
const price_impact = "0.12"

const protocol_stats = [
    { label: "Total TVL", value: "$2.41M" },
    { label: "24h Volume", value: "$183.2K" },
    { label: "Total Pools", value: "12" },
]

const percentage_buttons = ["25%", "50%", "MAX"]

const detail_rows = computed(() => [
    {
        label: "Price Impact",
        value: `${price_impact}%`,
        color: "text-green-400",
    },
    { label: "Network Fee", value: "~0.00001 BSV", color: text_muted.value },
    {
        label: "Minimum Received",
        value: `${(parseFloat(to_amount.value || "0") * 0.995).toFixed(6)} ${to_token.value.symbol}`,
        color: text_muted.value,
    },
    {
        label: "Slippage Tolerance",
        value: `${slippage.value}%`,
        color: text_muted.value,
    },
    {
        label: "Route",
        value: `${from_token.value.symbol} → ${to_token.value.symbol}`,
        color: "text-white/60",
    },
    {
        label: "Spend Type",
        value: "DSTAS Swap (type=4)",
        color: text_muted.value,
    },
    { label: "Network", value: "BSV Mainnet", color: text_muted.value },
])

function toggleSlippage() {
    show_slippage.value = !show_slippage.value
}

function toggleDetails() {
    show_details.value = !show_details.value
}

function handleSwapTokens() {
    const temp = from_token.value
    from_token.value = to_token.value
    to_token.value = temp
}

function handleTokenSelect(token: Token) {
    if (selecting_for.value === "from") {
        from_token.value = token
    } else {
        to_token.value = token
    }
    selecting_for.value = null
}
</script>
