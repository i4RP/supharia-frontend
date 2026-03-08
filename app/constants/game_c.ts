/** Mode C (Practice) — local off-chain game constants */

export const GAME_C_COLORS = {
    BACKGROUND: "#03080F",
    BACKGROUND_GRID: "#0A2040",
    ORDER_GRID: "#1B8DFF",
    ORDER_CELL: "#1B8DFF",
    PRICE_LINE: "#ffffff",
    PRICE_LINE_TRAIL: "#1B8DFF",
    CHART_HEAD: "#ffffff",
    WON_CELL: "#22c55e",
    LOST_CELL: "#ef4444",
    MULTIPLIER_TEXT: "#1B8DFF",
    PRICE_LABEL: "#4DA6FF",
    TIME_LABEL: "#4DA6FF",
    GRID_DOT: "#4DA6FF",
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
