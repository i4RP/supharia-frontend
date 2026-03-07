export interface Pool {
    id: string
    label: string
    tvl: string
    vol_24h: string
    fee: string
    fav: boolean
    price?: string
}

export interface PoolTransaction {
    type: string
    in: string
    out: string
    fee: string
    status: string
    time: string
}
