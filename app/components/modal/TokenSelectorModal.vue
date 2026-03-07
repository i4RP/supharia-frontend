<template>
    <Teleport to="body">
        <div
            v-if="modelValue"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            @click.self="closeModal()"
        >
            <div
                :class="[ modal_bg, 'rounded-2xl border', border, 'w-full max-w-sm shadow-2xl']"
            >
                <!-- Header -->
                <div
                    :class="[ 'flex items-center justify-between p-4 border-b', border]"
                >
                    <h2 :class="['text-sm', text]">Select Token</h2>
                    <button
                        :class="[ text_muted, 'hover:text-gray-100 transition-colors']"
                        @click="closeModal()"
                    >
                        <X :size="18" />
                    </button>
                </div>

                <!-- Search -->
                <div class="p-4">
                    <div class="relative">
                        <SearchIcon
                            :size="14"
                            :class="[ 'absolute left-3 top-1/2 -translate-y-1/2', text_muted]"
                        />
                        <input
                            :value="search_query"
                            type="text"
                            placeholder="Search by name or symbol..."
                            :class="[input_cls, 'pl-9']"
                            @input="handleSearchInput"
                        />
                    </div>
                </div>

                <!-- Token List -->
                <div class="max-h-[320px] overflow-y-auto">
                    <div
                        v-if="filtered_tokens.length === 0"
                        :class="['text-center py-8 text-sm', text_muted]"
                    >
                        No tokens found
                    </div>
                    <button
                        v-for="token in filtered_tokens"
                        :key="token.symbol"
                        class="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                        :class="[hover_bg]"
                        @click="handleSelect(token)"
                    >
                        <div
                            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            :style="{ backgroundColor: token.color }"
                        >
                            {{ token.symbol.slice(0, 2) }}
                        </div>
                        <div class="text-left flex-1 min-w-0">
                            <p :class="['text-sm truncate', text]">
                                {{ token.symbol }}
                            </p>
                            <p :class="['text-xs truncate', text_muted]">
                                {{ token.name }}
                            </p>
                        </div>
                        <div
                            v-if="token.balance !== undefined"
                            :class="['text-xs tabular-nums', text_muted]"
                        >
                            {{ token.balance }}
                        </div>
                    </button>
                </div>

                <!-- Footer -->
                <div :class="['px-4 py-3 border-t text-center', border]">
                    <p :class="['text-xs', text_muted]">
                        {{ filtered_tokens.length }} token{{
                            filtered_tokens.length !== 1 ? "s" : ""
                        }}
                        available
                    </p>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { Search as SearchIcon, X } from "lucide-vue-next"
import { TOKENS_FULL } from "~/constants/tokens"
import type { Token } from "~/types/token"

defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits<{
    "update:modelValue": [value: boolean]
    select: [token: Token]
}>()

const { is_dark, border, text, text_muted, hover_bg, input_cls } = useTheme()

const search_query = ref("")

const modal_bg = computed(() => (is_dark.value ? "bg-[#0a0a0a]" : "bg-white"))

const filtered_tokens = computed(() => {
    const query = search_query.value.toLowerCase().trim()
    if (!query) {
        return TOKENS_FULL
    }
    return TOKENS_FULL.filter(
        (token) => token.symbol.toLowerCase().includes(query) || token.name.toLowerCase().includes(query),
    )
})

function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement
    search_query.value = target.value
}

function handleSelect(token: Token) {
    emit("select", token)
    closeModal()
}

function closeModal() {
    search_query.value = ""
    emit("update:modelValue", false)
}
</script>
