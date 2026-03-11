<template>
    <div class="absolute inset-0 flex flex-col" style="background: #03080F">
        <!-- Header -->
        <div class="px-4 pt-[env(safe-area-inset-top,12px)] pb-3">
            <h1 class="text-lg font-bold tracking-wider" style="color: #1B8DFF">WALLET</h1>
            <p class="text-[11px] font-mono mt-0.5" style="color: rgba(255,255,255,0.35)">Your balances &amp; activity</p>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-4 pb-[80px]">
            <!-- Empty Wallet State -->
            <div v-if="!wm_hasWallets" class="flex flex-col items-center justify-center py-12">
                <div class="text-[11px] font-mono tracking-wider mb-6" style="color: rgba(255,255,255,0.4)">NO WALLETS</div>
                <div class="text-[13px] font-mono text-center mb-8" style="color: rgba(255,255,255,0.5)">Get started by creating a new wallet or using the sample wallet</div>
                <div v-if="empty_wallet_error" class="text-[11px] font-mono text-center mb-6" style="color: #ef4444">{{ empty_wallet_error }}</div>

                <!-- New wallet generation state -->
                <div v-if="new_wallet_generated" class="w-full max-w-[340px] mb-6">
                    <div class="rounded-2xl p-5" style="background: rgba(27,141,255,0.08); border: 1px solid rgba(27,141,255,0.25)">
                        <div class="text-[11px] font-mono tracking-wider mb-2" style="color: rgba(255,255,255,0.4)">NEW WALLET CREATED</div>
                        <div class="text-[11px] font-mono mb-1" style="color: rgba(255,255,255,0.35)">ADDRESS</div>
                        <div class="text-[11px] font-mono truncate mb-3 p-2 rounded-lg" style="background: rgba(0,0,0,0.3); color: #E0EEFF">{{ generated_address }}</div>
                        <div class="text-[11px] font-mono mb-1" style="color: rgba(255,255,255,0.35)">PRIVATE KEY (SAVE THIS!)</div>
                        <div class="text-[11px] font-mono break-all p-2 rounded-lg mb-3" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444">{{ generated_pk }}</div>
                        <div class="text-[10px] font-mono text-center mb-3" style="color: #ef4444">This key will NOT be shown again. Copy it now!</div>
                        <div class="flex gap-2">
                            <button
                                class="flex-1 py-2.5 rounded-xl text-[12px] font-bold font-mono tracking-wider"
                                style="background: rgba(27,141,255,0.1); color: #1B8DFF; border: 1px solid rgba(27,141,255,0.3)"
                                @click="copySpecificAddress(generated_pk)"
                            >COPY KEY</button>
                            <button
                                class="flex-1 py-2.5 rounded-xl text-[12px] font-bold font-mono tracking-wider"
                                style="background: rgba(27,141,255,0.25); color: #1B8DFF; border: 1px solid rgba(27,141,255,0.4)"
                                @click="confirmNewWallet"
                            >ADD WALLET</button>
                        </div>
                    </div>
                </div>

                <!-- Choice buttons -->
                <div v-else class="flex gap-4 w-full max-w-[340px]">
                    <button
                        class="flex-1 rounded-2xl p-5 flex flex-col items-center gap-3 transition-all"
                        style="background: rgba(5,13,26,0.8); border: 1px solid rgba(27,141,255,0.2)"
                        @click="handleCreateNewWallet"
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                        <div class="text-[12px] font-bold font-mono" style="color: #1B8DFF">CREATE NEW</div>
                        <div class="text-[10px] font-mono text-center" style="color: rgba(255,255,255,0.35)">Generate a new wallet with a fresh private key</div>
                    </button>
                    <button
                        class="flex-1 rounded-2xl p-5 flex flex-col items-center gap-3 transition-all"
                        style="background: rgba(5,13,26,0.8); border: 1px solid rgba(27,141,255,0.2)"
                        @click="handleSetSampleWallet"
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M22 10H2" /></svg>
                        <div class="text-[12px] font-bold font-mono" style="color: #1B8DFF">SAMPLE</div>
                        <div class="text-[10px] font-mono text-center" style="color: rgba(255,255,255,0.35)">Use the pre-loaded sample wallet with test funds</div>
                    </button>
                </div>

                <!-- Import existing key link -->
                <button
                    v-if="!new_wallet_generated"
                    class="mt-6 px-6 py-3 text-[12px] font-mono underline"
                    style="color: rgba(255,255,255,0.4)"
                    @click="show_add_wallet = true"
                >or import with private key</button>
            </div>

            <!-- Wallet List Section (only when wallets exist) -->
            <div v-if="wm_hasWallets" class="mb-4">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-[11px] font-mono tracking-wider" style="color: rgba(255,255,255,0.4)">WALLETS</div>
                    <button
                        class="px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider"
                        style="background: rgba(27,141,255,0.15); color: #1B8DFF; border: 1px solid rgba(27,141,255,0.3)"
                        @click="show_add_wallet = true"
                    >
                        + ADD
                    </button>
                </div>
                <div class="flex flex-col gap-2">
                    <div
                        v-for="(w, idx) in wm_wallets"
                        :key="w.address"
                        class="rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all"
                        :style="idx === wm_activeIndex
                            ? 'background: rgba(27,141,255,0.1); border: 1px solid rgba(27,141,255,0.35)'
                            : 'background: rgba(5,13,26,0.6); border: 1px solid rgba(27,141,255,0.1)'"
                        @click="handleSwitchWallet(idx)"
                    >
                        <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                            <img src="/megaeth-logo.jpg" alt="MegaETH" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <span class="text-[11px] font-bold font-mono" style="color: #E0EEFF">{{ w.label }}</span>
                                <span v-if="idx === wm_activeIndex" class="text-[8px] font-mono px-1.5 py-0.5 rounded" style="background: rgba(27,141,255,0.2); color: #1B8DFF">ACTIVE</span>
                            </div>
                            <div class="text-[11px] font-mono truncate mt-0.5" style="color: rgba(255,255,255,0.4)">{{ w.address }}</div>
                        </div>
                        <div class="flex items-center gap-1 flex-shrink-0">
                            <button
                                class="p-1.5 rounded-lg"
                                style="background: rgba(27,141,255,0.1)"
                                @click.stop="copySpecificAddress(w.address)"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                            </button>
                            <button
                                class="p-1.5 rounded-lg"
                                style="background: rgba(239,68,68,0.1)"
                                @click.stop="confirmRemoveWallet(idx)"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Total Balance Card (only when wallets exist) -->
            <template v-if="wm_hasWallets">
            <div
                class="rounded-2xl p-5 mb-4"
                style="background: rgba(27,141,255,0.08); border: 1px solid rgba(27,141,255,0.25)"
            >
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-[11px] font-mono tracking-wider" style="color: rgba(255,255,255,0.4)">GAME SCORE</span>
                    <a
                        href="https://megaeth-testnet-v2.blockscout.com/address/0xad15059611a74dc7b66451675e5787db9f6ff282"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-[10px] font-mono tracking-wider underline"
                        style="color: #1B8DFF"
                    >ONCHAIN</a>
                </div>
                <div class="flex items-center justify-between">
                    <div class="text-3xl font-bold font-mono" style="color: #1B8DFF">${{ game_store.balance.toFixed(2) }}</div>
                    <button class="flex items-center justify-center" style="color: #1B8DFF" @click="handlePlusButton">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                    </button>
                </div>
                <div class="text-[11px] font-mono mt-1" style="color: rgba(255,255,255,0.3)">{{ (game_store.total_pnl / 100).toFixed(2) }} P&amp;L</div>
            </div>

            <!-- Balance Breakdown -->
            <div class="flex gap-3 mb-6">
                <!-- Game Balance -->
                <div
                    class="flex-1 rounded-xl p-4"
                    style="background: rgba(5,13,26,0.8); border: 1px solid rgba(27,141,255,0.15)"
                >
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-[14px] h-[14px] rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                            <img src="/megaeth-logo.jpg" alt="MegaETH" class="w-full h-full object-cover" />
                        </div>
                        <span class="text-[10px] font-mono tracking-wider" style="color: rgba(255,255,255,0.4)">MegaETH <a href="https://megaeth-testnet-v2.blockscout.com/address/0x48345110dB117682E5a4EBdD99919Aff5b872D43" target="_blank" rel="noopener noreferrer" class="underline" style="color: #1B8DFF">rUSD</a></span>
                    </div>
                    <div class="text-lg font-bold font-mono" style="color: #E0EEFF">${{ rusd_display }}</div>
                </div>

                <!-- On-Chain ETH Balance -->
                <div
                    class="flex-1 rounded-xl p-4"
                    style="background: rgba(5,13,26,0.8); border: 1px solid rgba(27,141,255,0.15)"
                >
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-[14px] h-[14px] rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                            <img src="/megaeth-logo.jpg" alt="MegaETH" class="w-full h-full object-cover" />
                        </div>
                        <span class="text-[10px] font-mono tracking-wider" style="color: rgba(255,255,255,0.4)">MegaETH ETH</span>
                    </div>
                    <div class="text-lg font-bold font-mono" style="color: #E0EEFF">{{ eth_display }} ETH</div>
                </div>
            </div>

            <!-- Withdraw Section -->
            <div class="mb-6">
                <div class="text-[11px] font-mono tracking-wider mb-3" style="color: rgba(255,255,255,0.4)">WITHDRAW ETH</div>
                <div
                    class="rounded-xl p-4"
                    style="background: rgba(5,13,26,0.8); border: 1px solid rgba(27,141,255,0.15)"
                >
                    <!-- Network badge -->
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                            <img src="/megaeth-logo.jpg" alt="MegaETH" class="w-full h-full object-cover" />
                        </div>
                        <span class="text-[11px] font-mono" style="color: rgba(255,255,255,0.5)">MegaETH Testnet</span>
                        <span class="text-[9px] font-mono px-1.5 py-0.5 rounded" style="background: rgba(27,141,255,0.15); color: #1B8DFF">Ether</span>
                    </div>

                    <!-- Destination address input -->
                    <div class="mb-3">
                        <label class="text-[10px] font-mono tracking-wider block mb-1.5" style="color: rgba(255,255,255,0.35)">DESTINATION ADDRESS</label>
                        <input
                            v-model="withdraw_to"
                            type="text"
                            placeholder="0x..."
                            class="w-full rounded-lg px-3 py-2.5 text-[13px] font-mono outline-none"
                            style="background: rgba(0,0,0,0.3); border: 1px solid rgba(27,141,255,0.2); color: #E0EEFF"
                            :disabled="withdraw_loading"
                        />
                    </div>

                    <!-- Amount input -->
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-1.5">
                            <label class="text-[10px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">AMOUNT (ETH)</label>
                            <button
                                class="text-[10px] font-mono"
                                style="color: #1B8DFF"
                                @click="setMaxAmount"
                            >
                                MAX
                            </button>
                        </div>
                        <input
                            v-model="withdraw_amount"
                            type="text"
                            inputmode="decimal"
                            placeholder="0.0"
                            class="w-full rounded-lg px-3 py-2.5 text-[13px] font-mono outline-none"
                            style="background: rgba(0,0,0,0.3); border: 1px solid rgba(27,141,255,0.2); color: #E0EEFF"
                            :disabled="withdraw_loading"
                        />
                        <div class="text-[10px] font-mono mt-1" style="color: rgba(255,255,255,0.25)">
                            Available: {{ eth_display }} ETH on MegaETH
                        </div>
                    </div>

                    <!-- Withdraw button -->
                    <button
                        class="w-full py-3 rounded-xl text-[13px] font-bold font-mono tracking-wider transition-all"
                        :style="withdraw_button_style"
                        :disabled="!can_withdraw || withdraw_loading"
                        @click="handleWithdraw"
                    >
                        <span v-if="withdraw_loading" class="flex items-center justify-center gap-2">
                            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" /></svg>
                            PROCESSING...
                        </span>
                        <span v-else>WITHDRAW ETH</span>
                    </button>

                    <!-- Status message -->
                    <div v-if="withdraw_status" class="mt-3 text-[11px] font-mono text-center" :style="{ color: withdraw_status_color }">
                        {{ withdraw_status }}
                    </div>
                    <a
                        v-if="withdraw_tx"
                        :href="`https://megaeth-testnet-v2.blockscout.com/tx/${withdraw_tx}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="mt-1 block text-[10px] font-mono text-center truncate underline"
                        style="color: #1B8DFF"
                    >
                        TX: {{ withdraw_tx }}
                    </a>
                </div>
            </div>

            <!-- Withdraw rUSD Section -->
            <div class="mb-6">
                <div class="text-[11px] font-mono tracking-wider mb-3" style="color: rgba(255,255,255,0.4)">WITHDRAW rUSD</div>
                <div
                    class="rounded-xl p-4"
                    style="background: rgba(5,13,26,0.8); border: 1px solid rgba(27,141,255,0.15)"
                >
                    <!-- Network badge -->
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                            <img src="/megaeth-logo.jpg" alt="MegaETH" class="w-full h-full object-cover" />
                        </div>
                        <span class="text-[11px] font-mono" style="color: rgba(255,255,255,0.5)">MegaETH Testnet</span>
                        <a
                            href="https://megaeth-testnet-v2.blockscout.com/address/0x48345110dB117682E5a4EBdD99919Aff5b872D43"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-[9px] font-mono px-1.5 py-0.5 rounded underline"
                            style="background: rgba(27,141,255,0.15); color: #1B8DFF"
                        >rUSD</a>
                    </div>

                    <!-- Destination address input -->
                    <div class="mb-3">
                        <label class="text-[10px] font-mono tracking-wider block mb-1.5" style="color: rgba(255,255,255,0.35)">DESTINATION ADDRESS</label>
                        <input
                            v-model="rusd_withdraw_to"
                            type="text"
                            placeholder="0x..."
                            class="w-full rounded-lg px-3 py-2.5 text-[13px] font-mono outline-none"
                            style="background: rgba(0,0,0,0.3); border: 1px solid rgba(27,141,255,0.2); color: #E0EEFF"
                            :disabled="rusd_withdraw_loading"
                        />
                    </div>

                    <!-- Amount input -->
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-1.5">
                            <label class="text-[10px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">AMOUNT (rUSD)</label>
                            <button
                                class="text-[10px] font-mono"
                                style="color: #1B8DFF"
                                @click="setMaxRusdAmount"
                            >
                                MAX
                            </button>
                        </div>
                        <input
                            v-model="rusd_withdraw_amount"
                            type="text"
                            inputmode="decimal"
                            placeholder="0.0"
                            class="w-full rounded-lg px-3 py-2.5 text-[13px] font-mono outline-none"
                            style="background: rgba(0,0,0,0.3); border: 1px solid rgba(27,141,255,0.2); color: #E0EEFF"
                            :disabled="rusd_withdraw_loading"
                        />
                        <div class="text-[10px] font-mono mt-1" style="color: rgba(255,255,255,0.25)">
                            Available: {{ rusd_display }} rUSD on MegaETH
                        </div>
                    </div>

                    <!-- Withdraw button -->
                    <button
                        class="w-full py-3 rounded-xl text-[13px] font-bold font-mono tracking-wider transition-all"
                        :style="rusd_withdraw_button_style"
                        :disabled="!can_withdraw_rusd || rusd_withdraw_loading"
                        @click="handleWithdrawRusd"
                    >
                        <span v-if="rusd_withdraw_loading" class="flex items-center justify-center gap-2">
                            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" /></svg>
                            PROCESSING...
                        </span>
                        <span v-else>WITHDRAW rUSD</span>
                    </button>

                    <!-- Status message -->
                    <div v-if="rusd_withdraw_status" class="mt-3 text-[11px] font-mono text-center" :style="{ color: rusd_withdraw_status_color }">
                        {{ rusd_withdraw_status }}
                    </div>
                    <a
                        v-if="rusd_withdraw_tx"
                        :href="`https://megaeth-testnet-v2.blockscout.com/tx/${rusd_withdraw_tx}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="mt-1 block text-[10px] font-mono text-center truncate underline"
                        style="color: #1B8DFF"
                    >
                        TX: {{ rusd_withdraw_tx }}
                    </a>
                </div>
            </div>

            <!-- Stats -->
            <div class="mb-6">
                <div class="text-[11px] font-mono tracking-wider mb-3" style="color: rgba(255,255,255,0.4)">STATS</div>
                <div
                    v-for="stat in stats"
                    :key="stat.label"
                    class="flex items-center justify-between py-2.5 border-b"
                    style="border-color: rgba(27,141,255,0.1)"
                >
                    <span class="text-xs font-mono" style="color: rgba(255,255,255,0.5)">{{ stat.label }}</span>
                    <span class="text-xs font-bold font-mono" :style="{ color: stat.color || '#E0EEFF' }">{{ stat.value }}</span>
                </div>
            </div>

            <!-- Monster Box Section -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <div class="text-[11px] font-mono tracking-wider" style="color: rgba(255,255,255,0.4)">MONSTER BOX</div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-mono" style="color: #a855f7">&#x1F48E; {{ monster_store.magic_stones }}</span>
                        <span class="text-[10px] font-mono" style="color: #eab308">&#x1F95A; {{ monster_store.unrevealed_eggs.length }}</span>
                    </div>
                </div>

                <!-- Active Monster Card -->
                <div
                    v-if="wallet_active_monster"
                    class="rounded-xl p-4 mb-3 cursor-pointer"
                    style="background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.2)"
                    @click="show_wallet_monster_box = true"
                >
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3)">
                            {{ wallet_active_template?.icon_emoji }}
                        </div>
                        <div class="flex-1">
                            <div class="text-white font-bold font-mono text-sm">{{ wallet_active_template?.name }}</div>
                            <div class="flex items-center gap-2 mt-0.5">
                                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded" style="background: rgba(0,212,255,0.15); color: #00D4FF">Lv.{{ wallet_active_monster.level }}</span>
                                <span class="text-[10px] font-mono" style="color: rgba(255,255,255,0.35)">${{ monster_store.selected_tier }} tier</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] font-mono" style="color: rgba(255,255,255,0.35)">BOX MULT</div>
                            <div class="text-sm font-bold font-mono" style="color: #00D4FF">x{{ monster_store.box_multiplier.toFixed(2) }}</div>
                        </div>
                    </div>

                    <!-- Mini Stats -->
                    <div class="grid grid-cols-3 gap-2 mt-3">
                        <div class="rounded-lg p-1.5 text-center" style="background: rgba(0,0,0,0.3)">
                            <div class="text-[7px] font-mono" style="color: rgba(255,255,255,0.3)">PWR</div>
                            <div class="text-[10px] font-bold font-mono" style="color: #ef4444">{{ wallet_active_monster.stats.power }}</div>
                        </div>
                        <div class="rounded-lg p-1.5 text-center" style="background: rgba(0,0,0,0.3)">
                            <div class="text-[7px] font-mono" style="color: rgba(255,255,255,0.3)">RCV</div>
                            <div class="text-[10px] font-bold font-mono" style="color: #22c55e">{{ wallet_active_monster.stats.recovery }}</div>
                        </div>
                        <div class="rounded-lg p-1.5 text-center" style="background: rgba(0,0,0,0.3)">
                            <div class="text-[7px] font-mono" style="color: rgba(255,255,255,0.3)">LCK</div>
                            <div class="text-[10px] font-bold font-mono" style="color: #eab308">{{ wallet_active_monster.stats.luck }}</div>
                        </div>
                    </div>
                </div>

                <!-- Open Monster Box Button -->
                <button
                    class="w-full py-3 rounded-xl font-bold font-mono text-sm tracking-wider"
                    style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.25); color: #00D4FF"
                    @click="show_wallet_monster_box = true"
                >
                    OPEN MONSTER BOX
                </button>
            </div>

            <!-- Recent Activity (Placeholder) -->
            <div>
                <div class="text-[11px] font-mono tracking-wider mb-3" style="color: rgba(255,255,255,0.4)">RECENT ACTIVITY</div>
                <div class="text-center py-8">
                    <svg class="mx-auto mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(27,141,255,0.3)" stroke-width="1.5">
                        <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
                    </svg>
                    <p class="text-[11px] font-mono" style="color: rgba(255,255,255,0.25)">No recent activity</p>
                </div>
            </div>
            </template>
        </div>

        <!-- Purchase GAME SCORE Modal -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="show_purchase_modal" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="closePurchaseModal">
                    <!-- Backdrop -->
                    <div class="absolute inset-0" style="background: rgba(0,0,0,0.75); backdrop-filter: blur(8px)" />

                    <!-- Modal Card -->
                    <div class="relative w-[calc(100%-32px)] max-w-[340px] rounded-2xl p-5 sm:p-6" style="background: linear-gradient(145deg, #2a1020, #03080F); border: 1px solid rgba(27,141,255,0.3); box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(27,141,255,0.08)">
                        <!-- Close button -->
                        <button class="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full" style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4)" @click="closePurchaseModal">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>

                        <!-- Title -->
                        <div class="mb-5">
                            <div class="text-[11px] font-mono tracking-wider mb-1" style="color: rgba(255,255,255,0.4)">ADD TO</div>
                            <div class="text-xl font-bold font-mono" style="color: #1B8DFF">GAME SCORE</div>
                        </div>

                        <!-- Amount display -->
                        <div class="text-center rounded-xl py-4 mb-5" style="background: rgba(27,141,255,0.06); border: 1px solid rgba(27,141,255,0.15)">
                            <div class="text-3xl font-bold font-mono" style="color: #1B8DFF">+$100</div>
                            <div class="text-[10px] font-mono mt-1" style="color: rgba(255,255,255,0.3)">GAME CREDITS</div>
                        </div>

                        <!-- Payment options -->
                        <div class="text-[10px] font-mono tracking-wider mb-2" style="color: rgba(255,255,255,0.35)">PAY WITH</div>
                        <div class="flex flex-col gap-2.5">
                            <!-- rUSD option -->
                            <button
                                class="w-full rounded-xl p-3.5 flex items-center gap-3 transition-all"
                                :style="purchase_loading ? 'background: rgba(5,13,26,0.6); border: 1px solid rgba(27,141,255,0.1); cursor: wait; opacity: 0.5' : 'background: rgba(5,13,26,0.8); border: 1px solid rgba(27,141,255,0.2); cursor: pointer'"
                                :disabled="purchase_loading"
                                @click="purchaseWithRusd"
                            >
                                <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style="background: rgba(27,141,255,0.1); border: 1px solid rgba(27,141,255,0.2)">
                                    <span class="text-[13px] font-bold font-mono" style="color: #1B8DFF">$</span>
                                </div>
                                <div class="flex-1 text-left">
                                    <div class="text-[13px] font-bold font-mono" style="color: #E0EEFF">5 rUSD</div>
                                    <div class="text-[10px] font-mono" style="color: rgba(255,255,255,0.3)">Balance: {{ rusd_display }} rUSD</div>
                                </div>
                                <div v-if="purchase_loading && purchase_method === 'rusd'" class="flex-shrink-0">
                                    <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="2"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" /></svg>
                                </div>
                                <div v-else class="flex-shrink-0">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                </div>
                            </button>

                            <!-- ETH option -->
                            <button
                                class="w-full rounded-xl p-3.5 flex items-center gap-3 transition-all"
                                :style="purchase_loading ? 'background: rgba(5,13,26,0.6); border: 1px solid rgba(27,141,255,0.1); cursor: wait; opacity: 0.5' : 'background: rgba(5,13,26,0.8); border: 1px solid rgba(27,141,255,0.2); cursor: pointer'"
                                :disabled="purchase_loading"
                                @click="purchaseWithEth"
                            >
                                <div class="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                                    <img src="/megaeth-logo.jpg" alt="ETH" class="w-full h-full object-cover" />
                                </div>
                                <div class="flex-1 text-left">
                                    <div class="text-[13px] font-bold font-mono" style="color: #E0EEFF">0.0001 ETH</div>
                                    <div class="text-[10px] font-mono" style="color: rgba(255,255,255,0.3)">Balance: {{ eth_display }} ETH</div>
                                </div>
                                <div v-if="purchase_loading && purchase_method === 'eth'" class="flex-shrink-0">
                                    <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="2"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" /></svg>
                                </div>
                                <div v-else class="flex-shrink-0">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                </div>
                            </button>
                        </div>

                        <!-- Status -->
                        <div v-if="purchase_status" class="mt-4 text-center">
                            <div class="text-[11px] font-mono" :style="{ color: purchase_status_color }">{{ purchase_status }}</div>
                            <a
                                v-if="purchase_tx"
                                :href="`https://megaeth-testnet-v2.blockscout.com/tx/${purchase_tx}`"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="mt-1 block text-[9px] font-mono truncate underline"
                                style="color: #1B8DFF"
                            >TX: {{ purchase_tx }}</a>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Delete Wallet Confirmation Modal -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="show_delete_confirm" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="cancelRemoveWallet">
                    <div class="absolute inset-0" style="background: rgba(0,0,0,0.75); backdrop-filter: blur(8px)" />
                    <div class="relative w-[calc(100%-32px)] max-w-[300px] rounded-2xl p-5" style="background: linear-gradient(145deg, #2a1020, #03080F); border: 1px solid rgba(239,68,68,0.3); box-shadow: 0 25px 60px rgba(0,0,0,0.5)">
                        <div class="text-center mb-4">
                            <div class="text-[11px] font-mono tracking-wider mb-2" style="color: rgba(255,255,255,0.4)">CONFIRM</div>
                            <div class="text-[15px] font-bold font-mono" style="color: #ef4444">DELETE WALLET</div>
                        </div>
                        <div class="text-[12px] font-mono text-center mb-5" style="color: rgba(255,255,255,0.6)">
                            Remove <span style="color: #1B8DFF">{{ delete_target_label }}</span> ?
                        </div>
                        <div class="flex gap-3">
                            <button
                                class="flex-1 py-2.5 rounded-xl text-[12px] font-bold font-mono tracking-wider"
                                style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1)"
                                @click="cancelRemoveWallet"
                            >CANCEL</button>
                            <button
                                class="flex-1 py-2.5 rounded-xl text-[12px] font-bold font-mono tracking-wider"
                                style="background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.4)"
                                @click="handleRemoveWallet"
                            >DELETE</button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Add Wallet Modal -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="show_add_wallet" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="show_add_wallet = false">
                    <div class="absolute inset-0" style="background: rgba(0,0,0,0.75); backdrop-filter: blur(8px)" />
                    <div class="relative w-[calc(100%-32px)] max-w-[340px] rounded-2xl p-5 sm:p-6" style="background: linear-gradient(145deg, #2a1020, #03080F); border: 1px solid rgba(27,141,255,0.3); box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(27,141,255,0.08)">
                        <button class="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full" style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4)" @click="show_add_wallet = false">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>

                        <div class="mb-5">
                            <div class="text-[11px] font-mono tracking-wider mb-1" style="color: rgba(255,255,255,0.4)">IMPORT</div>
                            <div class="text-xl font-bold font-mono" style="color: #1B8DFF">ADD WALLET</div>
                        </div>

                        <div class="mb-3">
                            <label class="text-[10px] font-mono tracking-wider block mb-1.5" style="color: rgba(255,255,255,0.35)">LABEL (OPTIONAL)</label>
                            <input
                                v-model="new_wallet_label"
                                type="text"
                                placeholder="My Wallet"
                                class="w-full rounded-lg px-3 py-2.5 text-[13px] font-mono outline-none"
                                style="background: rgba(0,0,0,0.3); border: 1px solid rgba(27,141,255,0.2); color: #E0EEFF"
                            />
                        </div>

                        <div class="mb-4">
                            <label class="text-[10px] font-mono tracking-wider block mb-1.5" style="color: rgba(255,255,255,0.35)">PRIVATE KEY</label>
                            <input
                                v-model="new_wallet_pk"
                                type="password"
                                placeholder="0x..."
                                class="w-full rounded-lg px-3 py-2.5 text-[13px] font-mono outline-none"
                                style="background: rgba(0,0,0,0.3); border: 1px solid rgba(27,141,255,0.2); color: #E0EEFF"
                            />
                        </div>

                        <button
                            class="w-full py-3 rounded-xl text-[13px] font-bold font-mono tracking-wider transition-all"
                            :style="new_wallet_pk.trim().length > 0
                                ? 'background: rgba(27,141,255,0.25); color: #1B8DFF; border: 1px solid rgba(27,141,255,0.4); cursor: pointer'
                                : 'background: rgba(27,141,255,0.1); color: rgba(27,141,255,0.3); cursor: not-allowed'"
                            :disabled="new_wallet_pk.trim().length === 0 || add_wallet_loading"
                            @click="handleAddWallet"
                        >
                            <span v-if="add_wallet_loading" class="flex items-center justify-center gap-2">
                                <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" /></svg>
                                IMPORTING...
                            </span>
                            <span v-else>IMPORT WALLET</span>
                        </button>

                        <div v-if="add_wallet_error" class="mt-3 text-[11px] font-mono text-center" style="color: #ef4444">
                            {{ add_wallet_error }}
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Monster Box Modal (Wallet) -->
        <Teleport to="body">
            <div
                v-if="show_wallet_monster_box"
                class="fixed inset-0 z-[100] flex items-end justify-center"
                @click.self="show_wallet_monster_box = false"
            >
                <div class="absolute inset-0 bg-black/60" @click="show_wallet_monster_box = false" />
                <div
                    class="relative w-full max-w-[420px] rounded-t-2xl overflow-y-auto"
                    style="background: #0A1628; border: 1px solid rgba(0,212,255,0.2); border-bottom: none; max-height: 80vh"
                >
                    <!-- Header -->
                    <div class="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style="background: #0A1628; border-bottom: 1px solid rgba(0,212,255,0.15)">
                        <div class="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18" /><circle cx="12" cy="7.5" r="1.5" fill="#00D4FF" /></svg>
                            <span class="text-sm font-bold font-mono" style="color: #00D4FF">MONSTER BOX</span>
                        </div>
                        <button class="p-1" @click="show_wallet_monster_box = false">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>

                    <!-- Tier Tabs -->
                    <div class="flex px-4 pt-3 gap-2">
                        <button
                            v-for="tier in mb_tiers"
                            :key="tier"
                            class="flex-1 py-2 rounded-lg text-center font-mono font-bold text-sm transition-all"
                            :style="monster_store.selected_tier === tier
                                ? 'background: rgba(0,212,255,0.2); border: 1px solid rgba(0,212,255,0.5); color: #00D4FF'
                                : 'background: rgba(5,13,26,0.8); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4)'"
                            @click="monster_store.selectTier(tier)"
                        >
                            ${{ tier }}
                        </button>
                    </div>

                    <!-- Monster Card -->
                    <div class="px-4 py-3">
                        <div
                            v-if="mb_tier_monster"
                            class="rounded-xl p-4"
                            style="background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.2)"
                        >
                            <div class="flex items-center gap-3 mb-3">
                                <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl" style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3)">
                                    {{ mb_tier_template?.icon_emoji }}
                                </div>
                                <div class="flex-1">
                                    <div class="text-white font-bold font-mono">{{ mb_tier_template?.name }}</div>
                                    <div class="flex items-center gap-2 mt-1">
                                        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded" style="background: rgba(0,212,255,0.15); color: #00D4FF">Lv.{{ mb_tier_monster.level }}</span>
                                        <span class="text-[10px] font-mono" style="color: rgba(255,255,255,0.35)">${{ monster_store.selected_tier }} tier</span>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-[10px] font-mono" style="color: rgba(255,255,255,0.35)">BOX MULT</div>
                                    <div class="text-lg font-bold font-mono" style="color: #00D4FF">x{{ monster_store.box_multiplier.toFixed(2) }}</div>
                                </div>
                            </div>

                            <!-- Stats -->
                            <div class="grid grid-cols-3 gap-2 mb-3">
                                <div class="rounded-lg p-2.5 text-center" style="background: rgba(0,0,0,0.3)">
                                    <div class="text-[8px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">POWER</div>
                                    <div class="text-sm font-bold font-mono" style="color: #ef4444">{{ mb_tier_monster.stats.power }}</div>
                                    <div class="text-[7px] font-mono" style="color: rgba(255,255,255,0.2)">/ 9999</div>
                                </div>
                                <div class="rounded-lg p-2.5 text-center" style="background: rgba(0,0,0,0.3)">
                                    <div class="text-[8px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">RECOVERY</div>
                                    <div class="text-sm font-bold font-mono" style="color: #22c55e">{{ mb_tier_monster.stats.recovery }}</div>
                                    <div class="text-[7px] font-mono" style="color: rgba(255,255,255,0.2)">/ 9999</div>
                                </div>
                                <div class="rounded-lg p-2.5 text-center" style="background: rgba(0,0,0,0.3)">
                                    <div class="text-[8px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">LUCK</div>
                                    <div class="text-sm font-bold font-mono" style="color: #eab308">{{ mb_tier_monster.stats.luck }}</div>
                                    <div class="text-[7px] font-mono" style="color: rgba(255,255,255,0.2)">/ 9999</div>
                                </div>
                            </div>

                            <!-- Skills -->
                            <div class="flex gap-2 mb-3">
                                <div class="flex-1 rounded-lg p-2.5" style="background: rgba(0,0,0,0.3)">
                                    <div class="text-[8px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">SKILL</div>
                                    <div class="text-[11px] font-mono mt-0.5" style="color: #E0EEFF">{{ mb_tier_template?.skill.name }}</div>
                                    <div class="text-[9px] font-mono" style="color: rgba(255,255,255,0.3)">{{ mb_tier_template?.skill.description }}</div>
                                </div>
                                <div class="flex-1 rounded-lg p-2.5" style="background: rgba(0,0,0,0.3)">
                                    <div class="text-[8px] font-mono tracking-wider" style="color: rgba(255,255,255,0.35)">LEADER SKILL</div>
                                    <div class="text-[11px] font-mono mt-0.5" style="color: #E0EEFF">{{ mb_tier_template?.leader_skill.name }}</div>
                                    <div class="text-[9px] font-mono" style="color: rgba(255,255,255,0.3)">{{ mb_tier_template?.leader_skill.description }}</div>
                                </div>
                            </div>

                            <!-- Level Progress Bar -->
                            <div class="rounded-lg p-2.5" style="background: rgba(0,0,0,0.3)">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-[8px] font-mono" style="color: rgba(255,255,255,0.35)">LEVEL PROGRESS</span>
                                    <span class="text-[9px] font-mono" style="color: #00D4FF">{{ mb_tier_monster.level }} / 99</span>
                                </div>
                                <div class="w-full h-2 rounded-full overflow-hidden" style="background: rgba(0,212,255,0.1)">
                                    <div
                                        class="h-full rounded-full"
                                        :style="{ width: (mb_tier_monster.level / 99 * 100) + '%', background: 'linear-gradient(90deg, #00D4FF, #1B8DFF)' }"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Magic Stones + Eggs + Gacha -->
                    <div class="px-4 pb-3">
                        <div class="flex gap-3 mb-3">
                            <div class="flex-1 rounded-lg p-2.5 flex items-center gap-2" style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.25)">
                                <span class="text-lg">&#x1F48E;</span>
                                <div>
                                    <div class="text-[8px] font-mono" style="color: rgba(255,255,255,0.35)">MAGIC STONES</div>
                                    <div class="text-sm font-bold font-mono" style="color: #a855f7">{{ monster_store.magic_stones }}</div>
                                </div>
                            </div>
                            <div class="flex-1 rounded-lg p-2.5 flex items-center gap-2" style="background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.25)">
                                <span class="text-lg">&#x1F95A;</span>
                                <div>
                                    <div class="text-[8px] font-mono" style="color: rgba(255,255,255,0.35)">EGGS</div>
                                    <div class="text-sm font-bold font-mono" style="color: #eab308">{{ monster_store.unrevealed_eggs.length }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Gacha Button -->
                        <button
                            class="w-full py-3 rounded-xl font-bold font-mono text-sm tracking-wider mb-2"
                            :style="monster_store.magic_stones >= 5
                                ? 'background: linear-gradient(135deg, rgba(168,85,247,0.3), rgba(139,92,246,0.3)); border: 1px solid rgba(168,85,247,0.4); color: #a855f7'
                                : 'background: rgba(168,85,247,0.05); border: 1px solid rgba(168,85,247,0.15); color: rgba(168,85,247,0.3); cursor: not-allowed'"
                            :disabled="monster_store.magic_stones < 5"
                            @click="handleGacha"
                        >
                            GACHA PULL (5 &#x1F48E;)
                        </button>
                    </div>

                    <!-- Close Button -->
                    <div class="px-4 pb-4">
                        <button
                            class="w-full py-3 rounded-xl font-bold font-mono text-sm tracking-wider"
                            style="background: linear-gradient(135deg, rgba(0,212,255,0.3), rgba(27,141,255,0.3)); border: 1px solid rgba(0,212,255,0.4); color: #00D4FF"
                            @click="show_wallet_monster_box = false"
                        >
                            CLOSE
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { resetWalletClient } from "~/composables/useOnChain"
import type { MonsterElement } from "~/types/monster"
import { getMonsterTemplate } from "~/constants/monsters"

const game_store = useGameStoreC()
const monster_store = useMonsterStore()
const {
    getAddress,
    fetchEthBalance,
    withdrawEth,
    fetchRusdBalance,
    withdrawRusd,
    purchaseCreditsWithRusd,
    purchaseCreditsWithEth,
} = useOnChain()
const { restoreBalance } = useBatchSettlement()
const {
    wallets: wm_wallets,
    activeIndex: wm_activeIndex,
    activeWallet: wm_activeWallet,
    hasWallets: wm_hasWallets,
    addWallet: wm_addWallet,
    removeWallet: wm_removeWallet,
    switchWallet: wm_switchWallet,
    createNewWallet: wm_createNewWallet,
    setSampleWallet: wm_setSampleWallet,
} = useWalletManager()

// Wallet address
const wallet_address = ref("")
const copy_label = ref("COPY")

// Add wallet modal state
const show_add_wallet = ref(false)
const new_wallet_pk = ref("")
const new_wallet_label = ref("")
const add_wallet_error = ref("")
const add_wallet_loading = ref(false)

// Empty state (create new / sample)
const new_wallet_generated = ref(false)
const generated_pk = ref("")
const generated_address = ref("")
const empty_wallet_error = ref("")

// Monster Box modal state
const show_wallet_monster_box = ref(false)
const mb_tiers: MonsterElement[] = [20, 5, 1]

const mb_tier_monster = computed(() => {
    const tid = monster_store.equipped[monster_store.selected_tier]
    if (!tid) return null
    return monster_store.monsters.find(m => m.template_id === tid) ?? null
})

const mb_tier_template = computed(() => {
    if (!mb_tier_monster.value) return null
    return getMonsterTemplate(mb_tier_monster.value.template_id) ?? null
})

// Wallet page active monster display
const wallet_active_monster = computed(() => monster_store.active_monster)
const wallet_active_template = computed(() => monster_store.active_template)

function handleGacha() {
    const egg_id = monster_store.pullGacha()
    if (egg_id) {
        // Auto-reveal for now
        monster_store.revealEgg(egg_id)
    }
}

// Delete confirmation
const show_delete_confirm = ref(false)
const delete_target_idx = ref(-1)
const delete_target_label = ref("")

// ETH balance
const eth_balance = ref("0")
const eth_display = computed(() => {
    const val = parseFloat(eth_balance.value)
    if (isNaN(val)) return "0.0000"
    return val.toFixed(4)
})

// Withdraw ETH state
const withdraw_to = ref("")
const withdraw_amount = ref("")
const withdraw_loading = ref(false)
const withdraw_status = ref("")
const withdraw_status_color = ref("#22c55e")
const withdraw_tx = ref("")

// rUSD balance
const rusd_balance = ref(0)
const rusd_display = computed(() => rusd_balance.value.toFixed(2))

// Withdraw rUSD state
const rusd_withdraw_to = ref("")
const rusd_withdraw_amount = ref("")
const rusd_withdraw_loading = ref(false)
const rusd_withdraw_status = ref("")
const rusd_withdraw_status_color = ref("#22c55e")
const rusd_withdraw_tx = ref("")

const can_withdraw = computed(() => {
    if (!withdraw_to.value || !withdraw_amount.value) return false
    if (!withdraw_to.value.startsWith("0x") || withdraw_to.value.length !== 42) return false
    const amt = parseFloat(withdraw_amount.value)
    if (isNaN(amt) || amt <= 0) return false
    if (amt > parseFloat(eth_balance.value)) return false
    return true
})

const withdraw_button_style = computed(() => {
    if (withdraw_loading.value) {
        return "background: rgba(27,141,255,0.2); color: rgba(27,141,255,0.6); cursor: wait"
    }
    if (!can_withdraw.value) {
        return "background: rgba(27,141,255,0.1); color: rgba(27,141,255,0.3); cursor: not-allowed"
    }
    return "background: rgba(27,141,255,0.25); color: #1B8DFF; border: 1px solid rgba(27,141,255,0.4); cursor: pointer"
})

const can_withdraw_rusd = computed(() => {
    if (!rusd_withdraw_to.value || !rusd_withdraw_amount.value) return false
    if (!rusd_withdraw_to.value.startsWith("0x") || rusd_withdraw_to.value.length !== 42) return false
    const amt = parseFloat(rusd_withdraw_amount.value)
    if (isNaN(amt) || amt <= 0) return false
    if (amt > rusd_balance.value) return false
    return true
})

const rusd_withdraw_button_style = computed(() => {
    if (rusd_withdraw_loading.value) {
        return "background: rgba(27,141,255,0.2); color: rgba(27,141,255,0.6); cursor: wait"
    }
    if (!can_withdraw_rusd.value) {
        return "background: rgba(27,141,255,0.1); color: rgba(27,141,255,0.3); cursor: not-allowed"
    }
    return "background: rgba(27,141,255,0.25); color: #1B8DFF; border: 1px solid rgba(27,141,255,0.4); cursor: pointer"
})

// Load balance if not already loaded
onMounted(async () => {
    if (!wm_hasWallets.value) return
    if (!game_store.balance_loaded) {
        game_store.loadBalance()
    }
    await refreshBalances()
})

async function refreshBalances() {
    if (!wm_hasWallets.value) {
        wallet_address.value = ""
        eth_balance.value = "0"
        rusd_balance.value = 0
        return
    }
    try {
        wallet_address.value = getAddress()
        eth_balance.value = await fetchEthBalance()
        rusd_balance.value = await fetchRusdBalance()
    } catch (e) {
        console.warn("[Wallet] Failed to load balances:", e)
    }
}

async function afterWalletChanged(): Promise<void> {
    resetWalletClient()
    await refreshBalances()
    // Reload game balance for new wallet
    game_store.balance_loaded = false
    game_store.loadBalance()
}

function copyAddress() {
    if (!wallet_address.value) return
    navigator.clipboard
        .writeText(wallet_address.value)
        .then(() => {
            copy_label.value = "COPIED!"
            setTimeout(() => {
                copy_label.value = "COPY"
            }, 2000)
        })
        .catch(() => {
            copy_label.value = "COPY"
        })
}

function copySpecificAddress(addr: string) {
    navigator.clipboard.writeText(addr).catch(() => {})
}

function handleCreateNewWallet() {
    empty_wallet_error.value = ""
    try {
        const { privateKey, address } = wm_createNewWallet()
        generated_pk.value = privateKey
        generated_address.value = address
        new_wallet_generated.value = true
    } catch (e: unknown) {
        empty_wallet_error.value = e instanceof Error ? e.message : "Failed to generate wallet"
    }
}

async function confirmNewWallet() {
    empty_wallet_error.value = ""
    try {
        wm_addWallet(generated_pk.value, "Wallet 1")
        wm_switchWallet(wm_wallets.value.length - 1)
        new_wallet_generated.value = false
        generated_pk.value = ""
        generated_address.value = ""
        await afterWalletChanged()
    } catch (e: unknown) {
        empty_wallet_error.value = e instanceof Error ? e.message : "Failed to add wallet"
    }
}

async function handleSetSampleWallet() {
    empty_wallet_error.value = ""
    try {
        wm_setSampleWallet()
        wm_switchWallet(wm_wallets.value.length - 1)
        await afterWalletChanged()
    } catch (e: unknown) {
        empty_wallet_error.value = e instanceof Error ? e.message : "Failed to set sample wallet"
    }
}

async function handleSwitchWallet(idx: number) {
    if (idx === wm_activeIndex.value) return
    wm_switchWallet(idx)
    await afterWalletChanged()
}

function confirmRemoveWallet(idx: number) {
    delete_target_idx.value = idx
    delete_target_label.value = wm_wallets.value[idx]?.label || `Wallet ${idx + 1}`
    show_delete_confirm.value = true
}

function cancelRemoveWallet() {
    show_delete_confirm.value = false
    delete_target_idx.value = -1
}

function handleRemoveWallet() {
    const idx = delete_target_idx.value
    if (idx < 0) return
    show_delete_confirm.value = false
    delete_target_idx.value = -1

    const wasActive = idx === wm_activeIndex.value
    wm_removeWallet(idx)

    if (!wm_hasWallets.value) {
        // Empty state
        resetWalletClient()
        wallet_address.value = ""
        eth_balance.value = "0"
        rusd_balance.value = 0
        game_store.balance_loaded = false
        return
    }

    if (wasActive) {
        afterWalletChanged()
    }
}

async function handleAddWallet() {
    add_wallet_error.value = ""
    add_wallet_loading.value = true
    try {
        wm_addWallet(new_wallet_pk.value, new_wallet_label.value || undefined)
        wm_switchWallet(wm_wallets.value.length - 1)
        new_wallet_pk.value = ""
        new_wallet_label.value = ""
        show_add_wallet.value = false
        await afterWalletChanged()
    } catch (e: unknown) {
        add_wallet_error.value = e instanceof Error ? e.message : "Invalid private key"
    } finally {
        add_wallet_loading.value = false
    }
}

function setMaxAmount() {
    const bal = parseFloat(eth_balance.value)
    if (isNaN(bal) || bal <= 0) return
    // Leave a small amount for gas
    const maxSend = Math.max(0, bal - 0.0001)
    withdraw_amount.value = maxSend.toFixed(6)
}

async function handleWithdraw() {
    if (!can_withdraw.value || withdraw_loading.value) return
    withdraw_loading.value = true
    withdraw_status.value = ""
    withdraw_tx.value = ""
    try {
        const hash = await withdrawEth(withdraw_to.value, withdraw_amount.value)
        withdraw_tx.value = hash
        withdraw_status.value = "Withdrawal successful!"
        withdraw_status_color.value = "#22c55e"
        // Refresh balance
        eth_balance.value = await fetchEthBalance()
        withdraw_amount.value = ""
    } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e)
        withdraw_status.value = "Failed: " + errMsg.slice(0, 80)
        withdraw_status_color.value = "#ef4444"
    } finally {
        withdraw_loading.value = false
    }
}

function setMaxRusdAmount() {
    if (rusd_balance.value <= 0) return
    rusd_withdraw_amount.value = rusd_balance.value.toFixed(2)
}

async function handleWithdrawRusd() {
    if (!can_withdraw_rusd.value || rusd_withdraw_loading.value) return
    rusd_withdraw_loading.value = true
    rusd_withdraw_status.value = ""
    rusd_withdraw_tx.value = ""
    try {
        const hash = await withdrawRusd(rusd_withdraw_to.value, rusd_withdraw_amount.value)
        rusd_withdraw_tx.value = hash
        rusd_withdraw_status.value = "Withdrawal successful!"
        rusd_withdraw_status_color.value = "#22c55e"
        // Refresh balance
        rusd_balance.value = await fetchRusdBalance()
        rusd_withdraw_amount.value = ""
    } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e)
        rusd_withdraw_status.value = "Failed: " + errMsg.slice(0, 80)
        rusd_withdraw_status_color.value = "#ef4444"
    } finally {
        rusd_withdraw_loading.value = false
    }
}

// ============ Purchase GAME SCORE Modal ============
const show_purchase_modal = ref(false)
const purchase_loading = ref(false)
const purchase_method = ref<"rusd" | "eth" | "">("")
const purchase_status = ref("")
const purchase_status_color = ref("#22c55e")
const purchase_tx = ref("")

const PURCHASE_AMOUNT = 100 // +$100 game credits

function handlePlusButton() {
    purchase_status.value = ""
    purchase_tx.value = ""
    purchase_method.value = ""
    show_purchase_modal.value = true
}

function closePurchaseModal() {
    if (purchase_loading.value) return
    show_purchase_modal.value = false
}

async function purchaseWithRusd() {
    if (purchase_loading.value) return
    if (rusd_balance.value < 5) {
        purchase_status.value = "Insufficient rUSD balance"
        purchase_status_color.value = "#ef4444"
        return
    }
    purchase_loading.value = true
    purchase_method.value = "rusd"
    purchase_status.value = "Sending transaction..."
    purchase_status_color.value = "#1B8DFF"
    purchase_tx.value = ""
    try {
        const hash = await purchaseCreditsWithRusd()
        purchase_tx.value = hash
        // Credits are now on-chain (+$100 PnL). Update local balance.
        game_store.balance += PURCHASE_AMOUNT
        purchase_status.value = "+$100 added to GAME SCORE!"
        purchase_status_color.value = "#22c55e"
        // Refresh balances
        rusd_balance.value = await fetchRusdBalance()
    } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e)
        purchase_status.value = "Failed: " + errMsg.slice(0, 60)
        purchase_status_color.value = "#ef4444"
    } finally {
        purchase_loading.value = false
    }
}

async function purchaseWithEth() {
    if (purchase_loading.value) return
    if (parseFloat(eth_balance.value) < 0.0001) {
        purchase_status.value = "Insufficient ETH balance"
        purchase_status_color.value = "#ef4444"
        return
    }
    purchase_loading.value = true
    purchase_method.value = "eth"
    purchase_status.value = "Sending transaction..."
    purchase_status_color.value = "#1B8DFF"
    purchase_tx.value = ""
    try {
        const hash = await purchaseCreditsWithEth()
        purchase_tx.value = hash
        // Credits are now on-chain (+$100 PnL). Update local balance.
        game_store.balance += PURCHASE_AMOUNT
        purchase_status.value = "+$100 added to GAME SCORE!"
        purchase_status_color.value = "#22c55e"
        // Refresh balances
        eth_balance.value = await fetchEthBalance()
    } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e)
        purchase_status.value = "Failed: " + errMsg.slice(0, 60)
        purchase_status_color.value = "#ef4444"
    } finally {
        purchase_loading.value = false
    }
}

const stats = computed(() => [
    { label: "Total Bets", value: String(game_store.total_bets) },
    { label: "Wins", value: String(game_store.total_wins), color: "#22c55e" },
    { label: "Losses", value: String(game_store.total_losses), color: "#ef4444" },
    { label: "Win Rate", value: `${game_store.win_rate}%`, color: "#1B8DFF" },
    { label: "Best Streak", value: String(game_store.best_streak) },
    {
        label: "Total P&L",
        value: `$${(game_store.total_pnl / 100).toFixed(2)}`,
        color: game_store.total_pnl >= 0 ? "#22c55e" : "#ef4444",
    },
])
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>
