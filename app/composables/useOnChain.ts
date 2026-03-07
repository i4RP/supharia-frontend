import { createPublicClient, createWalletClient, http, parseAbi, formatUnits } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import type { PublicClient, WalletClient, Account } from "viem"

// MegaETH testnet chain definition
const megaETH = {
    id: 6343,
    name: "MegaETH Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://carrot.megaeth.com/rpc"] },
    },
} as const

const POOL_ADDRESS = "0x627B45ad772f4069542D2CA08E320e3e7dA582cD" as const
const RUSD_ADDRESS = "0x48345110dB117682E5a4EBdD99919Aff5b872D43" as const
const LEADERBOARD_ADDRESS = "0x3feb68cab679d87fef08276a7897d929aafcb7c5" as const
const DEV_PRIVATE_KEY = "0xfa9ca47a819eab83f48e91b88af74c4b48a9205cbb16887d3d49becd1c3186f4" as const

// Minimal ABIs for the contracts we interact with
const POOL_ABI = parseAbi([
    "function currentPrice() view returns (int256)",
    "function currentVolatility() view returns (int256)",
    "function getMultiplier(uint256 row, uint256 col) view returns (uint256)",
    "function getGrid() view returns (uint256[3][9] multipliers, int256[9] priceLows, int256[9] priceHighs, uint256[3] timeEnds)",
    "function placeBet(uint256 row, uint256 col) returns (uint256 betId)",
    "function settleBet(uint256 betId)",
    "function getBet(uint256 betId) view returns ((address user, int256 priceLow, int256 priceHigh, uint256 timeEnd, uint256 multiplier, uint256 amount, bool settled, bool won))",
    "function nextBetId() view returns (uint256)",
    "function poolBalance() view returns (uint256)",
    "function getLeaderboard() view returns (address[] addrs, uint256[] playerScores)",
    "function VISIBLE_ROWS() view returns (uint256)",
    "function VISIBLE_COLS() view returns (uint256)",
    "function BET_AMOUNT() view returns (uint256)",
    "event PriceUpdated(int256 price, int256 volatility, uint256 timestamp)",
    "event BetPlaced(uint256 indexed betId, address indexed user, int256 priceLow, int256 priceHigh, uint256 timeEnd, uint256 multiplier, uint256 amount)",
    "event BetSettled(uint256 indexed betId, address indexed user, bool won, uint256 payout)",
])

const RUSD_ABI = parseAbi([
    "function balanceOf(address) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function faucet() returns (bool)",
])

const LEADERBOARD_ABI = parseAbi([
    "function submitResult(address player, bool won, int256 pnlDelta)",
    "function getLeaderboard() view returns (address[] addrs, int256[] pnls, uint256[] totalBets, uint256[] winCounts)",
    "function getPlayerStats(address player) view returns ((uint256 totalBets, uint256 wins, uint256 losses, int256 pnl, uint256 bestStreak, uint256 currentStreak, uint256 lastPlayedAt))",
    "function playerCount() view returns (uint256)",
    "event GameResult(address indexed player, bool won, int256 pnlDelta, uint256 timestamp)",
])

export interface OnChainGrid {
    multipliers: number[][] // [row][col] as float (e.g., 3.88)
    priceLows: number[] // [row] in USD
    priceHighs: number[] // [row] in USD
    timeEnds: number[] // [col] as unix timestamp ms
}

export interface LeaderboardEntry {
    address: string
    pnl: number       // in cents (e.g., 12050 = $120.50)
    totalBets: number
    wins: number
    winRate: number    // percentage
}

export interface PlayerStats {
    totalBets: number
    wins: number
    losses: number
    pnl: number
    bestStreak: number
    currentStreak: number
    lastPlayedAt: number
}

export interface OnChainBet {
    id: number
    user: string
    priceLow: number
    priceHigh: number
    timeEnd: number // ms
    multiplier: number
    amount: number
    settled: boolean
    won: boolean
}

let _publicClient: PublicClient | null = null
let _walletClient: WalletClient | null = null
let _account: Account | null = null

function getPublicClient(): PublicClient {
    if (!_publicClient) {
        _publicClient = createPublicClient({
            chain: megaETH,
            transport: http(),
        }) as PublicClient
    }
    return _publicClient
}

function getWalletClient(): { wallet: WalletClient; account: Account } {
    if (!_walletClient || !_account) {
        _account = privateKeyToAccount(DEV_PRIVATE_KEY)
        _walletClient = createWalletClient({
            account: _account,
            chain: megaETH,
            transport: http(),
        })
    }
    return { wallet: _walletClient, account: _account }
}

export function useOnChain() {
    const client = getPublicClient()

    /** Fetch current price from contract (WAD → USD float) */
    async function fetchPrice(): Promise<number> {
        const price = await client.readContract({
            address: POOL_ADDRESS,
            abi: POOL_ABI,
            functionName: "currentPrice",
        })
        return Number(formatUnits(price as bigint, 18))
    }

    /** Fetch the 9×3 grid of multipliers from contract */
    async function fetchGrid(): Promise<OnChainGrid> {
        const [multipliers, priceLows, priceHighs, timeEnds] = await client.readContract({
            address: POOL_ADDRESS,
            abi: POOL_ABI,
            functionName: "getGrid",
        }) as [bigint[][], bigint[], bigint[], bigint[]]

        return {
            multipliers: multipliers.map((row: bigint[]) =>
                row.map((m: bigint) => Number(formatUnits(m, 18))),
            ),
            priceLows: priceLows.map((p: bigint) => Number(formatUnits(p, 18))),
            priceHighs: priceHighs.map((p: bigint) => Number(formatUnits(p, 18))),
            timeEnds: timeEnds.map((t: bigint) => Number(t) * 1000), // to ms
        }
    }

    /** Get a single cell multiplier */
    async function fetchMultiplier(row: number, col: number): Promise<number> {
        const mult = await client.readContract({
            address: POOL_ADDRESS,
            abi: POOL_ABI,
            functionName: "getMultiplier",
            args: [BigInt(row), BigInt(col)],
        })
        return Number(formatUnits(mult as bigint, 18))
    }

    /** Get user's rUSD balance */
    async function fetchRusdBalance(address?: string): Promise<number> {
        const { account } = getWalletClient()
        const addr = (address || account.address) as `0x${string}`
        const bal = await client.readContract({
            address: RUSD_ADDRESS,
            abi: RUSD_ABI,
            functionName: "balanceOf",
            args: [addr],
        })
        return Number(formatUnits(bal as bigint, 18))
    }

    /** Ensure rUSD is approved for pool spending */
    async function ensureApproval(): Promise<void> {
        const { wallet, account } = getWalletClient()
        const allowance = await client.readContract({
            address: RUSD_ADDRESS,
            abi: RUSD_ABI,
            functionName: "allowance",
            args: [account.address, POOL_ADDRESS],
        }) as bigint

        // Approve max if not enough
        if (allowance < BigInt(1000) * BigInt(10 ** 18)) {
            const hash = await wallet.writeContract({
                address: RUSD_ADDRESS,
                abi: RUSD_ABI,
                functionName: "approve",
                args: [POOL_ADDRESS, (BigInt(1) << BigInt(255)) - BigInt(1)],
                chain: megaETH,
                account,
                gas: BigInt(200_000),
                gasPrice: BigInt(1_000_000),
            })
            await client.waitForTransactionReceipt({ hash })
        }
    }

    /** Place a bet on-chain (row, col) → returns betId */
    async function placeBet(row: number, col: number): Promise<{ betId: number; txHash: string }> {
        await ensureApproval()
        const { wallet, account } = getWalletClient()

        const hash = await wallet.writeContract({
            address: POOL_ADDRESS,
            abi: POOL_ABI,
            functionName: "placeBet",
            args: [BigInt(row), BigInt(col)],
            chain: megaETH,
            account,
            gas: BigInt(500_000),
            gasPrice: BigInt(1_000_000),
        })

        const receipt = await client.waitForTransactionReceipt({ hash })

        // Parse BetPlaced event from logs
        let betId = 0
        for (const log of receipt.logs) {
            try {
                if (log.topics[0] === "0x" + "a1c7a31c" /* partial */) {
                    // Better to just read nextBetId - 1
                }
            }
            catch { /* ignore */ }
        }

        // Read the latest betId
        const nextId = await client.readContract({
            address: POOL_ADDRESS,
            abi: POOL_ABI,
            functionName: "nextBetId",
        }) as bigint
        betId = Number(nextId) - 1

        return { betId, txHash: hash }
    }

    /** Get a bet's details */
    async function fetchBet(betId: number): Promise<OnChainBet> {
        const bet = await client.readContract({
            address: POOL_ADDRESS,
            abi: POOL_ABI,
            functionName: "getBet",
            args: [BigInt(betId)],
        }) as [string, bigint, bigint, bigint, bigint, bigint, boolean, boolean]

        return {
            id: betId,
            user: bet[0],
            priceLow: Number(formatUnits(bet[1], 18)),
            priceHigh: Number(formatUnits(bet[2], 18)),
            timeEnd: Number(bet[3]) * 1000,
            multiplier: Number(formatUnits(bet[4], 18)),
            amount: Number(formatUnits(bet[5], 18)),
            settled: bet[6],
            won: bet[7],
        }
    }

    /** Claim rUSD from faucet (100 rUSD) */
    async function claimFaucet(): Promise<string> {
        const { wallet, account } = getWalletClient()
        const hash = await wallet.writeContract({
            address: RUSD_ADDRESS,
            abi: RUSD_ABI,
            functionName: "faucet",
            chain: megaETH,
            account,
            gas: BigInt(200_000),
            gasPrice: BigInt(1_000_000),
        })
        await client.waitForTransactionReceipt({ hash })
        return hash
    }

    /** Get pool balance */
    async function fetchPoolBalance(): Promise<number> {
        const bal = await client.readContract({
            address: POOL_ADDRESS,
            abi: POOL_ABI,
            functionName: "poolBalance",
        })
        return Number(formatUnits(bal as bigint, 18))
    }

    /** Get dev wallet address */
    function getAddress(): string {
        const { account } = getWalletClient()
        return account.address
    }

    /** Settle a bet on-chain (anyone can call after expiry) */
    async function settleBet(betId: number): Promise<string> {
        const { wallet, account } = getWalletClient()
        const hash = await wallet.writeContract({
            address: POOL_ADDRESS,
            abi: POOL_ABI,
            functionName: "settleBet",
            args: [BigInt(betId)],
            chain: megaETH,
            account,
            gas: BigInt(300_000),
            gasPrice: BigInt(1_000_000),
        })
        await client.waitForTransactionReceipt({ hash })
        return hash
    }

    // ============ Leaderboard Functions ============

    /** Fetch on-chain leaderboard sorted by PnL */
    async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
        const [addrs, pnls, totalBets, winCounts] = await client.readContract({
            address: LEADERBOARD_ADDRESS,
            abi: LEADERBOARD_ABI,
            functionName: "getLeaderboard",
        }) as [string[], bigint[], bigint[], bigint[]]

        return addrs.map((addr: string, i: number) => {
            const bets = Number(totalBets[i])
            const wins = Number(winCounts[i])
            return {
                address: addr,
                pnl: Number(pnls[i]),
                totalBets: bets,
                wins,
                winRate: bets > 0 ? Math.round((wins / bets) * 100) : 0,
            }
        })
    }

    /** Submit a game result to the on-chain leaderboard */
    async function submitGameResult(player: string, won: boolean, pnlDelta: number): Promise<string> {
        const { wallet, account } = getWalletClient()
        const hash = await wallet.writeContract({
            address: LEADERBOARD_ADDRESS,
            abi: LEADERBOARD_ABI,
            functionName: "submitResult",
            args: [player as `0x${string}`, won, BigInt(Math.round(pnlDelta))],
            chain: megaETH,
            account,
            gas: BigInt(500_000),
            gasPrice: BigInt(1_000_000),
        })
        await client.waitForTransactionReceipt({ hash })
        return hash
    }

    /** Get a specific player's stats from leaderboard */
    async function fetchPlayerStats(player: string): Promise<PlayerStats> {
        const result = await client.readContract({
            address: LEADERBOARD_ADDRESS,
            abi: LEADERBOARD_ABI,
            functionName: "getPlayerStats",
            args: [player as `0x${string}`],
        }) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint]

        return {
            totalBets: Number(result[0]),
            wins: Number(result[1]),
            losses: Number(result[2]),
            pnl: Number(result[3]),
            bestStreak: Number(result[4]),
            currentStreak: Number(result[5]),
            lastPlayedAt: Number(result[6]),
        }
    }

    return {
        fetchPrice,
        fetchGrid,
        fetchMultiplier,
        fetchRusdBalance,
        placeBet,
        fetchBet,
        settleBet,
        claimFaucet,
        fetchPoolBalance,
        getAddress,
        ensureApproval,
        fetchLeaderboard,
        submitGameResult,
        fetchPlayerStats,
    }
}
