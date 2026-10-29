<template>
    <aside class="controls" aria-label="Anchor settings">
        <div class="control-heading">
            <h2>
                Settings
            </h2>
            <button type="button" @click="$emit('reset')">
                Reset
            </button>
        </div>
        <div class="sliders">
            <label
                v-for="control in sliders"
                :key="control.key"
                :for="`${id}-${control.key}`"
            >
                <span>
                    {{ control.label }}
                    <output :for="`${id}-${control.key}`">
                        {{ Math.round(settings[control.key]) }}{{ control.unit }}
                    </output>
                </span>
                <input
                    :id="`${id}-${control.key}`"
                    type="range"
                    :value="settings[control.key]"
                    :min="control.min"
                    :max="control.max"
                    @input="updateNumber(control.key, $event)"
                />
            </label>
        </div>
        <label v-if="mode === 'anchor'" class="checkbox">
            <input
                type="checkbox"
                :checked="settings.centered"
                @change="update('centered', !settings.centered)"
            />
            <span>
                Center the orange square
            </span>
        </label>
        <template v-else>
            <fieldset>
                <legend>
                    position-area
                </legend>
                <div class="area-grid">
                    <button
                        v-for="area in areas"
                        :key="area.value"
                        type="button"
                        :aria-label="`Place at ${area.value}`"
                        :aria-pressed="settings.area === area.value"
                        :title="area.value"
                        @click="update('area', area.value)"
                    >
                        {{ area.label }}
                    </button>
                </div>
                <p class="area-value">
                    {{ settings.area }}
                </p>
            </fieldset>
            <label class="checkbox">
                <input
                    type="checkbox"
                    :checked="settings.flip"
                    :disabled="!support.flip"
                    @change="update('flip', !settings.flip)"
                />
                <span>
                    Flip to avoid overflow{{ support.flip ? '' : ' (unsupported)' }}
                </span>
            </label>
            <label class="checkbox">
                <input
                    type="checkbox"
                    :checked="settings.matchWidth"
                    :disabled="!support.size"
                    @change="update('matchWidth', !settings.matchWidth)"
                />
                <span>
                    Match anchor width{{ support.size ? '' : ' (unsupported)' }}
                </span>
            </label>
        </template>
        <p class="control-note">
            {{
                mode === 'anchor'
                    ? 'The original example has no overflow protection. Move it near the top edge.'
                    : 'Try the corners with flipping on and off. If no position fits, CSS uses ' +
                        'the original placement. Center overlaps the anchor and cannot flip.'
            }}
        </p>
        <p class="control-note">
            JavaScript moves only the blue anchor. The browser positions the attached element.
        </p>
    </aside>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import { areas, type AnchorMode, type AnchorSettings, type getSupport } from './settings';

const settings = defineModel<AnchorSettings>({ required: true });
defineProps<{ mode: AnchorMode; support: ReturnType<typeof getSupport> }>();
defineEmits<{ reset: [] }>();
const id = useId();
type NumberSetting = 'x' | 'y' | 'width' | 'gap';
const sliders: {
    key: NumberSetting;
    label: string;
    min: number;
    max: number;
    unit: string;
}[] = [
    { key: 'x', label: 'Horizontal position', min: 0, max: 100, unit: '%' },
    { key: 'y', label: 'Vertical position', min: 0, max: 100, unit: '%' },
    { key: 'width', label: 'Anchor width', min: 96, max: 240, unit: 'px' },
    { key: 'gap', label: 'Gap', min: 0, max: 32, unit: 'px' },
];

function update<K extends keyof AnchorSettings>(key: K, value: AnchorSettings[K]) {
    settings.value = { ...settings.value, [key]: value };
}

function updateNumber(key: NumberSetting, event: Event) {
    update(key, Number((event.target as HTMLInputElement).value));
}
</script>

<style scoped>
.controls {
    min-width: 0;
    padding: 26px 22px;
    border-left: 1px solid var(--border);
}

.control-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 28px;
}

h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 550;
}

.control-heading button {
    padding: 4px 0;
    color: var(--accent);
    font-size: 11px;
    cursor: pointer;
}

.sliders {
    display: grid;
    gap: 24px;
}

.sliders label > span {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 11px;
}

output {
    color: var(--secondary);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 10px;
}

input[type='range'] {
    width: 100%;
    margin: 14px 0 0;
    accent-color: var(--accent);
    cursor: pointer;
}

.checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 22px;
    font-size: 11px;
    line-height: 1.6;
    cursor: pointer;
}

.checkbox input {
    flex-shrink: 0;
    width: 15px;
    height: 15px;
    accent-color: var(--accent);
}

fieldset {
    margin: 28px 0 0;
    padding: 0;
    border: 0;
}

legend {
    margin-bottom: 12px;
    font-size: 11px;
}

.area-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
}

.area-grid button {
    min-height: 35px;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 17px;
    cursor: pointer;
}

.area-grid button:hover {
    background: var(--surface-hover);
}

.area-grid button[aria-pressed='true'] {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
}

.area-value {
    margin: 8px 0 0;
    color: var(--accent);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 11px;
    text-align: center;
}

.control-note {
    margin: 22px 0 0;
    padding-top: 18px;
    border-top: 1px solid var(--border);
    color: var(--muted);
    font-size: 10px;
    line-height: 1.85;
}

@container (max-width: 850px) {
    .controls {
        border-top: 1px solid var(--border);
        border-left: 0;
    }

    .sliders {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .area-grid {
        max-width: 210px;
    }

    .area-value {
        width: 210px;
    }
}
</style>
