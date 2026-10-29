<template>
    <aside class="sorting-controls" aria-label="Sorting settings">
        <h2>
            Animation
        </h2>
        <label class="animation-toggle">
            <span>
                Animate reordering
            </span>
            <input v-model="animationEnabled" type="checkbox" />
        </label>
        <p class="control-help">
            Turn it off to compare an immediate update with a smooth transition.
        </p>
        <div class="duration-control">
            <label :for="durationId">
                Duration
                <output :for="durationId">
                    {{ duration }}ms
                </output>
            </label>
            <input
                :id="durationId"
                v-model.number="duration"
                type="range"
                min="150"
                max="800"
                step="10"
                :disabled="!animationEnabled"
            />
            <div class="range-endpoints" aria-hidden="true">
                <span>
                    Snappy
                </span>
                <span>
                    Unhurried
                </span>
            </div>
        </div>
        <div class="list-actions">
            <button
                type="button"
                :disabled="busy"
                @click="$emit('shuffle')"
            >
                <span aria-hidden="true">
                    ⇄
                </span>
                Shuffle the list
            </button>
            <button
                type="button"
                :disabled="busy"
                @click="$emit('reset')"
            >
                <span aria-hidden="true">
                    ↺
                </span>
                Reset order
            </button>
        </div>
        <section class="order-inspector" aria-label="Current item IDs">
            <h3>
                Item IDs
            </h3>
            <ol>
                <li v-for="(item, index) in items" :key="item.id">
                    <span>
                        {{ index + 1 }}
                    </span>
                    <code>
                        {{ item.id }}
                    </code>
                </li>
            </ol>
            <p class="control-help">
                The item ID remains unchanged when its position changes.
            </p>
        </section>
        <p class="motion-note">
            Reduced-motion preferences take priority over these animation settings.
        </p>
    </aside>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import type { SortableItem } from './items';

defineProps<{ items: SortableItem[]; busy: boolean }>();
defineEmits<{ shuffle: []; reset: [] }>();
const animationEnabled = defineModel<boolean>('animationEnabled', { required: true });
const duration = defineModel<number>('duration', { required: true });
const durationId = useId();
</script>

<style scoped>
.sorting-controls {
    padding: 32px 26px;
    border-left: 1px solid var(--border);
    background: var(--surface);
}

.sorting-controls h2 {
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.025em;
}

.control-help,
.motion-note {
    margin: 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}

.animation-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    gap: 14px;
    margin-top: 16px;
    font-size: 12px;
    cursor: pointer;
}

.animation-toggle input {
    width: 17px;
    height: 17px;
    accent-color: var(--accent);
    cursor: pointer;
}

.duration-control {
    margin-top: 27px;
}

.duration-control label,
.range-endpoints {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
    font-size: 12px;
}

.duration-control output {
    padding: 3px 7px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--canvas);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 10px;
}

.duration-control input {
    display: block;
    width: 100%;
    height: 4px;
    margin: 0;
    accent-color: var(--accent);
    cursor: pointer;
}

.duration-control input:disabled {
    opacity: 0.4;
    cursor: default;
}

.range-endpoints {
    margin-top: 12px;
    color: var(--muted);
    font-size: 10px;
}

.list-actions {
    display: grid;
    gap: 9px;
    margin: 27px 0;
}

.list-actions button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    gap: 9px;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 11px;
    cursor: pointer;
}

.list-actions button:hover:enabled {
    background: var(--surface-hover);
}

.list-actions button:disabled {
    opacity: 0.4;
    cursor: default;
}

.list-actions button span {
    font-size: 17px;
}

.order-inspector {
    padding-top: 24px;
    border-top: 1px solid var(--border);
}

.order-inspector h3 {
    margin: 0 0 15px;
    font-size: 12px;
    font-weight: 550;
}

.order-inspector ol {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
    margin: 0 0 15px;
    padding: 0;
    list-style: none;
}

.order-inspector li {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 10px;
}

.order-inspector li > span {
    color: var(--muted);
}

.order-inspector code {
    color: var(--accent);
    font-size: 10px;
}

.motion-note {
    margin-top: 28px;
    color: var(--muted);
    font-size: 10px;
}

@container (max-width: 800px) {
    .sorting-controls {
        border-top: 1px solid var(--border);
        border-left: 0;
    }
}
</style>
