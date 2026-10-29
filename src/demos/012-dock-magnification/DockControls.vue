<template>
    <aside class="dock-controls" aria-label="Dock settings">
        <h2>
            Motion settings
        </h2>
        <div
            v-for="range in ranges"
            :key="range.key"
            class="range-control"
        >
            <label :for="`${id}-${range.key}`">
                {{ range.label }}
                <output :for="`${id}-${range.key}`">
                    {{ settings[range.key] }}{{ range.unit }}
                </output>
            </label>
            <input
                :id="`${id}-${range.key}`"
                :value="settings[range.key]"
                type="range"
                :min="range.min"
                :max="range.max"
                :step="range.step"
                @input="update(range.key, Number(($event.target as HTMLInputElement).value))"
            />
            <p>
                {{ range.help }}
            </p>
        </div>
        <label class="animation-toggle" :for="`${id}-animated`">
            <span>
                Animate changes
            </span>
            <input
                :id="`${id}-animated`"
                :checked="settings.animated"
                type="checkbox"
                role="switch"
                @change="update('animated', ($event.target as HTMLInputElement).checked)"
            />
        </label>
        <p class="control-note">
            Turn off to inspect the distance curve without spring smoothing or click bounce.
        </p>
        <button
            class="button secondary reset-button"
            type="button"
            @click="$emit('reset')"
        >
            Reset settings
        </button>
        <p class="motion-note">
            Reduced-motion preferences keep the icons at their resting size and disable click
            bounce.
        </p>
    </aside>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import type { DockSettings } from './settings';

const settings = defineModel<DockSettings>({ required: true });
defineEmits<{ reset: [] }>();
const id = useId();
const ranges = [
    {
        key: 'size',
        label: 'Icon size',
        min: 40,
        max: 64,
        step: 1,
        unit: 'px',
        help: 'Resting size before the dock adapts to its container.',
    },
    {
        key: 'magnification',
        label: 'Magnification',
        min: 1,
        max: 2.4,
        step: 0.1,
        unit: '×',
        help: 'Maximum size at the center of the influence curve.',
    },
    {
        key: 'radius',
        label: 'Influence radius',
        min: 80,
        max: 240,
        step: 5,
        unit: 'px',
        help: 'How far the effect reaches across neighboring icons.',
    },
] as const;

function update<K extends keyof DockSettings>(key: K, value: DockSettings[K]) {
    settings.value = { ...settings.value, [key]: value };
}
</script>

<style scoped>
.dock-controls {
    min-width: 0;
    padding: 30px 24px;
    border-left: 1px solid var(--border);
}

h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 550;
    letter-spacing: -0.02em;
}

.range-control {
    margin-top: 28px;
}

.range-control label,
.animation-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
}

output {
    padding: 3px 7px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--canvas);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 10px;
}

input[type='range'] {
    display: block;
    width: 100%;
    margin: 16px 0 0;
    accent-color: var(--accent);
    cursor: pointer;
}

.range-control p,
.control-note,
.motion-note {
    margin: 10px 0 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}

.animation-toggle {
    margin-top: 26px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
    cursor: pointer;
}

.animation-toggle input {
    width: 18px;
    height: 18px;
    margin: 0;
    accent-color: var(--accent);
}

.reset-button {
    width: 100%;
    margin-top: 24px;
}

.motion-note {
    margin-top: 24px;
    color: var(--muted);
    font-size: 10px;
}

@container (max-width: 960px) {
    .dock-controls {
        border-top: 1px solid var(--border);
        border-left: 0;
    }
}
</style>
