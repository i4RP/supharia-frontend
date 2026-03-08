import type { Ref } from "vue"

// MegaETH Testnet chain config
const MEGAETH_TESTNET = {
    id: 6342,
    name: "MegaETH Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://carrot.megaeth.com/rpc"] },
    },
    blockExplorers: {
        default: { name: "MegaETH Explorer", url: "https://www.megaexplorer.xyz" },
    },
}

// Privy App ID
const PRIVY_APP_ID = "cmm33x2et00fd0djr95ixiprn"

// rUSD token on Sepolia
const RUSD_ADDRESS = "0x6ce0d9aebb683abbec9bfbf82d35d4e92cfec12b" as const

interface PrivyState {
    is_authenticated: Ref<boolean>
    is_loading: Ref<boolean>
    user_id: Ref<string>
    wallet_address: Ref<string>
    email: Ref<string>
    privy_instance: Ref<unknown | null>
}

let _privy_singleton: unknown | null = null
let _iframe: HTMLIFrameElement | null = null
let _message_listener: ((e: MessageEvent) => void) | null = null

export function usePrivy(): PrivyState & {
    init: () => Promise<void>
    loginWithEmail: (email: string) => Promise<void>
    verifyEmailCode: (email: string, code: string) => Promise<void>
    loginWithOAuth: (provider: string) => Promise<void>
    handleOAuthCallback: () => Promise<void>
    logout: () => Promise<void>
    createWallet: () => Promise<string | null>
    getProvider: () => Promise<unknown | null>
    getAccessToken: () => Promise<string | null>
    isReady: () => boolean
} {
    const is_authenticated = useState<boolean>("privy_authenticated", () => false)
    const is_loading = useState<boolean>("privy_loading", () => false)
    const user_id = useState<string>("privy_user_id", () => "")
    const wallet_address = useState<string>("privy_wallet_address", () => "")
    const email = useState<string>("privy_email", () => "")
    const privy_instance = useState<unknown | null>("privy_instance", () => null)

    async function init() {
        if (!import.meta.client) return
        if (_privy_singleton) {
            privy_instance.value = _privy_singleton
            return
        }

        is_loading.value = true
        try {
            const PrivyModule = await import("@privy-io/js-sdk-core")
            const Privy = PrivyModule.default
            const PrivyLocalStorage = PrivyModule.LocalStorage

            const privy = new Privy({
                appId: PRIVY_APP_ID,
                storage: new PrivyLocalStorage(),
                supportedChains: [MEGAETH_TESTNET as never],
            })

            // Set up embedded wallet iframe
            const iframe_url = privy.embeddedWallet.getURL()
            _iframe = document.createElement("iframe")
            _iframe.src = iframe_url
            _iframe.style.display = "none"
            _iframe.setAttribute("id", "privy-iframe")
            document.body.appendChild(_iframe)

            // Wait for iframe to load
            await new Promise<void>((resolve) => {
                if (_iframe) {
                    _iframe.onload = () => resolve()
                    setTimeout(resolve, 3000) // fallback timeout
                } else {
                    resolve()
                }
            })

            // Set message poster and listener
            if (_iframe?.contentWindow) {
                privy.setMessagePoster(_iframe.contentWindow)
            }
            _message_listener = (e: MessageEvent) => {
                privy.embeddedWallet.onMessage(e.data)
            }
            window.addEventListener("message", _message_listener)

            _privy_singleton = privy
            privy_instance.value = privy

            // Try to restore session
            try {
                const token = await privy.getAccessToken()
                if (token) {
                    const user_data = await privy.user.get()
                    if (user_data) {
                        is_authenticated.value = true
                        user_id.value = user_data.id || ""

                        // Extract wallet address
                        const eth_wallet = PrivyModule.getUserEmbeddedEthereumWallet(user_data)
                        if (eth_wallet) {
                            wallet_address.value = eth_wallet.address
                        }

                        // Extract email
                        const linked = user_data.linked_accounts || []
                        for (const account of linked) {
                            if ("type" in account && account.type === "email" && "address" in account) {
                                email.value = (account as { address: string }).address
                                break
                            }
                        }
                    }
                }
            } catch {
                // No existing session
            }
        } catch (err) {
            console.error("Privy init error:", err)
        } finally {
            is_loading.value = false
        }
    }

    async function loginWithEmail(email_address: string) {
        const privy = _privy_singleton as { auth: { email: { sendCode: (e: string) => Promise<unknown> } } } | null
        if (!privy) throw new Error("Privy not initialized")
        is_loading.value = true
        try {
            await privy.auth.email.sendCode(email_address)
        } finally {
            is_loading.value = false
        }
    }

    async function verifyEmailCode(email_address: string, code: string) {
        const privy = _privy_singleton as {
            auth: { email: { loginWithCode: (e: string, c: string) => Promise<{ user: unknown }> } }
            user: { get: () => Promise<unknown> }
        } | null
        if (!privy) throw new Error("Privy not initialized")
        is_loading.value = true
        try {
            const result = await privy.auth.email.loginWithCode(email_address, code)
            is_authenticated.value = true
            email.value = email_address

            // Get user data
            const PrivyModule = await import("@privy-io/js-sdk-core")
            const user_data = result.user as { id?: string; linked_accounts?: unknown[] } | null
            if (user_data) {
                user_id.value = user_data.id || ""
                const eth_wallet = PrivyModule.getUserEmbeddedEthereumWallet(user_data as never)
                if (eth_wallet) {
                    wallet_address.value = eth_wallet.address
                }
            }
        } finally {
            is_loading.value = false
        }
    }

    async function loginWithOAuth(provider: string) {
        const privy = _privy_singleton as {
            auth: { oauth: { generateURL: (p: string, r: string) => Promise<{ url: string }> } }
        } | null
        if (!privy) throw new Error("Privy not initialized")
        is_loading.value = true
        try {
            const redirect_uri = `${window.location.origin}/game`
            const result = await privy.auth.oauth.generateURL(provider, redirect_uri)
            window.location.assign(result.url)
        } catch {
            is_loading.value = false
        }
    }

    async function handleOAuthCallback() {
        const privy = _privy_singleton as {
            auth: { oauth: { loginWithCode: (c: string, s: string) => Promise<{ user: unknown }> } }
        } | null
        if (!privy) return

        const params = new URLSearchParams(window.location.search)
        const oauth_code = params.get("privy_oauth_code")
        const oauth_state = params.get("privy_oauth_state")
        if (!oauth_code || !oauth_state) return

        is_loading.value = true
        try {
            const result = await privy.auth.oauth.loginWithCode(oauth_code, oauth_state)
            is_authenticated.value = true

            const PrivyModule = await import("@privy-io/js-sdk-core")
            const user_data = result.user as { id?: string } | null
            if (user_data) {
                user_id.value = user_data.id || ""
                const eth_wallet = PrivyModule.getUserEmbeddedEthereumWallet(user_data as never)
                if (eth_wallet) {
                    wallet_address.value = eth_wallet.address
                }
            }

            // Clean URL
            const clean_url = window.location.pathname
            window.history.replaceState({}, "", clean_url)
        } finally {
            is_loading.value = false
        }
    }

    async function logout() {
        is_authenticated.value = false
        user_id.value = ""
        wallet_address.value = ""
        email.value = ""

        // Clear Privy storage
        if (import.meta.client) {
            const keys_to_remove = Object.keys(localStorage).filter(
                (k) => k.startsWith("privy") || k.startsWith("@privy"),
            )
            for (const key of keys_to_remove) {
                localStorage.removeItem(key)
            }
        }
    }

    async function createWallet(): Promise<string | null> {
        const privy = _privy_singleton as {
            embeddedWallet: { create: (opts: Record<string, unknown>) => Promise<{ user: unknown }> }
        } | null
        if (!privy) return null

        try {
            const PrivyModule = await import("@privy-io/js-sdk-core")
            const result = await privy.embeddedWallet.create({})
            const user_data = result.user as Record<string, unknown> | null
            if (user_data) {
                const eth_wallet = PrivyModule.getUserEmbeddedEthereumWallet(user_data as never)
                if (eth_wallet) {
                    wallet_address.value = eth_wallet.address
                    return eth_wallet.address
                }
            }
        } catch (err) {
            console.error("Create wallet error:", err)
        }
        return null
    }

    async function getProvider(): Promise<unknown | null> {
        const privy = _privy_singleton as {
            embeddedWallet: {
                getEthereumProvider: (opts: Record<string, unknown>) => Promise<unknown>
            }
        } | null
        if (!privy || !wallet_address.value) return null

        try {
            const PrivyModule = await import("@privy-io/js-sdk-core")
            const user_data = await (privy as unknown as { user: { get: () => Promise<unknown> } }).user.get()
            const eth_wallet = PrivyModule.getUserEmbeddedEthereumWallet(user_data as never)
            if (!eth_wallet) return null

            const entropy = PrivyModule.getEntropyDetailsFromUser(user_data as never)
            const provider = await privy.embeddedWallet.getEthereumProvider({
                wallet: eth_wallet as never,
                entropyId: entropy.entropyId,
                entropyIdVerifier: entropy.entropyIdVerifier,
            })
            return provider
        } catch (err) {
            console.error("Get provider error:", err)
            return null
        }
    }

    async function getAccessToken(): Promise<string | null> {
        const privy = _privy_singleton as {
            getAccessToken: () => Promise<string | null>
        } | null
        if (!privy) return null
        try {
            return await privy.getAccessToken()
        } catch {
            return null
        }
    }

    function isReady(): boolean {
        return _privy_singleton !== null
    }

    return {
        is_authenticated,
        is_loading,
        user_id,
        wallet_address,
        email,
        privy_instance,
        init,
        loginWithEmail,
        verifyEmailCode,
        loginWithOAuth,
        handleOAuthCallback,
        logout,
        createWallet,
        getProvider,
        getAccessToken,
        isReady,
    }
}

export { MEGAETH_TESTNET, RUSD_ADDRESS, PRIVY_APP_ID }
