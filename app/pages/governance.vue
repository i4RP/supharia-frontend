<template>
    <div class="max-w-4xl mx-auto p-6 space-y-6">
        <h1 :class="[text, 'text-2xl font-bold']">Governance</h1>
        <p :class="text_muted">Vote on proposals and shape the future of DXS</p>

        <!-- Pool Selector -->
        <div>
            <label :class="[text_muted, 'text-xs block mb-1']"
                >Governance Pool</label
            >
            <select
                v-model="selected_pool"
                :class="input_cls"
                style="max-width: 300px"
            >
                <option
                    v-for="pool in governance_pools"
                    :key="pool.id"
                    :value="pool.id"
                >
                    {{ pool.name }}
                </option>
            </select>
        </div>

        <!-- Create Proposal -->
        <div :class="[border, 'border rounded-xl p-6']">
            <button
                class="flex items-center gap-2 text-sm font-medium transition-colors"
                :class="text"
                @click="show_create_form = !show_create_form"
            >
                <ChevronDown
                    :size="16"
                    class="transition-transform"
                    :class="show_create_form ? 'rotate-180' : ''"
                />
                <FileText :size="16" />
                Create Proposal
            </button>

            <div v-if="show_create_form" class="mt-4 space-y-4">
                <div>
                    <label :class="[text_muted, 'text-xs block mb-1']"
                        >Title</label
                    >
                    <input
                        v-model="proposal_form.title"
                        placeholder="Proposal title..."
                        :class="input_cls"
                    />
                </div>
                <div>
                    <label :class="[text_muted, 'text-xs block mb-1']"
                        >Description</label
                    >
                    <textarea
                        v-model="proposal_form.description"
                        placeholder="Describe your proposal..."
                        rows="4"
                        :class="input_cls"
                    />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label :class="[text_muted, 'text-xs block mb-1']"
                            >Voting Duration (days)</label
                        >
                        <input
                            v-model="proposal_form.duration"
                            type="number"
                            placeholder="7"
                            :class="input_cls"
                        />
                    </div>
                    <div>
                        <label :class="[text_muted, 'text-xs block mb-1']"
                            >Quorum (%)</label
                        >
                        <input
                            v-model="proposal_form.quorum"
                            type="number"
                            placeholder="50"
                            :class="input_cls"
                        />
                    </div>
                </div>
                <button
                    class="px-4 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                    @click="createProposal"
                >
                    Submit Proposal
                </button>
            </div>
        </div>

        <!-- Proposals List -->
        <div class="space-y-4">
            <h2 :class="[text, 'text-lg font-semibold']">Active Proposals</h2>

            <div
                v-for="proposal in pool_proposals"
                :key="proposal.id"
                :class="[border, 'border rounded-xl p-6 space-y-4']"
            >
                <div class="flex items-start justify-between">
                    <div>
                        <div :class="[text, 'text-sm font-semibold']">
                            {{ proposal.title }}
                        </div>
                        <div :class="[text_muted, 'text-xs mt-1']">
                            {{ proposal.description }}
                        </div>
                    </div>
                    <span
                        class="text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ml-3"
                        :class="statusBadge(proposal.status)"
                        >{{ proposal.status }}</span
                    >
                </div>

                <!-- Vote Progress -->
                <div class="space-y-2">
                    <div class="flex justify-between text-xs">
                        <span class="text-green-400"
                            >For: {{ proposal.votes_for }}</span
                        >
                        <span class="text-red-400"
                            >Against: {{ proposal.votes_against }}</span
                        >
                    </div>
                    <div
                        :class="[ border, 'w-full h-3 rounded-full border overflow-hidden flex']"
                    >
                        <div
                            class="h-full bg-green-500 transition-all"
                            :style="{ width: computeVotePercent( proposal.votes_for, proposal.votes_against) + '%', }"
                        />
                        <div
                            class="h-full bg-red-500 transition-all"
                            :style="{ width: 100 - computeVotePercent( proposal.votes_for, proposal.votes_against) + '%', }"
                        />
                    </div>
                    <div :class="[text_muted, 'text-xs']">
                        Quorum: {{ proposal.quorum }}% &middot; Ends:
                        {{ proposal.end_date }}
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2">
                    <button
                        v-if="proposal.status === 'active'"
                        class="px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                        @click="castVote(proposal.id, 'for')"
                    >
                        <ThumbsUp :size="14" class="inline mr-1" />
                        Vote For
                    </button>
                    <button
                        v-if="proposal.status === 'active'"
                        class="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        @click="castVote(proposal.id, 'against')"
                    >
                        <ThumbsDown :size="14" class="inline mr-1" />
                        Vote Against
                    </button>
                    <button
                        v-if="proposal.status === 'passed'"
                        class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        @click="executeProposal(proposal.id)"
                    >
                        <Play :size="14" class="inline mr-1" />
                        Execute
                    </button>
                </div>
            </div>

            <p
                v-if="pool_proposals.length === 0"
                :class="[text_muted, 'text-sm text-center py-4']"
            >
                No proposals for this pool.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ChevronDown, FileText, Play, ThumbsDown, ThumbsUp } from "lucide-vue-next"

const { text, text_muted, border, input_cls } = useTheme()

const selected_pool = ref("pool-1")
const show_create_form = ref(false)

const governance_pools = [
    { id: "pool-1", name: "DXS Main Pool" },
    { id: "pool-2", name: "Community Fund" },
    { id: "pool-3", name: "Development Pool" },
]

const proposal_form = reactive({
    title: "",
    description: "",
    duration: "",
    quorum: "",
})

const proposals = ref([
    {
        id: 1,
        pool_id: "pool-1",
        title: "Increase liquidity mining rewards by 15%",
        description: "Proposal to boost LP incentives to attract more liquidity providers to the platform.",
        votes_for: 1247,
        votes_against: 389,
        quorum: 50,
        status: "active",
        end_date: "2026-03-05",
    },
    {
        id: 2,
        pool_id: "pool-1",
        title: "Add wBTC/BSV trading pair",
        description: "Enable wrapped Bitcoin trading against BSV on the DEX.",
        votes_for: 2100,
        votes_against: 150,
        quorum: 40,
        status: "passed",
        end_date: "2026-02-20",
    },
    {
        id: 3,
        pool_id: "pool-2",
        title: "Fund community hackathon event",
        description: "Allocate 50,000 DXS tokens to sponsor a BSV developer hackathon.",
        votes_for: 820,
        votes_against: 430,
        quorum: 30,
        status: "active",
        end_date: "2026-03-10",
    },
    {
        id: 4,
        pool_id: "pool-3",
        title: "Upgrade smart contract engine to v2",
        description: "Migrate the execution layer to support sCrypt v2 contracts.",
        votes_for: 560,
        votes_against: 90,
        quorum: 60,
        status: "active",
        end_date: "2026-03-15",
    },
])

let next_proposal_id = 5

const pool_proposals = computed(() => proposals.value.filter((p) => p.pool_id === selected_pool.value))

function computeVotePercent(votes_for: number, votes_against: number): number {
    const total = votes_for + votes_against
    if (total === 0) return 50
    return Math.round((votes_for / total) * 100)
}

function castVote(proposal_id: number, vote: "for" | "against") {
    const proposal = proposals.value.find((p) => p.id === proposal_id)
    if (!proposal) return
    if (vote === "for") {
        proposal.votes_for += 1
    } else {
        proposal.votes_against += 1
    }
}

function executeProposal(proposal_id: number) {
    const proposal = proposals.value.find((p) => p.id === proposal_id)
    if (!proposal) return
    proposal.status = "executed"
}

function createProposal() {
    if (!proposal_form.title || !proposal_form.description) return
    proposals.value.unshift({
        id: next_proposal_id++,
        pool_id: selected_pool.value,
        title: proposal_form.title,
        description: proposal_form.description,
        votes_for: 0,
        votes_against: 0,
        quorum: Number(proposal_form.quorum) || 50,
        status: "active",
        end_date: "2026-03-25",
    })
    proposal_form.title = ""
    proposal_form.description = ""
    proposal_form.duration = ""
    proposal_form.quorum = ""
    show_create_form.value = false
}

function statusBadge(status: string): string {
    const badges: Record<string, string> = {
        active: "bg-green-500/20 text-green-400",
        passed: "bg-blue-500/20 text-blue-400",
        executed: "bg-purple-500/20 text-purple-400",
        rejected: "bg-red-500/20 text-red-400",
    }
    return badges[status] ?? "bg-gray-500/20 text-gray-400"
}
</script>
