import type { PricePoint } from "~/types/game"

/**
 * On-chain price stream: polls the TapTradingPool contract for price + grid data.
 * Replaces the old SSE-based backend stream.
 */
export function useGameStream() {
    const game_store = useGameStore()
    const onchain = useOnChain()
    let price_timer: ReturnType<typeof setInterval> | null = null
    let grid_timer: ReturnType<typeof setInterval> | null = null
    let settlement_timer: ReturnType<typeof setInterval> | null = null
    let running = false

    async function pollPrice() {
        try {
            const price = await onchain.fetchPrice()
            if (price > 0) {
                const point: PricePoint = { price, timestamp: Date.now() }
                game_store.addPricePoint(point)
                if (!game_store.is_connected) {
                    game_store.is_connected = true
                }
            }
        }
        catch {
            game_store.is_connected = false
        }
    }

    async function pollGrid() {
        try {
            const grid = await onchain.fetchGrid()
            if (grid.multipliers.length > 0) {
                game_store.updateGrid(
                    grid.multipliers,
                    grid.priceLows,
                    grid.priceHighs,
                    grid.timeEnds,
                )
            }
        }
        catch { /* ignore */ }
    }

    async function pollSettlements() {
        try {
            const current_orders = game_store.orders
            for (const order of current_orders) {
                if (order.status !== "settling") continue
                const bet_id = Number(order.id.replace("bet_", ""))
                if (isNaN(bet_id) || bet_id < 0) continue

                const bet = await onchain.fetchBet(bet_id)
                if (bet.settled) {
                    // Already settled on-chain — update UI
                    game_store.applySettlements([{
                        id: order.id,
                        status: bet.won ? "won" : "lost",
                    }])
                    const bal = await onchain.fetchRusdBalance()
                    game_store.updateBalance(bal)
                } else if (Date.now() > bet.timeEnd) {
                    // Expired but not settled — trigger settlement from frontend
                    try {
                        await onchain.settleBet(bet_id)
                        // Re-fetch to get result
                        const settled = await onchain.fetchBet(bet_id)
                        game_store.applySettlements([{
                            id: order.id,
                            status: settled.won ? "won" : "lost",
                        }])
                        const bal = await onchain.fetchRusdBalance()
                        game_store.updateBalance(bal)
                    }
                    catch { /* keeper may settle it instead */ }
                }
            }
        }
        catch { /* ignore */ }
    }

    function connect() {
        if (running) return
        running = true

        // Poll price every 1 second
        pollPrice()
        price_timer = setInterval(pollPrice, 1000)

        // Poll grid every 3 seconds (heavier call)
        pollGrid()
        grid_timer = setInterval(pollGrid, 3000)

        // Poll settlements every 2 seconds
        settlement_timer = setInterval(pollSettlements, 2000)
    }

    function disconnect() {
        running = false
        if (price_timer) {
            clearInterval(price_timer)
            price_timer = null
        }
        if (grid_timer) {
            clearInterval(grid_timer)
            grid_timer = null
        }
        if (settlement_timer) {
            clearInterval(settlement_timer)
            settlement_timer = null
        }
        game_store.is_connected = false
    }

    return { connect, disconnect }
}
