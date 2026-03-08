import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    ssr: false,
    runtimeConfig: {
        public: {
            devPrivateKey: process.env.NUXT_PUBLIC_DEV_PRIVATE_KEY || "",
        },
    },
    modules: ["@pinia/nuxt", "@vite-pwa/nuxt"],
    css: ["~/assets/css/main.css"],
    vite: {
        plugins: [tailwindcss()],
    },
    pwa: {
        registerType: "autoUpdate",
        manifest: {
            name: "SUPHARIA - Tap Trading",
            short_name: "SUPHARIA",
            description: "Trade at the Speed of Air",
            theme_color: "#0A0A14",
            background_color: "#0A0A14",
            display: "standalone",
            orientation: "portrait",
            start_url: "/game",
            scope: "/",
            icons: [
                {
                    src: "/icon-192.svg",
                    sizes: "192x192",
                    type: "image/svg+xml",
                    purpose: "any",
                },
                {
                    src: "/icon-512.svg",
                    sizes: "512x512",
                    type: "image/svg+xml",
                    purpose: "any maskable",
                },
            ],
        },
        workbox: {
            navigateFallback: "/game",
            globPatterns: ["**/*.{js,css,html,svg,ico,json}"],
            runtimeCaching: [
                {
                    urlPattern: /^https:\/\/.*\.fly\.dev\/api\/.*/i,
                    handler: "NetworkOnly",
                },
            ],
        },
        client: {
            installPrompt: true,
        },
        devOptions: {
            enabled: false,
        },
    },
    app: {
        head: {
            meta: [
                { name: "theme-color", content: "#0A0A14" },
                { name: "apple-mobile-web-app-capable", content: "yes" },
                { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
                { name: "apple-mobile-web-app-title", content: "SUPHARIA" },
                { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
            ],
            link: [
                { rel: "apple-touch-icon", href: "/icon-192.svg" },
            ],
        },
    },
})
