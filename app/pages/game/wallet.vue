<template>
    <div class="absolute inset-0 flex flex-col" style="background: #1a0a14">
        <!-- Header -->
        <div class="px-4 pt-[env(safe-area-inset-top,12px)] pb-3">
            <h1 class="text-lg font-bold tracking-wider" style="color: #ff69b4">WALLET</h1>
            <p class="text-[11px] font-mono mt-0.5" style="color: rgba(255,255,255,0.35)">Your balances &amp; activity</p>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-4 pb-[80px]">
            <!-- Address Card -->
            <div
                class="rounded-2xl p-4 mb-4 flex items-center gap-3"
                style="background: rgba(255,105,180,0.05); border: 1px solid rgba(212,96,154,0.2)"
            >
                <div class="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                    <img src="/megaeth-logo.jpg" alt="MegaETH" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-[10px] font-mono tracking-wider mb-0.5" style="color: rgba(255,255,255,0.4)">MegaETH ADDRESS</div>
                    <div class="text-[13px] font-mono truncate" style="color: #e8e8ff">{{ wallet_address }}</div>
                </div>
                <button
                    class="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider"
                    style="background: rgba(255,105,180,0.15); color: #ff69b4; border: 1px solid rgba(212,96,154,0.3)"
                    @click="copyAddress"
                >
                    {{ copy_label }}
                </button>
            </div>

            <!-- Total Balance Card -->
            <div
                class="rounded-2xl p-5 mb-4"
                style="background: rgba(255,105,180,0.08); border: 1px solid rgba(212,96,154,0.25)"
            >
                <div class="text-[11px] font-mono tracking-wider mb-1" style="color: rgba(255,255,255,0.4)">TOTAL BALANCE</div>
                <div class="text-3xl font-bold font-mono" style="color: #ff69b4">${{ rusd_display }}</div>
                <div class="text-[11px] font-mono mt-1" style="color: rgba(255,255,255,0.3)">{{ (game_store.total_pnl / 100).toFixed(2) }} P&amp;L</div>
            </div>

            <!-- Balance Breakdown -->
            <div class="flex gap-3 mb-6">
                <!-- Game Balance -->
                <div
                    class="flex-1 rounded-xl p-4"
                    style="background: rgba(30,15,25,0.8); border: 1px solid rgba(212,96,154,0.15)"
                >
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-[14px] h-[14px] rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                            <img src="/megaeth-logo.jpg" alt="MegaETH" class="w-full h-full object-cover" />
                        </div>
                        <span class="text-[10px] font-mono tracking-wider" style="color: rgba(255,255,255,0.4)">MegaETH <a href="https://megaeth-testnet-v2.blockscout.com/address/0x48345110dB117682E5a4EBdD99919Aff5b872D43" target="_blank" rel="noopener noreferrer" class="underline" style="color: #ff69b4">rUSD</a></span>
                    </div>
                    <div class="text-lg font-bold font-mono" style="color: #e8e8ff">${{ rusd_display }}</div>
                </div>

                <!-- On-Chain ETH Balance -->
                <div
                    class="flex-1 rounded-xl p-4"
                    style="background: rgba(30,15,25,0.8); border: 1px solid rgba(212,96,154,0.15)"
                >
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-[14px] h-[14px] rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                            <img src="/megaeth-logo.jpg" alt="MegaETH" class="w-full h-full object-cover" />
                        </div>
                        <span class="text-[10px] font-mono tracking-wider" style="color: rgba(255,255,255,0.4)">MegaETH ETH</span>
                    </div>
                    <div class="text-lg font-bold font-mono" style="color: #e8e8ff">{{ eth_display }} ETH</div>
                </div>
            </div>

            <!-- Withdraw Section -->
            <div class="mb-6">
                <div class="text-[11px] font-mono tracking-wider mb-3" style="color: rgba(255,255,255,0.4)">WITHDRAW ETH</div>
                <div
                    class="rounded-xl p-4"
                    style="background: rgba(30,15,25,0.8); border: 1px solid rgba(212,96,154,0.15)"
                >
                    <!-- Network badge -->
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                            <img src="/megaeth-logo.jpg" alt="MegaETH" class="w-full h-full object-cover" />
                        </div>
                        <span class="text-[11px] font-mono" style="color: rgba(255,255,255,0.5)">MegaETH Testnet</span>
                        <span class="text-[9px] font-mono px-1.5 py-0.5 rounded" style="background: rgba(255,105,180,0.15); color: #ff69b4">Ether</span>
                    </div>

                    <!-- Destination address input -->
                    <div class="mb-3">
                        <label class="text-[10px] font-mono tracking-wider block mb-1.5" style="color: rgba(255,255,255,0.35)">DESTINATION ADDRESS</label>
                        <input
                            v-model="withdraw_to"
                            type="text"
                            placeholder="0x..."
                            class="w-full rounded-lg px-3 py-2.5 text-[13px] font-mono outline-none"
                            style="background: rgba(0,0,0,0.3); border: 1px solid rgba(212,96,154,0.2); color: #e8e8ff"
                            :disabled="withdraw_loading"
                        />
                    </div>

                    <!-- Amount input -->
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-1.5">
                            <label class="text-[10px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">AMOUNT (ETH)</label>
                            <button
                                class="text-[10px] font-mono"
                                style="color: #ff69b4"
                                @click="setMaxAmount"
                            >
                                MAX
                            </button>
                        </div>
                        <input
                            v-model="withdraw_amount"
                            type="text"
                            inputmode="decimal"
                            placeholder="0.0"
                            class="w-full rounded-lg px-3 py-2.5 text-[13px] font-mono outline-none"
                            style="background: rgba(0,0,0,0.3); border: 1px solid rgba(212,96,154,0.2); color: #e8e8ff"
                            :disabled="withdraw_loading"
                        />
                        <div class="text-[10px] font-mono mt-1" style="color: rgba(255,255,255,0.25)">
                            Available: {{ eth_display }} ETH on MegaETH
                        </div>
                    </div>

                    <!-- Withdraw button -->
                    <button
                        class="w-full py-3 rounded-xl text-[13px] font-bold font-mono tracking-wider transition-all"
                        :style="withdraw_button_style"
                        :disabled="!can_withdraw || withdraw_loading"
                        @click="handleWithdraw"
                    >
                        <span v-if="withdraw_loading" class="flex items-center justify-center gap-2">
                            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" /></svg>
                            PROCESSING...
                        </span>
                        <span v-else>WITHDRAW ETH</span>
                    </button>

                    <!-- Status message -->
                    <div v-if="withdraw_status" class="mt-3 text-[11px] font-mono text-center" :style="{ color: withdraw_status_color }">
                        {{ withdraw_status }}
                    </div>
                    <a
                        v-if="withdraw_tx"
                        :href="`https://megaeth-testnet-v2.blockscout.com/tx/${withdraw_tx}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="mt-1 block text-[10px] font-mono text-center truncate underline"
                        style="color: #ff69b4"
                    >
                        TX: {{ withdraw_tx }}
                    </a>
                </div>
            </div>

            <!-- Withdraw rUSD Section -->
            <div class="mb-6">
                <div class="text-[11px] font-mono tracking-wider mb-3" style="color: rgba(255,255,255,0.4)">WITHDRAW rUSD</div>
                <div
                    class="rounded-xl p-4"
                    style="background: rgba(30,15,25,0.8); border: 1px solid rgba(212,96,154,0.15)"
                >
                    <!-- Network badge -->
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                            <img src="/megaeth-logo.jpg" alt="MegaETH" class="w-full h-full object-cover" />
                        </div>
                        <span class="text-[11px] font-mono" style="color: rgba(255,255,255,0.5)">MegaETH Testnet</span>
                        <a
                            href="https://megaeth-testnet-v2.blockscout.com/address/0x48345110dB117682E5a4EBdD99919Aff5b872D43"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-[9px] font-mono px-1.5 py-0.5 rounded underline"
                            style="background: rgba(255,105,180,0.15); color: #ff69b4"
                        >rUSD</a>
                    </div>

                    <!-- Destination address input -->
                    <div class="mb-3">
                        <label class="text-[10px] font-mono tracking-wider block mb-1.5" style="color: rgba(255,255,255,0.35)">DESTINATION ADDRESS</label>
                        <input
                            v-model="rusd_withdraw_to"
                            type="text"
                            placeholder="0x..."
                            class="w-full rounded-lg px-3 py-2.5 text-[13px] font-mono outline-none"
                            style="background: rgba(0,0,0,0.3); border: 1px solid rgba(212,96,154,0.2); color: #e8e8ff"
                            :disabled="rusd_withdraw_loading"
                        />
                    </div>

                    <!-- Amount input -->
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-1.5">
                            <label class="text-[10px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">AMOUNT (rUSD)</label>
                            <button
                                class="text-[10px] font-mono"
                                style="color: #ff69b4"
                                @click="setMaxRusdAmount"
                            >
                                MAX
                            </button>
                        </div>
                        <input
                            v-model="rusd_withdraw_amount"
                            type="text"
                            inputmode="decimal"
                            placeholder="0.0"
                            class="w-full rounded-lg px-3 py-2.5 text-[13px] font-mono outline-none"
                            style="background: rgba(0,0,0,0.3); border: 1px solid rgba(212,96,154,0.2); color: #e8e8ff"
                            :disabled="rusd_withdraw_loading"
                        />
                        <div class="text-[10px] font-mono mt-1" style="color: rgba(255,255,255,0.25)">
                            Available: {{ rusd_display }} rUSD on MegaETH
                        </div>
                    </div>

                    <!-- Withdraw button -->
                    <button
                        class="w-full py-3 rounded-xl text-[13px] font-bold font-mono tracking-wider transition-all"
                        :style="rusd_withdraw_button_style"
                        :disabled="!can_withdraw_rusd || rusd_withdraw_loading"
                        @click="handleWithdrawRusd"
                    >
                        <span v-if="rusd_withdraw_loading" class="flex items-center justify-center gap-2">
                            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" /></svg>
                            PROCESSING...
                        </span>
                        <span v-else>WITHDRAW rUSD</span>
                    </button>

                    <!-- Status message -->
                    <div v-if="rusd_withdraw_status" class="mt-3 text-[11px] font-mono text-center" :style="{ color: rusd_withdraw_status_color }">
                        {{ rusd_withdraw_status }}
                    </div>
                    <a
                        v-if="rusd_withdraw_tx"
                        :href="`https://megaeth-testnet-v2.blockscout.com/tx/${rusd_withdraw_tx}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="mt-1 block text-[10px] font-mono text-center truncate underline"
                        style="color: #ff69b4"
                    >
                        TX: {{ rusd_withdraw_tx }}
                    </a>
                </div>
            </div>

            <!-- Stats -->
            <div class="mb-6">
                <div class="text-[11px] font-mono tracking-wider mb-3" style="color: rgba(255,255,255,0.4)">STATS</div>
                <div
                    v-for="stat in stats"
                    :key="stat.label"
                    class="flex items-center justify-between py-2.5 border-b"
                    style="border-color: rgba(212,96,154,0.1)"
                >
                    <span class="text-xs font-mono" style="color: rgba(255,255,255,0.5)">{{ stat.label }}</span>
                    <span class="text-xs font-bold font-mono" :style="{ color: stat.color || '#e8e8ff' }">{{ stat.value }}</span>
                </div>
            </div>

            <!-- Recent Activity (Placeholder) -->
            <div>
                <div class="text-[11px] font-mono tracking-wider mb-3" style="color: rgba(255,255,255,0.4)">RECENT ACTIVITY</div>
                <div class="text-center py-8">
                    <svg class="mx-auto mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(212,96,154,0.3)" stroke-width="1.5">
                        <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
                    </svg>
                    <p class="text-[11px] font-mono" style="color: rgba(255,255,255,0.25)">No recent activity</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const game_store = useGameStoreC()
const { getAddress, fetchEthBalance, withdrawEth, fetchRusdBalance, withdrawRusd } = useOnChain()

// Wallet address
const wallet_address = ref("")
const copy_label = ref("COPY")

// ETH balance
const eth_balance = ref("0")
const eth_display = computed(() => {
    const val = parseFloat(eth_balance.value)
    if (isNaN(val)) return "0.0000"
    return val.toFixed(4)
})

// Withdraw ETH state
const withdraw_to = ref("")
const withdraw_amount = ref("")
const withdraw_loading = ref(false)
const withdraw_status = ref("")
const withdraw_status_color = ref("#22c55e")
const withdraw_tx = ref("")

// rUSD balance
const rusd_balance = ref(0)
const rusd_display = computed(() => rusd_balance.value.toFixed(2))

// Withdraw rUSD state
const rusd_withdraw_to = ref("")
const rusd_withdraw_amount = ref("")
const rusd_withdraw_loading = ref(false)
const rusd_withdraw_status = ref("")
const rusd_withdraw_status_color = ref("#22c55e")
const rusd_withdraw_tx = ref("")

const can_withdraw = computed(() => {
    if (!withdraw_to.value || !withdraw_amount.value) return false
    if (!withdraw_to.value.startsWith("0x") || withdraw_to.value.length !== 42) return false
    const amt = parseFloat(withdraw_amount.value)
    if (isNaN(amt) || amt <= 0) return false
    if (amt > parseFloat(eth_balance.value)) return false
    return true
})

const withdraw_button_style = computed(() => {
    if (withdraw_loading.value) {
        return "background: rgba(255,105,180,0.2); color: rgba(255,105,180,0.6); cursor: wait"
    }
    if (!can_withdraw.value) {
        return "background: rgba(255,105,180,0.1); color: rgba(255,105,180,0.3); cursor: not-allowed"
    }
    return "background: rgba(255,105,180,0.25); color: #ff69b4; border: 1px solid rgba(212,96,154,0.4); cursor: pointer"
})

const can_withdraw_rusd = computed(() => {
    if (!rusd_withdraw_to.value || !rusd_withdraw_amount.value) return false
    if (!rusd_withdraw_to.value.startsWith("0x") || rusd_withdraw_to.value.length !== 42) return false
    const amt = parseFloat(rusd_withdraw_amount.value)
    if (isNaN(amt) || amt <= 0) return false
    if (amt > rusd_balance.value) return false
    return true
})

const rusd_withdraw_button_style = computed(() => {
    if (rusd_withdraw_loading.value) {
        return "background: rgba(255,105,180,0.2); color: rgba(255,105,180,0.6); cursor: wait"
    }
    if (!can_withdraw_rusd.value) {
        return "background: rgba(255,105,180,0.1); color: rgba(255,105,180,0.3); cursor: not-allowed"
    }
    return "background: rgba(255,105,180,0.25); color: #ff69b4; border: 1px solid rgba(212,96,154,0.4); cursor: pointer"
})

// Load balance if not already loaded
onMounted(async () => {
    if (!game_store.balance_loaded) {
        game_store.loadBalance()
    }
    try {
        wallet_address.value = getAddress()
        eth_balance.value = await fetchEthBalance()
        rusd_balance.value = await fetchRusdBalance()
    }
    catch (e) {
        console.warn("[Wallet] Failed to load balances:", e)
    }
})

function copyAddress() {
    if (!wallet_address.value) return
    navigator.clipboard.writeText(wallet_address.value).then(() => {
        copy_label.value = "COPIED!"
        setTimeout(() => { copy_label.value = "COPY" }, 2000)
    }).catch(() => {
        copy_label.value = "COPY"
    })
}

function setMaxAmount() {
    const bal = parseFloat(eth_balance.value)
    if (isNaN(bal) || bal <= 0) return
    // Leave a small amount for gas
    const maxSend = Math.max(0, bal - 0.0001)
    withdraw_amount.value = maxSend.toFixed(6)
}

async function handleWithdraw() {
    if (!can_withdraw.value || withdraw_loading.value) return
    withdraw_loading.value = true
    withdraw_status.value = ""
    withdraw_tx.value = ""
    try {
        const hash = await withdrawEth(withdraw_to.value, withdraw_amount.value)
        withdraw_tx.value = hash
        withdraw_status.value = "Withdrawal successful!"
        withdraw_status_color.value = "#22c55e"
        // Refresh balance
        eth_balance.value = await fetchEthBalance()
        withdraw_amount.value = ""
    }
    catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e)
        withdraw_status.value = "Failed: " + errMsg.slice(0, 80)
        withdraw_status_color.value = "#ef4444"
    }
    finally {
        withdraw_loading.value = false
    }
}

function setMaxRusdAmount() {
    if (rusd_balance.value <= 0) return
    rusd_withdraw_amount.value = rusd_balance.value.toFixed(2)
}

async function handleWithdrawRusd() {
    if (!can_withdraw_rusd.value || rusd_withdraw_loading.value) return
    rusd_withdraw_loading.value = true
    rusd_withdraw_status.value = ""
    rusd_withdraw_tx.value = ""
    try {
        const hash = await withdrawRusd(rusd_withdraw_to.value, rusd_withdraw_amount.value)
        rusd_withdraw_tx.value = hash
        rusd_withdraw_status.value = "Withdrawal successful!"
        rusd_withdraw_status_color.value = "#22c55e"
        // Refresh balance
        rusd_balance.value = await fetchRusdBalance()
        rusd_withdraw_amount.value = ""
    }
    catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e)
        rusd_withdraw_status.value = "Failed: " + errMsg.slice(0, 80)
        rusd_withdraw_status_color.value = "#ef4444"
    }
    finally {
        rusd_withdraw_loading.value = false
    }
}

const stats = computed(() => [
    { label: "Total Bets", value: String(game_store.total_bets) },
    { label: "Wins", value: String(game_store.total_wins), color: "#22c55e" },
    { label: "Losses", value: String(game_store.total_losses), color: "#ef4444" },
    { label: "Win Rate", value: `${game_store.win_rate}%`, color: "#ff69b4" },
    { label: "Best Streak", value: String(game_store.best_streak) },
    { label: "Total P&L", value: `$${(game_store.total_pnl / 100).toFixed(2)}`, color: game_store.total_pnl >= 0 ? "#22c55e" : "#ef4444" },
])
</script>
