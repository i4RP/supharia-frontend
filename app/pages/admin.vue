<template>
    <div class="max-w-6xl mx-auto p-6 space-y-6">
        <h1 :class="[text, 'text-2xl font-bold']">Admin Dashboard</h1>

        <!-- Sub-tab Buttons -->
        <div class="flex flex-wrap gap-2">
            <button
                v-for="tab in admin_tabs"
                :key="tab.key"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="active_tab === tab.key ? 'bg-white text-black' : [border, text_muted, hover_bg, 'border']"
                @click="active_tab = tab.key"
            >
                {{ tab.label }}
            </button>
        </div>

        <!-- Overview Tab -->
        <template v-if="active_tab === 'overview'">
            <h2 :class="[text, 'text-lg font-semibold']">Health Metrics</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                    v-for="metric in health_metrics"
                    :key="metric.label"
                    :class="[border, 'border rounded-xl p-4']"
                >
                    <div class="flex items-center gap-2">
                        <div
                            class="w-2 h-2 rounded-full"
                            :class="metric.status === 'healthy' ? 'bg-green-500' : metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'"
                        />
                        <span :class="[text_muted, 'text-xs']">{{
                            metric.label
                        }}</span>
                    </div>
                    <div :class="[text, 'text-xl font-bold mt-2']">
                        {{ metric.value }}
                    </div>
                    <div :class="[text_muted, 'text-xs mt-1']">
                        {{ metric.detail }}
                    </div>
                </div>
            </div>
        </template>

        <!-- Users Tab -->
        <template v-if="active_tab === 'users'">
            <h2 :class="[text, 'text-lg font-semibold']">User Management</h2>
            <div :class="[border, 'border rounded-xl overflow-hidden']">
                <table class="w-full text-sm">
                    <thead>
                        <tr :class="is_dark ? 'bg-white/5' : 'bg-gray-100'">
                            <th
                                :class="[ text, 'text-left px-4 py-3 font-medium']"
                            >
                                Address
                            </th>
                            <th
                                :class="[ text, 'text-left px-4 py-3 font-medium']"
                            >
                                Role
                            </th>
                            <th
                                :class="[ text, 'text-left px-4 py-3 font-medium']"
                            >
                                Joined
                            </th>
                            <th
                                :class="[ text, 'text-left px-4 py-3 font-medium']"
                            >
                                Trades
                            </th>
                            <th
                                :class="[ text, 'text-left px-4 py-3 font-medium']"
                            >
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="user in users_list"
                            :key="user.address"
                            :class="[ border, 'border-t', hover_bg, 'transition-colors']"
                        >
                            <td :class="[text, 'px-4 py-3 font-mono text-xs']">
                                {{ user.address }}
                            </td>
                            <td :class="[text_muted, 'px-4 py-3']">
                                {{ user.role }}
                            </td>
                            <td :class="[text_muted, 'px-4 py-3']">
                                {{ user.joined }}
                            </td>
                            <td :class="[text, 'px-4 py-3']">
                                {{ user.trades }}
                            </td>
                            <td class="px-4 py-3">
                                <span
                                    class="text-xs px-2 py-0.5 rounded-full"
                                    :class="user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
                                    >{{ user.status }}</span
                                >
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>

        <!-- Logs Tab -->
        <template v-if="active_tab === 'logs'">
            <h2 :class="[text, 'text-lg font-semibold']">System Logs</h2>
            <div :class="[border, 'border rounded-xl p-4 space-y-2']">
                <div
                    v-for="log in system_logs"
                    :key="log.id"
                    :class="[ border, 'border rounded-lg px-4 py-2.5 flex items-start gap-3 text-sm']"
                >
                    <span
                        class="text-xs px-1.5 py-0.5 rounded font-mono font-bold shrink-0 mt-0.5"
                        :class="logLevelColor(log.level)"
                        >{{ log.level }}</span
                    >
                    <div class="flex-1 min-w-0">
                        <span :class="text">{{ log.message }}</span>
                        <div :class="[text_muted, 'text-xs mt-0.5']">
                            {{ log.timestamp }}
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Tokens Tab -->
        <template v-if="active_tab === 'tokens'">
            <h2 :class="[text, 'text-lg font-semibold']">Token Management</h2>

            <!-- Token Visibility Toggle Grid -->
            <div :class="[border, 'border rounded-xl p-6']">
                <h3 :class="[text, 'text-sm font-semibold mb-4']">
                    Token Visibility
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div
                        v-for="token in token_visibility"
                        :key="token.symbol"
                        :class="[ border, 'border rounded-lg p-3 flex items-center justify-between cursor-pointer transition-colors', hover_bg]"
                        @click="toggleTokenVisibility(token.symbol)"
                    >
                        <span :class="[text, 'text-sm font-medium']">{{
                            token.symbol
                        }}</span>
                        <div
                            class="w-8 h-4 rounded-full transition-colors relative"
                            :class="token.is_visible ? 'bg-green-500' : is_dark ? 'bg-[#333]' : 'bg-gray-300'"
                        >
                            <div
                                class="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all"
                                :class="token.is_visible ? 'left-4.5' : 'left-0.5'"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Allowlist -->
            <div :class="[border, 'border rounded-xl p-6']">
                <div class="flex items-center justify-between mb-4">
                    <h3 :class="[text, 'text-sm font-semibold']">
                        <Shield :size="14" class="inline mr-1" />
                        Allowlist
                    </h3>
                    <div class="flex gap-2">
                        <input
                            v-model="new_allowlist_address"
                            placeholder="Add address..."
                            :class="[input_cls, 'text-xs']"
                            style="width: 220px"
                        />
                        <button
                            class="px-3 py-2 rounded-lg text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                            @click="addToAllowlist"
                        >
                            Add
                        </button>
                    </div>
                </div>
                <div class="space-y-1">
                    <div
                        v-for="address in allowlist"
                        :key="address"
                        :class="[ border, 'border rounded-lg px-3 py-2 flex items-center justify-between']"
                    >
                        <span :class="[text, 'text-xs font-mono']">{{
                            address
                        }}</span>
                        <button
                            class="text-red-400 hover:text-red-300 transition-colors"
                            @click="removeFromAllowlist(address)"
                        >
                            <X :size="12" />
                        </button>
                    </div>
                    <p
                        v-if="allowlist.length === 0"
                        :class="[text_muted, 'text-xs text-center py-2']"
                    >
                        No addresses in allowlist.
                    </p>
                </div>
            </div>

            <!-- Denylist -->
            <div :class="[border, 'border rounded-xl p-6']">
                <div class="flex items-center justify-between mb-4">
                    <h3 :class="[text, 'text-sm font-semibold']">
                        <ShieldOff :size="14" class="inline mr-1" />
                        Denylist
                    </h3>
                    <div class="flex gap-2">
                        <input
                            v-model="new_denylist_address"
                            placeholder="Add address..."
                            :class="[input_cls, 'text-xs']"
                            style="width: 220px"
                        />
                        <button
                            class="px-3 py-2 rounded-lg text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            @click="addToDenylist"
                        >
                            Add
                        </button>
                    </div>
                </div>
                <div class="space-y-1">
                    <div
                        v-for="address in denylist"
                        :key="address"
                        :class="[ border, 'border rounded-lg px-3 py-2 flex items-center justify-between']"
                    >
                        <span :class="[text, 'text-xs font-mono']">{{
                            address
                        }}</span>
                        <button
                            class="text-red-400 hover:text-red-300 transition-colors"
                            @click="removeFromDenylist(address)"
                        >
                            <X :size="12" />
                        </button>
                    </div>
                    <p
                        v-if="denylist.length === 0"
                        :class="[text_muted, 'text-xs text-center py-2']"
                    >
                        No addresses in denylist.
                    </p>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Shield, ShieldOff, X } from "lucide-vue-next"

const { is_dark, text, text_muted, border, input_cls, hover_bg } = useTheme()

type AdminTab = "overview" | "users" | "logs" | "tokens"

const active_tab = ref<AdminTab>("overview")

const admin_tabs: { key: AdminTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "logs", label: "Logs" },
    { key: "tokens", label: "Tokens" },
]

// Overview
const health_metrics = [
    {
        label: "API Server",
        value: "99.99%",
        detail: "Uptime last 30d",
        status: "healthy",
    },
    {
        label: "Database",
        value: "12ms",
        detail: "Avg query time",
        status: "healthy",
    },
    {
        label: "WebSocket",
        value: "3,291",
        detail: "Active connections",
        status: "healthy",
    },
    {
        label: "Memory Usage",
        value: "72%",
        detail: "4.3GB / 6GB",
        status: "warning",
    },
    {
        label: "CPU Load",
        value: "34%",
        detail: "2 cores utilized",
        status: "healthy",
    },
    {
        label: "Disk Space",
        value: "45%",
        detail: "112GB / 250GB",
        status: "healthy",
    },
    {
        label: "Queue Depth",
        value: "23",
        detail: "Pending tasks",
        status: "healthy",
    },
    {
        label: "Error Rate",
        value: "0.02%",
        detail: "Last 24h",
        status: "healthy",
    },
]

// Users
const users_list = [
    {
        address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        role: "admin",
        joined: "2025-01-15",
        trades: 1247,
        status: "active",
    },
    {
        address: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
        role: "user",
        joined: "2025-03-22",
        trades: 89,
        status: "active",
    },
    {
        address: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
        role: "user",
        joined: "2025-06-10",
        trades: 432,
        status: "active",
    },
    {
        address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
        role: "moderator",
        joined: "2025-04-08",
        trades: 56,
        status: "suspended",
    },
    {
        address: "1BoatSLRHtKNngkdXEeobR76b53LETtpyT",
        role: "user",
        joined: "2025-09-01",
        trades: 0,
        status: "active",
    },
]

// Logs
const system_logs = [
    {
        id: 1,
        level: "INFO",
        message: "Server started on port 3000",
        timestamp: "2026-02-25 10:00:01",
    },
    {
        id: 2,
        level: "INFO",
        message: "WebSocket connection pool initialized (max: 5000)",
        timestamp: "2026-02-25 10:00:02",
    },
    {
        id: 3,
        level: "WARN",
        message: "Rate limit threshold reached for IP 192.168.1.45",
        timestamp: "2026-02-25 10:12:33",
    },
    {
        id: 4,
        level: "ERROR",
        message: "Failed to fetch price feed from oracle (timeout after 5000ms)",
        timestamp: "2026-02-25 10:15:07",
    },
    {
        id: 5,
        level: "INFO",
        message: "Price feed reconnected successfully",
        timestamp: "2026-02-25 10:15:12",
    },
    {
        id: 6,
        level: "DEBUG",
        message: "Swap executed: 2.5 BSV -> 237.50 USDT (tx: 0x1a2b3c...)",
        timestamp: "2026-02-25 10:18:44",
    },
    {
        id: 7,
        level: "WARN",
        message: "Memory usage at 72% - approaching threshold",
        timestamp: "2026-02-25 10:20:00",
    },
    {
        id: 8,
        level: "INFO",
        message: "Governance proposal #14 created by 1A1z...fNa",
        timestamp: "2026-02-25 10:22:15",
    },
]

function logLevelColor(level: string): string {
    const colors: Record<string, string> = {
        INFO: "bg-blue-500/20 text-blue-400",
        WARN: "bg-yellow-500/20 text-yellow-400",
        ERROR: "bg-red-500/20 text-red-400",
        DEBUG: "bg-gray-500/20 text-gray-400",
    }
    return colors[level] ?? "bg-gray-500/20 text-gray-400"
}

// Tokens
const token_visibility = ref([
    { symbol: "BSV", is_visible: true },
    { symbol: "USDT", is_visible: true },
    { symbol: "USDC", is_visible: true },
    { symbol: "sBTC", is_visible: true },
    { symbol: "DXS", is_visible: true },
    { symbol: "wBSV", is_visible: false },
    { symbol: "TST", is_visible: false },
    { symbol: "PEPE", is_visible: false },
])

function toggleTokenVisibility(symbol: string) {
    const token = token_visibility.value.find((t) => t.symbol === symbol)
    if (token) token.is_visible = !token.is_visible
}

const new_allowlist_address = ref("")
const allowlist = ref(["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"])

function addToAllowlist() {
    const address = new_allowlist_address.value.trim()
    if (!address) return
    if (allowlist.value.includes(address)) return
    allowlist.value.push(address)
    new_allowlist_address.value = ""
}

function removeFromAllowlist(address: string) {
    allowlist.value = allowlist.value.filter((a) => a !== address)
}

const new_denylist_address = ref("")
const denylist = ref(["3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5"])

function addToDenylist() {
    const address = new_denylist_address.value.trim()
    if (!address) return
    if (denylist.value.includes(address)) return
    denylist.value.push(address)
    new_denylist_address.value = ""
}

function removeFromDenylist(address: string) {
    denylist.value = denylist.value.filter((a) => a !== address)
}
</script>
