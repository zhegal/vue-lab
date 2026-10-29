import { onBeforeUnmount, watch } from 'vue';

export function useDockBounce(enabled: () => boolean) {
    const animations = new Map<HTMLElement, Animation>();

    function stop() {
        for (const animation of animations.values()) animation.cancel();
        animations.clear();
    }

    function bounce(element: HTMLElement, width: number) {
        if (!enabled()) return;
        const current = getComputedStyle(element).transform;
        animations.get(element)?.cancel();
        const height = Math.min(28, width * 0.4);
        const rise = 'cubic-bezier(0.16, 1, 0.3, 1)';
        const fall = 'cubic-bezier(0.7, 0, 0.84, 0)';
        // The wrapper translates independently of the button's live magnification transform.
        const animation = element.animate(
            [
                {
                    transform: current === 'none' ? 'translateY(0)' : current,
                    offset: 0,
                    easing: rise,
                },
                { transform: `translateY(${-height}px)`, offset: 0.3, easing: fall },
                { transform: 'translateY(0)', offset: 0.58, easing: rise },
                { transform: `translateY(${-height * 0.3}px)`, offset: 0.78, easing: fall },
                { transform: 'translateY(0)', offset: 1 },
            ],
            { duration: 720 },
        );
        animations.set(element, animation);
        const release = () => {
            if (animations.get(element) === animation) animations.delete(element);
        };
        animation.onfinish = release;
        animation.oncancel = release;
    }

    watch(enabled, (active) => {
        if (!active) stop();
    });
    onBeforeUnmount(stop);

    return { bounce };
}
