export interface Token {
    symbol: string
    name: string
    color: string
    token_id?: string
    issue_tx?: string | null
    satoshis?: number
    freeze?: boolean
    balance?: number
}
