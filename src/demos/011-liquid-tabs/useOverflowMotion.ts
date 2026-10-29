import { onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';
import { useLiquidIndicator } from './useLiquidIndicator';

type Panel = 'horizontal' | 'vertical';

export function useOverflowMotion(
    horizontal: Ref<HTMLElement | null>,
    vertical: Ref<HTMLElement | null>,
) {
    const springs = {
        horizontal: useLiquidIndicator(horizontal),
        vertical: useLiquidIndicator(vertical, 'y'),
    };
    const lengths = { horizontal: 44, vertical: 44 };
    let panel: Panel | undefined;
    let revision = 0;

    async function moveTo(
        nextPanel: Panel,
        start: number,
        length: number,
        rightEdge: number,
        topEdge: number,
        immediate = false,
    ) {
        const currentRevision = ++revision;
        if (!panel || immediate) {
            springs.horizontal.hide();
            springs.vertical.hide();
            panel = nextPanel;
            lengths[nextPanel] = length;
            void springs[nextPanel].moveTo(start, length, true);
            return;
        }
        if (panel === nextPanel) {
            lengths[nextPanel] = length;
            void springs[nextPanel].moveTo(start, length);
            return;
        }

        const previousPanel = panel;
        const finished = await springs[panel].exitThrough(
            previousPanel === 'horizontal' ? rightEdge : topEdge,
            previousPanel === 'horizontal' ? 1 : -1,
            lengths[panel],
        );
        if (!finished || currentRevision !== revision) return;
        springs[previousPanel].hide();
        panel = nextPanel;
        lengths[nextPanel] = length;
        const entry = nextPanel === 'vertical' ? topEdge - length - 12 : rightEdge + 12;
        // Clip each panel's edge: the same capsule exits one panel before entering the other.
        void springs[nextPanel].moveTo(entry, length, true);
        void springs[nextPanel].moveTo(start, length);
    }

    onBeforeUnmount(() => revision++);

    return { moveTo };
}
