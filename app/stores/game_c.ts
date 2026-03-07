import { defineStore } from "pinia"
import { GAME_C_BALANCE, GAME_C_PRICE } from "~/constants/game_c"
import type { GameOrder, PricePoint } from "~/types/game"
import { useOnChain } from "~/composables/useOnChain"

export const useGameStoreC = defineStore("game_c", () => {
    // Non-reactive buffer for high-frequency price data (read only in rAF)
    let price_buffer: PricePoint[] = []

    const current_price = ref(GAME_C_PRICE.BASE)
    const orders = shallowRef<GameOrder[]>([])
    const balance = ref(GAME_C_BALANCE.INITIAL)
    const is_connected = ref(false)
    const is_running = ref(false)
    const game_start_time = ref(0)

    let order_counter = 0

    // On-chain leaderboard: queue results to submit asynchronously
    let _submitting = false
    const _resultQueue: { won: boolean; pnlDelta: number }[] = []

    function _flushResultQueue() {
        if (_submitting || _resultQueue.length === 0) return
        _submitting = true
        const batch = _resultQueue.splice(0, _resultQueue.length)

        const { submitGameResult, getAddress } = useOnChain()
        const addr = getAddress()

        // Submit each result sequentially (fire-and-forget)
        ;(async () => {
            for (const r of batch) {
                try {
                    await submitGameResult(addr, r.won, r.pnlDelta)
                }
                catch (e) {
                    console.warn("[Leaderboard] submit failed:", e)
                }
            }
            _submitting = false
            // Flush again if more results queued during submission
            _flushResultQueue()
        })()
    }

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
                // Submit loss to on-chain leaderboard
                const pnlCents = Math.round(-order.cost * 100)
                _resultQueue.push({ won: false, pnlDelta: pnlCents })
                continue
            }

            if (now >= order.cell.time_start && now <= order.cell.time_end) {
                if (current_price.value >= order.cell.price_low && current_price.value <= order.cell.price_high) {
                    order.status = "won"
                    const payout = order.cost * order.multiplier
                    balance.value += payout
                    changed = true
                    // Submit win to on-chain leaderboard (profit = payout - cost)
                    const profitCents = Math.round((payout - order.cost) * 100)
                    _resultQueue.push({ won: true, pnlDelta: profitCents })
                }
            }
        }
        if (changed) {
            // Prune orders that are off-screen (expired/lost older than 10s)
            const cutoff = now - 10000
            orders.value = current_list.filter((o) => o.status === "active" || o.cell.time_end > cutoff)
            // Flush queued results to on-chain leaderboard
            _flushResultQueue()
        }
    }

    function resetGame() {
        price_buffer = []
        current_price.value = GAME_C_PRICE.BASE
        orders.value = []
        balance.value = GAME_C_BALANCE.INITIAL
        is_connected.value = false
        is_running.value = false
        game_start_time.value = 0
        order_counter = 0
    }

    return {
        current_price,
        orders,
        balance,
        is_connected,
        is_running,
        game_start_time,
        addPricePoint,
        getPriceHistory,
        placeOrder,
        checkOrderHits,
        resetGame,
    }
})
