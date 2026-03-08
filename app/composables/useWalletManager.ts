import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"

const STORAGE_KEY = "supharia_wallets"
const ACTIVE_KEY = "supharia_active_wallet"

export interface WalletEntry {
    label: string // user-given name or auto-generated
    address: string // derived from private key
    privateKey: string // hex string with 0x prefix
}

// Module-level reactive state (shared across all consumers)
const _wallets = ref<WalletEntry[]>([])
const _activeIndex = ref(0)
const _initialized = ref(false)

function _save(): void {
    if (!import.meta.client) return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_wallets.value))
        localStorage.setItem(ACTIVE_KEY, String(_activeIndex.value))
    } catch {
        /* quota exceeded */
    }
}

function _load(): void {
    if (!import.meta.client || _initialized.value) return
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw) as WalletEntry[]
            if (parsed.length > 0) {
                _wallets.value = parsed
                const idx = parseInt(localStorage.getItem(ACTIVE_KEY) || "0", 10)
                _activeIndex.value = Math.min(idx, parsed.length - 1)
                _initialized.value = true
                return
            }
        }
    } catch {
        /* corrupt data */
    }

    // No saved wallets — start with empty state (user chooses new or sample)
    _wallets.value = []
    _activeIndex.value = 0
    _initialized.value = true
}

function _seedDevWallet(): void {
    let pk = "0x0" as string
    if (typeof useRuntimeConfig !== "undefined") {
        try {
            const config = useRuntimeConfig()
            if (config.public?.devPrivateKey) {
                pk = config.public.devPrivateKey as string
            }
        } catch {
            /* SSR */
        }
    }
    if (pk && pk !== "0x0") {
        try {
            const account = privateKeyToAccount(pk as `0x${string}`)
            _wallets.value = [
                {
                    label: "Default",
                    address: account.address,
                    privateKey: pk,
                },
            ]
            _activeIndex.value = 0
            _save()
        } catch {
            /* invalid key */
        }
    }
}

export function useWalletManager() {
    // Initialize on first use
    _load()

    const wallets = computed(() => _wallets.value)
    const activeIndex = computed(() => _activeIndex.value)
    const activeWallet = computed(() => _wallets.value[_activeIndex.value] || null)

    /**
     * Add a new wallet by private key.
     * Returns the derived address, or throws if invalid.
     */
    function addWallet(privateKey: string, label?: string): string {
        // Normalize key
        let pk = privateKey.trim()
        if (!pk.startsWith("0x")) pk = "0x" + pk

        // Validate by deriving address
        const account = privateKeyToAccount(pk as `0x${string}`)
        const address = account.address

        // Check for duplicates
        if (_wallets.value.some((w) => w.address.toLowerCase() === address.toLowerCase())) {
            throw new Error("Wallet already exists")
        }

        const entry: WalletEntry = {
            label: label || `Wallet ${_wallets.value.length + 1}`,
            address,
            privateKey: pk,
        }
        _wallets.value = [..._wallets.value, entry]
        _save()
        return address
    }

    /**
     * Remove a wallet by index. Allows removing the last wallet (results in empty state).
     */
    function removeWallet(index: number): void {
        if (index < 0 || index >= _wallets.value.length) return
        _wallets.value = _wallets.value.filter((_, i) => i !== index)
        if (_wallets.value.length === 0) {
            _activeIndex.value = 0
        } else if (_activeIndex.value >= _wallets.value.length) {
            _activeIndex.value = _wallets.value.length - 1
        }
        _save()
    }

    /**
     * Switch active wallet by index.
     */
    function switchWallet(index: number): void {
        if (index < 0 || index >= _wallets.value.length) return
        _activeIndex.value = index
        _save()
    }

    /**
     * Get the active wallet's private key as a hex string.
     */
    function getActivePrivateKey(): `0x${string}` {
        const w = _wallets.value[_activeIndex.value]
        if (!w) return "0x0" as `0x${string}`
        return w.privateKey as `0x${string}`
    }

    /**
     * Rename a wallet.
     */
    function renameWallet(index: number, newLabel: string): void {
        if (index < 0 || index >= _wallets.value.length) return
        const updated = [..._wallets.value]
        updated[index] = { ...updated[index], label: newLabel }
        _wallets.value = updated
        _save()
    }

    /**
     * Generate a brand-new wallet keypair (does not add it).
     * UI should show the private key first, then call addWallet() when user confirms.
     */
    function createNewWallet(): { privateKey: string; address: string } {
        const pk = generatePrivateKey()
        const account = privateKeyToAccount(pk)
        return { privateKey: pk, address: account.address }
    }

    /**
     * Set the sample (dev) wallet from runtime config.
     */
    function setSampleWallet(): string {
        let pk = "0x0" as string
        if (typeof useRuntimeConfig !== "undefined") {
            try {
                const config = useRuntimeConfig()
                if (config.public?.devPrivateKey) {
                    pk = config.public.devPrivateKey as string
                }
            } catch {
                /* SSR */
            }
        }
        if (!pk || pk === "0x0") throw new Error("Sample wallet not available")
        const account = privateKeyToAccount(pk as `0x${string}`)
        // Check duplicate
        if (_wallets.value.some((w) => w.address.toLowerCase() === account.address.toLowerCase())) {
            throw new Error("Wallet already exists")
        }
        const entry: WalletEntry = {
            label: "Sample Wallet",
            address: account.address,
            privateKey: pk,
        }
        _wallets.value = [..._wallets.value, entry]
        _activeIndex.value = _wallets.value.length - 1
        _save()
        return account.address
    }

    /** Whether any wallets exist */
    const hasWallets = computed(() => _wallets.value.length > 0)

    return {
        wallets,
        activeIndex,
        activeWallet,
        hasWallets,
        addWallet,
        removeWallet,
        switchWallet,
        getActivePrivateKey,
        renameWallet,
        createNewWallet,
        setSampleWallet,
    }
}
