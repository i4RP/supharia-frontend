<template>
    <div :class="`min-h-screen ${bg} py-6 pb-20 md:pb-6`">
        <div class="max-w-4xl w-full mx-auto px-4 space-y-6">
            <!-- Title -->
            <div>
                <h1 :class="text">Routing</h1>
                <p :class="`text-sm ${text_muted} mt-1`">
                    Find optimal multi-hop swap routes using Dijkstra algorithm.
                </p>
            </div>

            <!-- Route Query -->
            <div class="space-y-3">
                <h2 :class="text">Find Route</h2>
                <div :class="`border ${border} rounded-2xl p-4 space-y-3`">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label
                                :class="`text-xs ${text_muted} mb-1.5 block`"
                            >
                                Input Token ID / Symbol
                            </label>
                            <input
                                v-model="input_token"
                                placeholder="BSV"
                                :class="input_cls"
                            />
                        </div>
                        <div>
                            <label
                                :class="`text-xs ${text_muted} mb-1.5 block`"
                            >
                                Output Token ID / Symbol
                            </label>
                            <input
                                v-model="output_token"
                                placeholder="DXS"
                                :class="input_cls"
                            />
                        </div>
                    </div>
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
                    <button
                        class="w-full py-3 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                        @click="show_route = true"
                    >
                        <GitBranch :size="14" />
                        Find Best Route
                    </button>
                </div>
            </div>

            <!-- Route Result -->
            <div v-if="show_route" class="space-y-3">
                <h2 :class="text">Best Route Found</h2>

                <!-- Route Stats -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div
                        v-for="stat in route_stats"
                        :key="stat.label"
                        :class="`rounded-xl p-3 border ${border} text-center`"
                    >
                        <p :class="`text-xs ${text_muted}`">{{ stat.label }}</p>
                        <p :class="`text-xs ${text} mt-1`">{{ stat.value }}</p>
                    </div>
                </div>

                <!-- Route Path Visualization -->
                <div
                    :class="`rounded-xl p-4 border ${border} flex items-center justify-center flex-wrap gap-2`"
                >
                    <div
                        v-for="(token, index) in mock_route.path"
                        :key="index"
                        class="flex items-center gap-2"
                    >
                        <div
                            class="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                            :style="{ borderColor: getTokenColor(token), backgroundColor: `${getTokenColor(token)}20`, }"
                        >
                            <div
                                class="w-4 h-4 rounded-full"
                                :style="{ backgroundColor: getTokenColor(token), }"
                            />
                            <span
                                class="text-xs"
                                :style="{ color: getTokenColor(token) }"
                            >
                                {{ token }}
                            </span>
                        </div>
                        <ArrowRight
                            v-if="index < mock_route.path.length - 1"
                            :size="14"
                            :class="text_muted"
                        />
                    </div>
                </div>

                <!-- Hop Details -->
                <div class="space-y-2">
                    <div
                        v-for="(hop, index) in mock_route.hops"
                        :key="index"
                        :class="`rounded-xl p-3 border ${border}`"
                    >
                        <div class="flex items-center gap-2 mb-2">
                            <span :class="`text-xs ${text_muted}`"
                                >Hop {{ index + 1 }}</span
                            >
                            <span :class="`text-xs ${text}`"
                                >{{ hop.from }} → {{ hop.to }}</span
                            >
                        </div>
                        <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div
                                v-for="field in getHopFields(hop)"
                                :key="field.label"
                                class="flex justify-between"
                            >
                                <span :class="`text-xs ${text_muted}`">{{
                                    field.label
                                }}</span>
                                <span :class="`text-xs ${text}`">{{
                                    field.value
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ArrowRight, GitBranch } from "lucide-vue-next"
import { TOKEN_COLORS } from "~/constants/tokens"

const { bg, border, text, text_muted, input_cls } = useTheme()

const input_token = ref("BSV")
const output_token = ref("DXS")
const amount = ref("")
const show_route = ref(false)

const mock_route = {
    total_input: "1.0000 BSV",
    total_output: "23.4521 DXS",
    total_fees: "0.4713 DXS",
    price_impact: "0.21%",
    path: ["BSV", "DSTAS", "DXS"],
    hops: [
        {
            from: "BSV",
            to: "DSTAS",
            input_amt: "1.0000 BSV",
            output_amt: "47.2300 DSTAS",
            pool: "pool_bsv_dstas",
            fee: "0.4723 DSTAS",
            impact: "0.12%",
        },
        {
            from: "DSTAS",
            to: "DXS",
            input_amt: "47.2300 DSTAS",
            output_amt: "23.4521 DXS",
            pool: "pool_dstas_dxs",
            fee: "0.2345 DXS",
            impact: "0.09%",
        },
    ],
}

const route_stats = [
    { label: "Total Input", value: mock_route.total_input },
    { label: "Total Output", value: mock_route.total_output },
    { label: "Total Fees", value: mock_route.total_fees },
    { label: "Price Impact", value: mock_route.price_impact },
]

interface RouteHop {
    from: string
    to: string
    input_amt: string
    output_amt: string
    pool: string
    fee: string
    impact: string
}

function getTokenColor(symbol: string): string {
    return TOKEN_COLORS[symbol] || "#6366f1"
}

function getHopFields(hop: RouteHop) {
    return [
        { label: "Input", value: hop.input_amt },
        { label: "Output", value: hop.output_amt },
        { label: "Pool", value: hop.pool },
        { label: "Fee", value: hop.fee },
        { label: "Price Impact", value: hop.impact },
    ]
}
</script>
