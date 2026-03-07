export const GAME_COLORS = {
    BACKGROUND: "#120e23",
    BACKGROUND_GRID: "#152132",
    ORDER_GRID: "#88a4ca",
    ORDER_CELL: "#ffdf3d",
    PRICE_LINE: "#22c55e",
    CHART_HEAD: "#ffffff",
    WON_CELL: "#22c55e",
    LOST_CELL: "#ef4444",
} as const

export const GAME_GRID = {
    CELL_TIME_SEC: 5,
    CELL_PRICE_STEP: 0.5,
    VISIBLE_COLS: 3,
    VISIBLE_ROWS: 9,
    CHART_HEAD_RATIO: 0.4,
    FIRST_SLOT_OFFSET: 5, // seconds from now for col 0
} as const

export const GAME_BALANCE = {
    INITIAL: 0,
    BET_COST: 1, // 1 rUSD
} as const

export const GAME_PRICE = {
    BASE: 100,
    MAX_HISTORY: 3600,
} as const

// On-chain multipliers are fetched from the contract via useOnChain
// This is a fallback for display before on-chain data loads
export function calculateMultiplier(col: number, row_offset: number): number {
    const max_col = GAME_GRID.VISIBLE_COLS
    const max_row = GAME_GRID.VISIBLE_ROWS / 2
    const raw = 1 + (col / max_col) * (Math.abs(row_offset) / max_row) * 4.0
    return Math.round(raw * 100) / 100
}
