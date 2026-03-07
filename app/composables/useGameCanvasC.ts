import { calculateMultiplierC, GAME_C_BALANCE, GAME_C_COLORS, GAME_C_GRID, GAME_C_LABELS } from "~/constants/game_c"
import type { GridCell } from "~/types/game"

export function useGameCanvasC(canvas_ref: Ref<HTMLCanvasElement | null>) {
    const game_store = useGameStoreC()
    let animation_id = 0

    const SLOT_MS = GAME_C_GRID.CELL_TIME_SEC * 1000
    const STEP = GAME_C_GRID.CELL_PRICE_STEP
    const SMOOTH_FACTOR = 0.03
    const PRICE_LABEL_W = GAME_C_LABELS.PRICE_LABEL_WIDTH
    const TIME_LABEL_H = GAME_C_LABELS.TIME_LABEL_HEIGHT

    let view_center = 0

    function resizeCanvas() {
        const canvas = canvas_ref.value
        if (!canvas) return
        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        const ctx = canvas.getContext("2d")
        if (ctx) ctx.scale(dpr, dpr)
    }

    function getCssSize() {
        const canvas = canvas_ref.value
        if (!canvas) return { width: 0, height: 0 }
        const rect = canvas.getBoundingClientRect()
        return { width: rect.width, height: rect.height }
    }

    function formatTime(ts: number): string {
        const d = new Date(ts)
        const h = d.getHours().toString().padStart(2, "0")
        const m = d.getMinutes().toString().padStart(2, "0")
        const s = d.getSeconds().toString().padStart(2, "0")
        return `${h}:${m}:${s}`
    }

    function draw() {
        const canvas = canvas_ref.value
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const { width: full_width, height: full_height } = getCssSize()
        if (full_width === 0 || full_height === 0) return

        // Reserve space for labels
        const grid_width = full_width - PRICE_LABEL_W
        const grid_height = full_height - TIME_LABEL_H

        const chart_head_x = grid_width * GAME_C_GRID.CHART_HEAD_RATIO
        const now = Date.now()

        const cell_width_px = (grid_width - chart_head_x) / GAME_C_GRID.VISIBLE_COLS
        const px_per_ms = cell_width_px / SLOT_MS

        const actual_price = game_store.current_price
        if (view_center === 0 && actual_price > 0) {
            view_center = actual_price
        } else if (actual_price > 0) {
            view_center += (actual_price - view_center) * SMOOTH_FACTOR
        }

        const half_rows = GAME_C_GRID.VISIBLE_ROWS / 2
        const price_range = GAME_C_GRID.VISIBLE_ROWS * STEP
        const price_top = view_center + half_rows * STEP
        const price_bottom = view_center - half_rows * STEP
        const px_per_price = grid_height / price_range

        function priceToY(price: number): number {
            return grid_height / 2 - (price - view_center) * px_per_price
        }

        function timeToX(timestamp: number): number {
            return chart_head_x + (timestamp - now) * px_per_ms
        }

        function fadeAlpha(x: number): number {
            if (x >= chart_head_x) return 1.0
            const distance = chart_head_x - x
            return Math.max(0, 1.0 - distance / cell_width_px)
        }

        const first_price_line = Math.floor(price_bottom / STEP) * STEP
        const last_price_line = Math.ceil(price_top / STEP) * STEP

        // 1. Background
        ctx.fillStyle = GAME_C_COLORS.BACKGROUND
        ctx.fillRect(0, 0, full_width, full_height)

        // 2. Background grid (left of chart head)
        ctx.strokeStyle = GAME_C_COLORS.BACKGROUND_GRID
        ctx.lineWidth = 0.5
        ctx.globalAlpha = 1.0
        for (let p = first_price_line; p <= last_price_line; p += STEP) {
            const y = priceToY(p)
            if (y < -1 || y > grid_height + 1) continue
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(chart_head_x, y)
            ctx.stroke()
        }

        // 3. Scrolling order grid
        const first_future_slot = Math.ceil(now / SLOT_MS) * SLOT_MS
        const past_slots = Math.ceil(chart_head_x / cell_width_px) + 1
        const total_slots = GAME_C_GRID.VISIBLE_COLS + past_slots + 2

        for (let i = 0; i < total_slots; i++) {
            const slot_time = first_future_slot - past_slots * SLOT_MS + i * SLOT_MS
            const col_x = timeToX(slot_time)
            const col_end_x = timeToX(slot_time + SLOT_MS)

            if (col_end_x < 0 || col_x > grid_width + cell_width_px) continue

            const alpha = fadeAlpha(col_x)
            if (alpha <= 0) continue

            // Vertical line at slot boundary
            ctx.globalAlpha = alpha
            ctx.strokeStyle = GAME_C_COLORS.ORDER_GRID
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(col_x, 0)
            ctx.lineTo(col_x, grid_height)
            ctx.stroke()

            // Horizontal lines within this column
            const seg_left = Math.max(col_x, 0)
            const seg_right = Math.min(col_end_x, grid_width)
            if (seg_left < seg_right) {
                ctx.strokeStyle = GAME_C_COLORS.ORDER_GRID
                ctx.globalAlpha = alpha
                for (let p = first_price_line; p <= last_price_line; p += STEP) {
                    const y = priceToY(p)
                    if (y < -1 || y > grid_height + 1) continue
                    ctx.beginPath()
                    ctx.moveTo(seg_left, y)
                    ctx.lineTo(seg_right, y)
                    ctx.stroke()
                }
            }

            // Multiplier labels (only for future cells)
            const col_index = Math.round((slot_time - first_future_slot) / SLOT_MS)
            if (col_x >= chart_head_x && col_index >= 0 && col_index < GAME_C_GRID.VISIBLE_COLS) {
                ctx.font = "9px monospace"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                const cx = (col_x + col_end_x) / 2
                for (let p = first_price_line; p + STEP <= last_price_line; p += STEP) {
                    const cell_top_y = priceToY(p + STEP)
                    const cell_bottom_y = priceToY(p)
                    if (cell_top_y > grid_height || cell_bottom_y < 0) continue
                    const cy = (cell_top_y + cell_bottom_y) / 2
                    const cell_center_price = p + STEP / 2
                    const row_offset = Math.round((cell_center_price - view_center) / STEP)
                    const mult = calculateMultiplierC(col_index, row_offset)
                    ctx.globalAlpha = alpha * 0.5
                    ctx.fillStyle = GAME_C_COLORS.ORDER_GRID
                    ctx.fillText(`${mult.toFixed(1)}x`, cx, cy)
                }
            }
        }

        ctx.globalAlpha = 1.0

        // 4 & 5. Order cells
        for (const order of game_store.orders) {
            const cell_x = timeToX(order.cell.time_start)
            const cell_end_x = timeToX(order.cell.time_end)
            const cell_y = priceToY(order.cell.price_high)
            const cell_w = cell_end_x - cell_x
            const cell_bottom_y = priceToY(order.cell.price_low)
            const cell_h = cell_bottom_y - cell_y

            if (cell_x + cell_w < 0 || cell_x > grid_width) continue
            if (cell_y > grid_height || cell_bottom_y < 0) continue

            const alpha = fadeAlpha(cell_x)
            if (alpha <= 0) continue

            const radius = 4

            if (order.status === "active") {
                ctx.globalAlpha = alpha
                ctx.fillStyle = GAME_C_COLORS.ORDER_CELL
            } else if (order.status === "won") {
                ctx.globalAlpha = Math.min(alpha, 0.7)
                ctx.fillStyle = GAME_C_COLORS.WON_CELL
            } else {
                ctx.globalAlpha = Math.min(alpha, 0.2)
                ctx.fillStyle = GAME_C_COLORS.LOST_CELL
            }

            ctx.beginPath()
            ctx.roundRect(cell_x, cell_y, cell_w, cell_h, radius)
            ctx.fill()

            if (order.status === "active" && alpha > 0.5) {
                ctx.globalAlpha = alpha
                ctx.fillStyle = "#000000"
                ctx.font = "bold 11px monospace"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                const cx = cell_x + cell_w / 2
                const cy = cell_y + cell_h / 2
                ctx.fillText(`$${GAME_C_BALANCE.BET_COST}`, cx, cy - 7)
                ctx.font = "9px monospace"
                ctx.fillText(`${order.multiplier.toFixed(2)}x`, cx, cy + 7)
            }

            ctx.globalAlpha = 1.0
        }

        // 6. Price line
        const history = game_store.getPriceHistory()
        if (history.length > 1) {
            ctx.strokeStyle = GAME_C_COLORS.PRICE_LINE
            ctx.lineWidth = 2
            ctx.globalAlpha = 1.0
            ctx.beginPath()
            let started = false
            for (let i = 0; i < history.length; i++) {
                const point = history[i]
                const x = timeToX(point.timestamp)
                if (x < -50) continue
                if (x > grid_width + 50) break
                const y = priceToY(point.price)
                if (!started) {
                    ctx.moveTo(x, y)
                    started = true
                } else {
                    ctx.lineTo(x, y)
                }
            }
            ctx.stroke()
        }

        // 7. Chart head marker
        ctx.strokeStyle = GAME_C_COLORS.CHART_HEAD
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.6
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(chart_head_x, 0)
        ctx.lineTo(chart_head_x, grid_height)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1.0

        // Current price dot
        const price_y = priceToY(actual_price)
        ctx.fillStyle = GAME_C_COLORS.PRICE_LINE
        ctx.beginPath()
        ctx.arc(chart_head_x, price_y, 5, 0, Math.PI * 2)
        ctx.fill()

        // 8. Price labels (right side)
        ctx.globalAlpha = 1.0
        ctx.font = "10px monospace"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        const label_x = grid_width + 6
        for (let p = first_price_line; p <= last_price_line; p += STEP) {
            const y = priceToY(p)
            if (y < 0 || y > grid_height) continue
            ctx.fillStyle = "rgba(255,255,255,0.35)"
            ctx.fillText(`$${p.toFixed(1)}`, label_x, y)
        }

        // Current price badge on right
        if (actual_price > 0) {
            const badge_y = price_y
            const badge_text = `$${actual_price.toFixed(1)}`
            ctx.font = "bold 11px monospace"
            const badge_w = ctx.measureText(badge_text).width + 12
            const badge_h = 20
            const badge_x = grid_width + 3
            ctx.fillStyle = GAME_C_COLORS.PRICE_LINE
            ctx.beginPath()
            ctx.roundRect(badge_x, badge_y - badge_h / 2, badge_w, badge_h, 4)
            ctx.fill()
            ctx.fillStyle = "#000000"
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText(badge_text, badge_x + 6, badge_y)
        }

        // 9. Time labels (bottom)
        ctx.globalAlpha = 1.0
        ctx.font = "10px monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillStyle = "rgba(255,255,255,0.35)"
        const time_y = grid_height + 4
        // Show time at each slot boundary
        for (let i = 0; i < total_slots; i++) {
            const slot_time = first_future_slot - past_slots * SLOT_MS + i * SLOT_MS
            const x = timeToX(slot_time)
            if (x < 0 || x > grid_width) continue
            // Only show every 3rd label to avoid clutter
            const slot_idx = Math.round(slot_time / SLOT_MS)
            if (slot_idx % 3 !== 0) continue
            ctx.fillText(formatTime(slot_time), x, time_y)
        }
    }

    function loop() {
        game_store.checkOrderHits()
        draw()
        animation_id = requestAnimationFrame(loop)
    }

    function start() {
        resizeCanvas()
        view_center = game_store.current_price
        game_store.is_running = true
        game_store.game_start_time = Date.now()
        loop()
    }

    function stop() {
        if (animation_id) {
            cancelAnimationFrame(animation_id)
            animation_id = 0
        }
        game_store.is_running = false
    }

    function handleClick(event: MouseEvent) {
        const canvas = canvas_ref.value
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const click_x = event.clientX - rect.left
        const click_y = event.clientY - rect.top

        const { width: full_width, height: full_height } = getCssSize()
        const grid_width = full_width - PRICE_LABEL_W
        const grid_height = full_height - TIME_LABEL_H
        const chart_head_x = grid_width * GAME_C_GRID.CHART_HEAD_RATIO
        const px_per_ms = (grid_width - chart_head_x) / GAME_C_GRID.VISIBLE_COLS / SLOT_MS
        const price_range = GAME_C_GRID.VISIBLE_ROWS * STEP
        const px_per_price = grid_height / price_range

        if (click_x < chart_head_x || click_x > grid_width) return
        if (click_y > grid_height) return

        const now = Date.now()

        // Snap to time slot
        const click_time_ms = now + (click_x - chart_head_x) / px_per_ms
        const slot_start = Math.floor(click_time_ms / SLOT_MS) * SLOT_MS
        const slot_end = slot_start + SLOT_MS

        // Snap to quantized price boundary
        const click_price = view_center + (grid_height / 2 - click_y) / px_per_price
        const cell_price_high = Math.ceil(click_price / STEP) * STEP
        const cell_price_low = cell_price_high - STEP

        // Column index for multiplier
        const first_future_slot = Math.ceil(now / SLOT_MS) * SLOT_MS
        const col = Math.round((slot_start - first_future_slot) / SLOT_MS)
        if (col < 0 || col >= GAME_C_GRID.VISIBLE_COLS) return

        // Row offset from center price
        const cell_center_price = (cell_price_high + cell_price_low) / 2
        const row_offset = Math.round((cell_center_price - view_center) / STEP)
        const half_rows = GAME_C_GRID.VISIBLE_ROWS / 2
        if (Math.abs(row_offset) > half_rows) return

        const multiplier = calculateMultiplierC(col, row_offset)

        const cell: GridCell = {
            col,
            row: half_rows - row_offset,
            price_low: cell_price_low,
            price_high: cell_price_high,
            time_start: slot_start,
            time_end: slot_end,
        }

        game_store.placeOrder({
            cell,
            cost: GAME_C_BALANCE.BET_COST,
            multiplier,
            placed_at: now,
            status: "active",
        })
    }

    function handleResize() {
        resizeCanvas()
    }

    return { start, stop, handleClick, handleResize }
}
