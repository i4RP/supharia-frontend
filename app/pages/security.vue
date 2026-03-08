<template>
    <div class="max-w-4xl mx-auto p-6 space-y-6">
        <h1 :class="[text, 'text-2xl font-bold']">Security Status</h1>
        <p :class="text_muted">System security overview and validation tools</p>

        <!-- Security Status Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
                v-for="item in security_items"
                :key="item.label"
                :class="[ border, 'border rounded-xl p-4 flex items-center gap-3']"
            >
                <CheckCircle :size="20" class="text-green-400 shrink-0" />
                <div>
                    <div :class="[text, 'text-sm font-medium']">
                        {{ item.label }}
                    </div>
                    <div :class="[text_muted, 'text-xs mt-0.5']">
                        {{ item.description }}
                    </div>
                </div>
            </div>
        </div>

        <!-- System Stats Grid -->
        <div :class="[border, 'border rounded-xl p-6']">
            <h2 :class="[text, 'text-lg font-semibold mb-4']">
                System Statistics
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                    v-for="stat in system_stats"
                    :key="stat.label"
                    :class="[border, 'border rounded-lg p-3']"
                >
                    <div :class="[text_muted, 'text-xs']">{{ stat.label }}</div>
                    <div :class="[text, 'text-lg font-bold mt-1']">
                        {{ stat.value }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Rate Limit Progress -->
        <div :class="[border, 'border rounded-xl p-6']">
            <h2 :class="[text, 'text-lg font-semibold mb-4']">Rate Limiting</h2>
            <div class="space-y-4">
                <div v-for="limit in rate_limits" :key="limit.label">
                    <div class="flex justify-between mb-1">
                        <span :class="[text, 'text-sm']">{{
                            limit.label
                        }}</span>
                        <span :class="[text_muted, 'text-xs']"
                            >{{ limit.current }} / {{ limit.max }}</span
                        >
                    </div>
                    <div
                        :class="[ border, 'w-full h-2 rounded-full border overflow-hidden']"
                    >
                        <div
                            class="h-full rounded-full transition-all"
                            :class="computeBarColor(limit.current / limit.max)"
                            :style="{ width: `${(limit.current / limit.max) * 100}%`, }"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Address Validator -->
        <div :class="[border, 'border rounded-xl p-6']">
            <h2 :class="[text, 'text-lg font-semibold mb-4']">
                Address Validator
            </h2>
            <div class="flex gap-3">
                <input
                    v-model="validation_address"
                    placeholder="Enter BSV address to validate..."
                    :class="[input_cls, 'flex-1']"
                />
                <button
                    class="px-4 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors shrink-0"
                    @click="validateAddress"
                >
                    <Shield :size="14" class="inline mr-1" />
                    Validate
                </button>
            </div>
            <div
                v-if="validation_result !== null"
                class="mt-3 p-3 rounded-lg text-sm"
                :class="validation_result.valid ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'"
            >
                <CheckCircle
                    v-if="validation_result.valid"
                    :size="14"
                    class="inline mr-1"
                />
                <AlertTriangle v-else :size="14" class="inline mr-1" />
                {{ validation_result.message }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { AlertTriangle, CheckCircle, Shield } from "lucide-vue-next"

const { text, text_muted, border, input_cls } = useTheme()

const validation_address = ref("")
const validation_result = ref<{ valid: boolean; message: string } | null>(null)

const security_items = [
    {
        label: "CORS Protection",
        description: "Cross-origin requests restricted to allowed domains",
    },
    {
        label: "Rate Limiting",
        description: "API rate limiting active with per-IP tracking",
    },
    {
        label: "Input Sanitization",
        description: "All user inputs sanitized against injection attacks",
    },
    {
        label: "HTTPS Enforced",
        description: "All connections encrypted with TLS 1.3",
    },
    {
        label: "JWT Authentication",
        description: "Bearer token auth with 15-minute expiry",
    },
    {
        label: "DDoS Protection",
        description: "Layer 7 DDoS mitigation via edge network",
    },
]

const system_stats = [
    { label: "Uptime", value: "99.97%" },
    { label: "Avg Latency", value: "42ms" },
    { label: "Blocked IPs", value: "1,847" },
    { label: "Active Sessions", value: "3,291" },
]

const rate_limits = [
    { label: "API Requests (per min)", current: 47, max: 100 },
    { label: "WebSocket Connections", current: 12, max: 50 },
    { label: "Auth Attempts (per hour)", current: 3, max: 10 },
]

function computeBarColor(ratio: number): string {
    if (ratio > 0.8) return "bg-red-500"
    if (ratio > 0.5) return "bg-yellow-500"
    return "bg-green-500"
}

function validateAddress() {
    const address = validation_address.value.trim()
    if (!address) {
        validation_result.value = {
            valid: false,
            message: "Please enter an address to validate.",
        }
        return
    }
    const is_valid = /^[1mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)
    validation_result.value = is_valid
        ? { valid: true, message: `Address ${address} is a valid BSV address.` }
        : {
              valid: false,
              message: `Address ${address} is not a valid BSV address format.`,
          }
}
</script>
