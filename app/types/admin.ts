export interface AdminUser {
    address: string
    swaps: number
    lp_value: string
    last_active: string
}

export interface AdminLog {
    level: string
    message: string
    time: string
}
