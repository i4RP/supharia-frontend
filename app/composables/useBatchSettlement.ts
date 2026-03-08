import { useOnChain } from "~/composables/useOnChain"
import type { PlayerStats } from "~/composables/useOnChain"
import { GAME_C_BALANCE } from "~/constants/game_c"

const BATCH_INTERVAL_MS = 5000 // Flush every 5 seconds
const LOCAL_STORAGE_KEY = "supharia_pending_results"

interface PendingResult {
    won: boolean
    pnlDelta: number // in cents (e.g., -500 = -$5.00, 1200 = +$12.00)
    timestamp: number
}

/**
 * Optimistic Batch Settlement composable.
 *
 * - Bet results are applied immediately to the local Pinia store (optimistic).
 * - Results are queued and flushed to on-chain Leaderboard every 5 seconds.
 * - On app load, balance is restored from on-chain PnL + any unflushed local results.
 * - Pending results survive page refresh via localStorage.
 */
export function useBatchSettlement() {
    const { submitGameResult, fetchPlayerStats, getAddress } = useOnChain()

    let _queue: PendingResult[] = []
    let _flushing = false
    let _flushTimer: ReturnType<typeof setInterval> | null = null

    // ============ Persistence ============

    function _savePending(): void {
        if (import.meta.client) {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(_queue))
            }
            catch { /* quota exceeded or private browsing */ }
        }
    }

    function _loadPending(): PendingResult[] {
        if (!import.meta.client) return []
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
            if (raw) return JSON.parse(raw) as PendingResult[]
        }
        catch { /* corrupt data */ }
        return []
    }

    function _clearPending(): void {
        if (import.meta.client) {
            localStorage.removeItem(LOCAL_STORAGE_KEY)
        }
    }

    // ============ Queue Management ============

    /**
     * Queue a bet result for batch submission.
     * Called immediately after local optimistic update.
     */
    function queueResult(won: boolean, pnlDelta: number): void {
        const result: PendingResult = {
            won,
            pnlDelta: Math.round(pnlDelta),
            timestamp: Date.now(),
        }
        _queue.push(result)
        _savePending()
    }

    /**
     * Flush all queued results to on-chain Leaderboard.
     * Uses single-result submissions (sequential) for reliability.
     * Could be upgraded to batch call if gas optimization needed.
     */
    async function flush(): Promise<void> {
        if (_flushing || _queue.length === 0) return
        _flushing = true

        const batch = _queue.splice(0, _queue.length)
        _savePending()

        const addr = getAddress()

        try {
            // Submit batch: use individual calls for now (more reliable)
            // The Leaderboard contract also has submitBatch() for gas savings
            for (const r of batch) {
                try {
                    await submitGameResult(addr, r.won, r.pnlDelta)
                }
                catch (e) {
                    console.warn("[BatchSettlement] single submit failed, re-queuing:", e)
                    // Re-queue failed results
                    _queue.unshift(r)
                }
            }
            _savePending()
        }
        catch (e) {
            console.error("[BatchSettlement] flush error:", e)
            // Put batch back in queue
            _queue.unshift(...batch)
            _savePending()
        }
        finally {
            _flushing = false
        }
    }

    // ============ Balance Restoration ============

    /**
     * Restore balance from on-chain stats + any unflushed local results.
     * Returns the computed balance.
     *
     * balance = INITIAL + (on-chain PnL / 100) + sum(pending PnL / 100)
     */
    async function restoreBalance(): Promise<{ balance: number; stats: PlayerStats }> {
        const addr = getAddress()
        let stats: PlayerStats

        try {
            stats = await fetchPlayerStats(addr)
        }
        catch {
            // If chain is unreachable, return initial balance
            stats = {
                totalBets: 0,
                wins: 0,
                losses: 0,
                pnl: 0,
                bestStreak: 0,
                currentStreak: 0,
                lastPlayedAt: 0,
            }
        }

        // Load any unflushed results from localStorage
        const pending = _loadPending()
        _queue = pending

        // Calculate pending PnL (cents)
        const pendingPnl = pending.reduce((sum, r) => sum + r.pnlDelta, 0)

        // Balance = on-chain PnL (cents→dollars) + pending PnL (cents→dollars)
        // Note: INITIAL is 0 — players must purchase credits to play.
        // Purchased credits are tracked on-chain via Leaderboard.purchaseWithRusd/purchaseWithEth
        // which add +10000 cents ($100) to on-chain PnL.
        const balance = GAME_C_BALANCE.INITIAL + (stats.pnl / 100) + (pendingPnl / 100)

        return {
            balance: Math.max(0, balance), // Never go below 0
            stats,
        }
    }

    // ============ Lifecycle ============

    /**
     * Start the batch flush timer. Call on game mount.
     */
    function startBatchTimer(): void {
        if (_flushTimer) return
        _flushTimer = setInterval(() => {
            flush()
        }, BATCH_INTERVAL_MS)
    }

    /**
     * Stop the batch flush timer and flush remaining. Call on game unmount.
     */
    function stopBatchTimer(): void {
        if (_flushTimer) {
            clearInterval(_flushTimer)
            _flushTimer = null
        }
        // Final flush on stop
        flush()
    }

    /**
     * Get count of pending (unflushed) results.
     */
    function pendingCount(): number {
        return _queue.length
    }

    return {
        queueResult,
        flush,
        restoreBalance,
        startBatchTimer,
        stopBatchTimer,
        pendingCount,
    }
}
