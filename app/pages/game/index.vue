<template>
    <div class="absolute inset-0 flex flex-col" style="background: #03080F; padding-bottom: 60px">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-3">
            <div class="flex items-center gap-3">
                <img src="/icon-192.png" alt="MPARA" class="w-8 h-8 rounded-lg" />
                <div>
                    <h1 class="text-white font-bold text-lg tracking-wide">MegaPARA</h1>
                    <p class="text-xs" style="color: #7A8AA0">Dungeon Select</p>
                </div>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full" style="background: rgba(5,13,26,0.9); border: 1px solid rgba(27,141,255,0.3)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 10H18a2 2 0 0 0 0 4h4" /></svg>
                <span class="text-white font-bold text-sm font-mono">${{ game_store.balance.toFixed(0) }}</span>
            </div>
        </div>

        <!-- Dungeon List -->
        <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
            <!-- Dungeon 1: Ender Dragon -->
            <button
                class="dungeon-card w-full text-left rounded-xl p-4 relative overflow-hidden"
                style="background: linear-gradient(135deg, #050D1A 0%, #0A1A30 100%); border: 1px solid rgba(27,141,255,0.3)"
                @click="enterDungeon('ender-dragon')"
            >
                <div class="flex items-center gap-4">
                    <!-- Dragon Icon -->
                    <div class="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center" style="background: rgba(27,141,255,0.15); border: 1px solid rgba(27,141,255,0.3)">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                            <path d="M18 4L6 14L10 28H26L30 14L18 4Z" stroke="#00D4FF" stroke-width="1.5" fill="rgba(0,212,255,0.1)" />
                            <circle cx="13" cy="16" r="2" fill="#ef4444" />
                            <circle cx="23" cy="16" r="2" fill="#ef4444" />
                            <path d="M12 22C12 22 15 25 18 25C21 25 24 22 24 22" stroke="#00D4FF" stroke-width="1.5" stroke-linecap="round" />
                            <path d="M6 14L2 8" stroke="#00D4FF" stroke-width="1.5" stroke-linecap="round" />
                            <path d="M30 14L34 8" stroke="#00D4FF" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="text-white font-bold text-base">Ender Dragon</h3>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold" style="background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.3)">BOSS</span>
                        </div>
                        <p class="text-xs mb-2" style="color: #7A8AA0">ETH price chart is the dragon's path. Place monsters on panels to strike!</p>
                        <div class="flex items-center gap-3">
                            <div class="flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 10h8M8 14h8" /></svg>
                                <span class="text-[11px] font-mono" style="color: #22c55e">$5 / panel</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B8DFF" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                <span class="text-[11px] font-mono" style="color: #1B8DFF">LIVE ETH/USD</span>
                            </div>
                        </div>
                    </div>
                    <!-- Arrow -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(27,141,255,0.5)" stroke-width="2" class="flex-shrink-0"><path d="M9 18l6-6-6-6" /></svg>
                </div>
                <!-- Glow effect -->
                <div class="absolute top-0 right-0 w-32 h-32 rounded-full" style="background: radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)" />
            </button>

            <!-- Dungeon 2: Coming Soon -->
            <div
                class="w-full text-left rounded-xl p-4 relative overflow-hidden opacity-50"
                style="background: linear-gradient(135deg, #050D1A 0%, #0A1A30 100%); border: 1px solid rgba(27,141,255,0.15)"
            >
                <div class="flex items-center gap-4">
                    <div class="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center" style="background: rgba(27,141,255,0.08); border: 1px solid rgba(27,141,255,0.15)">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                            <rect x="8" y="8" width="20" height="20" rx="3" stroke="#4DA6FF" stroke-width="1.5" stroke-dasharray="4 4" fill="none" />
                            <text x="18" y="21" text-anchor="middle" fill="#4DA6FF" font-size="14">?</text>
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="font-bold text-base" style="color: #7A8AA0">Shadow Realm</h3>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold" style="background: rgba(122,138,160,0.2); color: #7A8AA0; border: 1px solid rgba(122,138,160,0.3)">COMING SOON</span>
                        </div>
                        <p class="text-xs" style="color: #4A5568">New dungeon coming soon...</p>
                    </div>
                </div>
            </div>

            <!-- Dungeon 3: Coming Soon -->
            <div
                class="w-full text-left rounded-xl p-4 relative overflow-hidden opacity-50"
                style="background: linear-gradient(135deg, #050D1A 0%, #0A1A30 100%); border: 1px solid rgba(27,141,255,0.15)"
            >
                <div class="flex items-center gap-4">
                    <div class="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center" style="background: rgba(27,141,255,0.08); border: 1px solid rgba(27,141,255,0.15)">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                            <rect x="8" y="8" width="20" height="20" rx="3" stroke="#4DA6FF" stroke-width="1.5" stroke-dasharray="4 4" fill="none" />
                            <text x="18" y="21" text-anchor="middle" fill="#4DA6FF" font-size="14">?</text>
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="font-bold text-base" style="color: #7A8AA0">Void Citadel</h3>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold" style="background: rgba(122,138,160,0.2); color: #7A8AA0; border: 1px solid rgba(122,138,160,0.3)">COMING SOON</span>
                        </div>
                        <p class="text-xs" style="color: #4A5568">New dungeon coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const game_store = useGameStoreC()

function enterDungeon(id: string) {
    if (id === "ender-dragon") {
        navigateTo("/game/mode-c")
    }
}
</script>

<style scoped>
.dungeon-card {
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.dungeon-card:active {
    transform: scale(0.98);
    box-shadow: 0 0 20px rgba(27, 141, 255, 0.2);
}
</style>
