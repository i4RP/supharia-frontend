const API_BASE = "https://8nw2elu160.execute-api.us-east-1.amazonaws.com/prod"

export interface TapRecord {
    grid_row: number
    grid_col: number
    price_at_tap: number
    multiplier: number
    result: "win" | "loss"
    timestamp?: number
}

export interface LearnedPattern {
    strategy: "aggressive" | "balanced" | "conservative"
    win_rate: number
    avg_multiplier: number
    avg_win_multiplier: number
    preferred_positions: { position: string; win_rate: number; count: number }[]
    row_weights: Record<string, number>
    col_weights: Record<string, number>
    total_taps: number
    total_wins: number
}

export interface TrainingData {
    wallet_address: string
    monster_id: string
    tap_history: TapRecord[]
    learned_pattern: LearnedPattern | null
    training_count: number
    win_rate: number
    is_trained: boolean
    created_at: number
    updated_at: number
}

export function useTrainingApi() {
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function getAllTraining(walletAddress: string): Promise<TrainingData[]> {
        loading.value = true
        error.value = null
        try {
            const res = await fetch(`${API_BASE}/training/${walletAddress.toLowerCase()}`)
            const data = await res.json()
            return data.training_data || []
        } catch (e) {
            error.value = String(e)
            return []
        } finally {
            loading.value = false
        }
    }

    async function getTraining(walletAddress: string, monsterId: string): Promise<TrainingData> {
        loading.value = true
        error.value = null
        try {
            const res = await fetch(`${API_BASE}/training/${walletAddress.toLowerCase()}/${monsterId}`)
            const data = await res.json()
            return data as TrainingData
        } catch (e) {
            error.value = String(e)
            return {
                wallet_address: walletAddress.toLowerCase(),
                monster_id: monsterId,
                tap_history: [],
                learned_pattern: null,
                training_count: 0,
                win_rate: 0,
                is_trained: false,
                created_at: 0,
                updated_at: 0,
            }
        } finally {
            loading.value = false
        }
    }

    async function recordTap(walletAddress: string, monsterId: string, tap: TapRecord): Promise<{ training_count: number; is_trained: boolean }> {
        error.value = null
        try {
            const res = await fetch(`${API_BASE}/training/${walletAddress.toLowerCase()}/${monsterId}/tap`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tap),
            })
            const data = await res.json()
            return { training_count: data.training_count || 0, is_trained: data.is_trained || false }
        } catch (e) {
            error.value = String(e)
            return { training_count: 0, is_trained: false }
        }
    }

    async function analyzePattern(walletAddress: string, monsterId: string): Promise<LearnedPattern | null> {
        loading.value = true
        error.value = null
        try {
            const res = await fetch(`${API_BASE}/training/${walletAddress.toLowerCase()}/${monsterId}/analyze`, {
                method: "POST",
            })
            const data = await res.json()
            if (data.error) {
                error.value = data.error
                return null
            }
            return data.learned_pattern || null
        } catch (e) {
            error.value = String(e)
            return null
        } finally {
            loading.value = false
        }
    }

    async function resetTraining(walletAddress: string, monsterId: string): Promise<boolean> {
        loading.value = true
        error.value = null
        try {
            const res = await fetch(`${API_BASE}/training/${walletAddress.toLowerCase()}/${monsterId}`, {
                method: "DELETE",
            })
            const data = await res.json()
            return data.message === "Training data reset"
        } catch (e) {
            error.value = String(e)
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        getAllTraining,
        getTraining,
        recordTap,
        analyzePattern,
        resetTraining,
    }
}
