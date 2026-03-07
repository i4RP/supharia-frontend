const API_BASE = import.meta.dev ? "/api/game" : "https://app-nrtfhtlf.fly.dev/api/game"

interface RegisterResponse {
    user_id: string
    token: string
    wallet_address: string
    eth_balance: number
}

interface BetResponse {
    id: string
    col: number
    row: number
    price_low: number
    price_high: number
    time_start: number
    time_end: number
    cost: number
    multiplier: number
    status: string
    placed_at: number
    tx_hash: string
    eth_balance: number
}

interface BalanceResponse {
    user_id: string
    wallet_address: string
    eth_balance: number
    total_bets: number
    total_wins: number
    total_profit: number
}

interface GameStateResponse {
    price: number
    timestamp: number
    connected: boolean
    last_update: number
}

interface WalletBalanceResponse {
    wallet_address: string
    eth_balance: number
    house_balance: number
}

export function useGameApi() {
    const token = useState<string>("game_token", () => "")
    const user_id = useState<string>("game_user_id", () => "")

    function getHeaders(): Record<string, string> {
        const headers: Record<string, string> = { "Content-Type": "application/json" }
        if (token.value) {
            headers["X-User-Token"] = token.value
        }
        return headers
    }

    async function register(nickname: string = "", wallet_address: string = ""): Promise<RegisterResponse> {
        const resp = await $fetch<RegisterResponse>(`${API_BASE}/register`, {
            method: "POST",
            body: { nickname, wallet_address },
        })
        token.value = resp.token
        user_id.value = resp.user_id
        // Persist token in localStorage
        if (import.meta.client) {
            localStorage.setItem("supharia_token", resp.token)
            localStorage.setItem("supharia_user_id", resp.user_id)
        }
        return resp
    }

    function restoreSession(): boolean {
        if (!import.meta.client) return false
        const saved_token = localStorage.getItem("supharia_token")
        const saved_user_id = localStorage.getItem("supharia_user_id")
        if (saved_token && saved_user_id) {
            token.value = saved_token
            user_id.value = saved_user_id
            return true
        }
        return false
    }

    async function getBalance(): Promise<BalanceResponse> {
        return await $fetch<BalanceResponse>(`${API_BASE}/balance`, {
            headers: getHeaders(),
        })
    }

    async function placeBet(params: {
        col: number
        row: number
        price_low: number
        price_high: number
        time_start: number
        time_end: number
        multiplier: number
    }): Promise<BetResponse> {
        return await $fetch<BetResponse>(`${API_BASE}/bet`, {
            method: "POST",
            headers: getHeaders(),
            body: params,
        })
    }

    async function resetBalance(): Promise<{ user_id: string; wallet_address: string }> {
        return await $fetch<{ user_id: string; wallet_address: string }>(`${API_BASE}/reset`, {
            method: "POST",
            headers: getHeaders(),
        })
    }

    async function getGameState(): Promise<GameStateResponse> {
        return await $fetch<GameStateResponse>(`${API_BASE}/state`)
    }

    async function getLeaderboard(limit: number = 50): Promise<unknown[]> {
        return await $fetch<unknown[]>(`${API_BASE}/leaderboard`, {
            params: { limit },
        })
    }

    async function getWalletBalance(address: string): Promise<WalletBalanceResponse> {
        return await $fetch<WalletBalanceResponse>(`${API_BASE}/wallet/balance`, {
            params: { address },
            headers: getHeaders(),
        })
    }

    return {
        token,
        user_id,
        register,
        restoreSession,
        getBalance,
        placeBet,
        resetBalance,
        getGameState,
        getLeaderboard,
        getWalletBalance,
    }
}
