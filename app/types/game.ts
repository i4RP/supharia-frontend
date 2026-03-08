export interface PricePoint {
    price: number
    timestamp: number
}

export interface GridCell {
    col: number
    row: number
    price_low: number
    price_high: number
    time_start: number
    time_end: number
}

export type GameOrderStatus = "active" | "won" | "lost" | "expired" | "settling"

export interface GameOrder {
    id: string
    cell: GridCell
    cost: number
    multiplier: number
    placed_at: number
    status: GameOrderStatus
}
