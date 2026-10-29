<template>
    <div
        ref="stage"
        class="stage"
        :class="`mode-${mode}`"
        :style="stageStyle"
    >
        <span class="canvas-label" aria-hidden="true">
            {{ mode === 'popover' ? 'CANVAS · POPOVER CAN LEAVE THIS BOX' : 'CONTAINING BLOCK' }}
        </span>
        <button
            ref="anchor"
            class="anchor"
            type="button"
            :style="anchorStyle"
            :popovertarget="mode === 'popover' ? popoverId : undefined"
            :aria-label="
                mode === 'popover' ? 'Toggle anchored popover; drag to move' : 'Move anchor'
            "
            @pointerdown="startDrag"
            @pointermove="moveDrag"
            @pointerup="endDrag"
            @pointercancel="endDrag"
            @lostpointercapture="drag = null"
            @keydown="moveWithKeyboard"
            @click="onClick"
        >
            <span class="anchor-glyph" aria-hidden="true">
                ⠿
            </span>
            <span>
                {{ mode === 'popover' ? 'Open popover' : 'Anchor' }}
            </span>
            <span class="anchor-caption">
                {{ mode === 'popover' ? 'click to toggle · drag to move' : '--demo-anchor' }}
            </span>
        </button>
        <div
            v-if="mode === 'anchor'"
            class="square"
            :class="{ centered: settings.centered }"
        >
            <span>
                anchor()
            </span>
        </div>
        <div
            v-else-if="mode === 'area'"
            class="attached-card"
            :style="placementStyle"
        >
            <span class="card-heading">
                Attached element
            </span>
            <span class="card-detail">
                {{ settings.matchWidth ? 'anchor-size(width)' : 'position-area' }}
            </span>
        </div>
        <div
            v-else
            :id="popoverId"
            ref="popover"
            class="native-popover"
            popover="auto"
            role="dialog"
            aria-label="Anchored popover"
            :style="placementStyle"
            @toggle="onToggle"
        >
            <h3>
                Anchored popover
            </h3>
            <p>
                This panel is in the top layer. Scroll the page or move its trigger to see it
                follow.
            </p>
            <button
                class="button secondary"
                type="button"
                :popovertarget="popoverId"
                popovertargetaction="hide"
            >
                Close popover
            </button>
        </div>
        <span class="coordinate-label" aria-hidden="true">
            x {{ Math.round(settings.x) }}% · y {{ Math.round(settings.y) }}%
            {{ mode === 'popover' ? (popoverOpen ? '· open' : '· closed') : '' }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, type CSSProperties } from 'vue';
import { getSupport, type AnchorMode, type AnchorSettings } from './settings';

const settings = defineModel<AnchorSettings>({ required: true });
const props = defineProps<{ mode: AnchorMode }>();
const stage = ref<HTMLElement | null>(null);
const anchor = ref<HTMLButtonElement | null>(null);
const popover = ref<HTMLElement | null>(null);
const popoverOpen = ref(false);
const id = useId().replace(/[^a-zA-Z0-9-]/g, '');
const anchorName = `--lab-anchor-${id}`;
const popoverId = `anchor-popover-${id}`;
const support = getSupport();
const stageWidth = ref(600);
const stageHeight = ref(360);
const anchorHeight = computed(() => (props.mode === 'anchor' ? 140 : 88));
const anchorWidth = computed(() => Math.min(settings.value.width, stageWidth.value - 24));
const travelX = computed(() => Math.max(0, stageWidth.value - anchorWidth.value - 24));
const travelY = computed(() => Math.max(0, stageHeight.value - anchorHeight.value - 24));
const anchorStyle = computed<CSSProperties>(() => ({
    anchorName,
    width: `${anchorWidth.value}px`,
    height: `${anchorHeight.value}px`,
    left: `${12 + (travelX.value * settings.value.x) / 100}px`,
    top: `${12 + (travelY.value * settings.value.y) / 100}px`,
}));
const stageStyle = computed(() => ({
    '--demo-anchor': anchorName,
    '--anchor-gap': `${settings.value.gap}px`,
}));
const placementStyle = computed<CSSProperties>(() => ({
    positionAnchor: anchorName,
    positionArea: settings.value.area,
    positionTryFallbacks:
        settings.value.flip && support.flip
            ? 'flip-block, flip-inline, flip-block flip-inline'
            : 'none',
    width:
        settings.value.matchWidth && support.size
            ? 'anchor-size(width)'
            : props.mode === 'popover'
              ? '216px'
              : '148px',
}));

let observer: ResizeObserver | undefined;
let drag: {
    pointerId: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
} | null = null;
let moved = false;
const clamp = (value: number) => Math.min(100, Math.max(0, value));

function startDrag(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    moved = false;
    drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        x: settings.value.x,
        y: settings.value.y,
    };
    anchor.value?.setPointerCapture(event.pointerId);
}

function moveDrag(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.hypot(dx, dy) > 3) moved = true;
    if (!moved) return;
    settings.value = {
        ...settings.value,
        x: clamp(drag.x + (travelX.value ? (dx / travelX.value) * 100 : 0)),
        y: clamp(drag.y + (travelY.value ? (dy / travelY.value) * 100 : 0)),
    };
}

function endDrag(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (anchor.value?.hasPointerCapture(event.pointerId)) {
        anchor.value.releasePointerCapture(event.pointerId);
    }
    drag = null;
}

function onClick(event: MouseEvent) {
    if (moved && event.detail !== 0) event.preventDefault();
    moved = false;
}

function moveWithKeyboard(event: KeyboardEvent) {
    const directions: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const step = event.shiftKey ? 10 : 2;
    settings.value = {
        ...settings.value,
        x: clamp(settings.value.x + direction[0] * step),
        y: clamp(settings.value.y + direction[1] * step),
    };
}

function onToggle(event: Event) {
    popoverOpen.value = (event as ToggleEvent).newState === 'open';
}

onMounted(() => {
    if (!stage.value) return;
    observer = new ResizeObserver(([entry]) => {
        if (!entry) return;
        stageWidth.value = entry.contentRect.width;
        stageHeight.value = entry.contentRect.height;
    });
    observer.observe(stage.value);
});

onBeforeUnmount(() => {
    observer?.disconnect();
    if (drag && anchor.value?.hasPointerCapture(drag.pointerId)) {
        anchor.value.releasePointerCapture(drag.pointerId);
    }
    drag = null;
    if (popover.value?.matches(':popover-open')) popover.value.hidePopover();
});
</script>

<style scoped>
.stage {
    position: relative;
    isolation: isolate;
    height: 360px;
    overflow: clip;
    border: 1px solid var(--border);
    border-radius: 8px;
    background-color: var(--surface);
    background-image: radial-gradient(var(--dot) 1px, transparent 1px);
    background-size: 18px 18px;
}

.canvas-label,
.coordinate-label {
    position: absolute;
    z-index: -1;
    right: 12px;
    color: var(--muted);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 9px;
    pointer-events: none;
}

.canvas-label {
    top: 12px;
}

.coordinate-label {
    bottom: 12px;
}

.anchor {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border: 1px solid #2855a1;
    border-radius: 9px;
    color: #fff;
    background: #3767b0;
    box-shadow: 0 5px 16px #2244771a;
    font-size: 14px;
    cursor: grab;
    touch-action: none;
    user-select: none;
}

.anchor:active {
    cursor: grabbing;
}

.anchor-glyph {
    font-size: 20px;
    line-height: 1;
    opacity: 0.75;
}

.anchor-caption {
    max-width: 100%;
    padding-inline: 5px;
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 9px;
    text-align: center;
    overflow-wrap: anywhere;
    opacity: 0.8;
}

.square {
    position: absolute;
    position-anchor: var(--demo-anchor);
    bottom: calc(anchor(top) + var(--anchor-gap));
    left: anchor(center);
    display: grid;
    width: 64px;
    height: 64px;
    place-items: center;
    border: 1px solid #bc770b;
    border-radius: 6px;
    color: #4a2c00;
    background: #ffac19;
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 10px;
    pointer-events: none;
}

.square.centered {
    translate: -50% 0;
}

.attached-card {
    position: absolute;
    display: grid;
    height: 68px;
    align-content: center;
    gap: 8px;
    margin: var(--anchor-gap);
    padding: 10px;
    border: 1px solid #bc770b;
    border-radius: 7px;
    color: #4a2c00;
    background: #ffbd51;
    text-align: center;
    pointer-events: none;
}

.card-heading {
    font-size: 11px;
    font-weight: 600;
}

.card-detail {
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 9px;
}

.native-popover {
    position: fixed;
    inset: auto;
    box-sizing: border-box;
    max-width: calc(100vw - 24px);
    margin: var(--anchor-gap);
    padding: 18px;
    border: 1px solid var(--border);
    border-radius: 9px;
    color: var(--text);
    background: var(--surface);
    box-shadow: 0 12px 40px #10213b26;
}

.native-popover h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
}

.native-popover p {
    margin: 10px 0 16px;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}

.native-popover .button {
    width: 100%;
    min-height: 32px;
    font-size: 11px;
}
</style>
