export interface Notification {
    id: string
    type: string
    title: string
    message: string
    time: string
    read: boolean
}

export interface PriceAlert {
    id: string
    type: string
    threshold: string
    active: boolean
}
