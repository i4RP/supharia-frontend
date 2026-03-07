<template>
    <div class="max-w-4xl mx-auto p-6 space-y-6">
        <h1 :class="[text, 'text-2xl font-bold']">Token Launchpad</h1>
        <p :class="text_muted">Create and launch your own tokens on BSV</p>

        <!-- Create Token Form -->
        <div :class="[border, 'border rounded-xl p-6']">
            <h2 :class="[text, 'text-lg font-semibold mb-4']">
                <Rocket :size="18" class="inline mr-2" />
                Create New Token
            </h2>

            <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label :class="[text_muted, 'text-xs block mb-1']"
                            >Token Name</label
                        >
                        <input
                            v-model="token_form.name"
                            placeholder="e.g. My Token"
                            :class="input_cls"
                        />
                    </div>
                    <div>
                        <label :class="[text_muted, 'text-xs block mb-1']"
                            >Symbol</label
                        >
                        <input
                            v-model="token_form.symbol"
                            placeholder="e.g. MTK"
                            :class="input_cls"
                            maxlength="6"
                        />
                    </div>
                </div>

                <div>
                    <label :class="[text_muted, 'text-xs block mb-1']"
                        >Total Supply</label
                    >
                    <input
                        v-model="token_form.supply"
                        type="number"
                        placeholder="1000000"
                        :class="input_cls"
                    />
                </div>

                <!-- Color Picker -->
                <div>
                    <label :class="[text_muted, 'text-xs block mb-1']"
                        >Brand Color</label
                    >
                    <div class="flex items-center gap-3">
                        <div class="flex gap-2">
                            <button
                                v-for="color in color_options"
                                :key="color"
                                class="w-8 h-8 rounded-full border-2 transition-transform"
                                :class="token_form.color === color ? 'border-white scale-110' : 'border-transparent'"
                                :style="{ backgroundColor: color }"
                                @click="token_form.color = color"
                            />
                        </div>
                        <!-- Preview -->
                        <div
                            class="ml-4 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                            :style="{ backgroundColor: token_form.color }"
                        >
                            {{ token_form.symbol || "TKN" }}
                        </div>
                    </div>
                </div>

                <div>
                    <label :class="[text_muted, 'text-xs block mb-1']"
                        >Description</label
                    >
                    <textarea
                        v-model="token_form.description"
                        placeholder="Describe your token..."
                        rows="3"
                        :class="input_cls"
                    />
                </div>

                <div class="flex items-center gap-2">
                    <input
                        id="freeze"
                        v-model="token_form.freeze_enabled"
                        type="checkbox"
                        class="rounded"
                    />
                    <label
                        for="freeze"
                        :class="[text, 'text-sm cursor-pointer']"
                    >
                        Enable freeze authority
                    </label>
                    <span :class="[text_muted, 'text-xs']"
                        >(allows freezing token transfers)</span
                    >
                </div>

                <button
                    class="w-full py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
                    @click="createToken"
                >
                    <Rocket :size="14" class="inline mr-2" />
                    Launch Token
                </button>
            </div>
        </div>

        <!-- Launched Tokens -->
        <div :class="[border, 'border rounded-xl p-6']">
            <h2 :class="[text, 'text-lg font-semibold mb-4']">
                Launched Tokens
            </h2>
            <div class="space-y-3">
                <div
                    v-for="token in launched_tokens"
                    :key="token.id"
                    :class="[ border, 'border rounded-lg p-4 flex items-center gap-4']"
                >
                    <div
                        class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        :style="{ backgroundColor: token.color }"
                    >
                        {{ token.symbol.slice(0, 2) }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div :class="[text, 'text-sm font-medium']">
                            {{ token.name }}
                        </div>
                        <div :class="[text_muted, 'text-xs']">
                            {{ token.symbol }} &middot; Supply:
                            {{ formatSupply(token.supply) }}
                        </div>
                    </div>
                    <span
                        class="text-xs px-2.5 py-1 rounded-full font-medium"
                        :class="statusBadge(token.status)"
                        >{{ token.status }}</span
                    >
                </div>

                <p
                    v-if="launched_tokens.length === 0"
                    :class="[text_muted, 'text-sm text-center py-4']"
                >
                    No tokens launched yet.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Rocket } from "lucide-vue-next"

const { text, text_muted, border, input_cls } = useTheme()

const color_options = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]

const token_form = reactive({
    name: "",
    symbol: "",
    supply: "",
    color: "#3b82f6",
    description: "",
    freeze_enabled: false,
})

const launched_tokens = ref([
    {
        id: 1,
        name: "DXS Token",
        symbol: "DXS",
        supply: 1000000000,
        color: "#3b82f6",
        status: "active",
    },
    {
        id: 2,
        name: "Wrapped BSV",
        symbol: "wBSV",
        supply: 21000000,
        color: "#f97316",
        status: "active",
    },
    {
        id: 3,
        name: "TestCoin",
        symbol: "TST",
        supply: 500000,
        color: "#8b5cf6",
        status: "pending",
    },
])

let next_token_id = 4

function createToken() {
    if (!token_form.name || !token_form.symbol || !token_form.supply) return
    launched_tokens.value.unshift({
        id: next_token_id++,
        name: token_form.name,
        symbol: token_form.symbol.toUpperCase(),
        supply: Number(token_form.supply),
        color: token_form.color,
        status: "pending",
    })
    token_form.name = ""
    token_form.symbol = ""
    token_form.supply = ""
    token_form.description = ""
    token_form.freeze_enabled = false
}

function formatSupply(value: number): string {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B"
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M"
    if (value >= 1_000) return (value / 1_000).toFixed(1) + "K"
    return value.toString()
}

function statusBadge(status: string): string {
    const badges: Record<string, string> = {
        active: "bg-green-500/20 text-green-400",
        pending: "bg-yellow-500/20 text-yellow-400",
        failed: "bg-red-500/20 text-red-400",
    }
    return badges[status] ?? "bg-gray-500/20 text-gray-400"
}
</script>
