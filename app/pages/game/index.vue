<template>
    <div class="fixed inset-0 flex flex-col items-center justify-center" style="background: #0A0A14">
        <!-- Title -->
        <div class="text-center mb-12">
            <h1
                class="text-3xl font-bold tracking-widest mb-2"
                style="background: linear-gradient(135deg, #A78BFA 0%, #C4B5FD 50%, #00D4FF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent"
            >
                SUPHARIA
            </h1>
            <p class="text-sm font-mono tracking-wider" style="color: rgba(255,255,255,0.4)">
                TAP TRADING
            </p>
        </div>

        <!-- Mode Selection Cards -->
        <div class="flex flex-col gap-5 w-full max-w-sm px-6">
            <!-- Mode A: On-Chain -->
            <NuxtLink
                to="/game/mode-a"
                class="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style="background: rgba(167, 139, 250, 0.08); border: 1px solid rgba(167, 139, 250, 0.2)"
            >
                <!-- Glow effect -->
                <div
                    class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style="background: radial-gradient(circle at center, rgba(167, 139, 250, 0.1) 0%, transparent 70%)"
                />
                <div class="relative flex items-center gap-4">
                    <!-- Icon -->
                    <div
                        class="flex items-center justify-center w-14 h-14 rounded-xl shrink-0"
                        style="background: linear-gradient(135deg, #A78BFA 0%, #627EEA 100%)"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#0A0A14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        </svg>
                    </div>
                    <!-- Text -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-lg font-bold tracking-wide" style="color: #E8E8FF">Mode A</span>
                            <span
                                class="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider"
                                style="background: rgba(167,139,250,0.15); color: #A78BFA"
                            >
                                ON-CHAIN
                            </span>
                        </div>
                        <p class="text-xs font-mono" style="color: rgba(255,255,255,0.4)">
                            Real rUSD on MegaETH testnet
                        </p>
                        <div class="flex items-center gap-3 mt-2 text-[10px] font-mono" style="color: rgba(255,255,255,0.3)">
                            <span>1 rUSD / bet</span>
                            <span>3x9 grid</span>
                            <span>GBM odds</span>
                        </div>
                    </div>
                    <!-- Arrow -->
                    <svg class="shrink-0 opacity-40 group-hover:opacity-80 transition-opacity" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="#E8E8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </NuxtLink>

            <!-- Mode C: Practice -->
            <NuxtLink
                to="/game/mode-c"
                class="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2)"
            >
                <!-- Glow effect -->
                <div
                    class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style="background: radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, transparent 70%)"
                />
                <div class="relative flex items-center gap-4">
                    <!-- Icon -->
                    <div
                        class="flex items-center justify-center w-14 h-14 rounded-xl shrink-0"
                        style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="9" stroke="#0A0A14" stroke-width="2" fill="none"/>
                            <polygon points="10,8 16,12 10,16" fill="#0A0A14"/>
                        </svg>
                    </div>
                    <!-- Text -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-lg font-bold tracking-wide" style="color: #E8E8FF">Mode C</span>
                            <span
                                class="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider"
                                style="background: rgba(34,197,94,0.15); color: #22c55e"
                            >
                                PRACTICE
                            </span>
                        </div>
                        <p class="text-xs font-mono" style="color: rgba(255,255,255,0.4)">
                            Free play, no wallet needed
                        </p>
                        <div class="flex items-center gap-3 mt-2 text-[10px] font-mono" style="color: rgba(255,255,255,0.3)">
                            <span>$5 / bet</span>
                            <span>12x20 grid</span>
                            <span>$100 balance</span>
                        </div>
                    </div>
                    <!-- Arrow -->
                    <svg class="shrink-0 opacity-40 group-hover:opacity-80 transition-opacity" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="#E8E8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </NuxtLink>
        </div>

        <!-- Footer -->
        <div class="mt-12 text-center">
            <p class="text-[10px] font-mono tracking-wider" style="color: rgba(255,255,255,0.2)">
                POWERED BY MEGAETH
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: "game",
})
</script>
