<template>
    <div class="max-w-6xl mx-auto p-6">
        <div class="flex gap-6">
            <!-- Sidebar (Desktop) -->
            <nav
                class="hidden md:block w-56 shrink-0 sticky top-20 self-start"
            >
                <div :class="[border, 'border rounded-xl p-4']">
                    <h3 :class="[text, 'text-sm font-semibold mb-3']">Documentation</h3>
                    <ul class="space-y-1">
                        <li v-for="section in doc_sections" :key="section.key">
                            <button
                                class="w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors"
                                :class="active_section === section.key ? 'bg-white/10 text-white' : [text_muted, hover_bg]"
                                @click="active_section = section.key"
                            >
                                {{ section.label }}
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            <!-- Content Area -->
            <div class="flex-1 min-w-0">
                <!-- Mobile Selector -->
                <div class="md:hidden mb-4">
                    <select
                        v-model="active_section"
                        :class="input_cls"
                    >
                        <option
                            v-for="section in doc_sections"
                            :key="section.key"
                            :value="section.key"
                        >{{ section.label }}</option>
                    </select>
                </div>

                <!-- Introduction -->
                <div v-if="active_section === 'intro'" :class="[border, 'border rounded-xl p-6 space-y-4']">
                    <h1 :class="[text, 'text-2xl font-bold']">Introduction</h1>
                    <p :class="[text, 'text-sm leading-relaxed']">
                        DXS Swap is a decentralized exchange built on BSV, providing high-performance
                        token swaps, cross-chain bridging, and advanced DeFi features. This documentation
                        covers the complete API reference, integration guides, and protocol specifications.
                    </p>
                    <div :class="[border, 'border rounded-lg p-4']">
                        <h3 :class="[text, 'text-sm font-semibold mb-2']">Key Features</h3>
                        <ul :class="[text_muted, 'text-sm space-y-1 list-disc list-inside']">
                            <li>Instant token swaps with minimal slippage</li>
                            <li>Cross-chain bridging via wrapped tokens</li>
                            <li>Governance voting for protocol parameters</li>
                            <li>S402 AI agent payment protocol</li>
                            <li>Real-time WebSocket price feeds</li>
                        </ul>
                    </div>
                    <div :class="[border, 'border rounded-lg p-4']">
                        <h3 :class="[text, 'text-sm font-semibold mb-2']">Getting Started</h3>
                        <p :class="[text_muted, 'text-sm']">
                            To begin integrating with DXS, you need an API key. Request one through the
                            developer portal or connect your wallet to generate credentials automatically.
                        </p>
                    </div>
                </div>

                <!-- Quick Start -->
                <div v-else-if="active_section === 'quickstart'" :class="[border, 'border rounded-xl p-6 space-y-4']">
                    <h1 :class="[text, 'text-2xl font-bold']">Quick Start</h1>
                    <p :class="[text_muted, 'text-sm']">Get up and running in under 5 minutes.</p>

                    <div class="space-y-4">
                        <div>
                            <h3 :class="[text, 'text-sm font-semibold mb-2']">1. Install the SDK</h3>
                            <pre :class="[border, 'border rounded-lg p-4 text-sm overflow-x-auto']"><code :class="text">npm install @dxs/sdk</code></pre>
                        </div>
                        <div>
                            <h3 :class="[text, 'text-sm font-semibold mb-2']">2. Initialize the Client</h3>
                            <pre :class="[border, 'border rounded-lg p-4 text-sm overflow-x-auto']"><code :class="text">import { DXSClient } from "@dxs/sdk"

const client = new DXSClient({
    network: "mainnet",
    api_key: "your-api-key"
})</code></pre>
                        </div>
                        <div>
                            <h3 :class="[text, 'text-sm font-semibold mb-2']">3. Execute a Swap</h3>
                            <pre :class="[border, 'border rounded-lg p-4 text-sm overflow-x-auto']"><code :class="text">const result = await client.swap({
    from: "BSV",
    to: "USDT",
    amount: "1.5"
})
console.log(result.tx_hash)</code></pre>
                        </div>
                    </div>
                </div>

                <!-- Endpoints -->
                <div v-else-if="active_section === 'endpoints'" :class="[border, 'border rounded-xl p-6 space-y-4']">
                    <h1 :class="[text, 'text-2xl font-bold']">API Endpoints</h1>
                    <p :class="[text_muted, 'text-sm']">Base URL: <code>https://api.dxs.io/v1</code></p>

                    <div class="space-y-3">
                        <div
                            v-for="endpoint in api_endpoints"
                            :key="endpoint.path"
                            :class="[border, 'border rounded-lg p-4']"
                        >
                            <div class="flex items-center gap-2">
                                <span
                                    class="text-xs px-2 py-0.5 rounded font-mono font-bold"
                                    :class="methodColor(endpoint.method)"
                                >{{ endpoint.method }}</span>
                                <code :class="[text, 'text-sm']">{{ endpoint.path }}</code>
                            </div>
                            <p :class="[text_muted, 'text-xs mt-2']">{{ endpoint.description }}</p>
                        </div>
                    </div>
                </div>

                <!-- Default: Coming Soon -->
                <div v-else :class="[border, 'border rounded-xl p-8 text-center']">
                    <FileText :size="40" :class="[text_muted, 'mx-auto mb-3']" />
                    <h2 :class="[text, 'text-lg font-medium mb-2']">
                        {{ currentSectionLabel }}
                    </h2>
                    <p :class="[text_muted, 'text-sm']">Documentation coming soon.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FileText } from "lucide-vue-next"

const { text, text_muted, border, input_cls, hover_bg } = useTheme()

type DocSection =
    | "intro"
    | "quickstart"
    | "endpoints"
    | "authentication"
    | "websockets"
    | "tokens"
    | "bridge"
    | "governance"
    | "s402"
    | "errors"

const active_section = ref<DocSection>("intro")

const doc_sections: { key: DocSection; label: string }[] = [
    { key: "intro", label: "Introduction" },
    { key: "quickstart", label: "Quick Start" },
    { key: "endpoints", label: "API Endpoints" },
    { key: "authentication", label: "Authentication" },
    { key: "websockets", label: "WebSockets" },
    { key: "tokens", label: "Tokens" },
    { key: "bridge", label: "Bridge" },
    { key: "governance", label: "Governance" },
    { key: "s402", label: "S402 Protocol" },
    { key: "errors", label: "Error Codes" },
]

const currentSectionLabel = computed(() => doc_sections.find((s) => s.key === active_section.value)?.label ?? "")

const api_endpoints = [
    { method: "GET", path: "/health", description: "Health check endpoint. Returns server status." },
    { method: "GET", path: "/token", description: "List all available tokens with metadata." },
    { method: "GET", path: "/token/:symbol/price", description: "Get current price for a specific token." },
    { method: "POST", path: "/swap", description: "Execute a token swap between two assets." },
    { method: "GET", path: "/swap/:id", description: "Get status of a pending or completed swap." },
    { method: "POST", path: "/bridge/wrap", description: "Wrap a native token to its cross-chain equivalent." },
    { method: "POST", path: "/bridge/unwrap", description: "Unwrap a bridged token back to its native chain." },
    { method: "GET", path: "/governance/proposal", description: "List all governance proposals." },
    { method: "POST", path: "/governance/vote", description: "Cast a vote on an active proposal." },
    { method: "POST", path: "/s402/payment", description: "Send an S402 micropayment to an AI agent." },
]

function methodColor(method: string): string {
    const colors: Record<string, string> = {
        GET: "bg-green-500/20 text-green-400",
        POST: "bg-blue-500/20 text-blue-400",
        PUT: "bg-yellow-500/20 text-yellow-400",
        DELETE: "bg-red-500/20 text-red-400",
    }
    return colors[method] ?? "bg-gray-500/20 text-gray-400"
}
</script>
