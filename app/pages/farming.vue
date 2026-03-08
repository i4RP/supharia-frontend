<template>
    <div :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-6">

            <!-- Header -->
            <div>
                <div class="flex items-center gap-2">
                    <Tractor :size="20" class="text-green-400" />
                    <h1 :class="text">Farming</h1>
                </div>
                <p :class="`text-sm ${text_muted} mt-1`">Stake LP tokens to earn additional BSV farming rewards.</p>
            </div>

            <!-- Pool Selector -->
            <div>
                <label :class="`text-xs ${text_muted} mb-1.5 block`">Select Pool</label>
                <select v-model="selected_pool" :class="input_cls">
                    <option v-for="pool_label in POOL_LABELS" :key="pool_label">{{ pool_label }}</option>
                </select>
            </div>

            <!-- Farming Summary -->
            <div class="space-y-3">
                <h2 :class="text">Farming Summary</h2>
                <div class="grid grid-cols-3 gap-3">
                    <div
                        v-for="stat in farming_summary"
                        :key="stat.label"
                        :class="`rounded-xl p-3 border ${border} text-center`"
                    >
                        <p :class="`text-xs ${text_muted}`">{{ stat.label }}</p>
                        <p :class="`text-sm ${stat.color || text} mt-0.5`">{{ stat.value }}</p>
                    </div>
                </div>
            </div>

            <!-- My Position -->
            <div v-if="wallet_connected" class="space-y-3">
                <div class="flex items-center gap-2">
                    <Sprout :size="16" class="text-green-400" />
                    <h2 :class="text">My Position</h2>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div
                        v-for="stat in my_position_stats"
                        :key="stat.label"
                        :class="`rounded-xl p-3 border ${border}`"
                    >
                        <p :class="`text-xs ${text_muted}`">{{ stat.label }}</p>
                        <p :class="`text-sm ${stat.color || text} mt-0.5`">{{ stat.value }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="space-y-2">
                        <label :class="`text-xs ${text_muted}`">Stake LP</label>
                        <input v-model="stake_amount" placeholder="0.00" :class="input_cls">
                        <button class="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm transition-colors">Stake</button>
                    </div>
                    <div class="space-y-2">
                        <label :class="`text-xs ${text_muted}`">Unstake LP</label>
                        <input v-model="unstake_amount" placeholder="0.00" :class="input_cls">
                        <button class="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm transition-colors">Unstake</button>
                    </div>
                    <div class="space-y-2">
                        <label :class="`text-xs ${text_muted}`">Rewards</label>
                        <div :class="`${bg} rounded-xl p-2.5 border ${border} text-sm text-amber-400`">0.241 BSV pending</div>
                        <button class="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm transition-colors">Harvest Rewards</button>
                    </div>
                </div>
            </div>

            <div v-else class="text-center py-8">
                <p :class="`text-sm ${text_muted} mb-3`">Connect wallet to start farming</p>
                <button class="px-6 py-2.5 bg-white text-black rounded-xl text-sm" @click="openWalletModal">Connect Wallet</button>
            </div>

            <!-- All Stakers -->
            <div class="space-y-3">
                <h2 :class="text">All Stakers</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead>
                            <tr :class="text_muted">
                                <th v-for="header in staker_headers" :key="header" class="text-left py-1.5 pr-4">{{ header }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(staker, index) in STAKERS" :key="index" :class="`border-t ${border}`">
                                <td class="py-2 pr-4 text-white/50">{{ staker.address }}</td>
                                <td :class="`py-2 pr-4 ${text}`">{{ staker.staked }}</td>
                                <td class="py-2 pr-4 text-amber-400">{{ staker.pending }}</td>
                                <td class="py-2 pr-4 text-green-400">{{ staker.harvested }}</td>
                                <td :class="`py-2 ${text_muted}`">{{ staker.since }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { Sprout, Tractor } from "lucide-vue-next"
import { POOL_LABELS } from "~/constants/pools"

const { bg, border, text, text_muted, input_cls } = useTheme()
const { wallet_connected, openWalletModal } = useWallet()

const selected_pool = ref(POOL_LABELS[0])
const stake_amount = ref("")
const unstake_amount = ref("")

const STAKERS = [
    { address: "1A1z...FNa", staked: "12,340", pending: "2.41", harvested: "8.23", since: "30d ago" },
    { address: "1BVP...3xK", staked: "8,920", pending: "1.74", harvested: "5.61", since: "45d ago" },
    { address: "1CXD...9mL", staked: "5,100", pending: "0.99", harvested: "3.12", since: "60d ago" },
]

const farming_summary = [
    { label: "Farming APY", value: "5%", color: "text-green-400" },
    { label: "Total Staked", value: "26,360 LP", color: "" },
    { label: "Total Stakers", value: "23", color: "" },
]

const my_position_stats = [
    { label: "Staked LP Shares", value: "1,234", color: "" },
    { label: "Pending Rewards", value: "0.241 BSV", color: "text-amber-400" },
    { label: "Total Harvested", value: "0.820 BSV", color: "text-green-400" },
    { label: "Staked Since", value: "15d ago", color: "" },
]

const staker_headers = ["Address", "Staked LP", "Pending", "Harvested", "Since"]
</script>
