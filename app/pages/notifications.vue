<template>
    <div class="max-w-4xl mx-auto p-6 space-y-6">
        <h1 :class="[text, 'text-2xl font-bold']">Notifications</h1>

        <!-- Wallet Required -->
        <div
            v-if="!wallet_connected"
            :class="[border, 'border rounded-xl p-8 text-center']"
        >
            <BellOff :size="40" :class="[text_muted, 'mx-auto mb-3']" />
            <p :class="[text, 'text-lg font-medium mb-2']">
                Wallet Not Connected
            </p>
            <p :class="[text_muted, 'text-sm mb-4']">
                Connect your wallet to manage notifications and price alerts.
            </p>
            <button
                class="px-4 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                @click="openWalletModal"
            >
                Connect Wallet
            </button>
        </div>

        <template v-else>
            <!-- Price Alerts -->
            <div :class="[border, 'border rounded-xl p-6']">
                <h2 :class="[text, 'text-lg font-semibold mb-4']">
                    <Bell :size="18" class="inline mr-2" />
                    Price Alerts
                </h2>

                <!-- Add Alert Form -->
                <div class="flex gap-3 mb-4">
                    <select
                        v-model="alert_form.token"
                        :class="[input_cls, 'flex-1']"
                    >
                        <option value="BSV">BSV</option>
                        <option value="USDT">USDT</option>
                        <option value="USDC">USDC</option>
                    </select>
                    <select
                        v-model="alert_form.condition"
                        :class="[input_cls, 'flex-1']"
                    >
                        <option value="above">Above</option>
                        <option value="below">Below</option>
                    </select>
                    <input
                        v-model="alert_form.price"
                        type="number"
                        placeholder="Price"
                        :class="[input_cls, 'flex-1']"
                    />
                    <button
                        class="px-4 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors shrink-0"
                        @click="addAlert"
                    >
                        <Plus :size="14" class="inline mr-1" />
                        Add
                    </button>
                </div>

                <!-- Alert List -->
                <div class="space-y-2">
                    <div
                        v-for="alert in price_alerts"
                        :key="alert.id"
                        :class="[ border, 'border rounded-lg p-3 flex items-center justify-between']"
                    >
                        <span :class="[text, 'text-sm']">
                            {{ alert.token }} {{ alert.condition }} ${{
                                alert.price
                            }}
                        </span>
                        <button
                            :class="[ text_muted, 'hover:text-red-400 transition-colors']"
                            @click="removeAlert(alert.id)"
                        >
                            <X :size="14" />
                        </button>
                    </div>
                    <p
                        v-if="price_alerts.length === 0"
                        :class="[text_muted, 'text-sm text-center py-2']"
                    >
                        No price alerts set.
                    </p>
                </div>
            </div>

            <!-- Activity Feed -->
            <div :class="[border, 'border rounded-xl p-6']">
                <div class="flex items-center justify-between mb-4">
                    <h2 :class="[text, 'text-lg font-semibold']">
                        Activity Feed
                    </h2>
                    <div class="flex items-center gap-2">
                        <select
                            v-model="activity_filter"
                            :class="input_cls"
                            style="width: auto"
                        >
                            <option value="all">All</option>
                            <option value="unread">Unread</option>
                        </select>
                        <button
                            class="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                            :class="[border, text_muted, hover_bg, 'border']"
                            @click="markAllRead"
                        >
                            Mark All Read
                        </button>
                    </div>
                </div>

                <div class="space-y-2">
                    <div
                        v-for="notification in filtered_notifications"
                        :key="notification.id"
                        :class="[ border, 'border rounded-lg p-4 flex items-start gap-3 cursor-pointer transition-colors', notification.is_read ? '' : is_dark ? 'bg-white/[0.02]' : 'bg-blue-50/50', hover_bg]"
                        @click="markAsRead(notification.id)"
                    >
                        <div
                            class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            :class="typeColor(notification.type)"
                        >
                            <TrendingUp
                                v-if="notification.type === 'price'"
                                :size="14"
                            />
                            <ArrowLeftRight
                                v-else-if="notification.type === 'swap'"
                                :size="14"
                            />
                            <Shield
                                v-else-if="notification.type === 'security'"
                                :size="14"
                            />
                            <Bell v-else :size="14" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div :class="[text, 'text-sm font-medium']">
                                {{ notification.title }}
                            </div>
                            <div :class="[text_muted, 'text-xs mt-0.5']">
                                {{ notification.message }}
                            </div>
                            <div
                                :class="[text_muted, 'text-xs mt-1 opacity-60']"
                            >
                                {{ notification.time }}
                            </div>
                        </div>
                        <div
                            v-if="!notification.is_read"
                            class="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2"
                        />
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ArrowLeftRight, Bell, BellOff, Plus, Shield, TrendingUp, X } from "lucide-vue-next"

const { is_dark, text, text_muted, border, input_cls, hover_bg } = useTheme()
const { wallet_connected, openWalletModal } = useWallet()

const activity_filter = ref<"all" | "unread">("all")

const alert_form = reactive({
    token: "BSV",
    condition: "above" as "above" | "below",
    price: "",
})

const price_alerts = ref([
    { id: 1, token: "BSV", condition: "above", price: "100" },
    { id: 2, token: "USDT", condition: "below", price: "0.99" },
])

let next_alert_id = 3

function addAlert() {
    if (!alert_form.price) return
    price_alerts.value.push({
        id: next_alert_id++,
        token: alert_form.token,
        condition: alert_form.condition,
        price: alert_form.price,
    })
    alert_form.price = ""
}

function removeAlert(id: number) {
    price_alerts.value = price_alerts.value.filter((a) => a.id !== id)
}

const notifications = ref([
    {
        id: 1,
        type: "price",
        title: "BSV Price Alert",
        message: "BSV has crossed above $95.00",
        time: "2 min ago",
        is_read: false,
    },
    {
        id: 2,
        type: "swap",
        title: "Swap Completed",
        message: "Swapped 1.5 BSV for 142.50 USDT",
        time: "15 min ago",
        is_read: false,
    },
    {
        id: 3,
        type: "security",
        title: "New Login Detected",
        message: "New session from 192.168.1.x",
        time: "1 hour ago",
        is_read: true,
    },
    {
        id: 4,
        type: "system",
        title: "System Update",
        message: "Platform maintenance completed successfully",
        time: "3 hours ago",
        is_read: true,
    },
])

const filtered_notifications = computed(() => {
    if (activity_filter.value === "unread") {
        return notifications.value.filter((n) => !n.is_read)
    }
    return notifications.value
})

function markAsRead(id: number) {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) notification.is_read = true
}

function markAllRead() {
    notifications.value.forEach((n) => {
        n.is_read = true
    })
}

function typeColor(type: string): string {
    const colors: Record<string, string> = {
        price: "bg-green-500/20 text-green-400",
        swap: "bg-blue-500/20 text-blue-400",
        security: "bg-yellow-500/20 text-yellow-400",
        system: "bg-purple-500/20 text-purple-400",
    }
    return colors[type] ?? "bg-gray-500/20 text-gray-400"
}
</script>
