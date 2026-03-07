import { GAME_BALANCE, GAME_COLORS, GAME_GRID } from "~/constants/game"
import type { GridCell } from "~/types/game"

export function useGameCanvas(canvas_ref: Ref<HTMLCanvasElement | null>) {
    const game_store = useGameStore()
    let animation_id = 0

    const SLOT_MS = GAME_GRID.CELL_TIME_SEC * 1000
    const STEP = GAME_GRID.CELL_PRICE_STEP
    const SMOOTH_FACTOR = 0.03

    let view_center = game_store.current_price

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

    function draw() {
        const canvas = canvas_ref.value
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const { width, height } = getCssSize()
        if (width === 0 || height === 0) return

        const chart_head_x = width * GAME_GRID.CHART_HEAD_RATIO
        const now = Date.now()

        const cell_width_px = (width - chart_head_x) / GAME_GRID.VISIBLE_COLS
        const px_per_ms = cell_width_px / SLOT_MS

        const actual_price = game_store.current_price
        view_center += (actual_price - view_center) * SMOOTH_FACTOR

        const half_rows = GAME_GRID.VISIBLE_ROWS / 2
        const price_range = GAME_GRID.VISIBLE_ROWS * STEP
        const price_top = view_center + half_rows * STEP
        const price_bottom = view_center - half_rows * STEP
        const px_per_price = height / price_range

        // view_center is always at height/2 — grid moves smoothly
        function priceToY(price: number): number {
            return height / 2 - (price - view_center) * px_per_price
        }

        function timeToX(timestamp: number): number {
            return chart_head_x + (timestamp - now) * px_per_ms
        }

        function fadeAlpha(x: number): number {
            if (x >= chart_head_x) return 1.0
            const distance = chart_head_x - x
            return Math.max(0, 1.0 - distance / cell_width_px)
        }

        // Quantized price lines visible on screen
        const first_price_line = Math.floor(price_bottom / STEP) * STEP
        const last_price_line = Math.ceil(price_top / STEP) * STEP

        // 1. Background
        ctx.fillStyle = GAME_COLORS.BACKGROUND
        ctx.fillRect(0, 0, width, height)

        // 2. Background grid (left of chart head) — horizontal lines at quantized prices
        ctx.strokeStyle = GAME_COLORS.BACKGROUND_GRID
        ctx.lineWidth = 0.5
        ctx.globalAlpha = 1.0
        for (let p = first_price_line; p <= last_price_line; p += STEP) {
            const y = priceToY(p)
            if (y < -1 || y > height + 1) continue
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(chart_head_x, y)
            ctx.stroke()
        }

        // 3. Scrolling order grid (time-slotted columns + quantized price rows)
        const first_future_slot = Math.ceil(now / SLOT_MS) * SLOT_MS
        const past_slots = Math.ceil(chart_head_x / cell_width_px) + 1
        const total_slots = GAME_GRID.VISIBLE_COLS + past_slots + 2

        for (let i = 0; i < total_slots; i++) {
            const slot_time = first_future_slot - past_slots * SLOT_MS + i * SLOT_MS
            const col_x = timeToX(slot_time)
            const col_end_x = timeToX(slot_time + SLOT_MS)

            if (col_end_x < 0 || col_x > width + cell_width_px) continue

            const alpha = fadeAlpha(col_x)
            if (alpha <= 0) continue

            // Vertical line at slot boundary
            ctx.globalAlpha = alpha
            ctx.strokeStyle = GAME_COLORS.ORDER_GRID
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(col_x, 0)
            ctx.lineTo(col_x, height)
            ctx.stroke()

            // Horizontal lines within this column at quantized prices
            const seg_left = Math.max(col_x, 0)
            const seg_right = Math.min(col_end_x, width)
            if (seg_left < seg_right) {
                ctx.strokeStyle = GAME_COLORS.ORDER_GRID
                ctx.globalAlpha = alpha
                for (let p = first_price_line; p <= last_price_line; p += STEP) {
                    const y = priceToY(p)
                    if (y < -1 || y > height + 1) continue
                    ctx.beginPath()
                    ctx.moveTo(seg_left, y)
                    ctx.lineTo(seg_right, y)
                    ctx.stroke()
                }
            }

            // Multiplier labels (only for future cells)
            const col_index = Math.round((slot_time - first_future_slot) / SLOT_MS)
            if (col_x >= chart_head_x && col_index >= 0 && col_index < GAME_GRID.VISIBLE_COLS) {
                ctx.font = "9px monospace"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                const cx = (col_x + col_end_x) / 2
                for (let p = first_price_line; p + STEP <= last_price_line; p += STEP) {
                    const cell_top_y = priceToY(p + STEP)
                    const cell_bottom_y = priceToY(p)
                    if (cell_top_y > height || cell_bottom_y < 0) continue
                    const cy = (cell_top_y + cell_bottom_y) / 2
                    const cell_center_price = p + STEP / 2
                    const row_offset = Math.round((cell_center_price - view_center) / STEP)
                    // Use on-chain multiplier if available, otherwise show "..."
                    const grid_row = Math.round(half_rows - row_offset)
                    const on_chain_mult = game_store.getOnChainMultiplier(grid_row, col_index)
                    const mult_text = on_chain_mult > 0 ? `${on_chain_mult.toFixed(1)}x` : "..."
                    ctx.globalAlpha = alpha * 0.5
                    ctx.fillStyle = GAME_COLORS.ORDER_GRID
                    ctx.fillText(mult_text, cx, cy)
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

            if (cell_x + cell_w < 0 || cell_x > width) continue
            if (cell_y > height || cell_bottom_y < 0) continue

            const alpha = fadeAlpha(cell_x)
            if (alpha <= 0) continue

            const radius = 4

            if (order.status === "active") {
                ctx.globalAlpha = alpha
                ctx.fillStyle = GAME_COLORS.ORDER_CELL
            } else if (order.status === "won") {
                ctx.globalAlpha = Math.min(alpha, 0.7)
                ctx.fillStyle = GAME_COLORS.WON_CELL
            } else {
                ctx.globalAlpha = Math.min(alpha, 0.2)
                ctx.fillStyle = GAME_COLORS.LOST_CELL
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
                ctx.fillText(`${GAME_BALANCE.BET_COST} rUSD`, cx, cy - 7)
                ctx.font = "9px monospace"
                ctx.fillText(`${order.multiplier.toFixed(2)}x`, cx, cy + 7)
            }

            ctx.globalAlpha = 1.0
        }

        // 6. Price line
        const history = game_store.getPriceHistory()
        if (history.length > 1) {
            ctx.strokeStyle = GAME_COLORS.PRICE_LINE
            ctx.lineWidth = 2
            ctx.globalAlpha = 1.0
            ctx.beginPath()
            let started = false
            for (let i = 0; i < history.length; i++) {
                const point = history[i]
                const x = timeToX(point.timestamp)
                if (x < -50) continue
                if (x > width + 50) break
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
        ctx.strokeStyle = GAME_COLORS.CHART_HEAD
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.6
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(chart_head_x, 0)
        ctx.lineTo(chart_head_x, height)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1.0

        // Current price dot — always at (chart_head_x, height/2)
        ctx.fillStyle = GAME_COLORS.PRICE_LINE
        ctx.beginPath()
        ctx.arc(chart_head_x, height / 2, 5, 0, Math.PI * 2)
        ctx.fill()
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

        const { width, height } = getCssSize()
        const chart_head_x = width * GAME_GRID.CHART_HEAD_RATIO
        const px_per_ms = (width - chart_head_x) / GAME_GRID.VISIBLE_COLS / SLOT_MS
        const price_range = GAME_GRID.VISIBLE_ROWS * STEP
        const px_per_price = height / price_range

        if (click_x < chart_head_x) return

        const now = Date.now()

        // Snap to time slot
        const click_time_ms = now + (click_x - chart_head_x) / px_per_ms
        const slot_start = Math.floor(click_time_ms / SLOT_MS) * SLOT_MS
        const slot_end = slot_start + SLOT_MS

        // Snap to quantized price boundary (use smoothed view_center for consistent grid)
        const click_price = view_center + (height / 2 - click_y) / px_per_price
        const cell_price_high = Math.ceil(click_price / STEP) * STEP
        const cell_price_low = cell_price_high - STEP

        // Column index for multiplier
        const first_future_slot = Math.ceil(now / SLOT_MS) * SLOT_MS
        const col = Math.round((slot_start - first_future_slot) / SLOT_MS)
        if (col < 0 || col >= GAME_GRID.VISIBLE_COLS) return

        // Row offset from center price
        const cell_center_price = (cell_price_high + cell_price_low) / 2
        const row_offset = Math.round((cell_center_price - view_center) / STEP)
        const half_rows = GAME_GRID.VISIBLE_ROWS / 2
        if (Math.abs(row_offset) > half_rows) return

        const row = Math.round(half_rows - row_offset)
        // Use on-chain multiplier from contract
        const multiplier = game_store.getOnChainMultiplier(row, col) || 1.0

        const cell: GridCell = {
            col,
            row,
            price_low: cell_price_low,
            price_high: cell_price_high,
            time_start: slot_start,
            time_end: slot_end,
        }

        // Optimistic local update — check balance before allowing bet
        if (game_store.balance < GAME_BALANCE.BET_COST) return

        const temp_id = `temp_${Date.now()}`
        game_store.addOrder({
            id: temp_id,
            cell,
            cost: GAME_BALANCE.BET_COST,
            multiplier,
            placed_at: now,
            status: "active",
        })

        // Send bet to on-chain contract
        const onchain = useOnChain()
        onchain.placeBet(row, col).then(async (result) => {
            // Replace temp order with confirmed on-chain bet
            const bet_id = `bet_${result.betId}`
            const existing = game_store.orders.find((o) => o.id === temp_id)
            if (existing) {
                existing.id = bet_id
            }
            // Update balance from chain
            const bal = await onchain.fetchRusdBalance()
            game_store.updateBalance(bal)
        }).catch((err) => {
            console.error("placeBet failed:", err)
            // Revert optimistic update on failure
            game_store.orders = game_store.orders.filter((o) => o.id !== temp_id)
        })
    }

    function handleResize() {
        resizeCanvas()
    }

    return { start, stop, handleClick, handleResize }
}
