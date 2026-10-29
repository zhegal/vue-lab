import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef } from 'vue';
import type { Ref } from 'vue';
import { moveItem } from './items';
import type { SortableItem } from './items';

interface PointerDrag {
    id: string;
    pointerId: number;
    clientY: number;
    offsetY: number;
    left: number;
    width: number;
    height: number;
}

export function useSortable(
    items: Ref<SortableItem[]>,
    root: Ref<HTMLElement | null>,
    announce: (message: string) => void,
) {
    const pointer = shallowRef<PointerDrag | null>(null);
    const keyboardId = shallowRef<string | null>(null);
    const activeId = computed(() => pointer.value?.id ?? keyboardId.value);
    let originalOrder: SortableItem[] = [];
    let frame = 0;

    function describe(id: string, order = items.value) {
        const index = order.findIndex((item) => item.id === id);
        return `${order[index]?.title}, position ${index + 1} of ${order.length}`;
    }

    function reorder(id: string, target: number) {
        const from = items.value.findIndex((item) => item.id === id);
        const to = Math.max(0, Math.min(items.value.length - 1, target));
        if (from < 0 || from === to) return;
        const next = moveItem(items.value, from, to);
        items.value = next;
        announce(`Moved ${describe(id, next)}.`);
    }

    async function focusHandle(id: string) {
        await nextTick();
        const handle = root.value?.querySelector<HTMLButtonElement>(`[data-handle-id="${id}"]`);
        handle?.focus({ preventScroll: true });
        handle?.scrollIntoView({ block: 'nearest' });
    }

    function stopPointer(cancelled: boolean) {
        const drag = pointer.value;
        if (!drag) return;
        pointer.value = null;
        cancelAnimationFrame(frame);
        if (root.value?.hasPointerCapture(drag.pointerId)) {
            root.value.releasePointerCapture(drag.pointerId);
        }
        const order = cancelled ? [...originalOrder] : items.value;
        if (cancelled) items.value = order;
        announce(`${cancelled ? 'Cancelled. Restored' : 'Dropped'} ${describe(drag.id, order)}.`);
    }

    function animatePointer() {
        const drag = pointer.value;
        const list = root.value?.querySelector<HTMLOListElement>('ol');
        if (!drag || !list) return;

        const edge = 60;
        const bottom = window.innerHeight - edge;
        const scroll =
            drag.clientY < edge
                ? -Math.min(14, (edge - drag.clientY) / 4)
                : drag.clientY > bottom
                  ? Math.min(14, (drag.clientY - bottom) / 4)
                  : 0;
        if (scroll) window.scrollBy(0, scroll);

        const center = drag.clientY - drag.offsetY + drag.height / 2;
        const top = list.getBoundingClientRect().top;
        const rows = [...list.querySelectorAll<HTMLElement>('[data-sort-id]')];
        // Layout offsets ignore TransitionGroup's temporary FLIP transforms, avoiding jitter.
        const target = rows
            .filter((row) => row.dataset.sortId !== drag.id)
            .filter((row) => center > top + row.offsetTop + row.offsetHeight / 2).length;
        reorder(drag.id, target);
        frame = requestAnimationFrame(animatePointer);
    }

    function beginPointer(event: PointerEvent, id: string) {
        if (!event.isPrimary || event.button !== 0 || activeId.value) return;
        const handle = event.currentTarget as HTMLButtonElement;
        const row = handle.closest<HTMLElement>('[data-sort-id]');
        if (!row || !root.value) return;
        event.preventDefault();
        handle.focus({ preventScroll: true });
        const rect = row.getBoundingClientRect();
        originalOrder = [...items.value];
        pointer.value = {
            id,
            pointerId: event.pointerId,
            clientY: event.clientY,
            offsetY: event.clientY - rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        };
        // Capture on the stable wrapper: keyed rows themselves move in the DOM.
        root.value.setPointerCapture(event.pointerId);
        announce(`Picked up ${describe(id)}. Drag to reorder; Escape cancels.`);
        frame = requestAnimationFrame(animatePointer);
    }

    function movePointer(event: PointerEvent) {
        if (pointer.value?.pointerId !== event.pointerId) return;
        pointer.value = { ...pointer.value, clientY: event.clientY };
    }

    function finishPointer(event: PointerEvent) {
        if (pointer.value?.pointerId === event.pointerId) stopPointer(false);
    }

    function cancelPointer(event: PointerEvent) {
        if (pointer.value?.pointerId === event.pointerId) stopPointer(true);
    }

    function finishKeyboard(cancelled: boolean) {
        const id = keyboardId.value;
        if (!id) return;
        keyboardId.value = null;
        const order = cancelled ? [...originalOrder] : items.value;
        if (cancelled) items.value = order;
        announce(`${cancelled ? 'Cancelled. Restored' : 'Dropped'} ${describe(id, order)}.`);
        void focusHandle(id);
    }

    function handleKeydown(event: KeyboardEvent, id: string) {
        if (pointer.value) return;
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            if (keyboardId.value) finishKeyboard(false);
            else {
                originalOrder = [...items.value];
                keyboardId.value = id;
                announce(`Picked up ${describe(id)}. Use arrow keys; Escape cancels.`);
            }
            return;
        }
        if (keyboardId.value !== id) return;
        if (event.key === 'Tab') {
            keyboardId.value = null;
            announce(`Dropped ${describe(id)}.`);
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            finishKeyboard(true);
            return;
        }
        const index = items.value.findIndex((item) => item.id === id);
        const targets: Record<string, number> = {
            ArrowUp: index - 1,
            ArrowDown: index + 1,
            Home: 0,
            End: items.value.length - 1,
        };
        const target = targets[event.key];
        if (target === undefined) return;
        event.preventDefault();
        reorder(id, target);
        void focusHandle(id);
    }

    function step(id: string, direction: number) {
        if (activeId.value) return;
        const from = items.value.findIndex((item) => item.id === id);
        reorder(id, from + direction);
    }

    function cancel() {
        stopPointer(true);
        finishKeyboard(true);
    }

    function onWindowKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && pointer.value) {
            event.preventDefault();
            stopPointer(true);
        }
    }

    onMounted(() => {
        window.addEventListener('keydown', onWindowKeydown);
        window.addEventListener('blur', cancel);
        window.addEventListener('resize', cancel);
    });

    onBeforeUnmount(() => {
        cancel();
        window.removeEventListener('keydown', onWindowKeydown);
        window.removeEventListener('blur', cancel);
        window.removeEventListener('resize', cancel);
    });

    return {
        pointer,
        activeId,
        keyboardId,
        beginPointer,
        movePointer,
        finishPointer,
        cancelPointer,
        handleKeydown,
        step,
    };
}
