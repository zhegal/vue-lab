<template>
    <section class="tab-order" aria-label="Tab order">
        <h3>
            Tab order
        </h3>
        <p class="order-help">
            Drag the grips or use the arrows to change tab order. Escape cancels a drag.
        </p>
        <ol
            ref="list"
            :class="{ 'is-dragging': drag }"
            @pointermove="move"
            @pointerup="drop"
            @pointercancel="cancelPointer"
            @lostpointercapture="cancelPointer"
        >
            <li
                v-for="(tab, index) in tabs"
                :key="tab.id"
                :data-tab-id="tab.id"
                :class="{ 'is-active': tab.id === activeId, 'drag-source': drag?.id === tab.id }"
            >
                <span
                    class="drag-grip"
                    aria-hidden="true"
                    title="Drag to reorder"
                    @pointerdown="begin($event, tab)"
                >
                    ⠿
                </span>
                <span class="tab-label">
                    {{ tab.label }}
                    <span v-if="tab.id === activeId" class="active-label">
                        Selected
                    </span>
                </span>
                <div class="move-buttons">
                    <button
                        type="button"
                        :aria-label="`Move ${tab.label} up`"
                        :disabled="index === 0 || !!drag"
                        @click="moveTab(index, -1, $event)"
                    >
                        <span aria-hidden="true">
                            ↑
                        </span>
                    </button>
                    <button
                        type="button"
                        :aria-label="`Move ${tab.label} down`"
                        :disabled="index === tabs.length - 1 || !!drag"
                        @click="moveTab(index, 1, $event)"
                    >
                        <span aria-hidden="true">
                            ↓
                        </span>
                    </button>
                </div>
            </li>
        </ol>
        <p class="order-status" role="status">
            {{ status }}
        </p>
        <Teleport to="body">
            <div
                v-if="drag"
                class="drag-preview"
                aria-hidden="true"
                :style="{
                    width: `${drag.width}px`,
                    height: `${drag.height}px`,
                    transform: `translate3d(${drag.clientX - drag.offsetX}px,
                        ${drag.clientY - drag.offsetY}px, 0)`,
                }"
            >
                <span class="drag-grip">
                    ⠿
                </span>
                <span class="tab-label">
                    {{ drag.label }}
                </span>
            </div>
        </Teleport>
    </section>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import type { LiquidTab } from './types';
import { useTabOrderDrag } from './useTabOrderDrag';

defineProps<{ activeId: string }>();
const tabs = defineModel<LiquidTab[]>({ required: true });
const status = ref('');
const list = ref<HTMLOListElement | null>(null);
const { drag, begin, move, drop, cancelPointer } = useTabOrderDrag(tabs, list, (message) => {
    void nextTick(() => {
        status.value = message;
    });
});

watch(
    () => tabs.value.map((tab) => tab.id),
    () => {
        if (!drag.value) status.value = '';
    },
);

async function moveTab(index: number, direction: number, event: MouseEvent) {
    const destination = index + direction;
    if (destination < 0 || destination >= tabs.value.length) return;
    const next = [...tabs.value];
    const [tab] = next.splice(index, 1);
    if (!tab) return;
    next.splice(destination, 0, tab);
    const button = event.currentTarget as HTMLButtonElement;
    const row = button.closest('li');
    tabs.value = next;
    await nextTick();
    status.value = `${tab.label} moved to position ${destination + 1} of ${next.length}.`;
    // Keyed rows move in the DOM; restore focus, including when the clicked arrow becomes disabled.
    const target = button.disabled
        ? row?.querySelector<HTMLButtonElement>('button:not(:disabled)')
        : button;
    target?.focus({ preventScroll: true });
}
</script>

<style scoped>
.tab-order {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
}

h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 550;
}

.order-help,
.order-status {
    margin: 10px 0 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
    overflow-wrap: anywhere;
}

ol {
    display: grid;
    gap: 6px;
    max-height: 280px;
    margin: 14px 0 0;
    padding: 3px;
    overflow-y: auto;
    list-style: none;
    scrollbar-width: thin;
}

li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--surface);
}

.is-dragging {
    cursor: grabbing;
    user-select: none;
}

.drag-source {
    opacity: 0.35;
    border-style: dashed;
}

.drag-grip {
    display: grid;
    flex-shrink: 0;
    width: 24px;
    min-height: 32px;
    place-items: center;
    color: var(--muted);
    font-size: 22px;
    touch-action: none;
    user-select: none;
    cursor: grab;
}

.drag-preview {
    position: fixed;
    z-index: 50;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border: 1px solid var(--accent);
    border-radius: 6px;
    color: var(--text);
    background: var(--surface);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--text) 16%, transparent);
    pointer-events: none;
}

li.is-active {
    border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
    background: var(--accent-soft);
}

.tab-label {
    flex: 1;
    min-width: 0;
    font-size: 11px;
    line-height: 1.6;
    overflow-wrap: anywhere;
}

.active-label {
    display: block;
    color: var(--accent);
    font-size: 9px;
}

.move-buttons {
    display: flex;
    flex-shrink: 0;
    gap: 4px;
}

button {
    width: 30px;
    height: 32px;
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text);
    background: var(--surface);
    font-size: 15px;
    cursor: pointer;
}

button:hover:enabled {
    background: var(--surface-hover);
}

button:disabled {
    opacity: 0.35;
    cursor: default;
}

.order-status:empty {
    display: none;
}
</style>
