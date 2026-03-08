import { defineStore } from "pinia"
import { GAME_C_BALANCE, GAME_C_PRICE } from "~/constants/game_c"
import type { GameOrder, PricePoint } from "~/types/game"
import { useBatchSettlement } from "~/composables/useBatchSettlement"
import type { PlayerStats } from "~/composables/useOnChain"

export const useGameStoreC = defineStore("game_c", () => {
    // Non-reactive buffer for high-frequency price data (read only in rAF)
    let price_buffer: PricePoint[] = []

    const current_price = ref(GAME_C_PRICE.BASE)
    const orders = shallowRef<GameOrder[]>([])
    const balance = ref(GAME_C_BALANCE.INITIAL)
    const is_connected = ref(false)
    const is_running = ref(false)
    const game_start_time = ref(0)
    const balance_loaded = ref(false)

    // On-chain stats (loaded on init)
    const player_stats = ref<PlayerStats>({
        totalBets: 0,
        wins: 0,
        losses: 0,
        pnl: 0,
        bestStreak: 0,
        currentStreak: 0,
        lastPlayedAt: 0,
    })

    // Local session stats (added on top of on-chain stats)
    const session_stats = ref({
        totalBets: 0,
        wins: 0,
        losses: 0,
        pnl: 0, // cents
        currentStreak: 0,
        bestStreak: 0,
    })

    let order_counter = 0

    // Batch settlement composable
    const batchSettlement = useBatchSettlement()

    // ============ Computed Stats ============

    const total_bets = computed(() => player_stats.value.totalBets + session_stats.value.totalBets)
    const total_wins = computed(() => player_stats.value.wins + session_stats.value.wins)
    const total_losses = computed(() => player_stats.value.losses + session_stats.value.losses)
    const total_pnl = computed(() => player_stats.value.pnl + session_stats.value.pnl) // cents
    const win_rate = computed(() => total_bets.value > 0 ? Math.round((total_wins.value / total_bets.value) * 100) : 0)
    const best_streak = computed(() => Math.max(player_stats.value.bestStreak, session_stats.value.bestStreak))

    // ============ Balance Restoration ============

    /**
     * Load balance from on-chain stats + pending results.
     * Called once on game mount.
     */
    async function loadBalance(): Promise<void> {
        try {
            const { balance: restored, stats } = await batchSettlement.restoreBalance()
            balance.value = restored
            player_stats.value = stats
            balance_loaded.value = true
            console.log("[GameC] Balance restored:", restored, "On-chain PnL:", stats.pnl)
        }
        catch (e) {
            console.warn("[GameC] Failed to restore balance, using default:", e)
            balance.value = GAME_C_BALANCE.INITIAL
            balance_loaded.value = true
        }
    }

    // ============ Price & Orders ============

    function addPricePoint(point: PricePoint) {
        price_buffer.push(point)
        current_price.value = point.price
        if (price_buffer.length > GAME_C_PRICE.MAX_HISTORY) {
            price_buffer = price_buffer.slice(-GAME_C_PRICE.MAX_HISTORY)
        }
    }

    function getPriceHistory(): PricePoint[] {
        return price_buffer
    }

    function placeOrder(order: Omit<GameOrder, "id">) {
        if (balance.value < GAME_C_BALANCE.BET_COST) return
        balance.value -= GAME_C_BALANCE.BET_COST
        order_counter++
        orders.value = [...orders.value, { ...order, id: String(order_counter) }]
    }

    function checkOrderHits() {
        const now = Date.now()
        const current_list = orders.value
        let changed = false
        for (const order of current_list) {
            if (order.status !== "active") continue

            if (now > order.cell.time_end) {
                order.status = "expired"
                changed = true
                // Optimistic: queue loss to batch settlement
                const pnlCents = Math.round(-order.cost * 100)
                batchSettlement.queueResult(false, pnlCents)
                // Update session stats
                session_stats.value.totalBets++
                session_stats.value.losses++
                session_stats.value.pnl += pnlCents
                session_stats.value.currentStreak = 0
                continue
            }

            if (now >= order.cell.time_start && now <= order.cell.time_end) {
                if (current_price.value >= order.cell.price_low && current_price.value <= order.cell.price_high) {
                    order.status = "won"
                    const payout = order.cost * order.multiplier
                    balance.value += payout
                    changed = true
                    // Optimistic: queue win to batch settlement
                    const profitCents = Math.round((payout - order.cost) * 100)
                    batchSettlement.queueResult(true, profitCents)
                    // Update session stats
                    session_stats.value.totalBets++
                    session_stats.value.wins++
                    session_stats.value.pnl += profitCents
                    session_stats.value.currentStreak++
                    if (session_stats.value.currentStreak > session_stats.value.bestStreak) {
                        session_stats.value.bestStreak = session_stats.value.currentStreak
                    }
                }
            }
        }
        if (changed) {
            // Prune orders that are off-screen (expired/lost older than 10s)
            const cutoff = now - 10000
            orders.value = current_list.filter((o) => o.status === "active" || o.cell.time_end > cutoff)
        }
    }

    function resetGame() {
        price_buffer = []
        current_price.value = GAME_C_PRICE.BASE
        orders.value = []
        // Don't reset balance on game reset - keep persistent balance
        is_connected.value = false
        is_running.value = false
        game_start_time.value = 0
        order_counter = 0
    }

    /**
     * Start batch settlement timer. Call on game mount.
     */
    function startSettlement(): void {
        batchSettlement.startBatchTimer()
    }

    /**
     * Stop batch settlement timer and flush remaining. Call on game unmount.
     */
    function stopSettlement(): void {
        batchSettlement.stopBatchTimer()
    }

    return {
        current_price,
        orders,
        balance,
        balance_loaded,
        is_connected,
        is_running,
        game_start_time,
        player_stats,
        session_stats,
        // Computed stats
        total_bets,
        total_wins,
        total_losses,
        total_pnl,
        win_rate,
        best_streak,
        // Methods
        addPricePoint,
        getPriceHistory,
        placeOrder,
        checkOrderHits,
        resetGame,
        loadBalance,
        startSettlement,
        stopSettlement,
    }
})
