<template>
    <div :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-6">

            <!-- Header -->
            <div>
                <h1 :class="text">Rewards</h1>
                <p :class="`text-sm ${text_muted} mt-1`">View and claim your LP fee rewards.</p>
            </div>

            <!-- Pool Selector -->
            <div>
                <label :class="`text-xs ${text_muted} mb-1.5 block`">Select Pool</label>
                <select v-model="selected_pool" :class="input_cls">
                    <option v-for="pool_label in POOL_LABELS" :key="pool_label">{{ pool_label }}</option>
                </select>
            </div>

            <!-- Pool Rewards Summary -->
            <div class="space-y-3">
                <h2 :class="text">Pool Rewards Summary</h2>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div
                        v-for="stat in rewards_summary"
                        :key="stat.label"
                        :class="`rounded-xl p-3 border ${border}`"
                    >
                        <p :class="`text-xs ${text_muted}`">{{ stat.label }}</p>
                        <p :class="`text-sm ${stat.color || text} mt-0.5`">{{ stat.value }}</p>
                    </div>
                </div>
            </div>

            <!-- My Rewards -->
            <div v-if="wallet_connected" class="space-y-3">
                <div class="flex items-center gap-2">
                    <Gift :size="16" class="text-white/50" />
                    <h2 :class="text">My Rewards</h2>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div
                        v-for="item in my_rewards_items"
                        :key="item[0]"
                        :class="`rounded-xl p-3 border ${border}`"
                    >
                        <p :class="`text-xs ${text_muted}`">{{ item[0] }}</p>
                        <p :class="`text-sm ${text} mt-0.5`">{{ item[1] }}</p>
                    </div>
                </div>
            </div>

            <div v-else class="text-center py-8">
                <p :class="`text-sm ${text_muted} mb-3`">Connect wallet to view your rewards</p>
                <button class="px-6 py-2.5 bg-white text-black rounded-xl text-sm" @click="openWalletModal">
                    Connect Wallet
                </button>
            </div>

            <!-- All LP Providers -->
            <div class="space-y-3">
                <h2 :class="text">All LP Providers</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead>
                            <tr :class="text_muted">
                                <th v-for="header in provider_headers" :key="header" class="text-left py-1.5 pr-4">{{ header }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(provider, index) in PROVIDERS" :key="index" :class="`border-t ${border}`">
                                <td class="py-2 pr-4 text-white/50">{{ provider.address }}</td>
                                <td :class="`py-2 pr-4 ${text}`">{{ provider.shares }}</td>
                                <td :class="`py-2 pr-4 ${text}`">{{ provider.pct }}</td>
                                <td :class="`py-2 pr-4 ${text_muted}`">{{ provider.duration }}</td>
                                <td class="py-2 pr-4 text-green-400">{{ provider.rewards_a }}</td>
                                <td class="py-2 text-green-400">{{ provider.rewards_b }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { Gift } from "lucide-vue-next"
import { POOL_LABELS } from "~/constants/pools"

const { bg, border, text, text_muted, input_cls } = useTheme()
const { wallet_connected, openWalletModal } = useWallet()

const selected_pool = ref(POOL_LABELS[0])

const PROVIDERS = [
    {
        address: "1A1z...FNa",
        shares: "12,340",
        pct: "6.52%",
        duration: "720h",
        rewards_a: "0.41 BSV",
        rewards_b: "19.3 DSTAS",
    },
    {
        address: "1BVP...3xK",
        shares: "8,920",
        pct: "4.71%",
        duration: "480h",
        rewards_a: "0.28 BSV",
        rewards_b: "13.2 DSTAS",
    },
    {
        address: "1CXD...9mL",
        shares: "5,100",
        pct: "2.69%",
        duration: "360h",
        rewards_a: "0.15 BSV",
        rewards_b: "7.1 DSTAS",
    },
]

const rewards_summary = [
    { label: "APY", value: "1%", color: "text-green-400" },
    { label: "LP Providers", value: "47", color: "" },
    { label: "Total LP Shares", value: "189,234", color: "" },
    { label: "Total Distributed A", value: "12.3 BSV", color: "" },
    { label: "Total Distributed B", value: "581 DSTAS", color: "" },
]

const my_rewards_items = [
    ["LP Shares", "1,234"],
    ["Pool Share", "0.65%"],
    ["Duration", "320h"],
    ["Accrued A", "+0.041 BSV"],
    ["Accrued B", "+1.93 DSTAS"],
    ["Earned Fees A", "0.012 BSV"],
    ["Earned Fees B", "0.57 DSTAS"],
    ["Total A", "0.053 BSV"],
    ["Total B", "2.50 DSTAS"],
]

const provider_headers = ["Address", "Shares", "Pool %", "Duration", "Rewards A", "Rewards B"]
</script>
