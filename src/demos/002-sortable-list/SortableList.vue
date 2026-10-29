<template>
    <div
        ref="root"
        class="sort-root"
        :class="{ 'motion-off': !animationEnabled }"
        :style="{ '--sort-duration': `${duration}ms` }"
        @pointermove="movePointer"
        @pointerup="finishPointer"
        @pointercancel="cancelPointer"
        @lostpointercapture="cancelPointer"
    >
        <p :id="instructionsId" class="sort-instructions">
            Drag a handle or use the ↑ ↓ buttons. On a handle: Space to pick up, arrow keys to move,
            Enter to drop, Escape to cancel.
        </p>
        <TransitionGroup
            name="sort"
            tag="ol"
            class="sort-list"
            aria-label="Experiment steps"
        >
            <li
                v-for="(item, index) in items"
                :key="item.id"
                :data-sort-id="item.id"
                class="sort-slot"
                :class="{ 'pointer-placeholder': pointer?.id === item.id }"
            >
                <SortableRow
                    :item="item"
                    :position="index + 1"
                    :total="items.length"
                    :instructions-id="instructionsId"
                    :busy="Boolean(activeId)"
                    :picked="keyboardId === item.id"
                    @pick="beginPointer($event, item.id)"
                    @handle-key="handleKeydown($event, item.id)"
                    @step="step(item.id, $event)"
                />
            </li>
        </TransitionGroup>
        <Teleport to="body">
            <div
                v-if="pointer && draggedItem"
                class="drag-preview"
                :style="previewStyle"
                aria-hidden="true"
                inert
            >
                <SortableRow
                    :item="draggedItem"
                    :position="items.findIndex((item) => item.id === pointer?.id) + 1"
                    :total="items.length"
                    :instructions-id="instructionsId"
                    :busy="true"
                    floating
                />
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import { useSortable } from './useSortable';
import SortableRow from './SortableRow.vue';
import type { SortableItem } from './items';

defineProps<{ animationEnabled: boolean; duration: number }>();
const items = defineModel<SortableItem[]>({ required: true });
const emit = defineEmits<{ announce: [message: string]; busy: [value: boolean] }>();
const root = ref<HTMLElement | null>(null);
const instructionsId = useId();
const {
    pointer,
    activeId,
    keyboardId,
    beginPointer,
    movePointer,
    finishPointer,
    cancelPointer,
    handleKeydown,
    step,
} = useSortable(items, root, (message) => emit('announce', message));

const draggedItem = computed(() => items.value.find((item) => item.id === pointer.value?.id));
const previewStyle = computed(() => {
    const drag = pointer.value;
    if (!drag) return {};
    return {
        left: `${drag.left}px`,
        top: `${drag.clientY - drag.offsetY}px`,
        width: `${drag.width}px`,
    };
});

watch(activeId, (id) => emit('busy', Boolean(id)), { immediate: true });
</script>

<style scoped>
.sort-instructions {
    margin: 0 0 20px;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}

.sort-list {
    position: relative;
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.sort-slot {
    position: relative;
    min-width: 0;
    border-radius: 10px;
}

.sort-move {
    transition: transform var(--sort-duration) cubic-bezier(0.2, 0.8, 0.2, 1);
}

.pointer-placeholder {
    outline: 1px dashed var(--accent);
    outline-offset: -1px;
    background: var(--accent-soft);
}

.pointer-placeholder :deep(.sort-row) {
    opacity: 0;
}

.pointer-placeholder::after {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    content: 'Drop here';
    color: var(--accent);
    font-size: 11px;
    pointer-events: none;
}

.drag-preview {
    position: fixed;
    z-index: 100;
    pointer-events: none;
    user-select: none;
}

.motion-off .sort-move {
    transition: none;
}

@media (prefers-reduced-motion: reduce) {
    .sort-move {
        transition: none;
    }
}
</style>
