import type { PricePoint } from "~/types/game"

/**
 * Mode C price stream: uses SSE from local server route /api/game/price-stream.
 * No wallet or on-chain interaction required.
 */
export function useGameStreamC() {
    const game_store = useGameStoreC()
    let event_source: EventSource | null = null
    let reconnect_timer: ReturnType<typeof setTimeout> | null = null

    function connect() {
        if (event_source) return

        event_source = new EventSource("/api/game/price-stream")

        event_source.onopen = () => {
            game_store.is_connected = true
        }

        event_source.onmessage = (event) => {
            const point: PricePoint = JSON.parse(event.data)
            game_store.addPricePoint(point)
        }

        event_source.onerror = () => {
            game_store.is_connected = false
            event_source?.close()
            event_source = null
            reconnect_timer = setTimeout(() => {
                connect()
            }, 2000)
        }
    }

    function disconnect() {
        if (reconnect_timer) {
            clearTimeout(reconnect_timer)
            reconnect_timer = null
        }
        if (event_source) {
            event_source.close()
            event_source = null
        }
        game_store.is_connected = false
    }

    return { connect, disconnect }
}
