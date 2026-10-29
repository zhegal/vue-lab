import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Ref } from 'vue';

export function useFullscreenControls(
    fullscreen: Ref<boolean>,
    surface: Ref<HTMLElement | null>,
    viewport: Ref<HTMLElement | null>,
    panel: Ref<HTMLElement | null>,
    pinned: Ref<boolean>,
) {
    const visible = ref(true);
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let nearBottom = false;
    let interacting = false;
    let keyboardMode = false;
    let disposed = false;

    function clearTimer() {
        clearTimeout(hideTimer);
        hideTimer = undefined;
    }

    function shouldStayVisible() {
        return (
            !fullscreen.value ||
            pinned.value ||
            nearBottom ||
            interacting ||
            (keyboardMode && panel.value?.contains(document.activeElement))
        );
    }

    function hide() {
        hideTimer = undefined;
        if (shouldStayVisible()) return;
        // Pointer-focused buttons must lose focus before their panel becomes inert/aria-hidden.
        if (panel.value?.contains(document.activeElement))
            viewport.value?.focus({ preventScroll: true });
        visible.value = false;
        clearTimer();
    }

    function scheduleHide(delay = 600) {
        clearTimer();
        if (shouldStayVisible()) return;
        hideTimer = setTimeout(hide, delay);
    }

    function showBriefly() {
        visible.value = true;
        scheduleHide(1800);
    }

    function onPointerMove(event: PointerEvent) {
        if (!fullscreen.value || event.pointerType === 'touch' || !surface.value) return;
        const rect = surface.value.getBoundingClientRect();
        const bottomZone = Math.max(64, (panel.value?.offsetHeight ?? 100) + 12);
        const wasNearBottom = nearBottom;
        nearBottom = event.clientY >= rect.bottom - bottomZone;
        if (nearBottom) {
            visible.value = true;
            clearTimer();
        } else if (wasNearBottom || (visible.value && !hideTimer)) scheduleHide();
    }

    function onPointerDown(event: PointerEvent) {
        keyboardMode = false;
        if (!fullscreen.value) return;
        interacting = event.target instanceof Node && !!panel.value?.contains(event.target);
        if (interacting) {
            visible.value = true;
            clearTimer();
        } else if (event.pointerType === 'touch') showBriefly();
        else scheduleHide();
    }

    function onPointerUp() {
        if (!interacting) return;
        interacting = false;
        scheduleHide();
    }

    function onPointerLeave() {
        nearBottom = false;
        if (fullscreen.value) scheduleHide();
    }

    async function onKeydown(event: KeyboardEvent) {
        keyboardMode = true;
        if (!fullscreen.value) return;
        if (event.key === 'Tab' && !visible.value) {
            event.preventDefault();
            visible.value = true;
            clearTimer();
            await nextTick();
            if (disposed || !fullscreen.value) return;
            const controls = panel.value?.querySelectorAll<HTMLElement>(
                'button:not(:disabled), input:not(:disabled)',
            );
            const target = event.shiftKey ? controls?.[controls.length - 1] : controls?.[0];
            target?.focus({ preventScroll: true });
        } else showBriefly();
    }

    function onFocusIn() {
        if (!fullscreen.value) return;
        visible.value = true;
        scheduleHide();
    }

    async function onFocusOut() {
        await nextTick();
        if (!disposed && fullscreen.value) scheduleHide();
    }

    function onBlur() {
        interacting = false;
        nearBottom = false;
        if (fullscreen.value) scheduleHide();
    }

    watch(fullscreen, (active) => {
        clearTimer();
        nearBottom = false;
        interacting = false;
        visible.value = true;
        if (active) scheduleHide(1800);
    });
    watch(pinned, (active) => {
        if (active) {
            visible.value = true;
            clearTimer();
        } else if (fullscreen.value) scheduleHide();
    });

    onMounted(() => {
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
        window.addEventListener('blur', onBlur);
    });
    onBeforeUnmount(() => {
        disposed = true;
        clearTimer();
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
        window.removeEventListener('blur', onBlur);
    });

    return {
        visible,
        onPointerMove,
        onPointerDown,
        onPointerLeave,
        onKeydown,
        onFocusIn,
        onFocusOut,
    };
}
