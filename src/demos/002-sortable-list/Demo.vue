<template>
    <div class="sortable-demo">
        <section class="sorting-canvas" aria-label="Sortable list playground">
            <div class="canvas-heading">
                <span class="canvas-label">
                    A WORK IN PROGRESS
                </span>
                <span class="items-count">
                    {{ items.length }} steps
                </span>
            </div>
            <h2>
                Everything in its place.
            </h2>
            <SortableList
                v-model="items"
                :animation-enabled="animationEnabled"
                :duration="duration"
                @announce="status = $event"
                @busy="busy = $event"
            />
            <p
                class="sorting-status"
                role="status"
                aria-live="polite"
                aria-atomic="true"
            >
                {{ status }}
            </p>
        </section>
        <SortingControls
            v-model:animation-enabled="animationEnabled"
            v-model:duration="duration"
            :items="items"
            :busy="busy"
            @shuffle="shuffle"
            @reset="reset"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createItems } from './items';
import SortableList from './SortableList.vue';
import SortingControls from './SortingControls.vue';

const items = ref(createItems());
const animationEnabled = ref(true);
const duration = ref(280);
const busy = ref(false);
const status = ref('Ready when you are. Try moving a step.');

function reset() {
    items.value = createItems();
    status.value = 'Original order restored.';
}

function shuffle() {
    const next = [...items.value];
    for (let index = next.length - 1; index > 0; index--) {
        const target = Math.floor(Math.random() * (index + 1));
        const item = next[index]!;
        next[index] = next[target]!;
        next[target] = item;
    }
    if (next.every((item, index) => item.id === items.value[index]?.id)) {
        next.push(next.shift()!);
    }
    items.value = next;
    status.value = 'List shuffled. Same keys, a new order.';
}
</script>

<style scoped>
.sortable-demo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    color: var(--text);
    background: var(--surface);
}

.sorting-canvas {
    min-width: 0;
    padding: 32px clamp(20px, 3vw, 48px) 24px;
    background-color: var(--canvas);
    background-image: radial-gradient(var(--dot) 0.8px, transparent 0.8px);
    background-size: 18px 18px;
}

.canvas-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    color: var(--muted);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 9px;
}

.canvas-label {
    letter-spacing: 0.1em;
}

.items-count {
    padding: 3px 6px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--surface);
}

.sorting-canvas h2 {
    margin: 20px 0 12px;
    font-size: clamp(23px, 2.6vw, 32px);
    font-weight: 550;
    letter-spacing: -0.05em;
}

.sorting-status {
    min-height: 38px;
    margin: 18px 0 0;
    color: var(--accent);
    font-size: 11px;
    line-height: 1.8;
}

@media (max-width: 960px) {
    .sortable-demo {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (max-width: 600px) {
    .sorting-canvas {
        padding-inline: 14px;
    }
}
</style>
