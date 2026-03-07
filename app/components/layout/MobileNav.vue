<template>
    <nav
        class="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-pb"
        :class="[bg, 'border-t', border]"
    >
        <div class="flex">
            <button
                v-for="item in nav_items"
                :key="item.label"
                class="flex-1 flex flex-col items-center py-2 transition-colors"
                :class="isActive(item.tabs) ? 'text-white' : text_muted"
                @click="navigateTo('/' + item.default_tab)"
            >
                <component :is="item.icon" :size="20" />
                <span class="text-xs mt-0.5">{{ item.label }}</span>
            </button>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ArrowLeftRight, Layers, MoreHorizontal, Search, TrendingUp } from "lucide-vue-next"
import { EARN_TABS, EXPLORE_TABS, MORE_TABS, TRADE_TABS } from "~/constants/nav"
import type { NavTab } from "~/types/nav"

const { bg, border, text_muted } = useTheme()
const current_route = useRoute()

const nav_items = [
    { icon: ArrowLeftRight, label: "Trade", tabs: TRADE_TABS, default_tab: "swap" },
    { icon: TrendingUp, label: "Earn", tabs: EARN_TABS, default_tab: "pool" },
    { icon: Layers, label: "Bridge", tabs: ["bridge"] as NavTab[], default_tab: "bridge" },
    { icon: Search, label: "Explore", tabs: EXPLORE_TABS, default_tab: "analytics" },
    { icon: MoreHorizontal, label: "More", tabs: MORE_TABS, default_tab: "docs" },
]

function isActive(tabs: NavTab[]): boolean {
    const current_tab = current_route.path.replace("/", "")
    return tabs.includes(current_tab as NavTab)
}
</script>
