<template>
    <aside class="tooltip-options" aria-label="Tooltip options">
        <h2>
            Options
        </h2>
        <label :for="textId">
            Tooltip text
        </label>
        <input
            :id="textId"
            v-model="text"
            v-tooltip:bottom="text"
            :aria-describedby="hintId"
            maxlength="240"
        />
        <p :id="hintId" class="help">
            Type while focused to update this field's tooltip. HTML is shown as text.
        </p>
        <label :for="placementId">
            Preferred placement
        </label>
        <select :id="placementId" v-model="placement">
            <option
                v-for="side in placements"
                :key="side"
                :value="side"
            >
                {{ side }}
            </option>
        </select>
        <label :for="delayId">
            Hover delay · {{ delay }} ms
        </label>
        <input
            :id="delayId"
            v-model.number="delay"
            type="range"
            min="0"
            max="1000"
            step="50"
        />
        <p class="help">
            Focus opens immediately. These options apply to the preview button.
        </p>
        <label class="checkbox-option">
            <input v-model="disabled" type="checkbox" />
            <span>
                Disable preview tooltip
            </span>
        </label>
        <label class="checkbox-option">
            <input v-model="mounted" type="checkbox" />
            <span>
                Mount preview trigger
            </span>
        </label>
        <p class="help">
            Unmounting removes its tooltip, listeners, observers and pending timers.
        </p>
    </aside>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import { vTooltip } from './tooltip';
import { placements } from './position';
import type { Placement } from './position';

const text = defineModel<string>('text', { required: true });
const placement = defineModel<Placement>('placement', { required: true });
const delay = defineModel<number>('delay', { required: true });
const disabled = defineModel<boolean>('disabled', { required: true });
const mounted = defineModel<boolean>('mounted', { required: true });
const textId = useId();
const hintId = useId();
const placementId = useId();
const delayId = useId();
</script>

<style scoped>
.tooltip-options {
    min-width: 0;
    padding: 26px;
    border-left: 1px solid var(--border);
}
h2 {
    margin: 0 0 24px;
    font-size: 16px;
    font-weight: 600;
}
label {
    display: block;
    margin: 20px 0 8px;
    font-size: 12px;
}
input:not([type='checkbox']),
select {
    width: 100%;
    min-width: 0;
    font-size: 12px;
    accent-color: var(--accent);
}
input:not([type]),
select {
    padding: 9px 10px;
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text);
    background: var(--surface);
}
.help {
    margin: 8px 0 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
.checkbox-option {
    display: flex;
    align-items: center;
    gap: 10px;
}
input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: var(--accent);
}
@container (max-width: 900px) {
    .tooltip-options {
        border-top: 1px solid var(--border);
        border-left: 0;
    }
}
</style>
