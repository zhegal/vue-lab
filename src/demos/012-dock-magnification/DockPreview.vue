<template>
    <section class="dock-preview" aria-label="Dock magnification playground">
        <div class="preview-heading">
            <h2>
                Dock preview
            </h2>
            <span>
                {{ dockApps.length }} apps
            </span>
        </div>
        <div class="selection" role="status">
            <span class="eyebrow">
                Selected app
            </span>
            <p>
                {{ dockApps[selectedIndex]?.name }}
            </p>
        </div>
        <nav
            ref="rail"
            class="dock-rail"
            aria-label="Example applications"
            @pointermove="onPointerMove"
            @pointerleave="onPointerLeave"
            @pointercancel="onPointerLeave"
            @pointerdown="onPointerDown"
            @focusin="onFocusIn"
            @focusout="onFocusOut"
            @keydown="onKeydown"
        >
            <div class="dock-shelf" aria-hidden="true"></div>
            <ul class="dock-list">
                <li
                    v-for="(app, index) in dockApps"
                    :key="app.name"
                    class="dock-item"
                    :class="{ 'is-highlighted': highlightedIndex === index }"
                >
                    <div class="dock-bounce">
                        <span class="dock-label" aria-hidden="true">
                            {{ app.name }}
                        </span>
                        <button
                            type="button"
                            class="dock-button"
                            :data-dock-index="index"
                            :aria-label="app.name"
                            :aria-pressed="selectedIndex === index"
                            :style="{
                                background: `linear-gradient(150deg, ${app.color}, ${app.shade})`,
                            }"
                            @click="selectApp(index, $event)"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.6"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path
                                    v-for="path in app.paths"
                                    :key="path"
                                    :d="path"
                                />
                            </svg>
                        </button>
                    </div>
                    <span
                        class="running-dot"
                        :class="{ selected: selectedIndex === index }"
                        aria-hidden="true"
                    ></span>
                </li>
            </ul>
        </nav>
        <p class="preview-help">
            Move across the icons. Click or tap to select and bounce. Use Tab or ← / →, Home and End
            to explore with the keyboard.
        </p>
        <p
            v-if="reducedMotion"
            class="reduced-motion"
            role="status"
        >
            Reduced motion is active. Magnification and bounce are disabled.
        </p>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { dockApps } from './settings';
import type { DockSettings } from './settings';
import { useDockBounce } from './useDockBounce';
import { useDockMotion } from './useDockMotion';

const props = defineProps<{ settings: DockSettings }>();
const selectedIndex = ref(0);
const rail = ref<HTMLElement | null>(null);
const {
    highlightedIndex,
    reducedMotion,
    onPointerMove,
    onPointerLeave,
    onPointerDown,
    onFocusIn,
    onFocusOut,
    onKeydown,
} = useDockMotion(rail, () => props.settings, dockApps.length);
const { bounce } = useDockBounce(() => props.settings.animated && !reducedMotion.value);

function selectApp(index: number, event: MouseEvent) {
    selectedIndex.value = index;
    const button = event.currentTarget as HTMLButtonElement;
    if (button.parentElement) bounce(button.parentElement, button.getBoundingClientRect().width);
}
</script>

<style scoped>
.dock-preview {
    min-width: 0;
    padding: 30px clamp(12px, 3vw, 36px);
    background: var(--canvas);
}

.preview-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 550;
    letter-spacing: -0.02em;
}

.preview-heading > span {
    color: var(--muted);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 10px;
}

.selection {
    margin-top: 50px;
    text-align: center;
}

.selection > span {
    color: var(--muted);
}

.selection p {
    margin: 8px 0 0;
    font-size: 24px;
    font-weight: 550;
    letter-spacing: -0.03em;
}

.dock-rail {
    position: relative;
    height: 250px;
    isolation: isolate;
}

.dock-shelf {
    position: absolute;
    bottom: 9px;
    left: 50%;
    width: var(--shelf-width, 0px);
    height: calc(var(--icon-size, 52px) + 32px);
    transform: translateX(-50%);
    border: 1px solid var(--border);
    border-radius: 20px;
    background: color-mix(in srgb, var(--surface) 85%, transparent);
    box-shadow: 0 10px 24px -16px color-mix(in srgb, var(--text) 25%, transparent);
    pointer-events: none;
}

.dock-list {
    margin: 0;
    padding: 0;
    list-style: none;
}

.dock-item {
    position: absolute;
    bottom: 28px;
    left: 50%;
    width: var(--icon-size, 52px);
    height: var(--icon-size, 52px);
    transform: translate3d(var(--item-x, 0px), 0, 0);
    visibility: hidden;
    pointer-events: none;
}

.dock-rail[data-ready] .dock-item {
    visibility: visible;
}

.dock-bounce {
    position: relative;
    width: 100%;
    height: 100%;
}

.dock-button {
    display: grid;
    width: 100%;
    height: 100%;
    padding: 0;
    place-items: center;
    transform: scale(var(--item-scale, 1));
    transform-origin: left bottom;
    border: 1px solid rgb(255 255 255 / 20%);
    border-radius: 25%;
    color: white;
    box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 18%),
        0 3px 5px rgb(0 0 0 / 12%);
    cursor: pointer;
    pointer-events: auto;
}

.dock-button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
}

.dock-button svg {
    width: 62%;
    height: 62%;
}

.dock-label {
    position: absolute;
    bottom: calc(var(--item-width, 52px) + 12px);
    left: calc(var(--item-width, 52px) / 2);
    padding: 6px 9px;
    transform: translateX(-50%);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    background: var(--surface);
    font-size: 11px;
    white-space: nowrap;
    visibility: hidden;
}

.is-highlighted .dock-label {
    visibility: visible;
}

.running-dot {
    position: absolute;
    bottom: -11px;
    left: calc(var(--item-width, 52px) / 2 - 2px);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--text);
    opacity: 0;
}

.running-dot.selected {
    opacity: 1;
}

.preview-help,
.reduced-motion {
    max-width: 52ch;
    margin: 22px auto 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
    text-align: center;
}

.reduced-motion {
    margin-top: 12px;
    color: var(--accent);
}
</style>
