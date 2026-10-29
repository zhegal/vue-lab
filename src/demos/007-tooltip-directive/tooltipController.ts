import { placeTooltip } from './position';
import type { Placement } from './position';
import styles from './tooltip.module.css';

export interface TooltipConfig {
    text: string;
    placement: Placement;
    delay: number;
    disabled: boolean;
}

interface TooltipController {
    update: (config: TooltipConfig) => void;
    dismiss: () => void;
    destroy: () => void;
}

let sequence = 0;
let active: TooltipController | undefined;

export function createTooltip(element: HTMLElement, initial: TooltipConfig): TooltipController {
    const bubble = document.createElement('div');
    do bubble.id = `vue-lab-tooltip-${++sequence}`;
    while (document.getElementById(bubble.id));
    bubble.className = styles.bubble!;
    bubble.setAttribute('role', 'tooltip');
    bubble.hidden = true;
    document.body.append(bubble);

    let config = initial;
    let hovered = false;
    let bubbleHovered = false;
    let focused = element.contains(document.activeElement);
    let dismissed = false;
    let disposed = false;
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let session: AbortController | undefined;
    let resize: ResizeObserver | undefined;
    let intersection: IntersectionObserver | undefined;
    const lifetime = new AbortController();

    function enabled() {
        return (
            !!config.text.trim() &&
            !config.disabled &&
            !element.matches(':disabled, [aria-disabled="true"]')
        );
    }

    function interacting() {
        return hovered || bubbleHovered || focused;
    }

    function syncDescription() {
        const ids = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
        const remaining = ids.filter((id) => id !== bubble.id);
        if (enabled()) remaining.push(bubble.id);
        if (remaining.length) element.setAttribute('aria-describedby', remaining.join(' '));
        else element.removeAttribute('aria-describedby');
    }

    function clearTimers() {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        showTimer = undefined;
        hideTimer = undefined;
    }

    function hide() {
        clearTimers();
        cancelAnimationFrame(frame);
        frame = 0;
        bubble.hidden = true;
        bubbleHovered = false;
        session?.abort();
        session = undefined;
        resize?.disconnect();
        intersection?.disconnect();
        if (active === controller) active = undefined;
    }

    function dismiss() {
        dismissed = interacting();
        hide();
    }

    function position() {
        frame = 0;
        if (disposed || bubble.hidden) return;
        const visual = window.visualViewport;
        const viewport = {
            left: visual?.offsetLeft ?? 0,
            top: visual?.offsetTop ?? 0,
            width: visual?.width ?? document.documentElement.clientWidth,
            height: visual?.height ?? document.documentElement.clientHeight,
        };
        const rect = element.getBoundingClientRect();
        if (
            !element.isConnected ||
            !element.getClientRects().length ||
            rect.bottom <= viewport.top ||
            rect.right <= viewport.left ||
            rect.top >= viewport.top + viewport.height ||
            rect.left >= viewport.left + viewport.width
        ) {
            dismiss();
            return;
        }
        bubble.style.maxWidth = `${Math.max(1, Math.min(280, viewport.width - 16))}px`;
        bubble.style.maxHeight = `${Math.max(1, viewport.height - 16)}px`;
        const result = placeTooltip(
            rect,
            bubble.getBoundingClientRect(),
            viewport,
            config.placement,
        );
        bubble.style.left = `${result.x}px`;
        bubble.style.top = `${result.y}px`;
        bubble.dataset.placement = result.placement;
    }

    function schedulePosition() {
        if (!frame && !bubble.hidden) frame = requestAnimationFrame(position);
    }

    function onEscape(event: KeyboardEvent) {
        if (event.key !== 'Escape' || event.defaultPrevented) return;
        event.preventDefault();
        event.stopPropagation();
        dismiss();
    }

    function show() {
        showTimer = undefined;
        if (disposed || dismissed || !enabled() || !interacting()) {
            hide();
            return;
        }
        bubble.hidden = false;
        position();
        if (bubble.hidden || !session) return;
        const { signal } = session;
        document.addEventListener('scroll', schedulePosition, {
            capture: true,
            passive: true,
            signal,
        });
        window.addEventListener('resize', schedulePosition, { passive: true, signal });
        window.visualViewport?.addEventListener('resize', schedulePosition, { signal });
        window.visualViewport?.addEventListener('scroll', schedulePosition, { signal });
        resize = new ResizeObserver(schedulePosition);
        resize.observe(element);
        resize.observe(bubble);
        intersection = new IntersectionObserver(([entry]) => {
            if (entry && !entry.isIntersecting) dismiss();
        });
        intersection.observe(element);
    }

    function requestShow(delay: number) {
        if (disposed || dismissed || !enabled()) return;
        clearTimers();
        if (!bubble.hidden) return;
        if (active !== controller) active?.dismiss();
        active = controller;
        if (!session) {
            session = new AbortController();
            const { signal } = session;
            document.addEventListener('keydown', onEscape, { signal });
            window.addEventListener('blur', dismiss, { signal });
            document.addEventListener('visibilitychange', onVisibilityChange, { signal });
        }
        if (delay) showTimer = setTimeout(show, delay);
        else show();
    }

    function settle() {
        if (interacting()) return;
        dismissed = false;
        clearTimers();
        if (bubble.hidden) hide();
        else hideTimer = setTimeout(hide, 160);
    }

    function onPointerEnter(event: PointerEvent) {
        if (event.pointerType === 'touch') return;
        hovered = true;
        requestShow(focused ? 0 : config.delay);
    }

    function onPointerLeave() {
        hovered = false;
        settle();
    }

    function onFocusIn() {
        focused = true;
        requestShow(0);
    }

    function onFocusOut(event: FocusEvent) {
        if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return;
        focused = false;
        settle();
    }

    function onBubbleEnter(event: PointerEvent) {
        if (event.pointerType === 'touch') return;
        bubbleHovered = true;
        clearTimeout(hideTimer);
    }

    function onBubbleLeave() {
        bubbleHovered = false;
        settle();
    }

    function onVisibilityChange() {
        if (document.hidden) dismiss();
    }

    function update(next: TooltipConfig) {
        const previous = config;
        config = next;
        bubble.textContent = config.text;
        syncDescription();
        if (!enabled()) hide();
        else if (!bubble.hidden) schedulePosition();
        else if (interacting() && (previous.disabled || !previous.text.trim())) requestShow(0);
        else if (showTimer !== undefined && previous.delay !== config.delay) {
            requestShow(focused ? 0 : config.delay);
        }
    }

    function destroy() {
        disposed = true;
        hide();
        lifetime.abort();
        bubble.remove();
        const ids = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
        const remaining = ids.filter((id) => id !== bubble.id);
        if (remaining.length) element.setAttribute('aria-describedby', remaining.join(' '));
        else element.removeAttribute('aria-describedby');
    }

    const controller = { update, dismiss, destroy };
    const { signal } = lifetime;
    element.addEventListener('pointerenter', onPointerEnter, { signal });
    element.addEventListener('pointerleave', onPointerLeave, { signal });
    element.addEventListener('focusin', onFocusIn, { signal });
    element.addEventListener('focusout', onFocusOut, { signal });
    bubble.addEventListener('pointerenter', onBubbleEnter, { signal });
    bubble.addEventListener('pointerleave', onBubbleLeave, { signal });
    update(initial);
    if (focused) requestShow(0);
    return controller;
}
