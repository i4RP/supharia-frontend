import type { NavGroup, NavTab } from "~/types/nav"

export const NAV_GROUPS: NavGroup[] = [
    {
        label: "Trade",
        icon: "ArrowLeftRight",
        children: [
            { label: "Swap", tab: "swap" },
            { label: "Limit Orders", tab: "limit-orders" },
            { label: "Partial Fill", tab: "partial-fill" },
            { label: "Routing", tab: "routing" },
        ],
    },
    {
        label: "Earn",
        icon: "TrendingUp",
        children: [
            { label: "Pool", tab: "pool" },
            { label: "Rewards", tab: "rewards" },
            { label: "Farming", tab: "farming" },
        ],
    },
    {
        label: "Explore",
        icon: "Search",
        children: [
            { label: "Explorer", tab: "explorer" },
            { label: "Tokens", tab: "tokens" },
            { label: "Analytics", tab: "analytics" },
            { label: "Charts", tab: "charts" },
            { label: "Portfolio", tab: "portfolio" },
            { label: "History", tab: "history" },
        ],
    },
    {
        label: "More",
        icon: "MoreHorizontal",
        children: [
            { label: "s402", tab: "s402" },
            { label: "Docs", tab: "docs" },
            { label: "Launchpad", tab: "launchpad" },
            { label: "Governance", tab: "governance" },
            { label: "Notifications", tab: "notifications" },
            { label: "Security", tab: "security" },
            { label: "Admin", tab: "admin" },
        ],
    },
]

export const TRADE_TABS: NavTab[] = ["swap", "limit-orders", "partial-fill", "routing"]
export const EARN_TABS: NavTab[] = ["pool", "rewards", "farming"]
export const EXPLORE_TABS: NavTab[] = ["explorer", "tokens", "analytics", "charts", "portfolio", "history"]
export const MORE_TABS: NavTab[] = ["s402", "docs", "launchpad", "governance", "notifications", "security", "admin"]
