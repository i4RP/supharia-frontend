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
            name: "MPARA - Tap Trading",
            short_name: "MPARA",
            description: "Trade at the Speed of Air",
            theme_color: "#03080F",
            background_color: "#03080F",
            display: "standalone",
            orientation: "portrait",
            start_url: "/game",
            scope: "/",
            icons: [
                {
                    src: "/icon-192.png",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "any",
                },
                {
                    src: "/icon-512.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any",
                },
                {
                    src: "/icon-192-maskable.png",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "maskable",
                },
                {
                    src: "/icon-512-maskable.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "maskable",
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
                { name: "theme-color", content: "#03080F" },
                { name: "apple-mobile-web-app-capable", content: "yes" },
                { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
                { name: "apple-mobile-web-app-title", content: "MPARA" },
                { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
                { property: "og:title", content: "MPARA - Tap Trading" },
                { property: "og:description", content: "Trade at the Speed of Air" },
                { property: "og:image", content: "/og-image.png" },
                { property: "og:type", content: "website" },
                { name: "twitter:card", content: "summary_large_image" },
                { name: "twitter:title", content: "MPARA - Tap Trading" },
                { name: "twitter:image", content: "/og-image.png" },
            ],
            link: [
                { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
                { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
            ],
        },
    },
})
