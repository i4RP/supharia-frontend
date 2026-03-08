<template>
    <div :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-6">

            <!-- Header -->
            <div>
                <h1 :class="text">STAS Tokens</h1>
                <p :class="`text-sm ${text_muted} mt-1`">All Mainnet-issued STAS tokens ({{ TOKENS_FULL.length }} registered)</p>
            </div>

            <!-- Token Registry -->
            <div class="space-y-3">
                <h2 :class="text">Token Registry</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div
                        v-for="token in TOKENS_FULL"
                        :key="token.symbol"
                        :class="`rounded-2xl border ${border} p-4`"
                    >
                        <div class="flex items-center gap-3 mb-3">
                            <div
                                class="w-10 h-10 rounded-full flex items-center justify-center text-white"
                                :style="{ backgroundColor: token.color, fontSize: '16px', fontWeight: 700 }"
                            >
                                {{ token.symbol[0] }}
                            </div>
                            <div>
                                <p :class="`text-sm ${text}`">{{ token.symbol }}</p>
                                <p :class="`text-xs ${text_muted}`">{{ token.name }}</p>
                            </div>
                            <div v-if="token.freeze" class="ml-auto">
                                <Snowflake :size="14" class="text-blue-400" />
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <div class="flex justify-between">
                                <span :class="`text-xs ${text_muted}`">Token ID</span>
                                <span class="text-xs text-white/50">{{ token.token_id }}</span>
                            </div>
                            <div v-if="token.issue_tx" class="flex justify-between">
                                <span :class="`text-xs ${text_muted}`">Issue TX</span>
                                <a href="#" class="text-xs text-white/50 flex items-center gap-1">
                                    {{ token.issue_tx }} <ExternalLink :size="9" />
                                </a>
                            </div>
                            <div class="flex justify-between">
                                <span :class="`text-xs ${text_muted}`">Satoshis</span>
                                <span :class="`text-xs ${text}`">{{ (token.satoshis || 0).toLocaleString() }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span :class="`text-xs ${text_muted}`">Freeze</span>
                                <span :class="`text-xs ${token.freeze ? 'text-blue-400' : 'text-green-400'}`">
                                    {{ token.freeze ? "Enabled" : "Disabled" }}
                                </span>
                            </div>
                            <div
                                v-if="wallet_connected"
                                class="flex justify-between pt-1 border-t"
                                :style="{ borderColor: is_dark ? '#1a1a1a' : '#e5e7eb' }"
                            >
                                <span :class="`text-xs ${text_muted}`">Balance</span>
                                <span :class="`text-xs ${(token.balance || 0) > 0 ? text : text_muted}`">
                                    {{ token.balance }} {{ token.symbol }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ExternalLink, Snowflake } from "lucide-vue-next"
import { TOKENS_FULL } from "~/constants/tokens"

const { is_dark, bg, border, text, text_muted } = useTheme()
const { wallet_connected } = useWallet()
</script>
