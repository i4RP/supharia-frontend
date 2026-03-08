<template>
    <header :class="[bg, 'border-b', border, 'sticky top-0 z-50']">
        <div
            class="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4"
        >
            <!-- Logo -->
            <div
                class="flex items-center gap-2 shrink-0 cursor-pointer"
                @click="navigateTo('/swap')"
            >
                <div
                    class="w-7 h-7 rounded-md bg-[#111] border border-[#2a2a2a] flex items-center justify-center"
                >
                    <Zap :size="14" class="text-white" />
                </div>
                <span
                    :class="[text, 'hidden sm:block']"
                    style="font-weight: 700; font-size: 16px"
                    >DXS Swap</span
                >
            </div>

            <!-- Desktop Nav -->
            <nav
                class="hidden md:flex items-center gap-1 flex-1 justify-center"
            >
                <!-- Bridge (standalone) -->
                <button
                    class="px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5"
                    :class="current_route.path === '/bridge' ? 'bg-white/8 text-white' : [text_muted, hover_bg, 'hover:text-[#ededed]']"
                    @click="navigateTo('/bridge')"
                >
                    <Layers :size="14" />
                    Bridge
                </button>

                <!-- Game (standalone) -->
                <button
                    class="px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5"
                    :class="current_route.path === '/game' ? 'bg-white/8 text-white' : [text_muted, hover_bg, 'hover:text-[#ededed]']"
                    @click="navigateTo('/game')"
                >
                    <Gamepad2 :size="14" />
                    Game
                </button>

                <!-- Nav Groups -->
                <div
                    v-for="group in NAV_GROUPS"
                    :key="group.label"
                    class="relative"
                    @mouseenter="open_group = group.label"
                    @mouseleave="open_group = null"
                >
                    <button
                        class="px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5"
                        :class="current_group_label === group.label ? 'bg-white/8 text-white' : [text_muted, hover_bg, 'hover:text-[#ededed]']"
                    >
                        <ArrowLeftRight
                            v-if="group.icon === 'ArrowLeftRight'"
                            :size="14"
                        />
                        <TrendingUp
                            v-else-if="group.icon === 'TrendingUp'"
                            :size="14"
                        />
                        <Search
                            v-else-if="group.icon === 'Search'"
                            :size="14"
                        />
                        <MoreHorizontal
                            v-else-if="group.icon === 'MoreHorizontal'"
                            :size="14"
                        />
                        {{ group.label }}
                        <ChevronDown
                            :size="12"
                            class="transition-transform"
                            :class="open_group === group.label ? 'rotate-180' : ''"
                        />
                    </button>

                    <div
                        v-if="open_group === group.label"
                        :class="[ dropdown_bg, 'absolute top-full left-0 mt-1 min-w-[160px] rounded-lg border shadow-2xl py-1 z-50']"
                    >
                        <button
                            v-for="child in group.children"
                            :key="child.tab"
                            class="w-full text-left px-4 py-2 text-sm transition-colors"
                            :class="current_route.path === '/' + child.tab ? 'text-white bg-white/5' : [text_muted, hover_bg, 'hover:text-[#ededed]']"
                            @click="navigateTo('/' + child.tab); open_group = null"
                        >
                            {{ child.label }}
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Right Controls -->
            <div class="flex items-center gap-2 shrink-0">
                <!-- Live indicator -->
                <div
                    class="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
                    :class="app_store.is_live ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10'"
                >
                    <Wifi v-if="app_store.is_live" :size="10" />
                    <WifiOff v-else :size="10" />
                    {{ app_store.is_live ? "LIVE" : "OFF" }}
                </div>

                <!-- Network -->
                <select
                    :value="app_store.network"
                    class="hidden sm:block text-xs px-2 py-1 rounded-md border cursor-pointer outline-none"
                    :class="[border, bg, text_muted]"
                    @change="handleNetworkChange"
                >
                    <option value="bsv-mainnet">Mainnet</option>
                    <option value="bsv-testnet">Testnet</option>
                </select>

                <!-- Language -->
                <div
                    class="flex rounded-md border border-[#1a1a1a] overflow-hidden"
                >
                    <button
                        v-for="lang in languages"
                        :key="lang"
                        class="px-2 py-1 text-xs transition-colors"
                        :class="app_store.language === lang ? 'bg-white text-black' : [text_muted, hover_bg]"
                        @click="app_store.language = lang"
                    >
                        {{ lang.toUpperCase() }}
                    </button>
                </div>

                <!-- Theme -->
                <button
                    class="p-1.5 rounded-md border transition-colors"
                    :class="[border, hover_bg, text_muted]"
                    @click="app_store.toggleTheme()"
                >
                    <Sun v-if="is_dark" :size="14" />
                    <Moon v-else :size="14" />
                </button>

                <!-- Wallet -->
                <button
                    class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors"
                    :class="wallet_store.wallet_connected ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-white text-black hover:bg-white/90'"
                    @click="wallet_store.openWalletModal()"
                >
                    <Wallet :size="14" />
                    <span class="hidden sm:inline">
                        {{
                            wallet_store.wallet_connected
                                ? formatAddress(wallet_store.wallet_address)
                                : app_store.language === "en"
                                  ? "Connect Wallet"
                                  : "ウォレット接続"
                        }}
                    </span>
                </button>

                <!-- Mobile menu toggle -->
                <button
                    class="md:hidden p-1.5 rounded-md border transition-colors"
                    :class="[border, hover_bg, text_muted]"
                    @click="mobile_menu_open = !mobile_menu_open"
                >
                    <X v-if="mobile_menu_open" :size="16" />
                    <Menu v-else :size="16" />
                </button>
            </div>
        </div>

        <!-- Mobile dropdown -->
        <div
            v-if="mobile_menu_open"
            :class="['md:hidden', bg, 'border-t', border, 'py-2']"
        >
            <button
                class="w-full text-left px-4 py-2.5 text-sm"
                :class="[text_muted, hover_bg]"
                @click="navigateTo('/bridge'); mobile_menu_open = false"
            >
                Bridge
            </button>
            <button
                class="w-full text-left px-4 py-2.5 text-sm"
                :class="[text_muted, hover_bg]"
                @click="navigateTo('/game'); mobile_menu_open = false"
            >
                Game
            </button>
            <div v-for="group in NAV_GROUPS" :key="group.label">
                <div
                    :class="[ 'px-4 py-1.5 text-xs font-semibold uppercase tracking-wider opacity-60', text_muted]"
                >
                    {{ group.label }}
                </div>
                <button
                    v-for="child in group.children"
                    :key="child.tab"
                    class="w-full text-left px-6 py-2 text-sm"
                    :class="[ current_route.path === '/' + child.tab ? 'text-white' : text_muted, hover_bg]"
                    @click="navigateTo('/' + child.tab); mobile_menu_open = false"
                >
                    {{ child.label }}
                </button>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import {
    ArrowLeftRight,
    ChevronDown,
    Gamepad2,
    Layers,
    Menu,
    Moon,
    MoreHorizontal,
    Search,
    Sun,
    TrendingUp,
    Wallet,
    Wifi,
    WifiOff,
    X,
    Zap,
} from "lucide-vue-next"
import { NAV_GROUPS } from "~/constants/nav"
import type { Language, Network } from "~/types/app"

const app_store = useAppStore()
const wallet_store = useWalletStore()
const { is_dark, bg, border, text, text_muted, hover_bg } = useTheme()
const current_route = useRoute()

const open_group = ref<string | null>(null)
const mobile_menu_open = ref(false)
const languages: Language[] = ["en", "ja"]

const dropdown_bg = computed(() => (is_dark.value ? "bg-[#0a0a0a] border-[#1a1a1a]" : "bg-white border-gray-200"))

const current_group_label = computed(
    () => NAV_GROUPS.find((group) => group.children.some((child) => current_route.path === "/" + child.tab))?.label,
)

function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function handleNetworkChange(event: Event) {
    const target = event.target as HTMLSelectElement
    app_store.network = target.value as Network
}
</script>
