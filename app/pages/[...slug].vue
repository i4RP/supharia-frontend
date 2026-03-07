<template>
    <div class="error-page">
        <!-- Animated grid background -->
        <div class="grid-bg" />

        <!-- Scanline overlay -->
        <div class="scanlines" />

        <!-- Floating particles -->
        <div class="particles">
            <div v-for="n in 20" :key="n" class="particle" :style="particleStyle(n)" />
        </div>

        <!-- Glitch container -->
        <div class="content">
            <!-- Glitch 404 -->
            <div class="glitch-wrapper">
                <div class="glitch-text" data-text="404">404</div>
            </div>

            <!-- Status code subtitle -->
            <div class="status-bar">
                <span class="bracket">[</span>
                <span class="status-code">ERR::PAGE_NOT_FOUND</span>
                <span class="bracket">]</span>
            </div>

            <!-- Terminal-style message -->
            <div class="terminal">
                <div class="terminal-line">
                    <span class="prompt">&gt;</span>
                    <span class="cmd">locate</span>
                    <span class="path">{{ currentPath }}</span>
                </div>
                <div class="terminal-line result">
                    <span class="prompt">&gt;</span>
                    <span class="error-msg">target not found in matrix</span>
                    <span class="cursor" />
                </div>
            </div>

            <!-- Action buttons -->
            <div class="actions">
                <NuxtLink to="/game/mode-c" class="cyber-btn primary">
                    <span class="btn-glitch" data-text="RETURN TO BASE">RETURN TO BASE</span>
                    <span class="btn-border" />
                </NuxtLink>
                <button class="cyber-btn" @click="goBack">
                    <span class="btn-glitch" data-text="GO BACK">GO BACK</span>
                    <span class="btn-border" />
                </button>
            </div>

            <!-- Hex decoration -->
            <div class="hex-line">
                {{ hexString }}
            </div>
        </div>

        <!-- Corner decorations -->
        <div class="corner corner-tl" />
        <div class="corner corner-tr" />
        <div class="corner corner-bl" />
        <div class="corner corner-br" />

        <!-- Side data streams -->
        <div class="data-stream left">
            <div v-for="n in 15" :key="n" class="data-bit" :style="{ animationDelay: `${n * 0.3}s` }">
                {{ randomHex() }}
            </div>
        </div>
        <div class="data-stream right">
            <div v-for="n in 15" :key="n" class="data-bit" :style="{ animationDelay: `${n * 0.25}s` }">
                {{ randomHex() }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()

const currentPath = computed(() => {
    return route.path || "/unknown"
})

const hexString = computed(() => {
    const chars = "0123456789ABCDEF"
    let result = ""
    for (let i = 0; i < 48; i++) {
        result += chars[Math.floor(Math.random() * 16)]
        if (i % 4 === 3 && i < 47) result += " "
    }
    return result
})

function randomHex(): string {
    return Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, "0")
}

function particleStyle(n: number) {
    const x = Math.random() * 100
    const y = Math.random() * 100
    const size = Math.random() * 3 + 1
    const duration = Math.random() * 8 + 4
    const delay = Math.random() * 5
    return {
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
    }
}

function goBack() {
    if (import.meta.client && window.history.length > 1) {
        window.history.back()
    }
    else {
        navigateTo("/game/mode-c")
    }
}
</script>

<style scoped>
.error-page {
    position: fixed;
    inset: 0;
    background: #0a0a14;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-family: 'Courier New', monospace;
}

/* ===== Animated Grid Background ===== */
.grid-bg {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255, 105, 180, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 105, 180, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(40px, 40px); }
}

/* ===== Scanlines ===== */
.scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.1) 2px,
        rgba(0, 0, 0, 0.1) 4px
    );
    pointer-events: none;
    z-index: 10;
}

/* ===== Particles ===== */
.particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.particle {
    position: absolute;
    background: #ff69b4;
    border-radius: 50%;
    opacity: 0;
    animation: particleFloat linear infinite;
}

@keyframes particleFloat {
    0% { opacity: 0; transform: translateY(0) scale(0); }
    10% { opacity: 0.8; }
    90% { opacity: 0.2; }
    100% { opacity: 0; transform: translateY(-100px) scale(1.5); }
}

/* ===== Content ===== */
.content {
    position: relative;
    z-index: 5;
    text-align: center;
    padding: 20px;
}

/* ===== Glitch 404 Text ===== */
.glitch-wrapper {
    margin-bottom: 16px;
}

.glitch-text {
    font-size: clamp(80px, 20vw, 180px);
    font-weight: 900;
    color: #ff69b4;
    text-shadow:
        0 0 10px rgba(255, 105, 180, 0.5),
        0 0 40px rgba(255, 105, 180, 0.3),
        0 0 80px rgba(255, 105, 180, 0.1);
    position: relative;
    animation: textFlicker 4s infinite;
    letter-spacing: 0.1em;
}

.glitch-text::before,
.glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.glitch-text::before {
    color: #0ff;
    animation: glitch1 2s infinite linear alternate-reverse;
    clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
    -webkit-clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
}

.glitch-text::after {
    color: #f0f;
    animation: glitch2 3s infinite linear alternate-reverse;
    clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
    -webkit-clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
}

@keyframes glitch1 {
    0% { transform: translate(0); }
    20% { transform: translate(-3px, 2px); }
    40% { transform: translate(3px, -1px); }
    60% { transform: translate(-2px, -2px); }
    80% { transform: translate(2px, 1px); }
    100% { transform: translate(0); }
}

@keyframes glitch2 {
    0% { transform: translate(0); }
    20% { transform: translate(2px, -2px); }
    40% { transform: translate(-3px, 1px); }
    60% { transform: translate(1px, 2px); }
    80% { transform: translate(-2px, -1px); }
    100% { transform: translate(0); }
}

@keyframes textFlicker {
    0%, 100% { opacity: 1; }
    92% { opacity: 1; }
    93% { opacity: 0.3; }
    94% { opacity: 1; }
    96% { opacity: 0.8; }
    97% { opacity: 1; }
}

/* ===== Status Bar ===== */
.status-bar {
    font-size: clamp(12px, 2.5vw, 16px);
    margin-bottom: 32px;
    letter-spacing: 0.3em;
}

.bracket {
    color: #d4609a;
}

.status-code {
    color: #ff69b4;
    text-shadow: 0 0 10px rgba(255, 105, 180, 0.5);
    animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

/* ===== Terminal ===== */
.terminal {
    background: rgba(255, 105, 180, 0.03);
    border: 1px solid rgba(255, 105, 180, 0.15);
    border-radius: 8px;
    padding: 16px 20px;
    margin: 0 auto 32px;
    max-width: 500px;
    text-align: left;
    backdrop-filter: blur(4px);
}

.terminal-line {
    font-size: clamp(11px, 2vw, 14px);
    line-height: 1.8;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.prompt {
    color: #d4609a;
    font-weight: bold;
}

.cmd {
    color: #ff69b4;
}

.path {
    color: rgba(255, 255, 255, 0.5);
    word-break: break-all;
}

.result {
    margin-top: 4px;
}

.error-msg {
    color: #ef4444;
    text-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

.cursor {
    display: inline-block;
    width: 8px;
    height: 14px;
    background: #ff69b4;
    animation: cursorBlink 1s step-end infinite;
    vertical-align: middle;
    margin-left: 2px;
}

@keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

/* ===== Buttons ===== */
.actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-bottom: 32px;
    flex-wrap: wrap;
}

.cyber-btn {
    position: relative;
    padding: 12px 28px;
    background: transparent;
    border: 1px solid rgba(255, 105, 180, 0.3);
    color: #ff69b4;
    font-family: 'Courier New', monospace;
    font-size: clamp(11px, 2vw, 13px);
    font-weight: bold;
    letter-spacing: 0.15em;
    cursor: pointer;
    overflow: hidden;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    transition: all 0.3s;
    text-decoration: none;
}

.cyber-btn:hover {
    background: rgba(255, 105, 180, 0.1);
    border-color: rgba(255, 105, 180, 0.6);
    text-shadow: 0 0 10px rgba(255, 105, 180, 0.5);
    box-shadow: 0 0 20px rgba(255, 105, 180, 0.1);
}

.cyber-btn.primary {
    background: rgba(255, 105, 180, 0.1);
    border-color: rgba(255, 105, 180, 0.5);
}

.cyber-btn.primary:hover {
    background: rgba(255, 105, 180, 0.2);
    border-color: #ff69b4;
}

.btn-glitch {
    position: relative;
    display: inline-block;
}

.cyber-btn:hover .btn-glitch {
    animation: btnGlitch 0.3s linear;
}

@keyframes btnGlitch {
    0% { transform: translate(0); }
    25% { transform: translate(-2px, 1px); }
    50% { transform: translate(2px, -1px); }
    75% { transform: translate(-1px, -1px); }
    100% { transform: translate(0); }
}

.btn-border {
    position: absolute;
    top: -1px;
    right: -1px;
    width: 12px;
    height: 12px;
    border-top: 2px solid #ff69b4;
    border-right: 2px solid #ff69b4;
    transform: rotate(45deg) translate(-3px, 3px);
    opacity: 0.5;
}

/* ===== Hex Decoration ===== */
.hex-line {
    font-size: 9px;
    color: rgba(212, 96, 154, 0.15);
    letter-spacing: 0.2em;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
    word-break: break-all;
}

/* ===== Corner Decorations ===== */
.corner {
    position: absolute;
    width: 40px;
    height: 40px;
    z-index: 5;
}

.corner-tl {
    top: 20px;
    left: 20px;
    border-top: 2px solid rgba(255, 105, 180, 0.3);
    border-left: 2px solid rgba(255, 105, 180, 0.3);
}

.corner-tr {
    top: 20px;
    right: 20px;
    border-top: 2px solid rgba(255, 105, 180, 0.3);
    border-right: 2px solid rgba(255, 105, 180, 0.3);
}

.corner-bl {
    bottom: 20px;
    left: 20px;
    border-bottom: 2px solid rgba(255, 105, 180, 0.3);
    border-left: 2px solid rgba(255, 105, 180, 0.3);
}

.corner-br {
    bottom: 20px;
    right: 20px;
    border-bottom: 2px solid rgba(255, 105, 180, 0.3);
    border-right: 2px solid rgba(255, 105, 180, 0.3);
}

/* ===== Data Streams ===== */
.data-stream {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 50px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    z-index: 2;
    overflow: hidden;
}

.data-stream.left {
    left: 8px;
    align-items: flex-start;
}

.data-stream.right {
    right: 8px;
    align-items: flex-end;
}

.data-bit {
    font-size: 9px;
    color: rgba(212, 96, 154, 0.12);
    font-family: 'Courier New', monospace;
    animation: dataPulse 3s ease-in-out infinite;
}

@keyframes dataPulse {
    0%, 100% { opacity: 0.1; }
    50% { opacity: 0.4; color: rgba(255, 105, 180, 0.25); }
}

/* ===== Mobile adjustments ===== */
@media (max-width: 480px) {
    .data-stream { display: none; }
    .corner { width: 24px; height: 24px; }
    .terminal { margin-left: 8px; margin-right: 8px; padding: 12px 14px; }
    .actions { gap: 10px; }
    .cyber-btn { padding: 10px 20px; }
}
</style>
