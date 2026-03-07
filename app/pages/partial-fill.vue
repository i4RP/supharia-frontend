<template>
    <div :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-6">
            <!-- Title -->
            <div>
                <h1 :class="text">Partial Fill</h1>
                <p :class="`text-sm ${text_muted} mt-1`">
                    Split large orders across multiple executions to reduce
                    price impact.
                </p>
            </div>

            <!-- Configure Trade -->
            <div class="space-y-3">
                <h2 :class="text">Configure Trade</h2>
                <div :class="`border ${border} rounded-2xl p-4 space-y-3`">
                    <!-- Pool Selector -->
                    <div>
                        <label :class="`text-xs ${text_muted} mb-1.5 block`"
                            >Pool</label
                        >
                        <select v-model="pool" :class="input_cls">
                            <option v-for="p in pool_options" :key="p">
                                {{ p }}
                            </option>
                        </select>
                    </div>

                    <!-- Amount -->
                    <div>
                        <label :class="`text-xs ${text_muted} mb-1.5 block`"
                            >Amount</label
                        >
                        <input
                            v-model="amount"
                            placeholder="0.00"
                            :class="input_cls"
                        />
                    </div>

                    <!-- Split Count Slider -->
                    <div>
                        <label :class="`text-xs ${text_muted} mb-1.5 block`">
                            Split Count: {{ splits }}
                        </label>
                        <input
                            v-model.number="splits"
                            type="range"
                            min="2"
                            max="10"
                            class="w-full accent-white"
                        />
                        <div
                            :class="`flex justify-between text-xs ${text_muted} mt-1`"
                        >
                            <span>2</span>
                            <span>10</span>
                        </div>
                    </div>

                    <!-- Execute Button -->
                    <button
                        class="w-full py-3 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                        @click="show_result = true"
                    >
                        <Layers :size="14" />
                        Execute Partial Fill
                    </button>
                </div>
            </div>

            <!-- Result -->
            <div v-if="show_result" class="space-y-3">
                <h2 :class="text">Result</h2>

                <!-- Summary Stats -->
                <div class="grid grid-cols-3 gap-3">
                    <div
                        v-for="stat in result_stats"
                        :key="stat.label"
                        :class="`rounded-xl p-3 border ${border} text-center`"
                    >
                        <p :class="`text-xs ${text_muted}`">{{ stat.label }}</p>
                        <p :class="`text-xs ${text} mt-1`">{{ stat.value }}</p>
                    </div>
                </div>

                <!-- Split Details -->
                <div class="space-y-2">
                    <div
                        v-for="(split, index) in mock_result.splits"
                        :key="index"
                        :class="`rounded-xl p-3 border ${border}`"
                    >
                        <div class="flex items-center justify-between mb-1">
                            <span :class="`text-xs ${text}`">
                                Split #{{ index + 1 }}: {{ split.input }} →
                                {{ split.output }}
                            </span>
                            <span class="text-xs text-green-400">{{
                                split.impact
                            }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span :class="`text-xs ${text_muted}`"
                                >Fee: {{ split.fee }}</span
                            >
                            <a
                                href="#"
                                class="text-xs text-white/50 flex items-center gap-1"
                            >
                                {{ split.txid }}
                                <ExternalLink :size="10" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ExternalLink, Layers } from "lucide-vue-next"

const { bg, border, text, text_muted, input_cls } = useTheme()

const pool = ref("BSV / DSTAS")
const amount = ref("")
const splits = ref(4)
const show_result = ref(false)

const pool_options = ["BSV / DSTAS", "BSV / wUSDC", "DSTAS / DXS"]

const mock_result = {
    total_input: "1.0000 BSV",
    total_output: "46.9842 DSTAS",
    total_fees: "0.4747 DSTAS",
    splits: [
        {
            input: "0.25 BSV",
            output: "11.7800 DSTAS",
            fee: "0.1180",
            impact: "0.03%",
            txid: "a1b2c3d4e5f6...0001",
        },
        {
            input: "0.25 BSV",
            output: "11.7630 DSTAS",
            fee: "0.1180",
            impact: "0.05%",
            txid: "a1b2c3d4e5f6...0002",
        },
        {
            input: "0.25 BSV",
            output: "11.7450 DSTAS",
            fee: "0.1180",
            impact: "0.07%",
            txid: "a1b2c3d4e5f6...0003",
        },
        {
            input: "0.25 BSV",
            output: "11.6962 DSTAS",
            fee: "0.1180",
            impact: "0.09%",
            txid: "a1b2c3d4e5f6...0004",
        },
    ],
}

const result_stats = [
    { label: "Total Input", value: mock_result.total_input },
    { label: "Total Output", value: mock_result.total_output },
    { label: "Total Fees", value: mock_result.total_fees },
]
</script>
