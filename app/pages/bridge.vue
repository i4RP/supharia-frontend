<template>
    <div class="max-w-4xl mx-auto p-6 space-y-6">
        <h1 :class="[text, 'text-2xl font-bold']">Cross-Chain Bridge</h1>
        <p :class="text_muted">
            Bridge tokens between BSV and wrapped token networks
        </p>

        <!-- Bridge Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
                v-for="stat in bridge_stats"
                :key="stat.label"
                :class="[border, 'border rounded-xl p-4']"
            >
                <div :class="[text_muted, 'text-xs']">{{ stat.label }}</div>
                <div :class="[text, 'text-lg font-bold mt-1']">
                    {{ stat.value }}
                </div>
            </div>
        </div>

        <!-- Bridge Form -->
        <div :class="[border, 'border rounded-xl p-6 space-y-4']">
            <div class="flex items-center gap-4">
                <div class="flex-1">
                    <label :class="[text_muted, 'text-xs block mb-1']"
                        >Network</label
                    >
                    <select v-model="network" :class="input_cls">
                        <option value="mainnet">Mainnet</option>
                        <option value="testnet">Testnet</option>
                    </select>
                </div>
                <div class="flex-1">
                    <label :class="[text_muted, 'text-xs block mb-1']"
                        >Direction</label
                    >
                    <select v-model="direction" :class="input_cls">
                        <option value="wrap">Wrap</option>
                        <option value="unwrap">Unwrap</option>
                    </select>
                </div>
            </div>

            <div>
                <label :class="[text_muted, 'text-xs block mb-1']">Token</label>
                <select v-model="selected_token" :class="input_cls">
                    <option
                        v-for="token in available_tokens"
                        :key="token"
                        :value="token"
                    >
                        {{ token }}
                    </option>
                </select>
            </div>

            <div>
                <label :class="[text_muted, 'text-xs block mb-1']"
                    >Amount</label
                >
                <input
                    v-model="amount"
                    type="number"
                    placeholder="0.00"
                    :class="input_cls"
                />
            </div>

            <div v-if="tx_hash" :class="[border, 'border rounded-lg p-3']">
                <div :class="[text_muted, 'text-xs']">Transaction Hash</div>
                <div :class="[text, 'text-sm font-mono mt-1 break-all']">
                    {{ tx_hash }}
                </div>
            </div>

            <button
                class="w-full py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
                @click="executeBridge"
            >
                <ArrowLeftRight :size="14" class="inline mr-2" />
                {{ direction === "wrap" ? "Wrap" : "Unwrap" }}
                {{ selected_token }}
            </button>
        </div>

        <!-- Supported Tokens -->
        <div :class="[border, 'border rounded-xl p-6']">
            <h2 :class="[text, 'text-lg font-semibold mb-4']">
                Supported Tokens
            </h2>
            <div class="flex flex-wrap gap-2">
                <span
                    v-for="token in all_tokens"
                    :key="token"
                    :class="[ border, text_muted, 'border rounded-full px-3 py-1 text-xs']"
                    >{{ token }}</span
                >
            </div>
        </div>

        <!-- Transaction History -->
        <div :class="[border, 'border rounded-xl p-6']">
            <h2 :class="[text, 'text-lg font-semibold mb-4']">
                Recent Transactions
            </h2>
            <div class="space-y-3">
                <div
                    v-for="tx in transaction_history"
                    :key="tx.hash"
                    :class="[ border, 'border rounded-lg p-4 flex items-center justify-between']"
                >
                    <div>
                        <div :class="[text, 'text-sm font-medium']">
                            {{ tx.direction === "wrap" ? "Wrap" : "Unwrap" }}
                            {{ tx.token }}
                        </div>
                        <div :class="[text_muted, 'text-xs font-mono mt-1']">
                            {{ tx.hash }}
                        </div>
                    </div>
                    <div class="text-right">
                        <div :class="[text, 'text-sm']">{{ tx.amount }}</div>
                        <span
                            class="text-xs px-2 py-0.5 rounded-full"
                            :class="tx.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'"
                            >{{ tx.status }}</span
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ArrowLeftRight } from "lucide-vue-next"

const { text, text_muted, border, input_cls } = useTheme()

const network = ref<"mainnet" | "testnet">("mainnet")
const direction = ref<"wrap" | "unwrap">("wrap")
const selected_token = ref("BSV")
const amount = ref("")
const tx_hash = ref("")

const mainnet_tokens = ["BSV", "USDT", "USDC", "sBTC"]
const testnet_tokens = ["tBSV", "tUSDT", "tUSDC"]
const all_tokens = [...mainnet_tokens, ...testnet_tokens]

const available_tokens = computed(() => (network.value === "mainnet" ? mainnet_tokens : testnet_tokens))

watch(network, () => {
    selected_token.value = available_tokens.value[0]
})

const bridge_stats = [
    { label: "Total Bridged", value: "$12.4M" },
    { label: "24h Volume", value: "$842K" },
    { label: "Active Bridges", value: "1,247" },
    { label: "Avg. Time", value: "~3 min" },
]

const transaction_history = ref([
    {
        hash: "0x1a2b3c4d5e6f...7890abcd",
        direction: "wrap",
        token: "BSV",
        amount: "2.500 BSV",
        status: "confirmed",
    },
    {
        hash: "0x9f8e7d6c5b4a...3210fedc",
        direction: "unwrap",
        token: "USDT",
        amount: "1,000 USDT",
        status: "pending",
    },
    {
        hash: "0xabcdef012345...6789abcd",
        direction: "wrap",
        token: "USDC",
        amount: "500 USDC",
        status: "failed",
    },
])

function executeBridge() {
    if (!amount.value) return
    const mock_hash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    tx_hash.value = mock_hash
    transaction_history.value.unshift({
        hash: mock_hash.slice(0, 18) + "..." + mock_hash.slice(-8),
        direction: direction.value,
        token: selected_token.value,
        amount: `${amount.value} ${selected_token.value}`,
        status: "pending",
    })
    amount.value = ""
}
</script>
