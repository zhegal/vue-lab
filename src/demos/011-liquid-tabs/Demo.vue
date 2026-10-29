<template>
    <div class="liquid-demo">
        <section class="tabs-preview" aria-label="Liquid tabs playground">
            <div class="preview-heading">
                <h2>
                    Liquid tabs
                </h2>
                <span>
                    {{ tabs.length }} tabs
                </span>
            </div>
            <OverflowTabs
                v-if="overflowMenu"
                :id="id"
                v-model="activeId"
                :tabs="tabs"
            />
            <LiquidTabs
                v-else
                :id="id"
                v-model="activeId"
                :tabs="tabs"
            />
            <div
                :id="`${id}-panel`"
                class="selection-panel"
                role="tabpanel"
                :aria-labelledby="`${id}-tab-${activeId}`"
                tabindex="0"
            >
                <span class="eyebrow">
                    Selected tab
                </span>
                <p>
                    {{ activeTab?.label }}
                </p>
            </div>
            <p class="preview-help">
                Click between nearby and distant tabs to compare the stretch. Use ← / →, Home or End
                when a tab is focused.
            </p>
        </section>
        <aside class="tab-controls" aria-label="Manage example tabs">
            <label class="overflow-toggle" :for="`${id}-overflow-mode`">
                <span>
                    Overflow menu
                </span>
                <input
                    :id="`${id}-overflow-mode`"
                    v-model="overflowMenu"
                    type="checkbox"
                    role="switch"
                />
            </label>
            <p class="control-help overflow-help">
                {{
                    overflowMenu
                        ? 'Hidden tabs open in the » menu. Selection flows between the two panels.'
                        : 'Tabs scroll horizontally when the pill fills up.'
                }}
            </p>
            <h2>
                Add a tab
            </h2>
            <form @submit.prevent="addTab">
                <label :for="`${id}-label`">
                    Tab label
                </label>
                <input
                    :id="`${id}-label`"
                    ref="labelInput"
                    v-model="label"
                    type="text"
                    placeholder="e.g. Activity log"
                    autocomplete="off"
                />
                <button
                    class="button primary"
                    type="submit"
                    :disabled="!label.trim()"
                >
                    Add tab
                </button>
            </form>
            <p class="control-help">
                New tabs are selected automatically. Add a few to try the overflow behavior.
            </p>
            <TabOrder v-model="tabs" :active-id="activeId" />
            <button
                class="button secondary reset-button"
                type="button"
                @click="reset"
            >
                Reset tabs
            </button>
            <p class="motion-note">
                The capsule stretches with its speed and settles to the selected tab’s width.
                Reduced-motion preferences disable animation.
            </p>
        </aside>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import LiquidTabs from './LiquidTabs.vue';
import OverflowTabs from './OverflowTabs.vue';
import TabOrder from './TabOrder.vue';
import type { LiquidTab } from './types';

const id = useId();
const defaults = ['Overview', 'Projects', 'Activity', 'Team', 'Settings'];
const createTabs = (): LiquidTab[] =>
    defaults.map((label, index) => ({ id: `default-${index}`, label }));
const tabs = ref(createTabs());
const activeId = ref(tabs.value[0]!.id);
const label = ref('');
const overflowMenu = ref(false);
const labelInput = ref<HTMLInputElement | null>(null);
const activeTab = computed(() => tabs.value.find((tab) => tab.id === activeId.value));
let sequence = 0;

function addTab() {
    const text = label.value.trim();
    if (!text) return;
    const tab = { id: `custom-${++sequence}`, label: text };
    tabs.value.push(tab);
    activeId.value = tab.id;
    label.value = '';
    labelInput.value?.focus({ preventScroll: true });
}

function reset() {
    tabs.value = createTabs();
    activeId.value = tabs.value[0]!.id;
    label.value = '';
}
</script>

<style scoped>
.liquid-demo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 280px;
    color: var(--text);
    background: var(--surface);
}

.tabs-preview {
    min-width: 0;
    padding: 32px clamp(18px, 3vw, 44px);
    background: var(--canvas);
}

.preview-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 32px;
}

h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 550;
    letter-spacing: -0.02em;
}

.preview-heading > span {
    color: var(--muted);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 10px;
}

.selection-panel {
    display: grid;
    align-content: center;
    min-height: 190px;
    margin-top: 24px;
    padding: 24px;
    border: 1px dashed var(--border);
    border-radius: 12px;
    text-align: center;
}

.selection-panel > span {
    color: var(--muted);
}

.selection-panel p {
    margin: 12px 0 0;
    font-size: 26px;
    font-weight: 550;
    letter-spacing: -0.035em;
    overflow-wrap: anywhere;
}

.preview-help,
.control-help,
.motion-note {
    margin: 18px 0 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}

.tab-controls {
    min-width: 0;
    padding: 32px 24px;
    border-left: 1px solid var(--border);
}

form {
    display: grid;
    gap: 10px;
    margin-top: 24px;
}

label {
    font-size: 12px;
}

input {
    min-width: 0;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    background: var(--surface);
    font-size: 12px;
}

.overflow-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    cursor: pointer;
}

.overflow-toggle input {
    width: 18px;
    height: 18px;
    margin: 0;
    padding: 0;
    accent-color: var(--accent);
    cursor: pointer;
}

.overflow-help {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
}

button:disabled {
    opacity: 0.4;
    cursor: default;
}

.reset-button {
    width: 100%;
    margin-top: 24px;
}

.motion-note {
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    color: var(--muted);
    font-size: 10px;
}

@container (max-width: 900px) {
    .liquid-demo {
        grid-template-columns: minmax(0, 1fr);
    }

    .tab-controls {
        border-top: 1px solid var(--border);
        border-left: 0;
    }
}
</style>
