export interface S402Agent {
    id: string
    name: string
    address: string
    balance: number
    total_payments: number
    created: string
}

export interface S402Endpoint {
    path: string
    price: number
}
