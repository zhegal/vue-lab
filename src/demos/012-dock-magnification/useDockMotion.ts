import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Ref } from 'vue';
import type { DockSettings } from './settings';

function influence(distance: number, radius: number) {
    if (Math.abs(distance) >= radius) return 0;
    return (1 + Math.cos((distance / radius) * Math.PI)) / 2;
}

export function useDockMotion(
    rail: Ref<HTMLElement | null>,
    settings: () => DockSettings,
    count: number,
) {
    const highlightedIndex = ref<number | null>(null);
    const reducedMotion = ref(false);
    let items: HTMLElement[] = [];
    let buttons: HTMLButtonElement[] = [];
    let observer: ResizeObserver | undefined;
    let media: MediaQueryList | undefined;
    let pointer: { x: number; index: number | null } | null = null;
    let focusedIndex: number | null = null;
    let size = 0;
    let gap = 0;
    let radius = 0;
    let frame = 0;
    let previousTime = 0;
    let widths: number[] = [];
    let velocities: number[] = [];
    let targets: number[] = [];

    function restCenter(index: number) {
        return (index - (count - 1) / 2) * (size + gap);
    }

    function draw() {
        if (!rail.value) return;
        const total = widths.reduce((sum, width) => sum + width, 0) + gap * (count - 1);
        let left = -total / 2;
        items.forEach((item, index) => {
            const width = widths[index] ?? size;
            item.style.setProperty('--item-x', `${left}px`);
            item.style.setProperty('--item-scale', `${width / size}`);
            item.style.setProperty('--item-width', `${width}px`);
            left += width + gap;
        });
        rail.value.style.setProperty('--shelf-width', `${total + 28}px`);
    }

    function settle() {
        cancelAnimationFrame(frame);
        frame = 0;
        widths = [...targets];
        velocities.fill(0);
        draw();
    }

    function tick(time: number) {
        // Substeps keep the spring stable after slow frames or background-tab pauses.
        const elapsed = Math.min((time - previousTime) / 1000, 0.064);
        previousTime = time;
        const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)));
        const dt = elapsed / steps;
        for (let step = 0; step < steps; step++) {
            widths.forEach((width, index) => {
                const velocity = velocities[index] ?? 0;
                const target = targets[index] ?? size;
                const nextVelocity = velocity + ((target - width) * 300 - velocity * 34) * dt;
                velocities[index] = nextVelocity;
                widths[index] = width + nextVelocity * dt;
            });
        }

        draw();
        const moving = widths.some(
            (width, index) =>
                Math.abs(width - (targets[index] ?? size)) > 0.01 ||
                Math.abs(velocities[index] ?? 0) > 0.05,
        );
        if (moving) frame = requestAnimationFrame(tick);
        else settle();
    }

    function updateTargets() {
        if (!size || !rail.value) return;
        const x = pointer?.x ?? (focusedIndex === null ? null : restCenter(focusedIndex));
        const strength = reducedMotion.value ? 0 : settings().magnification - 1;
        targets = Array.from({ length: count }, (_, index) => {
            const weight = x === null ? 0 : influence(restCenter(index) - x, radius);
            return size * (1 + strength * weight);
        });

        highlightedIndex.value = pointer ? pointer.index : focusedIndex;

        if (!settings().animated || reducedMotion.value) settle();
        else if (!frame) {
            previousTime = performance.now();
            frame = requestAnimationFrame(tick);
        }
    }

    function measure() {
        if (!rail.value || !items.length) return;
        const options = settings();
        const pitch = options.size + 8;
        const restingWidth = count * options.size + (count - 1) * 8;
        let expandedWidth = restingWidth;

        // Reserve the widest influence envelope, rather than shrinking a growing dock mid-hover.
        // One-pixel samples plus an 8px margin cover the small gaps between samples.
        for (let x = 0; x <= (count - 1) * pitch; x++) {
            const extra = Array.from({ length: count }, (_, index) =>
                influence(index * pitch - x, options.radius),
            ).reduce((sum, weight) => sum + weight * options.size * (options.magnification - 1), 0);
            expandedWidth = Math.max(expandedWidth, restingWidth + extra);
        }
        const fit = Math.min(1, Math.max(1, rail.value.clientWidth - 40) / (expandedWidth + 8));
        size = options.size * fit;
        gap = 8 * fit;
        radius = options.radius * fit;
        widths = Array.from({ length: count }, () => size);
        velocities = Array.from({ length: count }, () => 0);
        pointer = null;
        rail.value.style.setProperty('--icon-size', `${size}px`);
        rail.value.dataset.ready = '';
        updateTargets();
        draw();
    }

    function onPointerMove(event: PointerEvent) {
        if (event.pointerType === 'touch' || !rail.value) return;
        const index = eventIndex(event);
        if (!pointer && index === null) return;
        const rect = rail.value.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top;
        const totalWidth = widths.reduce((sum, width) => sum + width, 0) + gap * (count - 1);
        const top = Math.min(rect.height - size - 41, rect.height - 28 - Math.max(...widths));

        // An icon activates the pointer target; gaps retain it inside the shelf/icon envelope.
        if (
            index === null &&
            (Math.abs(x) > (totalWidth + 28) / 2 || y < top || y > rect.height - 9)
        ) {
            onPointerLeave();
            return;
        }
        pointer = { x, index };
        updateTargets();
    }

    function onPointerLeave() {
        pointer = null;
        updateTargets();
    }

    function onPointerDown(event: PointerEvent) {
        focusedIndex = null;
        if (event.pointerType === 'touch') pointer = null;
        updateTargets();
    }

    function eventIndex(event: Event) {
        const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
            '[data-dock-index]',
        );
        return button ? Number(button.dataset.dockIndex) : null;
    }

    function onFocusIn(event: FocusEvent) {
        if (!(event.target as HTMLElement).matches(':focus-visible')) return;
        focusedIndex = eventIndex(event);
        pointer = null;
        updateTargets();
    }

    function onFocusOut(event: FocusEvent) {
        if (event.relatedTarget instanceof Node && rail.value?.contains(event.relatedTarget))
            return;
        focusedIndex = null;
        updateTargets();
    }

    function onKeydown(event: KeyboardEvent) {
        const index = eventIndex(event);
        if (index === null || event.key === 'Tab') return;
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % count;
        else if (event.key === 'ArrowLeft') next = (index + count - 1) % count;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = count - 1;
        else if (event.key !== 'Enter' && event.key !== ' ') return;
        else {
            focusedIndex = index;
            pointer = null;
            updateTargets();
            return;
        }
        event.preventDefault();
        focusedIndex = next;
        pointer = null;
        buttons[next]?.focus({ preventScroll: true });
        updateTargets();
    }

    function clearInteraction() {
        pointer = null;
        focusedIndex = null;
        updateTargets();
        settle();
    }

    function onVisibilityChange() {
        if (document.hidden) clearInteraction();
    }

    function onMotionChange() {
        reducedMotion.value = media?.matches ?? false;
        updateTargets();
    }

    watch(() => [settings().size, settings().radius, settings().magnification], measure, {
        flush: 'post',
    });
    watch(() => settings().animated, updateTargets);

    onMounted(() => {
        if (!rail.value) return;
        items = Array.from(rail.value.querySelectorAll<HTMLElement>('.dock-item'));
        buttons = Array.from(rail.value.querySelectorAll<HTMLButtonElement>('.dock-button'));
        media = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotion.value = media.matches;
        media.addEventListener('change', onMotionChange);
        observer = new ResizeObserver(measure);
        observer.observe(rail.value);
        window.addEventListener('blur', clearInteraction);
        document.addEventListener('visibilitychange', onVisibilityChange);
        measure();
    });

    onBeforeUnmount(() => {
        cancelAnimationFrame(frame);
        observer?.disconnect();
        media?.removeEventListener('change', onMotionChange);
        window.removeEventListener('blur', clearInteraction);
        document.removeEventListener('visibilitychange', onVisibilityChange);
    });

    return {
        highlightedIndex,
        reducedMotion,
        onPointerMove,
        onPointerLeave,
        onPointerDown,
        onFocusIn,
        onFocusOut,
        onKeydown,
    };
}
