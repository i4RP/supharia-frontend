export function useMobile() {
    const is_mobile = ref(false)

    onMounted(() => {
        const query = window.matchMedia("(max-width: 768px)")
        is_mobile.value = query.matches
        const handler = (e: MediaQueryListEvent) => {
            is_mobile.value = e.matches
        }
        query.addEventListener("change", handler)
        onUnmounted(() => query.removeEventListener("change", handler))
    })

    return { is_mobile }
}
