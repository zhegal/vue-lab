<template>
    <aside class="card-controls" aria-label="Card settings">
        <div class="controls-heading">
            <h2>
                Card settings
            </h2>
        </div>
        <fieldset class="color-control">
            <legend>
                Background
            </legend>
            <div class="color-swatches">
                <button
                    v-for="color in colorPresets"
                    :key="color"
                    type="button"
                    class="color-swatch"
                    :class="{ selected: settings.color === color }"
                    :style="{ backgroundColor: color }"
                    :aria-label="`Set background to ${color}`"
                    :aria-pressed="settings.color === color"
                    @click="update('color', color)"
                ></button>
            </div>
            <label class="custom-color">
                <span>
                    Custom color
                </span>
                <span class="color-value">
                    {{ settings.color.toUpperCase() }}
                </span>
                <input
                    :value="settings.color"
                    type="color"
                    aria-label="Custom background color"
                    @input="update('color', ($event.target as HTMLInputElement).value)"
                />
            </label>
        </fieldset>
        <div
            v-for="control in ranges"
            :key="control.key"
            class="range-control"
        >
            <label :for="`welcome-${control.key}`">
                {{ control.label }}
                <output :for="`welcome-${control.key}`">
                    {{ settings[control.key] }}{{ control.unit }}
                </output>
            </label>
            <input
                :id="`welcome-${control.key}`"
                :value="settings[control.key]"
                type="range"
                :min="control.min"
                :max="control.max"
                @input="update(control.key, Number(($event.target as HTMLInputElement).value))"
            />
            <div class="range-labels" aria-hidden="true">
                <span>
                    {{ control.start }}
                </span>
                <span>
                    {{ control.end }}
                </span>
            </div>
        </div>
        <button
            class="reset-button"
            type="button"
            @click="$emit('reset')"
        >
            <span aria-hidden="true">
                ↺
            </span>
            Reset to defaults
        </button>
    </aside>
</template>

<script setup lang="ts">
import { colorPresets } from './settings';
import type { CardSettings } from './settings';

const settings = defineModel<CardSettings>({ required: true });
defineEmits<{ reset: [] }>();

const ranges = [
    {
        key: 'radius',
        label: 'Corner radius',
        min: 0,
        max: 56,
        unit: 'px',
        start: 'Sharp',
        end: 'Rounded',
    },
    {
        key: 'size',
        label: 'Card size',
        min: 220,
        max: 360,
        unit: 'px',
        start: 'Compact',
        end: 'Spacious',
    },
    { key: 'shadow', label: 'Shadow', min: 0, max: 60, unit: '', start: 'Flat', end: 'Floating' },
] as const;

function update<K extends keyof CardSettings>(key: K, value: CardSettings[K]) {
    settings.value = { ...settings.value, [key]: value };
}
</script>

<style scoped>
.card-controls {
    padding: 30px 26px;
    border-left: 1px solid var(--border);
}

.controls-heading h2 {
    margin: 0 0 7px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.025em;
}

.color-control {
    margin: 29px 0 24px;
    padding: 0;
    border: 0;
}

.color-control legend,
.range-control label {
    margin-bottom: 13px;
    font-size: 12px;
    font-weight: 550;
}

.color-swatches {
    display: flex;
    gap: 10px;
}

.color-swatch {
    width: 32px;
    height: 32px;
    border: 3px solid var(--surface);
    border-radius: 50%;
    outline: 1px solid transparent;
    cursor: pointer;
}

.color-swatch.selected {
    outline-color: var(--text);
}

.custom-color {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    color: var(--muted);
    font-size: 10px;
}

.color-value {
    margin-left: auto;
    font-family: 'SFMono-Regular', Consolas, monospace;
}

.custom-color input {
    width: 24px;
    height: 24px;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 5px;
    cursor: pointer;
}

.range-control {
    margin-top: 24px;
}

.range-control label,
.range-labels {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.range-control output {
    padding: 3px 7px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--canvas);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 10px;
    font-weight: 400;
}

.range-control input {
    display: block;
    width: 100%;
    height: 4px;
    margin: 0;
    accent-color: var(--accent);
    cursor: pointer;
}

.range-labels {
    margin-top: 10px;
    color: var(--muted);
    font-size: 10px;
}

.reset-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    margin-top: 29px;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 11px;
    cursor: pointer;
}

.reset-button:hover {
    background: var(--surface-hover);
}

.reset-button span {
    font-size: 17px;
    line-height: 1;
}

@container (max-width: 760px) {
    .card-controls {
        border-top: 1px solid var(--border);
        border-left: 0;
    }
}
</style>
