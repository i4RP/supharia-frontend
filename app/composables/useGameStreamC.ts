import type { PricePoint } from "~/types/game"

const REDSTONE_URL = "https://api.redstone.finance/prices/?symbols=ETH&provider=redstone-primary-prod"
const POLL_INTERVAL_MS = 1000

/**
 * Mode C price stream: polls RedStone ETH/USD price API.
 * No wallet or on-chain interaction required.
 */
export function useGameStreamC() {
    const game_store = useGameStoreC()
    let poll_timer: ReturnType<typeof setInterval> | null = null
    let is_polling = false

    async function fetchPrice() {
        if (is_polling) return
        is_polling = true
        try {
            const res = await fetch(REDSTONE_URL)
            const data = await res.json()
            const eth_data = data?.ETH
            if (eth_data && typeof eth_data.value === "number") {
                const point: PricePoint = {
                    price: Math.round(eth_data.value * 100) / 100,
                    timestamp: Date.now(),
                }
                game_store.addPricePoint(point)
                game_store.is_connected = true
            }
        } catch {
            game_store.is_connected = false
        } finally {
            is_polling = false
        }
    }

    function connect() {
        if (poll_timer) return
        fetchPrice()
        poll_timer = setInterval(fetchPrice, POLL_INTERVAL_MS)
    }

    function disconnect() {
        if (poll_timer) {
            clearInterval(poll_timer)
            poll_timer = null
        }
        game_store.is_connected = false
    }

    return { connect, disconnect }
}
