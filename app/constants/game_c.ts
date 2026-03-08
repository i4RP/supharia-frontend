/** Mode C (Practice) — local off-chain game constants */

export const GAME_C_COLORS = {
    BACKGROUND: "#1a0a14",
    BACKGROUND_GRID: "#2a1520",
    ORDER_GRID: "#d4609a",
    ORDER_CELL: "#ff69b4",
    PRICE_LINE: "#ffffff",
    PRICE_LINE_TRAIL: "#ff69b4",
    CHART_HEAD: "#ffffff",
    WON_CELL: "#22c55e",
    LOST_CELL: "#ef4444",
    MULTIPLIER_TEXT: "#ff69b4",
    PRICE_LABEL: "#d4609a",
    TIME_LABEL: "#d4609a",
    GRID_DOT: "#d4609a",
} as const

export const GAME_C_GRID = {
    CELL_TIME_SEC: 5,
    CELL_PRICE_STEP: 0.5,
    VISIBLE_COLS: 12,
    VISIBLE_ROWS: 20,
    TARGET_ROWS: 12,
    CHART_HEAD_RATIO: 0.4,
} as const

export const GAME_C_BALANCE = {
    INITIAL: 0,
    BET_COST: 5,
} as const

export const GAME_C_PRICE = {
    BASE: 0, // Will be set from RedStone ETH/USD feed
    MAX_HISTORY: 3600,
} as const

export const GAME_C_LABELS = {
    PRICE_LABEL_WIDTH: 70, // px reserved for price labels on right
    TIME_LABEL_HEIGHT: 20, // px reserved for time labels on bottom
} as const

export function calculateMultiplierC(col: number, row_offset: number): number {
    const max_col = GAME_C_GRID.VISIBLE_COLS
    const max_row = GAME_C_GRID.VISIBLE_ROWS / 2
    const raw = 1 + (col / max_col) * (Math.abs(row_offset) / max_row) * 4.0
    return Math.round(raw * 100) / 100
}
