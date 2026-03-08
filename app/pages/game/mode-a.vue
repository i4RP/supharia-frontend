<template>
    <div class="fixed inset-0 top-0 flex flex-col" style="background: #120e23">
        <!-- Game Canvas -->
        <canvas
            ref="game_canvas"
            class="w-full flex-1 cursor-crosshair"
            @click="handleClick"
        />

        <!-- HUD Overlay (top left) -->
        <div class="absolute top-2 left-4 flex items-center gap-4 text-sm font-mono">
            <span class="text-white/60">
                ETH:
                <span class="text-white font-bold">${{ game_store.current_price.toFixed(2) }}</span>
            </span>
            <span :class="game_store.is_connected ? 'text-green-400' : 'text-red-400'">
                {{ game_store.is_connected ? "ON-CHAIN" : "OFFLINE" }}
            </span>
        </div>

        <!-- Controls (top right) -->
        <div class="absolute top-2 right-4 flex items-center gap-2">
            <span
                v-if="dev_wallet_address"
                class="px-2 py-1 rounded-lg text-xs font-mono"
                style="background: rgba(0,212,255,0.1); color: #00D4FF; border: 1px solid rgba(0,212,255,0.2)"
            >
                {{ dev_wallet_address.slice(0, 6) }}...{{ dev_wallet_address.slice(-4) }}
            </span>
            <span
                class="px-2 py-1 rounded-lg text-xs font-mono"
                style="background: rgba(167,139,250,0.1); color: #A78BFA"
            >
                ON-CHAIN
            </span>
            <NuxtLink
                to="/game"
                class="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-xs font-mono hover:bg-white/20 transition-colors"
            >
                BACK
            </NuxtLink>
            <button
                class="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-xs font-mono hover:bg-white/20 transition-colors"
                @click="resetAndRestart"
            >
                RESET
            </button>
        </div>

        <!-- Wallet Balance Button (bottom left) -->
        <button
            class="absolute bottom-6 left-4 flex items-center gap-2.5 px-4 py-2.5 rounded-full font-mono transition-all hover:scale-105 active:scale-95 z-40"
            style="background: rgba(30, 20, 45, 0.9); border: 1px solid rgba(167, 139, 250, 0.25); backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4)"
            @click="onWalletButtonClick"
        >
            <!-- Wallet Icon -->
            <span
                class="flex items-center justify-center w-7 h-7 rounded-lg"
                style="background: linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="6" width="20" height="14" rx="3" stroke="#1E1430" stroke-width="2" fill="none"/>
                    <path d="M6 6V5C6 3.89543 6.89543 3 8 3H16C17.1046 3 18 3.89543 18 5V6" stroke="#1E1430" stroke-width="2"/>
                    <circle cx="17" cy="13" r="1.5" fill="#1E1430"/>
                </svg>
            </span>
            <!-- Total Balance Amount -->
            <span class="text-base font-bold tracking-wide" style="color: #E8E8FF">
                {{ total_wallet_balance.toFixed(2) }} rUSD
            </span>
        </button>

        <!-- Wallet Detail Panel (slides up from bottom-left) -->
        <div
            v-if="wallet_panel_open"
            class="absolute bottom-20 left-4 w-72 rounded-2xl font-mono z-40 overflow-hidden"
            style="background: rgba(18, 14, 35, 0.97); border: 1px solid rgba(167, 139, 250, 0.2); backdrop-filter: blur(20px); box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6)"
        >
            <!-- Panel Header -->
            <div class="flex items-center justify-between px-4 pt-4 pb-2">
                <span class="text-sm font-bold tracking-wider" style="color: #E8E8FF">Wallet</span>
                <button
                    class="w-6 h-6 flex items-center justify-center rounded-full text-xs"
                    style="background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4)"
                    @click="wallet_panel_open = false"
                >
                    x
                </button>
            </div>

            <!-- Balance Rows -->
            <div class="px-4 pb-4 space-y-2.5">
                <!-- MegaETH (testnet) -->
                <div
                    class="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06)"
                >
                    <div class="flex items-center gap-2.5">
                        <span
                            class="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold"
                            style="background: linear-gradient(135deg, #00D4FF 0%, #627EEA 100%); color: #0a0a14"
                        >ETH</span>
                        <div>
                            <div class="text-xs font-bold" style="color: #E8E8FF">MegaETH</div>
                            <div class="text-[10px]" style="color: rgba(255,255,255,0.35)">testnet</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-bold" style="color: #E8E8FF">{{ game_store.balance.toFixed(2) }} rUSD</div>
                        <div class="text-[10px]" style="color: rgba(255,255,255,0.35)">on-chain</div>
                    </div>
                </div>
            </div>

            <!-- Refresh Button -->
            <div class="px-4 pb-4">
                <button
                    class="w-full py-2 rounded-xl text-xs font-bold tracking-wide transition-all"
                    style="background: rgba(167,139,250,0.12); color: #A78BFA; border: 1px solid rgba(167,139,250,0.2)"
                    :disabled="wallet_loading"
                    @click="refreshWalletBalances"
                >
                    {{ wallet_loading ? 'Loading...' : 'Refresh' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: "game",
})

const game_canvas = useTemplateRef<HTMLCanvasElement>("game_canvas")
const game_store = useGameStore()
const onchain = useOnChain()
const { connect, disconnect } = useGameStream()
const { start, stop, handleClick, handleResize } = useGameCanvas(game_canvas)

// Dev testnet wallet address
const dev_wallet_address = ref(onchain.getAddress())
const wallet_panel_open = ref(false)
const wallet_loading = ref(false)

// Total balance = on-chain rUSD (synced with game_store.balance)
const total_wallet_balance = computed(() => {
    return game_store.balance
})

async function initOnChain() {
    try {
        // Fetch rUSD balance from chain
        const bal = await onchain.fetchRusdBalance()
        game_store.updateBalance(bal)
        game_store.is_registered = true

        // If balance is 0, claim from faucet
        if (bal < 1) {
            await onchain.claimFaucet()
            const new_bal = await onchain.fetchRusdBalance()
            game_store.updateBalance(new_bal)
        }

        // Ensure rUSD approved for pool
        await onchain.ensureApproval()
    } catch (err) {
        console.error("On-chain init failed:", err)
    }
}

async function startGame() {
    await initOnChain()
    connect()
    nextTick(() => {
        start()
    })
}

async function fetchWalletBalance() {
    try {
        wallet_loading.value = true
        const bal = await onchain.fetchRusdBalance()
        game_store.updateBalance(bal)
    } catch (err) {
        console.error("Failed to fetch balance:", err)
    } finally {
        wallet_loading.value = false
    }
}

function onWalletButtonClick() {
    wallet_panel_open.value = !wallet_panel_open.value
    if (wallet_panel_open.value) {
        fetchWalletBalance()
    }
}

async function refreshWalletBalances() {
    await fetchWalletBalance()
}

async function resetAndRestart() {
    stop()
    disconnect()
    game_store.resetGame()
    await initOnChain()
    connect()
    nextTick(() => {
        start()
    })
}

onMounted(async () => {
    window.addEventListener("resize", handleResize)
    // Auto-start game immediately — fully on-chain, no login required
    await startGame()
})

onUnmounted(() => {
    stop()
    disconnect()
    window.removeEventListener("resize", handleResize)
})
</script>
