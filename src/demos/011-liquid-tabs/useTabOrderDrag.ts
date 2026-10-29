import { onBeforeUnmount, onMounted, shallowRef } from 'vue';
import type { Ref } from 'vue';
import type { LiquidTab } from './types';

interface TabDrag {
    id: string;
    label: string;
    pointerId: number;
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
}

export function useTabOrderDrag(
    tabs: Ref<LiquidTab[]>,
    list: Ref<HTMLOListElement | null>,
    announce: (message: string) => void,
) {
    const drag = shallowRef<TabDrag | null>(null);
    let originalOrder: LiquidTab[] = [];
    let frame = 0;
    let previousTime = 0;

    function describe(id: string) {
        const index = tabs.value.findIndex((tab) => tab.id === id);
        return `${tabs.value[index]?.label}, position ${index + 1} of ${tabs.value.length}.`;
    }

    function finish(cancelled = false) {
        const current = drag.value;
        if (!current) return;
        drag.value = null;
        cancelAnimationFrame(frame);
        if (list.value?.hasPointerCapture(current.pointerId)) {
            list.value.releasePointerCapture(current.pointerId);
        }
        if (cancelled) tabs.value = originalOrder;
        announce(`${cancelled ? 'Cancelled. Restored' : 'Dropped'} ${describe(current.id)}`);
    }

    function tick(time: number) {
        const current = drag.value;
        const root = list.value;
        if (!current || !root) return;
        const dt = Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;
        const bounds = root.getBoundingClientRect();
        const edge = 36;
        if (current.clientX >= bounds.left - edge && current.clientX <= bounds.right + edge) {
            const topSpeed = Math.max(0, Math.min(1, (bounds.top + edge - current.clientY) / edge));
            const bottomSpeed = Math.max(
                0,
                Math.min(1, (current.clientY - bounds.bottom + edge) / edge),
            );
            root.scrollTop += (bottomSpeed - topSpeed) * 420 * dt;
        }

        const center = current.clientY - current.offsetY + current.height / 2;
        const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-tab-id]'));
        const destination = rows.filter((row) => {
            if (row.dataset.tabId === current.id) return false;
            const rect = row.getBoundingClientRect();
            return center > rect.top + rect.height / 2;
        }).length;
        const index = tabs.value.findIndex((tab) => tab.id === current.id);
        if (index >= 0 && index !== destination) {
            const next = [...tabs.value];
            const [tab] = next.splice(index, 1);
            next.splice(destination, 0, tab!);
            tabs.value = next;
        }
        frame = requestAnimationFrame(tick);
    }

    function begin(event: PointerEvent, tab: LiquidTab) {
        if (!event.isPrimary || event.button !== 0 || drag.value || !list.value) return;
        const row = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-tab-id]');
        if (!row) return;
        event.preventDefault();
        const rect = row.getBoundingClientRect();
        originalOrder = [...tabs.value];
        drag.value = {
            id: tab.id,
            label: tab.label,
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
            width: rect.width,
            height: rect.height,
        };
        // The list keeps pointer capture while Vue moves its keyed rows underneath the pointer.
        list.value.setPointerCapture(event.pointerId);
        announce(`Picked up ${describe(tab.id)} Drag to reorder; Escape cancels.`);
        previousTime = performance.now();
        frame = requestAnimationFrame(tick);
    }

    function move(event: PointerEvent) {
        if (drag.value?.pointerId !== event.pointerId) return;
        drag.value = { ...drag.value, clientX: event.clientX, clientY: event.clientY };
    }

    function drop(event: PointerEvent) {
        if (drag.value?.pointerId === event.pointerId) finish();
    }

    function cancelPointer(event: PointerEvent) {
        if (drag.value?.pointerId === event.pointerId) finish(true);
    }

    function cancel() {
        finish(true);
    }

    function onKeydown(event: KeyboardEvent) {
        if (!drag.value) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            cancel();
        } else if (event.key === 'Tab') finish();
    }

    onMounted(() => {
        window.addEventListener('keydown', onKeydown);
        window.addEventListener('blur', cancel);
        window.addEventListener('resize', cancel);
    });

    onBeforeUnmount(() => {
        cancel();
        window.removeEventListener('keydown', onKeydown);
        window.removeEventListener('blur', cancel);
        window.removeEventListener('resize', cancel);
    });

    return { drag, begin, move, drop, cancelPointer };
}
