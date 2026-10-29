import { onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';

export function useLiquidIndicator(element: Ref<HTMLElement | null>, axis: 'x' | 'y' = 'x') {
    let frame = 0;
    let previousTime = 0;
    let initialized = false;
    let center = 0;
    let width = 0;
    let velocity = 0;
    let widthVelocity = 0;
    let stretch = 0;
    let stretchVelocity = 0;
    let targetCenter = 0;
    let targetWidth = 0;
    let complete: ((finished: boolean) => void) | undefined;
    let exitBoundary: { edge: number; direction: 1 | -1 } | undefined;

    function bounds() {
        const direction = Math.tanh(velocity / 120);
        const left = center - width / 2 - stretch / 2 + direction * stretch * 0.25;
        return { left, length: width + stretch };
    }

    function draw() {
        if (!element.value) return;
        // Most of the extra length sits ahead of the moving center, like a pulled droplet.
        const { left, length } = bounds();
        const scaleY = 1 - Math.min(stretch / 400, 0.08);
        element.value.style[axis === 'x' ? 'width' : 'height'] = `${length}px`;
        element.value.style.transform =
            axis === 'x'
                ? `translate3d(${left}px, 0, 0) scaleY(${scaleY})`
                : `translate3d(0, ${left}px, 0) scaleX(${scaleY})`;
        element.value.style.opacity = '1';
    }

    function settle() {
        cancelAnimationFrame(frame);
        frame = 0;
        center = targetCenter;
        width = targetWidth;
        velocity = widthVelocity = stretch = stretchVelocity = 0;
        draw();
        complete?.(true);
        complete = undefined;
        exitBoundary = undefined;
    }

    function tick(time: number) {
        // Small integration steps keep the spring stable on slow frames and background-tab returns.
        const elapsed = Math.min((time - previousTime) / 1000, 0.064);
        previousTime = time;
        const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)));
        const dt = elapsed / steps;

        for (let step = 0; step < steps; step++) {
            velocity += ((targetCenter - center) * 240 - velocity * 28) * dt;
            center += velocity * dt;
            widthVelocity += ((targetWidth - width) * 240 - widthVelocity * 28) * dt;
            width += widthVelocity * dt;

            const targetStretch = Math.min(Math.abs(velocity) * 0.045, 38);
            stretchVelocity += ((targetStretch - stretch) * 320 - stretchVelocity * 30) * dt;
            stretch = Math.max(0, stretch + stretchVelocity * dt);
        }

        draw();
        if (exitBoundary) {
            const { left, length } = bounds();
            const crossed =
                exitBoundary.direction === 1
                    ? left >= exitBoundary.edge
                    : left + length <= exitBoundary.edge;
            if (crossed) {
                settle();
                return;
            }
        }
        const moving =
            Math.abs(targetCenter - center) > 0.05 ||
            Math.abs(targetWidth - width) > 0.05 ||
            Math.abs(velocity) > 0.1 ||
            Math.abs(widthVelocity) > 0.1 ||
            stretch > 0.05 ||
            Math.abs(stretchVelocity) > 0.1;

        if (moving) frame = requestAnimationFrame(tick);
        else settle();
    }

    function moveTo(left: number, nextWidth: number, immediate = false) {
        exitBoundary = undefined;
        complete?.(false);
        const result = new Promise<boolean>((resolve) => {
            complete = resolve;
        });
        targetCenter = left + nextWidth / 2;
        targetWidth = nextWidth;
        if (!initialized || immediate) {
            initialized = true;
            settle();
        } else if (!frame) {
            previousTime = performance.now();
            frame = requestAnimationFrame(tick);
        }
        return result;
    }

    function exitThrough(edge: number, direction: 1 | -1, length: number) {
        const destination = direction === 1 ? edge + length + 12 : edge - length * 2 - 12;
        const result = moveTo(destination, length);
        exitBoundary = { edge, direction };
        return result;
    }

    function hide() {
        cancelAnimationFrame(frame);
        frame = 0;
        initialized = false;
        complete?.(false);
        complete = undefined;
        exitBoundary = undefined;
        if (element.value) element.value.style.opacity = '0';
    }

    onBeforeUnmount(hide);

    return { moveTo, exitThrough, hide };
}
