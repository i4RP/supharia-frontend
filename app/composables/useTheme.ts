export function useTheme() {
    const app_store = useAppStore()
    const is_dark = computed(() => app_store.is_dark)

    const bg = computed(() => (is_dark.value ? "bg-black" : "bg-gray-50"))
    const border = computed(() => (is_dark.value ? "border-[#1a1a1a]" : "border-gray-200"))
    const text = computed(() => (is_dark.value ? "text-[#ededed]" : "text-gray-900"))
    const text_muted = computed(() => (is_dark.value ? "text-[#888]" : "text-gray-500"))
    const hover_bg = computed(() => (is_dark.value ? "hover:bg-[#111]" : "hover:bg-gray-100"))
    const input_cls = computed(
        () =>
            `w-full px-3 py-2.5 rounded-xl border ${is_dark.value ? "bg-black border-[#1a1a1a] text-[#ededed]" : "bg-gray-50 border-gray-200 text-gray-900"} text-sm outline-none`,
    )

    return { is_dark, bg, border, text, text_muted, hover_bg, input_cls }
}
