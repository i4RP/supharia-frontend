import type { PricePoint } from "~/types/game"

// Primary: Coinbase (CORS-friendly, reliable)
// Fallback: RedStone (may have CORS issues from some origins)
const COINBASE_URL = "https://api.coinbase.com/v2/prices/ETH-USD/spot"
const REDSTONE_URL = "https://api.redstone.finance/prices/?symbols=ETH&provider=redstone-primary-prod"
const POLL_INTERVAL_MS = 1000 // 1Hz polling; 120fps smoothness via cubic Hermite interpolation

/**
 * Mode C price stream: polls ETH/USD price with Coinbase primary + RedStone fallback.
 * No wallet or on-chain interaction required.
 */
export function useGameStreamC() {
    const game_store = useGameStoreC()
    let poll_timer: ReturnType<typeof setInterval> | null = null
    let is_polling = false
    let use_fallback = false

    async function fetchPrice() {
        if (is_polling) return
        is_polling = true
        try {
            let price: number | null = null

            if (!use_fallback) {
                // Primary: Coinbase
                try {
                    const res = await fetch(COINBASE_URL)
                    const data = await res.json()
                    const amount = parseFloat(data?.data?.amount)
                    if (!isNaN(amount) && amount > 0) {
                        price = Math.round(amount * 100) / 100
                    }
                } catch {
                    use_fallback = true // Switch to fallback on Coinbase failure
                }
            }

            if (price === null && use_fallback) {
                // Fallback: RedStone
                const res = await fetch(REDSTONE_URL)
                const data = await res.json()
                const eth_data = data?.ETH
                if (eth_data && typeof eth_data.value === "number") {
                    price = Math.round(eth_data.value * 100) / 100
                }
            }

            if (price !== null) {
                const point: PricePoint = {
                    price,
                    timestamp: Date.now(),
                }
                game_store.addPricePoint(point)
                game_store.is_connected = true
                // If fallback succeeded, try primary again next time
                if (use_fallback) use_fallback = false
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
