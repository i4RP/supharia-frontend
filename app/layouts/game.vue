<template>
    <div :class="`min-h-screen ${app_store.is_dark ? 'bg-black text-[#ededed]' : 'bg-gray-50 text-gray-900'}`">
        <main>
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
const app_store = useAppStore()
</script>
