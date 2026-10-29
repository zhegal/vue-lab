<template>
    <div class="liquid-tabs">
        <div class="pill">
            <div
                ref="viewport"
                class="tab-viewport"
                @scroll.passive="updateScroll"
            >
                <div
                    ref="track"
                    class="tab-track"
                    role="tablist"
                    aria-label="Example tabs"
                    @keydown="onKeydown"
                >
                    <span
                        ref="indicator"
                        class="liquid-indicator"
                        aria-hidden="true"
                    />
                    <button
                        v-for="tab in tabs"
                        :id="`${id}-tab-${tab.id}`"
                        :key="tab.id"
                        type="button"
                        role="tab"
                        :aria-selected="model === tab.id"
                        :aria-controls="`${id}-panel`"
                        :tabindex="model === tab.id ? 0 : -1"
                        @click="model = tab.id"
                    >
                        {{ tab.label }}
                    </button>
                </div>
            </div>
        </div>
        <div v-if="overflowing" class="scroll-controls">
            <span>
                Swipe, scroll horizontally or use the arrows
            </span>
            <div class="scroll-buttons">
                <button
                    type="button"
                    aria-label="Scroll tabs left"
                    :disabled="!canScrollLeft"
                    @click="scroll(-1)"
                >
                    <span aria-hidden="true">
                        ←
                    </span>
                </button>
                <button
                    type="button"
                    aria-label="Scroll tabs right"
                    :disabled="!canScrollRight"
                    @click="scroll(1)"
                >
                    <span aria-hidden="true">
                        →
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { LiquidTab } from './types';
import { useLiquidIndicator } from './useLiquidIndicator';

const props = defineProps<{ id: string; tabs: LiquidTab[] }>();
const model = defineModel<string>({ required: true });
const viewport = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const indicator = ref<HTMLElement | null>(null);
const overflowing = ref(false);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const { moveTo } = useLiquidIndicator(indicator);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let observer: ResizeObserver | undefined;
let mounted = false;

function tabButtons() {
    return Array.from(track.value?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
}

function activeButton() {
    return tabButtons().find((button) => button.getAttribute('aria-selected') === 'true');
}

function updateScroll() {
    const view = viewport.value;
    if (!view) return;
    const max = view.scrollWidth - view.clientWidth;
    overflowing.value = max > 1;
    canScrollLeft.value = view.scrollLeft > 1;
    canScrollRight.value = view.scrollLeft < max - 1;
}

function revealActive() {
    const view = viewport.value;
    const button = activeButton();
    if (!view || !button) return;
    const padding = 6;
    const left = button.offsetLeft - padding;
    const right = button.offsetLeft + button.offsetWidth + padding;
    let destination = view.scrollLeft;
    if (right - left > view.clientWidth || left < destination) destination = left;
    else if (right > destination + view.clientWidth) destination = right - view.clientWidth;
    view.scrollTo({ left: destination, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}

function measure(immediate = false) {
    const button = activeButton();
    if (button) moveTo(button.offsetLeft, button.offsetWidth, immediate || reducedMotion.matches);
    updateScroll();
}

function scroll(direction: number) {
    const view = viewport.value;
    if (!view) return;
    view.scrollBy({
        left: direction * view.clientWidth * 0.7,
        behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
}

function onKeydown(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const buttons = tabButtons();
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = buttons.length - 1;
    else
        nextIndex =
            (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    const tab = props.tabs[nextIndex];
    if (!tab) return;
    model.value = tab.id;
    buttons[nextIndex]?.focus({ preventScroll: true });
}

function onResize() {
    measure();
    revealActive();
}

watch(
    [model, () => props.tabs.map((tab) => `${tab.id}:${tab.label}`).join('|')],
    () => {
        measure();
        revealActive();
    },
    { flush: 'post' },
);

onMounted(() => {
    mounted = true;
    measure(true);
    observer = new ResizeObserver(onResize);
    if (viewport.value) observer.observe(viewport.value);
    if (track.value) observer.observe(track.value);
    reducedMotion.addEventListener('change', onResize);
    void document.fonts.ready.then(async () => {
        await nextTick();
        if (mounted) onResize();
    });
});

onBeforeUnmount(() => {
    mounted = false;
    observer?.disconnect();
    reducedMotion.removeEventListener('change', onResize);
});
</script>

<style scoped>
.liquid-tabs {
    min-width: 0;
    width: 100%;
}

.pill {
    width: max-content;
    max-width: 100%;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--surface);
    box-shadow: 0 3px 12px color-mix(in srgb, var(--text) 4%, transparent);
}

.tab-viewport {
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
}

.tab-viewport::-webkit-scrollbar {
    display: none;
}

.tab-track {
    position: relative;
    display: flex;
    gap: 4px;
    width: max-content;
    min-width: 100%;
    padding: 6px;
    overflow: clip;
    isolation: isolate;
}

.liquid-indicator {
    position: absolute;
    z-index: -1;
    top: 6px;
    left: 0;
    height: 44px;
    border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
    border-radius: 999px;
    background: var(--accent-soft);
    box-shadow: 0 2px 5px color-mix(in srgb, var(--accent) 10%, transparent);
    opacity: 0;
    pointer-events: none;
    will-change: transform, width;
}

.tab-track > button {
    flex: 0 0 auto;
    height: 44px;
    padding: 0 22px;
    border: 0;
    border-radius: 999px;
    color: var(--secondary);
    background: transparent;
    font-size: 13px;
    font-weight: 550;
    white-space: nowrap;
    cursor: pointer;
    transition: color 160ms;
}

.tab-track > button:hover,
.tab-track > button[aria-selected='true'] {
    color: var(--accent);
}

.tab-track > button:focus-visible {
    outline-offset: -3px;
}

.scroll-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 14px;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.6;
}

.scroll-buttons {
    display: flex;
    gap: 6px;
}

.scroll-buttons button {
    width: 34px;
    height: 34px;
    border: 1px solid var(--border);
    border-radius: 50%;
    color: var(--text);
    background: var(--surface);
    font-size: 17px;
    cursor: pointer;
}

.scroll-buttons button:hover:enabled {
    background: var(--surface-hover);
}

.scroll-buttons button:disabled {
    opacity: 0.35;
    cursor: default;
}

@media (prefers-reduced-motion: reduce) {
    .tab-track > button {
        transition: none;
    }
}
</style>
