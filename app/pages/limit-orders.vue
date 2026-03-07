<template>
    <div :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-6">
            <!-- Title -->
            <div>
                <h1 :class="text">Limit Orders</h1>
                <p :class="`text-sm ${text_muted} mt-1`">
                    Place orders that execute automatically when your target
                    price is reached.
                </p>
            </div>

            <!-- Place Order -->
            <div class="space-y-3">
                <h2 :class="text">Place Order</h2>
                <div :class="`border ${border} rounded-2xl p-4 space-y-3`">
                    <!-- Pool Selector -->
                    <div>
                        <label :class="`text-xs ${text_muted} mb-1.5 block`"
                            >Pool</label
                        >
                        <select v-model="selected_pool" :class="input_cls">
                            <option
                                v-for="p in mock_pools"
                                :key="p.id"
                                :value="p.id"
                            >
                                {{ p.label }}
                            </option>
                        </select>
                    </div>

                    <!-- Current Price -->
                    <div
                        :class="`rounded-xl p-3 border ${border} flex justify-between`"
                    >
                        <span :class="`text-xs ${text_muted}`"
                            >Current Price</span
                        >
                        <span :class="`text-xs ${text}`">{{
                            active_pool.price
                        }}</span>
                    </div>

                    <!-- Direction -->
                    <div>
                        <label :class="`text-xs ${text_muted} mb-1.5 block`"
                            >Direction</label
                        >
                        <div
                            class="flex rounded-xl border overflow-hidden"
                            :style="{ borderColor: is_dark ? '#1a1a1a' : '#e5e7eb', }"
                        >
                            <button
                                v-for="d in direction_options"
                                :key="d.id"
                                :class="`flex-1 py-2 text-sm transition-colors ${ direction === d.id ? 'bg-white text-black' : text_muted }`"
                                @click="direction = d.id"
                            >
                                {{ d.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Amount & Target Price -->
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label :class="`text-xs ${text_muted} mb-1.5 block`"
                                >Amount</label
                            >
                            <input
                                v-model="amount"
                                placeholder="0.00"
                                :class="input_cls"
                            />
                        </div>
                        <div>
                            <label :class="`text-xs ${text_muted} mb-1.5 block`"
                                >Target Price</label
                            >
                            <input
                                v-model="target_price"
                                placeholder="0.00"
                                :class="input_cls"
                            />
                        </div>
                    </div>

                    <!-- Expiry -->
                    <div>
                        <label :class="`text-xs ${text_muted} mb-1.5 block`"
                            >Expiry (hours)</label
                        >
                        <input
                            v-model="expiry"
                            placeholder="24"
                            :class="input_cls"
                        />
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2">
                        <template v-if="wallet_connected">
                            <button
                                class="flex-1 py-2.5 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus :size="14" />
                                Place Limit Order
                            </button>
                            <button
                                :class="`px-4 py-2.5 rounded-xl border ${border} text-sm ${text_muted} hover:bg-[#111] transition-colors`"
                            >
                                Check Price Match
                            </button>
                        </template>
                        <button
                            v-else
                            class="flex-1 py-2.5 bg-white text-black rounded-xl text-sm"
                            @click="openWalletModal"
                        >
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </div>

            <!-- Orders List -->
            <div class="space-y-3">
                <h2 :class="text">Orders</h2>
                <div class="space-y-3">
                    <div
                        v-for="order in mock_orders"
                        :key="order.id"
                        :class="`rounded-xl p-3 border ${border}`"
                    >
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2">
                                <span :class="`text-sm ${text}`">{{
                                    order.pair
                                }}</span>
                                <span
                                    :class="`text-xs px-2 py-0.5 rounded-full border ${status_colors[order.status]}`"
                                >
                                    {{ order.status }}
                                </span>
                            </div>
                            <button
                                v-if="order.status === 'open'"
                                class="text-red-400 hover:text-red-300 transition-colors"
                            >
                                <X :size="14" />
                            </button>
                        </div>
                        <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div
                                v-for="field in getOrderFields(order)"
                                :key="field.label"
                                class="flex justify-between"
                            >
                                <span :class="`text-xs ${text_muted}`">{{
                                    field.label
                                }}</span>
                                <span :class="`text-xs ${text}`">{{
                                    field.value
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Plus, X } from "lucide-vue-next"

const { is_dark, bg, border, text, text_muted, input_cls } = useTheme()
const { wallet_connected, openWalletModal } = useWallet()

const selected_pool = ref("pool1")
const direction = ref<"a" | "b">("a")
const amount = ref("")
const target_price = ref("")
const expiry = ref("24")

const mock_pools = [
    { id: "pool1", label: "BSV / DSTAS", price: "47.23" },
    { id: "pool2", label: "BSV / wUSDC", price: "62.10" },
    { id: "pool3", label: "DSTAS / DXS", price: "0.382" },
]

const mock_orders = [
    {
        id: "ord1",
        pair: "BSV → DSTAS",
        status: "open",
        amount: "0.5",
        target_price: "48.00",
        filled: "0.0",
        created: "2026-02-25 10:23",
        expires: "2026-02-26 10:23",
    },
    {
        id: "ord2",
        pair: "BSV → wUSDC",
        status: "filled",
        amount: "1.0",
        target_price: "63.00",
        filled: "1.0",
        created: "2026-02-24 14:10",
        expires: "2026-02-25 14:10",
    },
    {
        id: "ord3",
        pair: "DSTAS → BSV",
        status: "expired",
        amount: "100",
        target_price: "0.022",
        filled: "0.0",
        created: "2026-02-23 09:00",
        expires: "2026-02-24 09:00",
    },
]

const status_colors: Record<string, string> = {
    open: "text-white/70 bg-white/5 border-white/10",
    filled: "text-green-400 bg-green-500/10 border-green-500/30",
    cancelled: "text-red-400 bg-red-500/10 border-red-500/30",
    expired: "text-[#555] bg-white/3 border-white/8",
}

const direction_options = [
    { id: "a" as const, label: "Sell Token A" },
    { id: "b" as const, label: "Sell Token B" },
]

const active_pool = computed(() => mock_pools.find((p) => p.id === selected_pool.value)!)

interface MockOrder {
    id: string
    pair: string
    status: string
    amount: string
    target_price: string
    filled: string
    created: string
    expires: string
}

function getOrderFields(order: MockOrder) {
    return [
        { label: "Amount", value: order.amount },
        { label: "Target Price", value: order.target_price },
        { label: "Filled", value: order.filled },
        { label: "Created", value: order.created },
        { label: "Expires", value: order.expires },
    ]
}
</script>
