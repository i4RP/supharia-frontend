import { defineStore } from "pinia"
import type { Language, Network, Theme } from "~/types/app"

export const useAppStore = defineStore("app", () => {
    const tos_cookie = useCookie<boolean>("dxs_tos_agreed", {
        maxAge: 60 * 60 * 24 * 365,
        default: () => false,
    })

    const theme = ref<Theme>("dark")
    const language = ref<Language>("en")
    const network = ref<Network>("bsv-mainnet")
    const tos_agreed = computed(() => tos_cookie.value === true)
    const is_live = ref(true)

    const is_dark = computed(() => theme.value === "dark")

    function agreeToS() {
        tos_cookie.value = true
    }

    function toggleTheme() {
        theme.value = theme.value === "dark" ? "light" : "dark"
    }

    return { theme, language, network, tos_agreed, is_live, is_dark, agreeToS, toggleTheme }
})
