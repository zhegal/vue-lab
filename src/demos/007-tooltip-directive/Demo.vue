<template>
    <div class="tooltip-demo">
        <div class="tooltip-layout">
            <section class="playground" aria-label="Tooltip playground">
                <h2>
                    Hover and focus
                </h2>
                <p class="help">
                    Hover over a trigger or reach it with Tab. Move onto the tooltip to keep it
                    open. Esc dismisses it without moving focus; leave and return to open it again.
                </p>
                <div class="preview">
                    <button
                        v-if="mounted"
                        v-tooltip:[placement]="{ text, delay, disabled }"
                        class="button primary"
                        type="button"
                    >
                        Preview tooltip
                    </button>
                    <p v-else class="help">
                        Preview trigger unmounted
                    </p>
                </div>
                <h3>
                    Preferred placement
                </h3>
                <div class="placement-buttons">
                    <button
                        v-for="side in placements"
                        :key="side"
                        v-tooltip:[side]="
                            `Preferred ${side}. Keep the pointer here or on this tooltip.`
                        "
                        class="button secondary"
                        type="button"
                    >
                        {{ side }}
                    </button>
                </div>
                <TooltipBoundaryLab />
            </section>
            <TooltipOptions
                v-model:text="text"
                v-model:placement="placement"
                v-model:delay="delay"
                v-model:disabled="disabled"
                v-model:mounted="mounted"
            />
        </div>
        <p class="footnote">
            Tooltips provide extra descriptions. Each trigger keeps its visible label; links and
            buttons belong in a popover or dialog, rather than inside a tooltip.
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { vTooltip } from './tooltip';
import { placements } from './position';
import type { Placement } from './position';
import TooltipOptions from './TooltipOptions.vue';
import TooltipBoundaryLab from './TooltipBoundaryLab.vue';

const text = ref('Additional information for this control.');
const placement = ref<Placement>('top');
const delay = ref(350);
const disabled = ref(false);
const mounted = ref(true);
</script>

<style scoped>
.tooltip-demo {
    color: var(--text);
    background: var(--surface);
}
.tooltip-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
}
.playground {
    min-width: 0;
    padding: 26px;
}
h2 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 600;
}
h3 {
    margin: 0 0 12px;
    font-size: 13px;
    font-weight: 600;
}
.help {
    margin: 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
.preview {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 130px;
    margin: 22px 0;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--canvas);
}
.placement-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.placement-buttons button {
    min-width: 70px;
    text-transform: capitalize;
}
.footnote {
    margin: 0;
    padding: 18px 26px;
    border-top: 1px solid var(--border);
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
@container (max-width: 900px) {
    .tooltip-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
@container (max-width: 600px) {
    .playground {
        padding: 20px;
    }
}
</style>
