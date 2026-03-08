export function useWallet() {
    const wallet_store = useWalletStore()

    return {
        wallet_connected: computed(() => wallet_store.wallet_connected),
        wallet_address: computed(() => wallet_store.wallet_address),
        show_wallet_modal: computed(() => wallet_store.show_wallet_modal),
        connectWallet: wallet_store.connectWallet,
        openWalletModal: wallet_store.openWalletModal,
        closeWalletModal: wallet_store.closeWalletModal,
    }
}
