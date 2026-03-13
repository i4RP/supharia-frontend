<template>
    <div class="absolute inset-0 flex flex-col" style="background: #03080F; padding-bottom: 60px">
        <!-- Phase 1: Monster Selection (no training active) -->
        <template v-if="!training_active">
            <!-- Header -->
            <div class="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-3">
                <div class="flex items-center gap-3">
                    <img src="/icon-192.png" alt="MPARA" class="w-8 h-8 rounded-lg" />
                    <div>
                        <h1 class="text-white font-bold text-lg tracking-wide">MegaPARA</h1>
                        <p class="text-xs" style="color: #7A8AA0">トレーニング</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full" style="background: rgba(5,13,26,0.9); border: 1px solid rgba(27,141,255,0.3)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 10H18a2 2 0 0 0 0 4h4" /></svg>
                    <span class="text-white font-bold text-sm font-mono">${{ game_store.balance.toFixed(0) }}</span>
                </div>
            </div>

            <!-- Instruction Banner -->
            <div class="mx-4 mb-3 rounded-xl p-3" style="background: linear-gradient(135deg, rgba(27,141,255,0.1), rgba(0,212,255,0.05)); border: 1px solid rgba(27,141,255,0.2)">
                <div class="flex items-center gap-2 mb-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                    <span class="text-xs font-bold font-mono" style="color: #1B8DFF">トレーニングモード</span>
                </div>
                <p class="text-[11px] leading-relaxed" style="color: #7A8AA0">モンスターを選んでトレーニング開始。自分でタップしてパターンを学習させると、モンスターが自動でプレイします。</p>
                <a href="https://github.com/i4RP/mpara-learning-engine" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 mt-1.5 text-[10px] font-mono" style="color: #1B8DFF" @click.stop>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#1B8DFF"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    Open Source - Learning Engine
                </a>
            </div>

            <!-- Monster List -->
            <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                <button
                    v-for="m in all_monsters"
                    :key="m.template_id"
                    class="monster-card w-full text-left rounded-xl p-4 relative overflow-hidden"
                    style="background: linear-gradient(135deg, #050D1A 0%, #0A1A30 100%); border: 1px solid rgba(0,212,255,0.3)"
                    @click="selectMonster(m.template_id)"
                >
                    <div class="flex items-center gap-4">
                        <!-- Monster Icon -->
                        <div class="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3)">
                            {{ m.icon }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <h3 class="text-white font-bold text-sm font-mono">{{ m.name }}</h3>
                                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono" style="background: rgba(0,212,255,0.15); color: #00D4FF">Lv.{{ m.level }}</span>
                                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono" style="background: rgba(27,141,255,0.15); color: #1B8DFF">${{ m.tier }}</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-[10px] font-mono" style="color: #ef4444">PWR {{ m.stats.power }}</span>
                                <span class="text-[10px] font-mono" style="color: #22c55e">REC {{ m.stats.recovery }}</span>
                                <span class="text-[10px] font-mono" style="color: #eab308">LCK {{ m.stats.luck }}</span>
                            </div>
                            <!-- Training progress -->
                            <div class="mt-1.5 flex items-center gap-2">
                                <div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.08)">
                                    <div
                                        class="h-full rounded-full transition-all duration-500"
                                        :style="{ width: getProgressPct(m.template_id) + '%', background: getProgressPct(m.template_id) >= 100 ? '#22c55e' : 'linear-gradient(90deg, #1B8DFF, #00D4FF)' }"
                                    />
                                </div>
                                <span class="text-[9px] font-mono flex-shrink-0" :style="{ color: getProgressPct(m.template_id) >= 100 ? '#22c55e' : '#7A8AA0' }">
                                    {{ getProgressPct(m.template_id) >= 100 ? 'TRAINED' : getTrainingCount(m.template_id) + '/3' }}
                                </span>
                            </div>
                        </div>
                        <!-- Arrow / AUTO badge -->
                        <div class="flex-shrink-0">
                            <div
                                v-if="getProgressPct(m.template_id) >= 100"
                                class="px-2 py-1 rounded-lg text-[10px] font-bold font-mono"
                                style="background: rgba(34,197,94,0.2); color: #22c55e; border: 1px solid rgba(34,197,94,0.3)"
                            >
                                AUTO
                            </div>
                            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.5)" stroke-width="2" class="flex-shrink-0"><path d="M9 18l6-6-6-6" /></svg>
                        </div>
                    </div>
                </button>

                <!-- Empty state -->
                <div v-if="all_monsters.length === 0" class="text-center py-12">
                    <div class="text-3xl mb-3">&#x1F4E6;</div>
                    <p class="text-sm font-mono" style="color: #7A8AA0">モンスターがいません</p>
                    <p class="text-xs font-mono mt-1" style="color: #4A5568">バトルでモンスターを入手しましょう</p>
                </div>
            </div>
        </template>

        <!-- Phase 2: Training Session Active -->
        <template v-else>
            <!-- Training Top Bar -->
            <div class="absolute top-0 left-0 right-0 z-10 px-3 pt-[env(safe-area-inset-top,8px)] pb-1">
                <div class="flex items-center gap-2">
                    <!-- Back button -->
                    <button class="p-1.5 rounded-lg" style="background: rgba(5,13,26,0.8); border: 1px solid rgba(27,141,255,0.2)" @click="stopTraining">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="2"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>

                    <!-- Monster info -->
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                        <span class="text-lg">{{ selected_template?.icon_emoji }}</span>
                        <span class="text-white font-bold text-xs font-mono">{{ selected_template?.name }}</span>
                    </div>

                    <!-- Training Progress Bar -->
                    <div class="flex-1 h-5 rounded-full overflow-hidden relative" style="background: rgba(5,13,26,0.9); border: 1px solid rgba(0,212,255,0.3)">
                        <div
                            class="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                            :style="{
                                width: training_progress + '%',
                                background: training_progress >= 100 ? 'linear-gradient(90deg, #22c55e, #10b981)' : 'linear-gradient(90deg, #1B8DFF, #00D4FF)',
                            }"
                        />
                        <span class="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold font-mono z-10">
                            {{ training_progress >= 100 ? 'TRAINED!' : current_training_count + '/3' }}
                        </span>
                    </div>

                    <!-- Auto toggle (only when trained) -->
                    <button
                        v-if="is_trained"
                        class="px-3 py-1.5 rounded-lg font-mono font-bold text-[10px] tracking-wider"
                        :style="auto_mode
                            ? 'background: rgba(34,197,94,0.3); border: 1px solid rgba(34,197,94,0.5); color: #22c55e'
                            : 'background: rgba(5,13,26,0.8); border: 1px solid rgba(34,197,94,0.3); color: rgba(34,197,94,0.5)'"
                        @click="toggleAutoMode"
                    >
                        {{ auto_mode ? 'AUTO ON' : 'AUTO' }}
                    </button>

                    <!-- Status -->
                    <span
                        :class="game_store.is_connected ? 'text-green-400' : 'text-red-400'"
                        class="text-[10px] font-mono flex-shrink-0"
                    >
                        {{ game_store.is_connected ? "LIVE" : "OFF" }}
                    </span>
                </div>
            </div>

            <!-- Game Canvas (Training Field) -->
            <canvas
                ref="game_canvas"
                class="w-full flex-1 cursor-crosshair"
                style="margin-top: 44px; margin-bottom: 100px"
                @click="handleTrainingClick"
            />

            <!-- Bottom Training Info -->
            <div class="absolute bottom-[52px] left-0 right-0 z-10 flex items-center justify-between px-3 pb-1">
                <!-- Win Rate -->
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full" style="background: rgba(5,13,26,0.9); border: 1px solid rgba(27,141,255,0.3)">
                    <span class="text-[10px] font-mono" style="color: #7A8AA0">WIN</span>
                    <span class="text-white font-bold text-sm font-mono">{{ training_win_rate.toFixed(0) }}%</span>
                </div>

                <!-- Session stats -->
                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-1 px-2 py-1.5 rounded-lg" style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2)">
                        <span class="text-[10px] font-mono" style="color: #22c55e">W:{{ session_wins }}</span>
                    </div>
                    <div class="flex items-center gap-1 px-2 py-1.5 rounded-lg" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2)">
                        <span class="text-[10px] font-mono" style="color: #ef4444">L:{{ session_losses }}</span>
                    </div>
                </div>

                <!-- Mode indicator -->
                <div
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    :style="auto_mode
                        ? 'background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3)'
                        : 'background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2)'"
                >
                    <span class="text-lg">{{ selected_template?.icon_emoji }}</span>
                    <span class="text-[10px] font-mono font-bold" :style="{ color: auto_mode ? '#22c55e' : '#00D4FF' }">
                        {{ auto_mode ? 'AUTO PLAY' : 'TRAINING' }}
                    </span>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { calculateMultiplierC, GAME_C_GRID } from "~/constants/game_c"
import { getMonsterTemplate } from "~/constants/monsters"
import type { TapRecord } from "~/composables/useTrainingApi"

const game_canvas = useTemplateRef<HTMLCanvasElement>("game_canvas")
const game_store = useGameStoreC()
const monster_store = useMonsterStore()
const { connect, disconnect } = useGameStreamC()
const training_api = useTrainingApi()

// Training state
const training_active = ref(false)
const selected_monster_id = ref<string | null>(null)
const auto_mode = ref(false)
const is_trained = ref(false)
const current_training_count = ref(0)
const training_win_rate = ref(0)
const session_wins = ref(0)
const session_losses = ref(0)

// Training data cache (loaded from API)
const training_cache = ref<Record<string, { training_count: number; win_rate: number; is_trained: boolean }>>({})

// Canvas composable (only used when training is active)
let canvas_composable: ReturnType<typeof useGameCanvasC> | null = null

// Auto-play timer
let auto_play_timer: ReturnType<typeof setInterval> | null = null

// Wallet address (use stored or generate a local one for training)
const wallet_address = computed(() => {
    if (typeof window === "undefined") return "local"
    let addr = localStorage.getItem("mpara_wallet_address")
    if (!addr) {
        addr = "local_training_" + Date.now()
        localStorage.setItem("mpara_wallet_address", addr)
    }
    return addr
})

// All monsters with their templates
const all_monsters = computed(() => {
    return monster_store.monsters.map(m => {
        const template = getMonsterTemplate(m.template_id)
        return {
            template_id: m.template_id,
            name: template?.name || m.template_id,
            icon: template?.icon_emoji || "?",
            level: m.level,
            tier: template?.element || 1,
            stats: m.stats,
        }
    })
})

const selected_template = computed(() => {
    if (!selected_monster_id.value) return null
    return getMonsterTemplate(selected_monster_id.value) ?? null
})

const training_progress = computed(() => {
    return Math.min(100, (current_training_count.value / 3) * 100)
})

// Load all training data on mount
onMounted(async () => {
    await loadAllTrainingData()
})

async function loadAllTrainingData() {
    const addr = wallet_address.value
    const data = await training_api.getAllTraining(addr)
    const cache: Record<string, { training_count: number; win_rate: number; is_trained: boolean }> = {}
    for (const item of data) {
        cache[item.monster_id] = {
            training_count: item.training_count,
            win_rate: item.win_rate,
            is_trained: item.is_trained,
        }
    }
    training_cache.value = cache
}

function getProgressPct(monsterId: string): number {
    const cached = training_cache.value[monsterId]
    if (!cached) return 0
    return Math.min(100, (cached.training_count / 3) * 100)
}

function getTrainingCount(monsterId: string): number {
    const cached = training_cache.value[monsterId]
    return cached ? Math.min(3, cached.training_count) : 0
}

// ========== Training Session ==========

async function selectMonster(monsterId: string) {
    selected_monster_id.value = monsterId
    training_active.value = true
    session_wins.value = 0
    session_losses.value = 0
    auto_mode.value = false

    // Load training data for this monster
    const data = await training_api.getTraining(wallet_address.value, monsterId)
    current_training_count.value = data.training_count || 0
    training_win_rate.value = data.win_rate || 0
    is_trained.value = data.is_trained || false

    // Start game canvas and price stream
    await nextTick()
    if (game_canvas.value) {
        canvas_composable = useGameCanvasC(game_canvas)
        connect()
        canvas_composable.start()
    }
}

function stopTraining() {
    if (canvas_composable) {
        canvas_composable.stop()
        canvas_composable = null
    }
    disconnect()
    stopAutoMode()
    game_store.resetGame()
    training_active.value = false
    selected_monster_id.value = null

    // Refresh training cache
    loadAllTrainingData()
}

function handleTrainingClick(event: MouseEvent) {
    if (auto_mode.value) return // Don't record during auto mode

    if (!canvas_composable) return
    canvas_composable.handleClick(event)

    // Record tap data and send to API
    recordTapFromClick(event)
}

async function recordTapFromClick(event: MouseEvent) {
    const canvas = game_canvas.value
    if (!canvas || !selected_monster_id.value) return

    const rect = canvas.getBoundingClientRect()
    const click_x = event.clientX - rect.left
    const click_y = event.clientY - rect.top

    const full_width = rect.width
    const full_height = rect.height
    const is_mobile = full_width < 480
    const price_label_w = is_mobile ? 55 : 70
    const grid_width = full_width - price_label_w
    const grid_height = full_height - 20
    const cell_size = grid_height / GAME_C_GRID.TARGET_ROWS
    const base_chart_head_x = grid_width * GAME_C_GRID.CHART_HEAD_RATIO
    const available_col_width = grid_width - base_chart_head_x
    const visible_cols = Math.max(2, Math.min(GAME_C_GRID.VISIBLE_COLS, Math.floor(available_col_width / cell_size)))
    const chart_head_x = grid_width - visible_cols * cell_size
    const SLOT_MS = GAME_C_GRID.CELL_TIME_SEC * 1000
    const STEP = GAME_C_GRID.CELL_PRICE_STEP
    const px_per_ms = cell_size / SLOT_MS
    const px_per_price = cell_size / STEP

    if (click_x < chart_head_x || click_x > grid_width) return
    if (click_y > grid_height) return

    const now = Date.now()
    const click_time_ms = now + (click_x - chart_head_x) / px_per_ms
    const slot_start = Math.floor(click_time_ms / SLOT_MS) * SLOT_MS

    const view_center = game_store.current_price || 0
    const click_price = view_center + (grid_height / 2 - click_y) / px_per_price
    const cell_price_high = Math.ceil(click_price / STEP) * STEP
    const cell_price_low = cell_price_high - STEP

    const first_future_slot = Math.ceil(now / SLOT_MS) * SLOT_MS
    const col = Math.round((slot_start - first_future_slot) / SLOT_MS)
    if (col < 0 || col >= visible_cols) return

    const cell_center_price = (cell_price_high + cell_price_low) / 2
    const row_offset = Math.round((cell_center_price - view_center) / STEP)

    const multiplier = calculateMultiplierC(col, row_offset)

    // Determine result after the cell's time window passes
    const time_end = slot_start + SLOT_MS
    const wait_time = time_end - Date.now() + 500

    setTimeout(async () => {
        const current = game_store.current_price
        const result: "win" | "loss" = (current >= cell_price_low && current <= cell_price_high) ? "win" : "loss"

        if (result === "win") session_wins.value++
        else session_losses.value++

        const tap: TapRecord = {
            grid_row: row_offset,
            grid_col: col,
            price_at_tap: view_center,
            multiplier,
            result,
        }

        const resp = await training_api.recordTap(wallet_address.value, selected_monster_id.value!, tap)
        current_training_count.value = resp.training_count
        is_trained.value = resp.is_trained

        const total = session_wins.value + session_losses.value
        training_win_rate.value = total > 0 ? (session_wins.value / total) * 100 : 0

        // Auto-analyze when training completes
        if (resp.is_trained && current_training_count.value === 3) {
            await training_api.analyzePattern(wallet_address.value, selected_monster_id.value!)
        }
    }, Math.max(wait_time, 1000))
}

// ========== Auto Play Mode ==========

function toggleAutoMode() {
    if (auto_mode.value) {
        stopAutoMode()
    } else {
        startAutoMode()
    }
}

async function startAutoMode() {
    if (!selected_monster_id.value) return

    const data = await training_api.getTraining(wallet_address.value, selected_monster_id.value)
    let pattern = data.learned_pattern
    if (!pattern) {
        await training_api.analyzePattern(wallet_address.value, selected_monster_id.value)
        const updated = await training_api.getTraining(wallet_address.value, selected_monster_id.value)
        pattern = updated.learned_pattern
        if (!pattern) return
    }

    auto_mode.value = true

    const SLOT_MS = GAME_C_GRID.CELL_TIME_SEC * 1000

    auto_play_timer = setInterval(() => {
        if (!auto_mode.value || !canvas_composable || !game_canvas.value) return

        const positions = pattern!.preferred_positions
        if (!positions || positions.length === 0) return

        // Weighted random selection from preferred positions
        const total_weight = positions.reduce((sum: number, p: { win_rate: number; count: number }) => sum + p.win_rate * p.count, 0)
        let roll = Math.random() * total_weight
        let chosen = positions[0]
        for (const pos of positions) {
            roll -= pos.win_rate * pos.count
            if (roll <= 0) {
                chosen = pos
                break
            }
        }

        const [row_str, col_str] = chosen.position.split(",")
        const row_offset = parseInt(row_str) || 0
        const col = parseInt(col_str) || 0

        simulateGridClick(col, row_offset)
    }, SLOT_MS + 500)
}

function stopAutoMode() {
    auto_mode.value = false
    if (auto_play_timer) {
        clearInterval(auto_play_timer)
        auto_play_timer = null
    }
}

function simulateGridClick(col: number, row_offset: number) {
    const canvas = game_canvas.value
    if (!canvas || !canvas_composable) return

    const rect = canvas.getBoundingClientRect()
    const full_width = rect.width
    const full_height = rect.height
    const is_mobile = full_width < 480
    const price_label_w = is_mobile ? 55 : 70
    const grid_width = full_width - price_label_w
    const grid_height = full_height - 20
    const cell_size = grid_height / GAME_C_GRID.TARGET_ROWS
    const base_chart_head_x = grid_width * GAME_C_GRID.CHART_HEAD_RATIO
    const available_col_width = grid_width - base_chart_head_x
    const visible_cols = Math.max(2, Math.min(GAME_C_GRID.VISIBLE_COLS, Math.floor(available_col_width / cell_size)))
    const chart_head_x = grid_width - visible_cols * cell_size
    const SLOT_MS = GAME_C_GRID.CELL_TIME_SEC * 1000
    const STEP = GAME_C_GRID.CELL_PRICE_STEP
    const px_per_ms = cell_size / SLOT_MS
    const px_per_price = cell_size / STEP

    const now = Date.now()
    const first_future_slot = Math.ceil(now / SLOT_MS) * SLOT_MS
    const target_slot = first_future_slot + col * SLOT_MS
    const click_x = chart_head_x + (target_slot - now) * px_per_ms + cell_size / 2

    const view_center = game_store.current_price || 0
    const target_price = view_center + row_offset * STEP
    const click_y = grid_height / 2 - (target_price - view_center) * px_per_price

    if (click_x < chart_head_x || click_x > grid_width) return
    if (click_y < 0 || click_y > grid_height) return

    const synthetic_event = new MouseEvent("click", {
        clientX: rect.left + click_x,
        clientY: rect.top + click_y,
    })

    canvas_composable.handleClick(synthetic_event)
}

// Cleanup
onUnmounted(() => {
    stopAutoMode()
    if (canvas_composable) {
        canvas_composable.stop()
        canvas_composable = null
    }
    disconnect()
})
</script>

<style scoped>
.monster-card {
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.monster-card:active {
    transform: scale(0.98);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}
</style>
