import { defineStore } from "pinia"

export const useWalletStore = defineStore("wallet", () => {
    const wallet_connected = ref(false)
    const wallet_address = ref("")
    const show_wallet_modal = ref(false)

    function connectWallet(address: string) {
        wallet_address.value = address
        wallet_connected.value = true
    }

    function openWalletModal() {
        show_wallet_modal.value = true
    }

    function closeWalletModal() {
        show_wallet_modal.value = false
    }

    return {
        wallet_connected,
        wallet_address,
        show_wallet_modal,
        connectWallet,
        openWalletModal,
        closeWalletModal,
    }
})
