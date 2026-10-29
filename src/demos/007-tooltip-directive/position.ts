export const placements = ['top', 'right', 'bottom', 'left'] as const;
export type Placement = (typeof placements)[number];

export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

const opposite: Record<Placement, Placement> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
};

export function placeTooltip(
    anchor: Rect,
    bubble: Pick<Rect, 'width' | 'height'>,
    viewport: Rect,
    preferred: Placement,
) {
    const padding = 8;
    const gap = 8;
    const right = anchor.left + anchor.width;
    const bottom = anchor.top + anchor.height;
    const bounds = {
        left: viewport.left + padding,
        top: viewport.top + padding,
        right: viewport.left + viewport.width - padding,
        bottom: viewport.top + viewport.height - padding,
    };
    const space: Record<Placement, number> = {
        top: anchor.top - bounds.top - gap,
        right: bounds.right - right - gap,
        bottom: bounds.bottom - bottom - gap,
        left: anchor.left - bounds.left - gap,
    };
    const needed = preferred === 'top' || preferred === 'bottom' ? bubble.height : bubble.width;
    const alternate = opposite[preferred];
    const placement =
        space[preferred] < needed && space[alternate] > space[preferred] ? alternate : preferred;
    let x = anchor.left + (anchor.width - bubble.width) / 2;
    let y = anchor.top + (anchor.height - bubble.height) / 2;

    if (placement === 'top') y = anchor.top - bubble.height - gap;
    if (placement === 'bottom') y = bottom + gap;
    if (placement === 'left') x = anchor.left - bubble.width - gap;
    if (placement === 'right') x = right + gap;

    return {
        x: Math.max(bounds.left, Math.min(x, bounds.right - bubble.width)),
        y: Math.max(bounds.top, Math.min(y, bounds.bottom - bubble.height)),
        placement,
    };
}
