<template>
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
        <div
            :class="[ modal_bg, 'rounded-2xl border', border, 'w-full max-w-lg shadow-2xl']"
        >
            <div class="p-6">
                <!-- Header -->
                <div class="flex items-center gap-3 mb-5">
                    <div
                        class="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center"
                    >
                        <Shield :size="20" class="text-white" />
                    </div>
                    <div>
                        <h2 :class="text">Terms of Service</h2>
                        <p :class="['text-xs', text_muted]">
                            Please read before using DXS Swap
                        </p>
                    </div>
                </div>

                <!-- Progress -->
                <div class="flex gap-1 mb-5">
                    <div
                        v-for="(_, index) in total_steps"
                        :key="index"
                        class="h-1 flex-1 rounded-full transition-colors"
                        :class="index <= current_step ? 'bg-white' : is_dark ? 'bg-[#1a1a1a]' : 'bg-gray-200'"
                    />
                </div>

                <!-- Section Content -->
                <div v-if="!is_final_step">
                    <div
                        :class="[ card_bg, 'rounded-xl p-4 border mb-5 min-h-[140px]', border]"
                    >
                        <h3 :class="['text-sm mb-2', text]">
                            {{ TOS_SECTIONS[current_step].title }}
                        </h3>
                        <p :class="['text-sm leading-relaxed', text_muted]">
                            {{ TOS_SECTIONS[current_step].content }}
                        </p>
                    </div>
                    <div class="flex gap-3">
                        <button
                            :class="[ 'flex-1 py-2.5 rounded-xl border text-sm transition-colors hover:bg-[#111]', border, text_muted]"
                            @click="handleBack()"
                        >
                            {{ current_step === 0 ? "Skip" : "Back" }}
                        </button>
                        <button
                            class="flex-1 py-2.5 bg-white hover:bg-white/90 text-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                            @click="current_step++"
                        >
                            Next
                            <ChevronRight :size="14" />
                        </button>
                    </div>
                </div>

                <!-- Final Agreement Step -->
                <div v-else>
                    <div
                        :class="[card_bg, 'rounded-xl p-4 border mb-4', border]"
                    >
                        <p :class="['text-sm leading-relaxed', text_muted]">
                            By clicking "I Agree", you confirm that you have
                            read, understood, and agree to the DXS Swap Terms of
                            Service and understand the risks involved.
                        </p>
                    </div>
                    <label class="flex items-start gap-3 mb-5 cursor-pointer">
                        <input
                            type="checkbox"
                            :checked="checkbox_agreed"
                            class="mt-0.5 accent-white"
                            @change="handleCheckboxChange"
                        />
                        <span :class="['text-sm', text_muted]">
                            I confirm I am of legal age and understand the risks
                            of decentralized trading.
                        </span>
                    </label>
                    <div class="flex gap-3">
                        <button
                            :class="[ 'flex-1 py-2.5 rounded-xl border text-sm hover:bg-[#111] transition-colors', border, text_muted]"
                            @click="current_step--"
                        >
                            Back
                        </button>
                        <button
                            :disabled="!checkbox_agreed"
                            class="flex-1 py-2.5 rounded-xl text-sm transition-colors"
                            :class="checkbox_agreed ? 'bg-white hover:bg-white/90 text-black' : 'bg-white/10 text-white/30 cursor-not-allowed'"
                            @click="handleAgree()"
                        >
                            I Agree to the Terms
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ChevronRight, Shield } from "lucide-vue-next"
import { TOS_SECTIONS } from "~/constants/tos"

const app_store = useAppStore()
const { is_dark, border, text, text_muted } = useTheme()

const current_step = ref(0)
const checkbox_agreed = ref(false)

const total_steps = computed(() => TOS_SECTIONS.length + 1)
const is_final_step = computed(() => current_step.value === TOS_SECTIONS.length)
const modal_bg = computed(() => (is_dark.value ? "bg-[#0a0a0a]" : "bg-white"))
const card_bg = computed(() => (is_dark.value ? "bg-black" : "bg-gray-50"))

function handleBack() {
    if (current_step.value > 0) {
        current_step.value--
    }
}

function handleCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement
    checkbox_agreed.value = target.checked
}

function handleAgree() {
    if (checkbox_agreed.value) {
        app_store.agreeToS()
    }
}
</script>
