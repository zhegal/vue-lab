export type AnchorMode = 'anchor' | 'area' | 'popover';

export interface AnchorSettings {
    x: number;
    y: number;
    width: number;
    gap: number;
    centered: boolean;
    area: string;
    flip: boolean;
    matchWidth: boolean;
}

export const modes: { id: AnchorMode; label: string; description: string }[] = [
    {
        id: 'anchor',
        label: '01 · anchor()',
        description: 'Attach the orange square to the blue anchor, just like the reference.',
    },
    {
        id: 'area',
        label: '02 · Placement',
        description: 'Choose an area, then move the anchor to an edge to try overflow fallbacks.',
    },
    {
        id: 'popover',
        label: '03 · Popover',
        description:
            'Click the blue trigger. Its native popover uses the viewport as its boundary.',
    },
];

export const areas = [
    { value: 'top left', label: '↖' },
    { value: 'top', label: '↑' },
    { value: 'top right', label: '↗' },
    { value: 'left', label: '←' },
    { value: 'center', label: '·' },
    { value: 'right', label: '→' },
    { value: 'bottom left', label: '↙' },
    { value: 'bottom', label: '↓' },
    { value: 'bottom right', label: '↘' },
];

export const createSettings = (): AnchorSettings => ({
    x: 45,
    y: 62,
    width: 160,
    gap: 0,
    centered: false,
    area: 'top',
    flip: true,
    matchWidth: false,
});

export function getSupport() {
    const has = (property: string, value: string) =>
        typeof CSS !== 'undefined' && CSS.supports(property, value);
    return {
        anchor: has('anchor-name', '--test') && has('bottom', 'anchor(top)'),
        area: has('position-area', 'top'),
        flip: has('position-try-fallbacks', 'flip-block, flip-inline, flip-block flip-inline'),
        size: has('width', 'anchor-size(width)'),
        popover: typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype,
    };
}
