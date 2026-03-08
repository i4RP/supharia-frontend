<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<script setup lang="ts">
const app_store = useAppStore()

useHead({
    htmlAttrs: { class: computed(() => (app_store.is_dark ? "dark" : "")) },
    title: "MPARA",
})
</script>
