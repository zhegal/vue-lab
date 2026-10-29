<template>
    <div ref="root" class="overflow-tabs">
        <div class="overflow-pill">
            <div
                ref="track"
                class="horizontal-track"
                role="tablist"
                aria-label="Example tabs"
                @keydown="onKeydown"
            >
                <span
                    ref="indicator"
                    class="horizontal-indicator"
                    aria-hidden="true"
                />
                <button
                    v-for="tab in visibleTabs"
                    :id="`${id}-tab-${tab.id}`"
                    :key="tab.id"
                    class="tab-button"
                    type="button"
                    role="tab"
                    :aria-selected="model === tab.id"
                    :aria-controls="`${id}-panel`"
                    :tabindex="model === tab.id ? 0 : -1"
                    :data-tab-id="tab.id"
                    @click="model = tab.id"
                >
                    {{ tab.label }}
                </button>
                <button
                    v-if="hiddenTabs.length"
                    ref="moreButton"
                    class="tab-button more-button"
                    :class="{ 'has-selection': hiddenActive }"
                    type="button"
                    :aria-label="`More tabs (${hiddenTabs.length})`"
                    :aria-expanded="open"
                    :aria-controls="`${id}-overflow`"
                    @click="toggleMenu"
                    @keydown.down.prevent="showMenu(true)"
                    @keydown.up.prevent="showMenu(true, true)"
                >
                    <span aria-hidden="true">
                        »
                    </span>
                </button>
            </div>
        </div>
        <div
            ref="measurement"
            class="measurement"
            aria-hidden="true"
            inert
        >
            <span
                v-for="tab in tabs"
                :key="tab.id"
                class="tab-button"
            >
                {{ tab.label }}
            </span>
        </div>
        <OverflowMenu
            :id="id"
            ref="menu"
            :tabs="hiddenTabs"
            :active-id="model"
            @select="model = $event"
            @toggle="onMenuToggle"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import OverflowMenu from './OverflowMenu.vue';
import type { LiquidTab } from './types';
import { useOverflowMotion } from './useOverflowMotion';

const props = defineProps<{ id: string; tabs: LiquidTab[] }>();
const model = defineModel<string>({ required: true });
const root = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const measurement = ref<HTMLElement | null>(null);
const indicator = ref<HTMLElement | null>(null);
const moreButton = ref<HTMLButtonElement | null>(null);
const menu = ref<InstanceType<typeof OverflowMenu> | null>(null);
const verticalIndicator = computed(() => menu.value?.indicator ?? null);
const motion = useOverflowMotion(indicator, verticalIndicator);
const count = ref(0);
const open = ref(false);
const visibleTabs = computed(() => props.tabs.slice(0, count.value));
const hiddenTabs = computed(() => props.tabs.slice(count.value));
const hiddenActive = computed(() => hiddenTabs.value.some((tab) => tab.id === model.value));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let observer: ResizeObserver | undefined;
let mounted = false;

function syncSelection(immediate = false) {
    const horizontal = track.value;
    if (!horizontal) return;
    const vertical = menu.value?.track;
    const verticalButton =
        open.value && hiddenActive.value
            ? vertical?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
            : null;
    const menuViewport = vertical?.parentElement;
    if (verticalButton && menuViewport) {
        const top = verticalButton.offsetTop - 6;
        const bottom = verticalButton.offsetTop + verticalButton.offsetHeight + 6;
        if (top < menuViewport.scrollTop) menuViewport.scrollTop = top;
        else if (bottom > menuViewport.scrollTop + menuViewport.clientHeight) {
            menuViewport.scrollTop = bottom - menuViewport.clientHeight;
        }
    }
    const target =
        verticalButton ??
        horizontal.querySelector<HTMLButtonElement>('[aria-selected="true"]') ??
        moreButton.value;
    if (!target) return;
    void motion.moveTo(
        verticalButton ? 'vertical' : 'horizontal',
        verticalButton ? target.offsetTop : target.offsetLeft,
        verticalButton ? target.offsetHeight : target.offsetWidth,
        horizontal.clientWidth,
        menuViewport?.scrollTop ?? 0,
        immediate || reducedMotion.matches,
    );
}

async function fit(immediate = false) {
    if (!root.value || !measurement.value) return;
    const widths = Array.from(measurement.value.children).map(
        (item) => item.getBoundingClientRect().width,
    );
    const available = root.value.clientWidth;
    const gap = 4;
    const padding = 14;
    const total =
        widths.reduce((sum, width) => sum + width, 0) +
        Math.max(0, widths.length - 1) * gap +
        padding;
    let nextCount = widths.length;
    if (total > available) {
        let used = padding + 44;
        nextCount = 0;
        for (const width of widths) {
            if (used + gap + width > available) break;
            used += gap + width;
            nextCount++;
        }
    }
    count.value = nextCount;
    await nextTick();
    if (!mounted) return;
    if (!hiddenTabs.value.length) menu.value?.hide();
    menu.value?.position();
    syncSelection(immediate);
}

async function showMenu(focus = false, last = false) {
    if (!moreButton.value) return;
    open.value = true;
    await menu.value?.show(moreButton.value, focus, last);
    if (mounted) syncSelection();
}

function toggleMenu() {
    if (menu.value?.isOpen()) menu.value.hide();
    else void showMenu();
}

function onMenuToggle(value: boolean) {
    if (open.value === value) return;
    open.value = value;
    syncSelection();
}

function onKeydown(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const buttons = Array.from(track.value?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next =
        event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    const button = buttons[next];
    button?.focus({ preventScroll: true });
    if (button?.dataset.tabId) model.value = button.dataset.tabId;
}

function resize() {
    void fit(true);
}

watch(
    () => props.tabs.map((tab) => `${tab.id}:${tab.label}`),
    () => void fit(),
    { flush: 'post' },
);
watch(model, async () => {
    await nextTick();
    if (!mounted) return;
    if (hiddenActive.value && !open.value) await showMenu();
    else syncSelection();
});

onMounted(() => {
    mounted = true;
    void fit(true);
    observer = new ResizeObserver(resize);
    if (root.value) observer.observe(root.value);
    if (measurement.value) observer.observe(measurement.value);
    reducedMotion.addEventListener('change', resize);
    void document.fonts.ready.then(() => {
        if (mounted) resize();
    });
});

onBeforeUnmount(() => {
    mounted = false;
    observer?.disconnect();
    reducedMotion.removeEventListener('change', resize);
});
</script>

<style scoped>
.overflow-tabs {
    position: relative;
    min-width: 0;
    width: 100%;
}

.overflow-pill {
    width: max-content;
    max-width: 100%;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--surface);
    box-shadow: 0 3px 12px color-mix(in srgb, var(--text) 4%, transparent);
}

.horizontal-track,
.measurement {
    display: flex;
    gap: 4px;
    width: max-content;
}

.horizontal-track {
    position: relative;
    padding: 6px;
    overflow: clip;
    isolation: isolate;
}

.measurement {
    position: absolute;
    top: 0;
    left: 0;
    max-width: 100%;
    overflow: clip;
    visibility: hidden;
    pointer-events: none;
    contain: layout;
}

.tab-button {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
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
}

.tab-button:hover,
.tab-button[aria-selected='true'],
.more-button.has-selection {
    color: var(--accent);
}

.tab-button:focus-visible {
    outline-offset: -3px;
}

.more-button {
    width: 44px;
    padding: 0;
    font-size: 24px;
}

.horizontal-indicator {
    position: absolute;
    z-index: -1;
    top: 6px;
    left: 0;
    height: 44px;
    border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
    border-radius: 999px;
    background: var(--accent-soft);
    opacity: 0;
    pointer-events: none;
    will-change: transform, width;
}
</style>
