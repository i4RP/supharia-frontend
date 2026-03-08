<template>
    <div :class="`min-h-screen ${app_store.is_dark ? 'bg-black text-[#ededed]' : 'bg-gray-50 text-gray-900'}`">
        <ModalToSModal v-if="!app_store.tos_agreed" />
        <ModalWalletModal v-if="wallet_store.show_wallet_modal" />
        <LayoutAppHeader />
        <main>
            <slot />
        </main>
        <LayoutMobileNav />
    </div>
</template>

<script setup lang="ts">
const app_store = useAppStore()
const wallet_store = useWalletStore()
</script>
