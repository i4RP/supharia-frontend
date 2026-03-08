<template>
    <div class="max-w-4xl mx-auto p-6 space-y-6">
        <h1 :class="[text, 'text-2xl font-bold']">S402 Protocol</h1>
        <p :class="text_muted">
            AI Agent Payments Protocol for autonomous machine-to-machine
            transactions
        </p>

        <!-- Section Tabs -->
        <div class="flex flex-wrap gap-2">
            <button
                v-for="tab in section_tabs"
                :key="tab.key"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="active_section === tab.key ? 'bg-white text-black' : [border, text_muted, hover_bg, 'border']"
                @click="active_section = tab.key"
            >
                {{ tab.label }}
            </button>
        </div>

        <!-- Protocol Info -->
        <div
            v-if="active_section === 'protocol'"
            :class="[border, 'border rounded-xl p-6 space-y-4']"
        >
            <h2 :class="[text, 'text-lg font-semibold']">
                <Cpu :size="18" class="inline mr-2" />
                Protocol Overview
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    v-for="info in protocol_info"
                    :key="info.label"
                    :class="[border, 'border rounded-lg p-4']"
                >
                    <div :class="[text_muted, 'text-xs']">{{ info.label }}</div>
                    <div :class="[text, 'text-sm font-medium mt-1']">
                        {{ info.value }}
                    </div>
                </div>
            </div>
            <div :class="[border, 'border rounded-lg p-4']">
                <div :class="[text_muted, 'text-xs mb-2']">How It Works</div>
                <ol
                    :class="[ text, 'text-sm space-y-2 list-decimal list-inside']"
                >
                    <li>
                        AI agents register with the S402 protocol and receive an
                        agent ID
                    </li>
                    <li>Service providers publish pricing for API endpoints</li>
                    <li>Agents negotiate and establish payment channels</li>
                    <li>
                        Micropayments are streamed per-request via BSV
                        transactions
                    </li>
                    <li>Settlement occurs on-chain with full auditability</li>
                </ol>
            </div>
        </div>

        <!-- Dashboard -->
        <div v-if="active_section === 'dashboard'" class="space-y-4">
            <h2 :class="[text, 'text-lg font-semibold']">Dashboard</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                    v-for="stat in dashboard_stats"
                    :key="stat.label"
                    :class="[border, 'border rounded-xl p-4']"
                >
                    <div :class="[text_muted, 'text-xs']">{{ stat.label }}</div>
                    <div :class="[text, 'text-xl font-bold mt-1']">
                        {{ stat.value }}
                    </div>
                    <div
                        v-if="stat.change"
                        class="text-xs mt-1"
                        :class="stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'"
                    >
                        {{ stat.change }}
                    </div>
                </div>
            </div>

            <div :class="[border, 'border rounded-xl p-6']">
                <h3 :class="[text, 'text-sm font-semibold mb-3']">
                    Recent Transactions
                </h3>
                <div class="space-y-2">
                    <div
                        v-for="tx in dashboard_transactions"
                        :key="tx.id"
                        :class="[ border, 'border rounded-lg p-3 flex items-center justify-between']"
                    >
                        <div>
                            <div :class="[text, 'text-sm']">
                                {{ tx.description }}
                            </div>
                            <div :class="[text_muted, 'text-xs']">
                                {{ tx.time }}
                            </div>
                        </div>
                        <div :class="[text, 'text-sm font-mono']">
                            {{ tx.amount }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Agents -->
        <div v-if="active_section === 'agents'" class="space-y-4">
            <h2 :class="[text, 'text-lg font-semibold']">Agent Registration</h2>

            <div :class="[border, 'border rounded-xl p-6 space-y-4']">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label :class="[text_muted, 'text-xs block mb-1']"
                            >Agent Name</label
                        >
                        <input
                            v-model="agent_form.name"
                            placeholder="e.g. Trading Bot Alpha"
                            :class="input_cls"
                        />
                    </div>
                    <div>
                        <label :class="[text_muted, 'text-xs block mb-1']"
                            >Agent Type</label
                        >
                        <select v-model="agent_form.type" :class="input_cls">
                            <option value="trading">Trading</option>
                            <option value="data">Data</option>
                            <option value="compute">Compute</option>
                            <option value="storage">Storage</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label :class="[text_muted, 'text-xs block mb-1']"
                        >Endpoint URL</label
                    >
                    <input
                        v-model="agent_form.endpoint"
                        placeholder="https://api.example.com/agent"
                        :class="input_cls"
                    />
                </div>
                <div>
                    <label :class="[text_muted, 'text-xs block mb-1']"
                        >Description</label
                    >
                    <textarea
                        v-model="agent_form.description"
                        placeholder="Describe your agent's capabilities..."
                        rows="3"
                        :class="input_cls"
                    />
                </div>
                <button
                    class="px-4 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                    @click="registerAgent"
                >
                    <Bot :size="14" class="inline mr-1" />
                    Register Agent
                </button>
            </div>

            <!-- Registered Agents -->
            <div class="space-y-3">
                <div
                    v-for="agent in registered_agents"
                    :key="agent.id"
                    :class="[ border, 'border rounded-lg p-4 flex items-center justify-between']"
                >
                    <div>
                        <div :class="[text, 'text-sm font-medium']">
                            {{ agent.name }}
                        </div>
                        <div :class="[text_muted, 'text-xs']">
                            {{ agent.type }} &middot; {{ agent.endpoint }}
                        </div>
                    </div>
                    <span
                        class="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400"
                        >active</span
                    >
                </div>
            </div>
        </div>

        <!-- Payment -->
        <div v-if="active_section === 'payment'" class="space-y-4">
            <h2 :class="[text, 'text-lg font-semibold']">Send Payment</h2>

            <div :class="[border, 'border rounded-xl p-6 space-y-4']">
                <div>
                    <label :class="[text_muted, 'text-xs block mb-1']"
                        >Recipient Agent ID</label
                    >
                    <input
                        v-model="payment_form.recipient"
                        placeholder="agent_xxxxxxxxxxxx"
                        :class="input_cls"
                    />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label :class="[text_muted, 'text-xs block mb-1']"
                            >Amount (satoshis)</label
                        >
                        <input
                            v-model="payment_form.amount"
                            type="number"
                            placeholder="1000"
                            :class="input_cls"
                        />
                    </div>
                    <div>
                        <label :class="[text_muted, 'text-xs block mb-1']"
                            >Memo</label
                        >
                        <input
                            v-model="payment_form.memo"
                            placeholder="API call payment"
                            :class="input_cls"
                        />
                    </div>
                </div>
                <button
                    class="w-full py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
                    @click="sendPayment"
                >
                    <CreditCard :size="14" class="inline mr-2" />
                    Send Payment
                </button>
                <div
                    v-if="payment_result"
                    class="p-3 rounded-lg text-sm bg-green-500/10 text-green-400 border border-green-500/30"
                >
                    {{ payment_result }}
                </div>
            </div>
        </div>

        <!-- Pricing -->
        <div v-if="active_section === 'pricing'" class="space-y-4">
            <h2 :class="[text, 'text-lg font-semibold']">Pricing Management</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    v-for="tier in pricing_tiers"
                    :key="tier.name"
                    :class="[border, 'border rounded-xl p-6']"
                >
                    <div :class="[text, 'text-lg font-bold']">
                        {{ tier.name }}
                    </div>
                    <div class="text-3xl font-bold mt-2" :class="text">
                        {{ tier.price }}
                        <span :class="[text_muted, 'text-sm font-normal']">{{
                            tier.unit
                        }}</span>
                    </div>
                    <ul class="mt-4 space-y-2">
                        <li
                            v-for="feature in tier.features"
                            :key="feature"
                            :class="[ text_muted, 'text-sm flex items-center gap-2']"
                        >
                            <Check :size="14" class="text-green-400 shrink-0" />
                            {{ feature }}
                        </li>
                    </ul>
                    <button
                        class="w-full mt-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        :class="tier.is_popular ? 'bg-white text-black hover:bg-white/90' : [border, text, hover_bg, 'border']"
                    >
                        {{ tier.is_popular ? "Get Started" : "Select Plan" }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Bot, Check, Cpu, CreditCard } from "lucide-vue-next"

const { text, text_muted, border, input_cls, hover_bg } = useTheme()

type SectionKey = "protocol" | "dashboard" | "agents" | "payment" | "pricing"

const active_section = ref<SectionKey>("protocol")

const section_tabs: { key: SectionKey; label: string }[] = [
    { key: "protocol", label: "Protocol" },
    { key: "dashboard", label: "Dashboard" },
    { key: "agents", label: "Agents" },
    { key: "payment", label: "Payment" },
    { key: "pricing", label: "Pricing" },
]

const protocol_info = [
    { label: "Protocol Version", value: "S402 v1.2.0" },
    { label: "Network", value: "BSV Mainnet" },
    { label: "Settlement Layer", value: "On-chain micropayments" },
    { label: "Agent Standard", value: "DXS Agent Framework" },
]

const dashboard_stats = [
    { label: "Total Payments", value: "12,847", change: "+12.4%" },
    { label: "Active Agents", value: "342", change: "+8.2%" },
    { label: "Volume (24h)", value: "4.2M sats", change: "+23.1%" },
    { label: "Avg. Latency", value: "120ms", change: "-5.3%" },
]

const dashboard_transactions = [
    {
        id: 1,
        description: "GPT-4 API call payment",
        amount: "1,200 sats",
        time: "2 min ago",
    },
    {
        id: 2,
        description: "Data feed subscription",
        amount: "500 sats",
        time: "8 min ago",
    },
    {
        id: 3,
        description: "Compute job settlement",
        amount: "3,400 sats",
        time: "15 min ago",
    },
]

const agent_form = reactive({
    name: "",
    type: "trading",
    endpoint: "",
    description: "",
})

const registered_agents = ref([
    {
        id: "agent_001",
        name: "Price Oracle Bot",
        type: "data",
        endpoint: "https://oracle.dxs.io/v1",
    },
    {
        id: "agent_002",
        name: "Arb Scanner",
        type: "trading",
        endpoint: "https://arb.dxs.io/v1",
    },
])

let next_agent_index = 3

function registerAgent() {
    if (!agent_form.name || !agent_form.endpoint) return
    registered_agents.value.push({
        id: `agent_${String(next_agent_index++).padStart(3, "0")}`,
        name: agent_form.name,
        type: agent_form.type,
        endpoint: agent_form.endpoint,
    })
    agent_form.name = ""
    agent_form.endpoint = ""
    agent_form.description = ""
}

const payment_form = reactive({
    recipient: "",
    amount: "",
    memo: "",
})

const payment_result = ref("")

function sendPayment() {
    if (!payment_form.recipient || !payment_form.amount) return
    payment_result.value = `Payment of ${payment_form.amount} sats sent to ${payment_form.recipient}. TX: ${generateMockTxId()}`
    payment_form.recipient = ""
    payment_form.amount = ""
    payment_form.memo = ""
}

function generateMockTxId(): string {
    return "tx_" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

const pricing_tiers = [
    {
        name: "Free",
        price: "0",
        unit: "sats/req",
        is_popular: false,
        features: ["100 requests/day", "Basic agent registration", "Community support", "Public endpoints only"],
    },
    {
        name: "Pro",
        price: "10",
        unit: "sats/req",
        is_popular: true,
        features: [
            "Unlimited requests",
            "Priority routing",
            "Custom agent profiles",
            "Premium endpoints",
            "24/7 support",
        ],
    },
    {
        name: "Enterprise",
        price: "Custom",
        unit: "",
        is_popular: false,
        features: [
            "Dedicated infrastructure",
            "SLA guarantees",
            "Custom integrations",
            "White-label options",
            "Account manager",
        ],
    },
]
</script>
