<template>
    <div
        :id="`${id}-overflow`"
        ref="popover"
        class="overflow-menu"
        popover="manual"
        @toggle="onToggle"
    >
        <div class="menu-viewport" @keydown="onKeydown">
            <div
                ref="track"
                class="menu-track"
                role="tablist"
                aria-label="More example tabs"
                aria-orientation="vertical"
            >
                <span
                    ref="indicator"
                    class="vertical-indicator"
                    aria-hidden="true"
                />
                <button
                    v-for="(tab, index) in tabs"
                    :id="`${id}-tab-${tab.id}`"
                    :key="tab.id"
                    type="button"
                    role="tab"
                    :aria-selected="activeId === tab.id"
                    :aria-controls="`${id}-panel`"
                    :tabindex="activeId === tab.id || (!containsActive && index === 0) ? 0 : -1"
                    @click="$emit('select', tab.id)"
                >
                    {{ tab.label }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import type { LiquidTab } from './types';

const props = defineProps<{ id: string; tabs: LiquidTab[]; activeId: string }>();
const emit = defineEmits<{ select: [id: string]; toggle: [open: boolean] }>();
const popover = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const indicator = ref<HTMLElement | null>(null);
const containsActive = computed(() => props.tabs.some((tab) => tab.id === props.activeId));
let anchor: HTMLElement | null = null;
let opened = false;

function position() {
    if (!opened || !anchor || !popover.value) return;
    const rect = anchor.getBoundingClientRect();
    const margin = 12;
    const below = window.innerHeight - rect.bottom - margin - 8;
    const above = rect.top - margin - 8;
    const height = Math.min(320, Math.max(below, above));
    popover.value.style.setProperty('--menu-height', `${Math.max(80, height)}px`);
    const bounds = popover.value.getBoundingClientRect();
    const left = Math.max(
        margin,
        Math.min(rect.right - bounds.width, window.innerWidth - bounds.width - margin),
    );
    const top =
        below >= Math.min(320, bounds.height) || below >= above
            ? rect.bottom + 8
            : Math.max(margin, rect.top - bounds.height - 8);
    popover.value.style.left = `${left}px`;
    popover.value.style.top = `${top}px`;
}

async function show(button: HTMLElement, focus = false, last = false) {
    anchor = button;
    opened = true;
    popover.value?.showPopover();
    await nextTick();
    position();
    if (focus) {
        const buttons = Array.from(
            track.value?.querySelectorAll<HTMLButtonElement>('button') ?? [],
        );
        const active = buttons.find((item) => item.getAttribute('aria-selected') === 'true');
        (active ?? (last ? buttons.at(-1) : buttons[0]))?.focus({ preventScroll: true });
    }
}

function isOpen() {
    return popover.value?.matches(':popover-open') ?? false;
}

function hide() {
    opened = false;
    popover.value?.hidePopover();
    emit('toggle', false);
}

function onToggle() {
    opened = isOpen();
    emit('toggle', opened);
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault();
        hide();
        anchor?.focus({ preventScroll: true });
        return;
    }
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const buttons = Array.from(track.value?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next =
        event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus({ preventScroll: true });
}

function onScroll(event: Event) {
    if (!(event.target instanceof Node) || !popover.value?.contains(event.target)) position();
}

function dismissOutside(event: PointerEvent) {
    if (!opened || !(event.target instanceof Node)) return;
    if (popover.value?.contains(event.target) || anchor?.parentElement?.contains(event.target))
        return;
    hide();
}

function dismissWithEscape(event: KeyboardEvent) {
    if (!opened || event.defaultPrevented || event.key !== 'Escape') return;
    event.preventDefault();
    hide();
    anchor?.focus({ preventScroll: true });
}

onMounted(() => {
    document.addEventListener('pointerdown', dismissOutside);
    window.addEventListener('keydown', dismissWithEscape);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', position);
});

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', dismissOutside);
    window.removeEventListener('keydown', dismissWithEscape);
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', position);
});

defineExpose({ show, hide, isOpen, track, indicator, position });
</script>

<style scoped>
.overflow-menu {
    position: fixed;
    inset: auto;
    width: min(340px, calc(100vw - 24px));
    margin: 0;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 22px;
    color: var(--text);
    background: var(--surface);
    box-shadow: 0 12px 36px color-mix(in srgb, var(--text) 12%, transparent);
}

.menu-viewport {
    max-height: var(--menu-height, 320px);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
}

.menu-track {
    position: relative;
    display: grid;
    gap: 4px;
    padding: 6px;
    overflow: clip;
    isolation: isolate;
}

.menu-track button {
    min-height: 44px;
    padding: 12px 18px;
    border: 0;
    border-radius: 22px;
    color: var(--secondary);
    background: transparent;
    font-size: 13px;
    font-weight: 550;
    line-height: 1.5;
    text-align: left;
    overflow-wrap: anywhere;
    cursor: pointer;
}

.menu-track button:hover,
.menu-track button[aria-selected='true'] {
    color: var(--accent);
}

.menu-track button:focus-visible {
    outline-offset: -3px;
}

.vertical-indicator {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 6px;
    width: calc(100% - 12px);
    border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
    border-radius: 22px;
    background: var(--accent-soft);
    opacity: 0;
    pointer-events: none;
    will-change: transform, height;
}
</style>
