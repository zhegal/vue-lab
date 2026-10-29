<template>
    <div class="sort-row" :class="{ 'keyboard-picked': picked, floating }">
        <button
            type="button"
            class="drag-handle"
            :data-handle-id="item.id"
            :aria-label="`Reorder ${item.title}, position ${position} of ${total}`"
            :aria-describedby="instructionsId"
            :aria-pressed="picked"
            :tabindex="floating ? -1 : 0"
            @pointerdown="$emit('pick', $event)"
            @keydown="$emit('handleKey', $event)"
        >
            <svg
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="currentColor"
                aria-hidden="true"
            >
                <circle
                    v-for="point in gripPoints"
                    :key="point.join('-')"
                    :cx="point[0]"
                    :cy="point[1]"
                    r="1.3"
                />
            </svg>
        </button>
        <span class="row-position" aria-hidden="true">
            {{ position.toString().padStart(2, '0') }}
        </span>
        <div class="row-copy">
            <strong>
                {{ item.title }}
            </strong>
            <span>
                {{ item.description }}
            </span>
        </div>
        <span class="row-category">
            {{ item.category }}
        </span>
        <div class="row-actions" :class="{ 'floating-actions': floating }">
            <button
                type="button"
                :aria-label="`Move ${item.title} up`"
                :disabled="position === 1 || busy"
                @click="$emit('step', -1)"
            >
                ↑
            </button>
            <button
                type="button"
                :aria-label="`Move ${item.title} down`"
                :disabled="position === total || busy"
                @click="$emit('step', 1)"
            >
                ↓
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { SortableItem } from './items';

defineProps<{
    item: SortableItem;
    position: number;
    total: number;
    instructionsId: string;
    busy: boolean;
    picked?: boolean;
    floating?: boolean;
}>();
defineEmits<{
    pick: [event: PointerEvent];
    handleKey: [event: KeyboardEvent];
    step: [direction: number];
}>();

const gripPoints = [
    [5, 5],
    [11, 5],
    [5, 10],
    [11, 10],
    [5, 15],
    [11, 15],
];
</script>

<style scoped>
.sort-row {
    display: flex;
    align-items: center;
    gap: 13px;
    min-height: 83px;
    padding: 12px 14px 12px 8px;
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    background: var(--surface);
}

.sort-row.keyboard-picked,
.sort-row.floating {
    border-color: var(--accent);
    box-shadow: 0 8px 24px -12px rgb(0 0 0 / 25%);
}

.drag-handle {
    display: grid;
    flex-shrink: 0;
    width: 32px;
    height: 44px;
    place-items: center;
    border-radius: 5px;
    color: var(--muted);
    touch-action: none;
    cursor: grab;
}

.drag-handle:hover,
.drag-handle[aria-pressed='true'] {
    color: var(--accent);
    background: var(--accent-soft);
}

.drag-handle:active {
    cursor: grabbing;
}

.row-position {
    color: var(--muted);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 10px;
    font-variant-numeric: tabular-nums;
}

.row-copy {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
}

.row-copy strong {
    font-size: 13px;
    font-weight: 550;
    line-height: 1.4;
    letter-spacing: -0.02em;
}

.row-copy > span {
    color: var(--secondary);
    font-size: 10px;
    line-height: 1.5;
}

.row-category {
    padding: 4px 7px;
    border-radius: 4px;
    color: var(--accent);
    background: var(--accent-soft);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 9px;
}

.row-actions {
    display: flex;
    gap: 2px;
}

.row-actions button {
    width: 29px;
    height: 36px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
}

.row-actions button:hover:enabled {
    color: var(--accent);
    background: var(--surface-hover);
}

.row-actions button:disabled {
    opacity: 0.25;
    cursor: default;
}

.floating-actions {
    visibility: hidden;
}

@container (max-width: 440px) {
    .sort-row {
        gap: 7px;
        padding-right: 7px;
    }

    .row-category,
    .row-position {
        display: none;
    }

    .row-copy strong {
        font-size: 12px;
    }

    .row-actions button {
        width: 28px;
        height: 44px;
    }
}
</style>
