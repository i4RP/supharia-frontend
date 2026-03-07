export type NavTab =
    | "swap"
    | "limit-orders"
    | "partial-fill"
    | "routing"
    | "pool"
    | "rewards"
    | "farming"
    | "bridge"
    | "explorer"
    | "tokens"
    | "analytics"
    | "charts"
    | "portfolio"
    | "history"
    | "s402"
    | "docs"
    | "launchpad"
    | "governance"
    | "notifications"
    | "security"
    | "admin"
    | "game"

export interface NavChild {
    label: string
    tab: NavTab
}

export interface NavGroup {
    label: string
    icon: string
    children: NavChild[]
}
