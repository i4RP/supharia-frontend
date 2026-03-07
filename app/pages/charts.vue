<template>
    <div :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-4">

            <!-- Header -->
            <div class="flex items-center justify-between flex-wrap gap-3">
                <h1 :class="text">Charts</h1>
                <select
                    v-model="selected_pool"
                    :class="`px-3 py-1.5 rounded-xl border ${is_dark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#ededed]' : 'bg-white border-gray-200 text-gray-900'} text-sm outline-none`"
                >
                    <option v-for="pool_label in POOL_LABELS" :key="pool_label">{{ pool_label }}</option>
                </select>
            </div>

            <!-- Chart Card -->
            <div :class="`${card_bg} rounded-2xl border ${border} overflow-hidden`">

                <!-- Toolbar -->
                <div :class="`flex flex-wrap items-center gap-3 p-3 border-b ${border}`">
                    <div class="flex items-center gap-3">
                        <span :class="`text-sm ${text}`" style="font-weight: 700">{{ last_candle.close.toFixed(4) }}</span>
                        <span :class="`text-xs ${is_green ? 'text-green-400' : 'text-red-400'}`">
                            {{ is_green ? "+" : "" }}{{ price_change_percent.toFixed(2) }}%
                        </span>
                    </div>

                    <div :class="`h-4 w-px ${is_dark ? 'bg-[#1a1a1a]' : 'bg-gray-200'}`" />

                    <!-- Intervals -->
                    <div class="flex gap-1">
                        <button
                            v-for="iv in INTERVALS"
                            :key="iv"
                            :class="`px-2 py-1 rounded text-xs transition-colors ${ selected_interval === iv ? 'bg-white text-black' : `${text_muted} hover:bg-[#111]` }`"
                            @click="selected_interval = iv"
                        >
                            {{ iv }}
                        </button>
                    </div>

                    <div :class="`h-4 w-px ${is_dark ? 'bg-[#1a1a1a]' : 'bg-gray-200'}`" />

                    <!-- Indicators -->
                    <div class="flex flex-wrap gap-1">
                        <button
                            v-for="ind in INDICATORS"
                            :key="ind"
                            :class="`px-2 py-1 rounded text-xs transition-colors ${ active_indicators.has(ind) ? 'bg-white/8 text-white border border-white/20' : `${text_muted} hover:bg-[#111]` }`"
                            @click="toggleIndicator(ind)"
                        >
                            {{ ind }}
                        </button>
                    </div>
                </div>

                <!-- OHLCV info -->
                <div :class="`flex gap-4 px-4 py-2 text-xs ${text_muted} border-b ${border}`">
                    <span v-for="item in ohlcv_items" :key="item[0]">
                        {{ item[0] }}: <span :class="text">{{ item[1] }}</span>
                    </span>
                </div>

                <!-- Charts -->
                <div :class="`${is_dark ? 'bg-black' : 'bg-gray-50'} p-2`">
                    <canvas ref="candlestick_canvas" width="600" height="220" class="w-full" />
                    <canvas ref="volume_canvas" width="600" height="60" class="w-full" />
                    <template v-for="ind in visible_indicator_canvases" :key="ind">
                        <div :class="`border-t ${border} pt-1`">
                            <canvas :ref="(el) => setIndicatorCanvasRef(ind, el as HTMLCanvasElement)" width="600" height="80" class="w-full" />
                        </div>
                    </template>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { POOL_LABELS } from "~/constants/pools"
import type { Candle } from "~/types/chart"

const { is_dark, bg, border, text, text_muted } = useTheme()

const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"]
const INDICATORS = ["SMA", "EMA", "Bollinger", "RSI", "MACD"]

const selected_pool = ref(POOL_LABELS[0])
const selected_interval = ref("1h")
const active_indicators = ref(new Set<string>())

const card_bg = computed(() => (is_dark.value ? "bg-[#0a0a0a]" : "bg-white"))

const candlestick_canvas = useTemplateRef<HTMLCanvasElement>("candlestick_canvas")
const volume_canvas = useTemplateRef<HTMLCanvasElement>("volume_canvas")
const indicator_canvas_refs = ref<Record<string, HTMLCanvasElement | null>>({})

function setIndicatorCanvasRef(indicator_name: string, element: HTMLCanvasElement | null) {
    indicator_canvas_refs.value[indicator_name] = element
}

function generateCandles(count: number, base_price: number): Candle[] {
    const candle_list: Candle[] = []
    let current_price = base_price
    for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.5) * current_price * 0.03
        const candle_open = current_price
        const candle_close = current_price + change
        const candle_high = Math.max(candle_open, candle_close) + Math.random() * current_price * 0.01
        const candle_low = Math.min(candle_open, candle_close) - Math.random() * current_price * 0.01
        const candle_volume = 50000 + Math.random() * 100000
        candle_list.push({
            open: candle_open,
            high: candle_high,
            low: candle_low,
            close: candle_close,
            volume: candle_volume,
        })
        current_price = candle_close
    }
    return candle_list
}

const candles = generateCandles(60, 47.23)
const last_candle = candles[candles.length - 1]
const is_green = last_candle.close >= last_candle.open
const price_change_percent = ((last_candle.close - last_candle.open) / last_candle.open) * 100

const ohlcv_items = computed(() => [
    ["O", last_candle.open.toFixed(4)],
    ["H", last_candle.high.toFixed(4)],
    ["L", last_candle.low.toFixed(4)],
    ["C", last_candle.close.toFixed(4)],
])

const visible_indicator_canvases = computed(() =>
    Array.from(active_indicators.value).filter((ind) => ind === "RSI" || ind === "MACD"),
)

function toggleIndicator(indicator_name: string) {
    const next_set = new Set(active_indicators.value)
    if (next_set.has(indicator_name)) {
        next_set.delete(indicator_name)
    } else {
        next_set.add(indicator_name)
    }
    active_indicators.value = next_set
}

function drawCandlestickChart(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const canvas_width = canvas.width
    const canvas_height = canvas.height
    ctx.clearRect(0, 0, canvas_width, canvas_height)

    const background_color = is_dark.value ? "#000000" : "#f9fafb"
    const grid_color = is_dark.value ? "#1a1a1a" : "#e5e7eb"

    ctx.fillStyle = background_color
    ctx.fillRect(0, 0, canvas_width, canvas_height)

    ctx.strokeStyle = grid_color
    ctx.lineWidth = 0.5
    for (let i = 1; i <= 4; i++) {
        const grid_y = (canvas_height * i) / 5
        ctx.beginPath()
        ctx.moveTo(40, grid_y)
        ctx.lineTo(canvas_width, grid_y)
        ctx.stroke()
    }

    const all_prices = candles.flatMap((c) => [c.high, c.low])
    const min_price = Math.min(...all_prices)
    const max_price = Math.max(...all_prices)
    const price_range = max_price - min_price || 1

    const pad_left = 45
    const pad_right = 10
    const pad_top = 10
    const pad_bottom = 10
    const chart_width = canvas_width - pad_left - pad_right
    const chart_height = canvas_height - pad_top - pad_bottom
    const candle_width = Math.max(2, chart_width / candles.length - 1)

    candles.forEach((candle, index) => {
        const x_position = pad_left + (index / candles.length) * chart_width + candle_width / 2
        const priceToY = (price: number) => pad_top + chart_height - ((price - min_price) / price_range) * chart_height

        const candle_is_green = candle.close >= candle.open
        ctx.strokeStyle = candle_is_green ? "#22c55e" : "#ef4444"
        ctx.fillStyle = candle_is_green ? "#22c55e" : "#ef4444"

        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x_position, priceToY(candle.high))
        ctx.lineTo(x_position, priceToY(candle.low))
        ctx.stroke()

        const body_top = priceToY(Math.max(candle.open, candle.close))
        const body_height = Math.max(1, Math.abs(priceToY(candle.open) - priceToY(candle.close)))
        ctx.fillRect(x_position - candle_width / 2, body_top, candle_width, body_height)
    })

    ctx.fillStyle = is_dark.value ? "#6b7280" : "#9ca3af"
    ctx.font = "9px monospace"
    for (let i = 0; i <= 4; i++) {
        const label_price = min_price + (price_range * i) / 4
        const label_y = pad_top + chart_height - (i / 4) * chart_height
        ctx.fillText(label_price.toFixed(2), 0, label_y + 3)
    }
}

function drawVolumeChart(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const canvas_width = canvas.width
    const canvas_height = canvas.height
    ctx.fillStyle = is_dark.value ? "#000000" : "#f9fafb"
    ctx.fillRect(0, 0, canvas_width, canvas_height)

    const max_volume = Math.max(...candles.map((c) => c.volume))
    const bar_width = Math.max(2, (canvas_width - 45) / candles.length - 1)

    candles.forEach((candle, index) => {
        const x_position = 45 + (index / candles.length) * (canvas_width - 45) + bar_width / 2
        const bar_height = (candle.volume / max_volume) * (canvas_height - 10)
        ctx.fillStyle = candle.close >= candle.open ? "#22c55e44" : "#ef444444"
        ctx.fillRect(x_position - bar_width / 2, canvas_height - bar_height - 5, bar_width, bar_height)
    })
}

function drawIndicatorChart(canvas: HTMLCanvasElement, indicator_name: string) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const canvas_width = canvas.width
    const canvas_height = canvas.height
    ctx.fillStyle = is_dark.value ? "#000000" : "#f9fafb"
    ctx.fillRect(0, 0, canvas_width, canvas_height)

    ctx.strokeStyle = "#6366f1"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let x = 45; x < canvas_width; x++) {
        const sine_value = canvas_height / 2 + Math.sin((x / canvas_width) * Math.PI * 8) * (canvas_height / 3)
        if (x === 45) {
            ctx.moveTo(x, sine_value)
        } else {
            ctx.lineTo(x, sine_value)
        }
    }
    ctx.stroke()

    ctx.fillStyle = is_dark.value ? "#6b7280" : "#9ca3af"
    ctx.font = "9px monospace"
    ctx.fillText(indicator_name, 2, 12)
}

onMounted(() => {
    if (candlestick_canvas.value) {
        drawCandlestickChart(candlestick_canvas.value)
    }
    if (volume_canvas.value) {
        drawVolumeChart(volume_canvas.value)
    }
})

watch(
    visible_indicator_canvases,
    () => {
        nextTick(() => {
            for (const indicator_name of visible_indicator_canvases.value) {
                const canvas_element = indicator_canvas_refs.value[indicator_name]
                if (canvas_element) {
                    drawIndicatorChart(canvas_element, indicator_name)
                }
            }
        })
    },
    { deep: true },
)
</script>
