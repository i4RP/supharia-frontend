import { calculateMultiplierC, GAME_C_BALANCE, GAME_C_COLORS, GAME_C_GRID, GAME_C_LABELS } from "~/constants/game_c"
import type { GridCell } from "~/types/game"

export function useGameCanvasC(canvas_ref: Ref<HTMLCanvasElement | null>) {
    const game_store = useGameStoreC()
    const monster_store = useMonsterStore()
    let animation_id = 0

    const SLOT_MS = GAME_C_GRID.CELL_TIME_SEC * 1000
    const STEP = GAME_C_GRID.CELL_PRICE_STEP
    // Frame-rate independent smoothing: target ~6 frames at 120fps to reach 63%
    const SMOOTH_HALF_LIFE_MS = 50 // ms for camera to reach halfway to target
    const PRICE_LABEL_W = GAME_C_LABELS.PRICE_LABEL_WIDTH
    const TIME_LABEL_H = GAME_C_LABELS.TIME_LABEL_HEIGHT

    let view_center = 0
    let last_frame_time = 0 // for delta-time calculation
    // Epoch offset: convert performance.now() to Date.now()-compatible timestamps
    const perf_epoch_offset = Date.now() - performance.now()

    const TARGET_ROWS = GAME_C_GRID.TARGET_ROWS

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

        const is_mobile = full_width < 480
        const price_label_w = is_mobile ? 55 : PRICE_LABEL_W

        // Reserve space for labels
        const grid_width = full_width - price_label_w
        const grid_height = full_height - TIME_LABEL_H

        // Use performance.now() for sub-ms precision (120fps = 8.33ms per frame)
        const perf_now = performance.now()
        const now = perf_epoch_offset + perf_now
        const dt = last_frame_time > 0 ? Math.min(perf_now - last_frame_time, 50) : 8.33
        last_frame_time = perf_now

        // 方式2: cell_size from TARGET_ROWS, cols derived → perfect squares
        const cell_size = grid_height / TARGET_ROWS
        const base_chart_head_x = grid_width * GAME_C_GRID.CHART_HEAD_RATIO
        const available_col_width = grid_width - base_chart_head_x
        const visible_cols = Math.max(2, Math.min(GAME_C_GRID.VISIBLE_COLS, Math.floor(available_col_width / cell_size)))
        // Absorb leftover pixels into chart_head_x so grid fills to the right edge
        const chart_head_x = grid_width - visible_cols * cell_size

        const cell_width_px = cell_size
        const px_per_ms = cell_width_px / SLOT_MS

        // Frame-rate independent exponential smoothing for camera
        // Uses interpolated price so camera tracks the smooth line, not raw API ticks
        const interp_price = game_store.getInterpolatedPrice(now)
        const actual_price = interp_price > 0 ? interp_price : game_store.current_price
        if (view_center === 0 && actual_price > 0) {
            view_center = actual_price
        } else if (actual_price > 0) {
            // Exponential decay: factor = 1 - 0.5^(dt/halfLife)
            const smooth = 1 - Math.pow(0.5, dt / SMOOTH_HALF_LIFE_MS)
            view_center += (actual_price - view_center) * smooth
        }

        const visible_rows = TARGET_ROWS
        const half_rows = visible_rows / 2
        const price_range = visible_rows * STEP
        const price_top = view_center + half_rows * STEP
        const price_bottom = view_center - half_rows * STEP
        const px_per_price = cell_size / STEP

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
        ctx.globalAlpha = 0.6
        for (let p = first_price_line; p <= last_price_line; p += STEP) {
            const y = priceToY(p)
            if (y < -1 || y > grid_height + 1) continue
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(chart_head_x, y)
            ctx.stroke()
        }

        ctx.globalAlpha = 1.0

        // 3. Scrolling order grid
        const first_future_slot = Math.ceil(now / SLOT_MS) * SLOT_MS
        const past_slots = Math.ceil(chart_head_x / cell_width_px) + 1
        const total_slots = visible_cols + past_slots + 2

        for (let i = 0; i < total_slots; i++) {
            const slot_time = first_future_slot - past_slots * SLOT_MS + i * SLOT_MS
            const col_x = timeToX(slot_time)
            const col_end_x = timeToX(slot_time + SLOT_MS)

            if (col_end_x < 0 || col_x > grid_width + cell_width_px) continue

            const alpha = fadeAlpha(col_x)
            if (alpha <= 0) continue

            // Vertical line at slot boundary
            ctx.globalAlpha = alpha * 0.4
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
                ctx.globalAlpha = alpha * 0.4
                for (let p = first_price_line; p <= last_price_line; p += STEP) {
                    const y = priceToY(p)
                    if (y < -1 || y > grid_height + 1) continue
                    ctx.beginPath()
                    ctx.moveTo(seg_left, y)
                    ctx.lineTo(seg_right, y)
                    ctx.stroke()
                }
            }

            // Dots at grid intersections
            if (col_x >= chart_head_x - cell_width_px) {
                ctx.fillStyle = GAME_C_COLORS.GRID_DOT
                ctx.globalAlpha = alpha * 0.5
                for (let p = first_price_line; p <= last_price_line; p += STEP) {
                    const y = priceToY(p)
                    if (y < -1 || y > grid_height + 1) continue
                    ctx.beginPath()
                    ctx.arc(col_x, y, 1.5, 0, Math.PI * 2)
                    ctx.fill()
                }
            }

            // Multiplier labels (only for future cells)
            const col_index = Math.round((slot_time - first_future_slot) / SLOT_MS)
            if (col_x >= chart_head_x && col_index >= 0 && col_index < visible_cols) {
                const font_size = is_mobile ? 11 : 9
                ctx.font = `bold ${font_size}px monospace`
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
                    ctx.globalAlpha = alpha * 0.7
                    ctx.fillStyle = GAME_C_COLORS.MULTIPLIER_TEXT
                    ctx.fillText(`${mult.toFixed(1)}X`, cx, cy)
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
                ctx.globalAlpha = alpha * 0.8
                ctx.fillStyle = GAME_C_COLORS.ORDER_CELL
            } else if (order.status === "won") {
                ctx.globalAlpha = Math.min(alpha, 0.7)
                ctx.fillStyle = GAME_C_COLORS.WON_CELL
            } else {
                ctx.globalAlpha = Math.min(alpha, 0.2)
                ctx.fillStyle = GAME_C_COLORS.LOST_CELL
            }

            ctx.beginPath()
            ctx.roundRect(cell_x + 1, cell_y + 1, cell_w - 2, cell_h - 2, radius)
            ctx.fill()

            // Border glow for active cells
            if (order.status === "active") {
                ctx.globalAlpha = alpha * 0.4
                ctx.strokeStyle = GAME_C_COLORS.ORDER_CELL
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.roundRect(cell_x + 1, cell_y + 1, cell_w - 2, cell_h - 2, radius)
                ctx.stroke()
            }

            if (order.status === "active" && alpha > 0.5) {
                ctx.globalAlpha = alpha
                ctx.fillStyle = "#ffffff"
                ctx.font = is_mobile ? "bold 12px monospace" : "bold 11px monospace"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                const cx = cell_x + cell_w / 2
                const cy = cell_y + cell_h / 2
                ctx.fillText(`$${monster_store.bet_cost}`, cx, cy - 7)
                ctx.font = is_mobile ? "10px monospace" : "9px monospace"
                ctx.fillText(`${order.multiplier.toFixed(2)}x`, cx, cy + 7)
            }

            ctx.globalAlpha = 1.0
        }

        // 6. Price line - trail + head with smooth Catmull-Rom spline + 60fps interpolation
        const history = game_store.getInterpolatedHistory(now)
        let last_x = chart_head_x
        let last_y = grid_height / 2

        // Convert history to screen-space points, filter visible
        const pts: { x: number; y: number; ts: number }[] = []
        for (let i = 0; i < history.length; i++) {
            const point = history[i]
            const x = timeToX(point.timestamp)
            if (x < -100) continue
            if (x > grid_width + 100) break
            pts.push({ x, y: priceToY(point.price), ts: point.timestamp })
        }

        if (pts.length > 1) {
            // Helper: draw smooth Catmull-Rom spline through points
            function drawSmoothLine(points: { x: number; y: number }[]) {
                if (points.length < 2) return
                if (points.length === 2) {
                    ctx.moveTo(points[0].x, points[0].y)
                    ctx.lineTo(points[1].x, points[1].y)
                    return
                }
                ctx.moveTo(points[0].x, points[0].y)
                for (let i = 0; i < points.length - 1; i++) {
                    const p0 = points[Math.max(0, i - 1)]
                    const p1 = points[i]
                    const p2 = points[i + 1]
                    const p3 = points[Math.min(points.length - 1, i + 2)]
                    const cp1x = p1.x + (p2.x - p0.x) / 6
                    const cp1y = p1.y + (p2.y - p0.y) / 6
                    const cp2x = p2.x - (p3.x - p1.x) / 6
                    const cp2y = p2.y - (p3.y - p1.y) / 6
                    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
                }
            }

            // Blue trail (full line)
            ctx.strokeStyle = GAME_C_COLORS.PRICE_LINE_TRAIL
            ctx.lineWidth = 2
            ctx.globalAlpha = 0.6
            ctx.lineJoin = "round"
            ctx.lineCap = "round"
            ctx.beginPath()
            drawSmoothLine(pts)
            ctx.stroke()

            // White leading portion (last ~3 seconds) - Ender Dragon glow
            const white_start = now - 3000
            const white_pts = pts.filter(p => p.ts >= white_start)
            if (white_pts.length > 1) {
                ctx.strokeStyle = GAME_C_COLORS.PRICE_LINE
                ctx.lineWidth = 2.5
                ctx.globalAlpha = 1.0
                ctx.beginPath()
                drawSmoothLine(white_pts)
                ctx.stroke()

                // Glow effect on leading line
                ctx.strokeStyle = GAME_C_COLORS.PRICE_LINE_TRAIL
                ctx.lineWidth = 6
                ctx.globalAlpha = 0.15
                ctx.beginPath()
                drawSmoothLine(white_pts)
                ctx.stroke()
            }

            last_x = pts[pts.length - 1].x
            last_y = pts[pts.length - 1].y

            // Glowing dot at chart head (dragon's eye)
            ctx.globalAlpha = 0.3
            ctx.fillStyle = GAME_C_COLORS.PRICE_LINE_TRAIL
            ctx.beginPath()
            ctx.arc(last_x, last_y, 8, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = GAME_C_COLORS.PRICE_LINE
            ctx.globalAlpha = 1.0
            ctx.beginPath()
            ctx.arc(last_x, last_y, 4, 0, Math.PI * 2)
            ctx.fill()
        }

        // 7. Chart head vertical marker
        ctx.strokeStyle = GAME_C_COLORS.CHART_HEAD
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.3
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(chart_head_x, 0)
        ctx.lineTo(chart_head_x, grid_height)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1.0

        // 8. Price labels (right side) - pink text
        const price_font_size = is_mobile ? 8 : 10
        ctx.font = `${price_font_size}px monospace`
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        const label_x = grid_width + 4
        const label_step = is_mobile ? STEP * 2 : STEP
        for (let p = first_price_line; p <= last_price_line; p += label_step) {
            const y = priceToY(p)
            if (y < 5 || y > grid_height - 5) continue
            ctx.fillStyle = GAME_C_COLORS.PRICE_LABEL
            ctx.globalAlpha = 0.5
            ctx.fillText(`$${p.toFixed(1)}`, label_x, y)
        }

        // Current price badge on right (use interpolated price for smooth badge)
        const display_price = game_store.getInterpolatedPrice(now)
        if (display_price > 0) {
            const badge_y = priceToY(display_price)
            const badge_text = `$${display_price.toFixed(1)}`
            ctx.font = `bold ${is_mobile ? 9 : 11}px monospace`
            const badge_w = ctx.measureText(badge_text).width + 10
            const badge_h = is_mobile ? 16 : 20
            const badge_x = grid_width + 2
            ctx.globalAlpha = 1.0
            ctx.fillStyle = GAME_C_COLORS.ORDER_CELL
            ctx.beginPath()
            ctx.roundRect(badge_x, badge_y - badge_h / 2, badge_w, badge_h, 3)
            ctx.fill()
            ctx.fillStyle = "#000000"
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText(badge_text, badge_x + 5, badge_y)
        }

        // 9. Time labels (bottom) - pink text
        ctx.globalAlpha = 0.5
        ctx.font = `${is_mobile ? 8 : 10}px monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillStyle = GAME_C_COLORS.TIME_LABEL
        const time_y = grid_height + 4
        for (let i = 0; i < total_slots; i++) {
            const slot_time = first_future_slot - past_slots * SLOT_MS + i * SLOT_MS
            const x = timeToX(slot_time)
            if (x < 30 || x > grid_width - 10) continue
            const slot_idx = Math.round(slot_time / SLOT_MS)
            if (slot_idx % 3 !== 0) continue
            ctx.fillText(formatTime(slot_time), x, time_y)
        }
        ctx.globalAlpha = 1.0
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
        const is_mobile = full_width < 480
        const price_label_w = is_mobile ? 55 : PRICE_LABEL_W
        const grid_width = full_width - price_label_w
        const grid_height = full_height - TIME_LABEL_H
        const cell_size = grid_height / TARGET_ROWS
        const base_chart_head_x = grid_width * GAME_C_GRID.CHART_HEAD_RATIO
        const available_col_width = grid_width - base_chart_head_x
        const visible_cols = Math.max(2, Math.min(GAME_C_GRID.VISIBLE_COLS, Math.floor(available_col_width / cell_size)))
        const chart_head_x = grid_width - visible_cols * cell_size
        const cell_width_px = cell_size
        const px_per_ms = cell_width_px / SLOT_MS
        const visible_rows = TARGET_ROWS
        const price_range = visible_rows * STEP
        const px_per_price = cell_size / STEP

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
        if (col < 0 || col >= visible_cols) return

        // Row offset from center price
        const cell_center_price = (cell_price_high + cell_price_low) / 2
        const row_offset = Math.round((cell_center_price - view_center) / STEP)
        const half_rows = visible_rows / 2
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
            cost: monster_store.bet_cost,
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
