import type { Pool, PoolTransaction } from "~/types/pool"

export const POOLS: Pool[] = [
    { id: "pool1", label: "BSV / DSTAS", tvl: "$1.24M", vol_24h: "$83.2K", fee: "1%", fav: true, price: "47.23" },
    { id: "pool2", label: "BSV / wUSDC", tvl: "$890K", vol_24h: "$52.1K", fee: "1%", fav: false, price: "62.10" },
    { id: "pool3", label: "DSTAS / DXS", tvl: "$280K", vol_24h: "$28.7K", fee: "1%", fav: false, price: "0.382" },
]

export const POOL_LABELS = ["BSV / DSTAS", "BSV / wUSDC", "DSTAS / DXS"]

export const POOL_TX_DATA: PoolTransaction[] = [
    { type: "Swap", in: "0.5 BSV", out: "23.61 DSTAS", fee: "0.24", status: "confirmed", time: "5m ago" },
    { type: "Add Liquidity", in: "1.0 BSV", out: "47.23 DSTAS", fee: "0.00", status: "confirmed", time: "12m ago" },
    { type: "Swap", in: "100 DSTAS", out: "2.11 BSV", fee: "1.01", status: "confirmed", time: "28m ago" },
    { type: "Remove Liquidity", in: "50 LP", out: "", fee: "0.00", status: "confirmed", time: "1h ago" },
]
