import { defineStore } from "pinia"
import { GAME_BALANCE, GAME_PRICE } from "~/constants/game"
import type { GameOrder, PricePoint } from "~/types/game"

export const useGameStore = defineStore("game", () => {
    // Non-reactive buffer for high-frequency price data (read only in rAF)
    let price_buffer: PricePoint[] = []

    const current_price = ref(GAME_PRICE.BASE)
    const orders = shallowRef<GameOrder[]>([])
    const balance = ref(GAME_BALANCE.INITIAL) // rUSD balance
    const is_connected = ref(false)
    const is_running = ref(false)
    const game_start_time = ref(0)
    const is_registered = ref(false)
    const total_bets = ref(0)
    const total_wins = ref(0)
    const total_profit = ref(0)

    // On-chain grid multipliers (fetched from contract)
    const on_chain_multipliers = ref<number[][]>([])
    const on_chain_price_lows = ref<number[]>([])
    const on_chain_price_highs = ref<number[]>([])
    const on_chain_time_ends = ref<number[]>([])

    function addPricePoint(point: PricePoint) {
        price_buffer.push(point)
        current_price.value = point.price
        if (price_buffer.length > GAME_PRICE.MAX_HISTORY) {
            price_buffer = price_buffer.slice(-GAME_PRICE.MAX_HISTORY)
        }
    }

    function getPriceHistory(): PricePoint[] {
        return price_buffer
    }

    function addOrder(order: GameOrder) {
        orders.value = [...orders.value, order]
    }

    function updateBalance(new_balance: number) {
        balance.value = new_balance
    }

    function updateGrid(multipliers: number[][], priceLows: number[], priceHighs: number[], timeEnds: number[]) {
        on_chain_multipliers.value = multipliers
        on_chain_price_lows.value = priceLows
        on_chain_price_highs.value = priceHighs
        on_chain_time_ends.value = timeEnds
    }

    /** Get on-chain multiplier for a grid cell, or 0 if not loaded */
    function getOnChainMultiplier(row: number, col: number): number {
        const mults = on_chain_multipliers.value
        if (mults.length > row && mults[row] && mults[row].length > col) {
            return mults[row][col]
        }
        return 0
    }

    function checkOrderHits() {
        const now = Date.now()
        const current_list = orders.value
        let changed = false
        for (const order of current_list) {
            if (order.status !== "active") continue

            if (now > order.cell.time_end + 3000) {
                // Grace period passed — mark as pending settlement (server will confirm)
                order.status = "settling"
                changed = true
                continue
            }
        }
        if (changed) {
            const cutoff = now - 15000
            orders.value = current_list.filter(
                (o) => o.status === "active" || o.status === "settling" || o.cell.time_end > cutoff,
            )
        }
    }

    function applySettlements(settled_bets: Array<{ id: string; status: string; payout?: number }>) {
        const current_list = orders.value
        let changed = false
        for (const settled of settled_bets) {
            const order = current_list.find((o) => o.id === settled.id)
            if (order && order.status !== settled.status) {
                order.status = settled.status as GameOrder["status"]
                changed = true
            }
        }
        if (changed) {
            const now = Date.now()
            const cutoff = now - 15000
            orders.value = current_list.filter(
                (o) => o.status === "active" || o.status === "settling" || o.cell.time_end > cutoff,
            )
        }
    }

    function resetGame() {
        price_buffer = []
        current_price.value = GAME_PRICE.BASE
        orders.value = []
        balance.value = GAME_BALANCE.INITIAL
        is_connected.value = false
        is_running.value = false
        game_start_time.value = 0
        is_registered.value = false
        total_bets.value = 0
        total_wins.value = 0
        total_profit.value = 0
        on_chain_multipliers.value = []
        on_chain_price_lows.value = []
        on_chain_price_highs.value = []
        on_chain_time_ends.value = []
    }

    return {
        current_price,
        orders,
        balance,
        is_connected,
        is_running,
        game_start_time,
        is_registered,
        total_bets,
        total_wins,
        total_profit,
        on_chain_multipliers,
        on_chain_price_lows,
        on_chain_price_highs,
        on_chain_time_ends,
        addPricePoint,
        getPriceHistory,
        addOrder,
        updateBalance,
        updateGrid,
        getOnChainMultiplier,
        checkOrderHits,
        applySettlements,
        resetGame,
    }
})
