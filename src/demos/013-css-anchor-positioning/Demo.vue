<template>
    <div class="anchor-demo">
        <div
            class="mode-bar"
            role="group"
            aria-label="Anchor positioning examples"
        >
            <button
                v-for="item in modes"
                :key="item.id"
                type="button"
                :aria-pressed="mode === item.id"
                @click="mode = item.id"
            >
                {{ item.label }}
            </button>
        </div>
        <div class="demo-layout">
            <section class="playground" aria-label="Anchor playground">
                <div class="preview-heading">
                    <h2>
                        {{ currentMode.label }}
                    </h2>
                    <span class="support-label" :class="{ unavailable: !available }">
                        {{ available ? 'Native CSS' : 'Unsupported API' }}
                    </span>
                </div>
                <p class="description">
                    {{ currentMode.description }}
                </p>
                <AnchorStage
                    v-if="available"
                    :key="mode"
                    v-model="settings"
                    :mode="mode"
                />
                <div
                    v-else
                    class="unsupported"
                    role="status"
                >
                    <p>
                        This browser does not support the APIs required by this example. Try a newer
                        browser; the CSS below is still available to inspect.
                    </p>
                </div>
                <p class="interaction-help">
                    Drag the blue anchor, or focus it and use arrow keys (Shift for a larger step).
                    The sliders also work with touch and keyboard.
                </p>
                <div class="concept-note">
                    <span class="eyebrow">
                        {{ mode === 'anchor' ? 'READ THE COORDINATES' : 'LET CSS PLACE IT' }}
                    </span>
                    <p v-if="mode === 'anchor'">
                        bottom: anchor(top) touches the anchor’s top edge. left: anchor(center)
                        starts at its horizontal center; it does not center the orange square.
                        Toggle centering to compare.
                    </p>
                    <p v-else-if="mode === 'area'">
                        position-area chooses a region around the anchor. When it overflows,
                        position-try-fallbacks can mirror the placement. The boundary here is the
                        dotted canvas. Without a fitting flip, default alignment can shift the card
                        over its anchor.
                    </p>
                    <p v-else>
                        Popover controls visibility, light dismissal and the top layer. Anchor
                        positioning controls placement. Press Escape or click outside to dismiss.
                        Fallbacks use the viewport, not the dotted canvas.
                    </p>
                </div>
            </section>
            <AnchorControls
                v-model="settings"
                :mode="mode"
                :support="support"
                @reset="reset"
            />
        </div>
        <AnchorCode :settings="settings" :mode="mode" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AnchorStage from './AnchorStage.vue';
import AnchorControls from './AnchorControls.vue';
import AnchorCode from './AnchorCode.vue';
import { createSettings, getSupport, modes, type AnchorMode } from './settings';

const mode = ref<AnchorMode>('anchor');
const settings = ref(createSettings());
const support = getSupport();
const currentMode = computed(() => modes.find((item) => item.id === mode.value)!);
const available = computed(
    () =>
        support.anchor &&
        (mode.value === 'anchor' || support.area) &&
        (mode.value !== 'popover' || support.popover),
);

function reset() {
    settings.value = createSettings();
    mode.value = 'anchor';
}
</script>

<style scoped>
.anchor-demo {
    color: var(--text);
    background: var(--surface);
}

.mode-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 14px 24px;
    border-bottom: 1px solid var(--border);
}

.mode-bar button {
    padding: 9px 12px;
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--secondary);
    font-size: 12px;
    cursor: pointer;
}

.mode-bar button[aria-pressed='true'] {
    border-color: var(--border);
    color: var(--accent);
    background: var(--accent-soft);
}

.mode-bar button:hover {
    background: var(--surface-hover);
}

.demo-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 260px;
}

.playground {
    min-width: 0;
    padding: 26px;
    background: var(--canvas);
}

.preview-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
}

h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 550;
}

.support-label {
    padding: 4px 7px;
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--accent);
    background: var(--surface);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 10px;
}

.support-label.unavailable {
    color: var(--secondary);
}

.description,
.interaction-help,
.concept-note p,
.unsupported p {
    color: var(--secondary);
    font-size: 12px;
    line-height: 1.8;
}

.description {
    min-height: 44px;
    margin: 14px 0 18px;
}

.interaction-help {
    margin: 14px 0 22px;
    font-size: 11px;
}

.concept-note {
    padding: 16px 18px;
    border: 1px solid var(--border);
    border-radius: 7px;
    background: var(--surface);
}

.concept-note span {
    color: var(--accent);
}

.concept-note p {
    margin: 8px 0 0;
    font-size: 11px;
}

.unsupported {
    display: grid;
    min-height: 360px;
    padding: 24px;
    place-items: center;
    border: 1px dashed var(--border);
    border-radius: 8px;
}

@container (max-width: 850px) {
    .demo-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}

@container (max-width: 480px) {
    .playground {
        padding: 18px;
    }

    .mode-bar {
        padding: 12px;
    }
}
</style>
