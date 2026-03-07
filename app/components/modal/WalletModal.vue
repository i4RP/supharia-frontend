<template>
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
        <div
            :class="[ modal_bg, 'rounded-2xl border', border, 'w-full max-w-md shadow-2xl']"
        >
            <!-- Header -->
            <div
                :class="[ 'flex items-center justify-between p-5 border-b', border]"
            >
                <h2 :class="text">Connect Wallet</h2>
                <button
                    :class="[ text_muted, 'hover:text-gray-100 transition-colors']"
                    @click="wallet_store.closeWalletModal()"
                >
                    <X :size="18" />
                </button>
            </div>

            <!-- Tabs -->
            <div :class="['flex border-b', border]">
                <button
                    v-for="tab in wallet_tabs"
                    :key="tab.id"
                    class="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm transition-colors"
                    :class="active_tab === tab.id ? 'text-white border-b-2 border-white' : text_muted"
                    @click="active_tab = tab.id"
                >
                    <component :is="tab.icon" :size="14" />
                    <span class="hidden sm:inline">{{ tab.label }}</span>
                </button>
            </div>

            <div class="p-5 space-y-4">
                <!-- Extension Tab -->
                <div v-if="active_tab === 'extension'" class="space-y-4">
                    <div
                        :class="[ card_bg, 'rounded-xl p-4 border', border, 'flex items-start gap-3']"
                    >
                        <div
                            class="w-10 h-10 rounded-lg bg-white/8 flex items-center justify-center shrink-0"
                        >
                            <Wallet :size="18" class="text-white" />
                        </div>
                        <div>
                            <p :class="['text-sm', text]">
                                DXS Wallet Extension
                            </p>
                            <p :class="['text-xs mt-1', text_muted]">
                                Connect via browser extension using postMessage
                                protocol
                            </p>
                        </div>
                    </div>
                    <button
                        class="w-full py-3 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors"
                        @click="handleMockConnect()"
                    >
                        Connect Extension
                    </button>
                    <div :class="['text-center text-xs', text_muted]">
                        Don't have the extension?
                        <span class="text-white/60 cursor-pointer"
                            >Download here</span
                        >
                    </div>
                </div>

                <!-- WIF Tab -->
                <div v-if="active_tab === 'wif'" class="space-y-4">
                    <div>
                        <label :class="['text-xs mb-1.5 block', text_muted]"
                            >WIF Private Key</label
                        >
                        <div class="relative">
                            <input
                                :type="show_wif ? 'text' : 'password'"
                                :value="wif_key"
                                :placeholder="'Enter WIF private key...'"
                                :class="[input_cls, 'pr-10']"
                                @input="handleWifInput"
                            />
                            <button
                                :class="[ 'absolute right-3 top-1/2 -translate-y-1/2', text_muted]"
                                @click="show_wif = !show_wif"
                            >
                                <EyeOff v-if="show_wif" :size="14" />
                                <Eye v-else :size="14" />
                            </button>
                        </div>
                    </div>
                    <div
                        :class="[ card_bg, 'rounded-xl p-3 border', border, 'flex items-start gap-2']"
                    >
                        <AlertTriangle
                            :size="14"
                            class="text-amber-400 shrink-0 mt-0.5"
                        />
                        <p :class="['text-xs', text_muted]">
                            Never share your private key. This stays local in
                            your browser.
                        </p>
                    </div>
                    <button
                        class="w-full py-3 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors"
                        @click="handleMockConnect()"
                    >
                        Import WIF Key
                    </button>
                </div>

                <!-- Mnemonic Tab -->
                <div v-if="active_tab === 'mnemonic'" class="space-y-4">
                    <div>
                        <label :class="['text-xs mb-1.5 block', text_muted]"
                            >12-Word Mnemonic Phrase</label
                        >
                        <textarea
                            :value="mnemonic_phrase"
                            placeholder="Enter your 12-word mnemonic phrase..."
                            :rows="3"
                            :class="[input_cls, 'resize-none']"
                            @input="handleMnemonicInput"
                        />
                    </div>
                    <div
                        :class="[ card_bg, 'rounded-xl p-3 border', border, 'flex items-start gap-2']"
                    >
                        <AlertTriangle
                            :size="14"
                            class="text-amber-400 shrink-0 mt-0.5"
                        />
                        <p :class="['text-xs', text_muted]">
                            Your mnemonic is only stored in memory, never
                            transmitted.
                        </p>
                    </div>
                    <button
                        class="w-full py-3 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors"
                        @click="handleMockConnect()"
                    >
                        Import Mnemonic
                    </button>

                    <div :class="['border-t pt-4', border]">
                        <p :class="['text-xs mb-2', text_muted]">
                            Create New Wallet
                        </p>
                        <div
                            :class="[ card_bg, 'rounded-xl p-3 border mb-3', border]"
                        >
                            <p
                                class="text-xs font-mono text-amber-400 break-all"
                            >
                                {{ generated_mnemonic }}
                            </p>
                        </div>
                        <div class="flex items-center gap-2 mb-3">
                            <CheckCircle :size="12" class="text-amber-400" />
                            <p :class="['text-xs', text_muted]">
                                Save these 12 words in a secure location
                            </p>
                        </div>
                        <button
                            :class="[ 'w-full py-2 rounded-xl border text-sm flex items-center justify-center gap-2 hover:bg-[#111] transition-colors', border, text_muted]"
                        >
                            <RefreshCw :size="13" />
                            Generate New Wallet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { AlertTriangle, BookText, CheckCircle, Eye, EyeOff, Key, RefreshCw, Wallet, X } from "lucide-vue-next"
import type { WalletTab } from "~/types/wallet"

const wallet_store = useWalletStore()
const { is_dark, border, text, text_muted, input_cls } = useTheme()

const active_tab = ref<WalletTab>("extension")
const wif_key = ref("")
const mnemonic_phrase = ref("")
const show_wif = ref(false)
const generated_mnemonic = ref("abandon ability able about above absent absorb abstract absurd abuse access")

const modal_bg = computed(() => (is_dark.value ? "bg-[#0a0a0a]" : "bg-white"))
const card_bg = computed(() => (is_dark.value ? "bg-black" : "bg-gray-50"))

const wallet_tabs = [
    { id: "extension" as WalletTab, label: "DXS Extension", icon: Wallet },
    { id: "wif" as WalletTab, label: "WIF Key", icon: Key },
    { id: "mnemonic" as WalletTab, label: "Mnemonic", icon: BookText },
]

function handleWifInput(event: Event) {
    const target = event.target as HTMLInputElement
    wif_key.value = target.value
}

function handleMnemonicInput(event: Event) {
    const target = event.target as HTMLTextAreaElement
    mnemonic_phrase.value = target.value
}

function handleMockConnect() {
    wallet_store.connectWallet("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")
    wallet_store.closeWalletModal()
}
</script>
