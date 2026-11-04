<template>
    <section class="player" aria-label="Cover Flow album browser">
        <header>
            <span>
                LIBRARY / ALBUMS
            </span>
            <span>
                {{ String(active + 1).padStart(2, '0') }} / {{ albums.length }}
            </span>
        </header>
        <div
            class="stage"
            tabindex="0"
            role="region"
            aria-label="Albums. Use left and right arrow keys or swipe to browse."
            @keydown.left.prevent="move(-1)"
            @keydown.right.prevent="move(1)"
            @keydown.home.prevent="active = 0"
            @keydown.end.prevent="active = albums.length - 1"
            @pointerdown="startDrag"
            @pointerup="endDrag"
            @pointercancel="dragStart = null"
        >
            <button
                v-for="{ album, slot } in visibleAlbums"
                :key="slot"
                class="album"
                :class="{ selected: slot === cursor }"
                :style="position(slot)"
                :aria-label="`${album.artist} — ${album.title}`"
                :aria-pressed="slot === cursor"
                :tabindex="slot === cursor ? 0 : -1"
                :data-slot="slot"
                @click="select(slot)"
            >
                <AlbumCover :album="album" />
                <div class="reflection" aria-hidden="true">
                    <AlbumCover :album="album" />
                </div>
            </button>
        </div>
        <div
            class="caption"
            aria-live="polite"
            aria-atomic="true"
        >
            <h2>
                {{ current.title }}
            </h2>
            <p>
                {{ current.artist }} · {{ current.year }}
            </p>
        </div>
        <nav aria-label="Album navigation">
            <button aria-label="Previous album" @click="move(-1)">
                ←
            </button>
            <input
                v-model.number="active"
                type="range"
                min="0"
                :max="albums.length - 1"
                aria-label="Selected album"
                :aria-valuetext="current.title"
            />
            <button aria-label="Next album" @click="move(1)">
                →
            </button>
        </nav>
        <footer>
            Swipe or drag · Arrow keys · Click an album
        </footer>
    </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AlbumCover from './AlbumCover.vue';
import { albums } from './albums';

const cursor = ref(3);
const wrap = (value: number) => ((value % albums.length) + albums.length) % albums.length;
const active = computed({
    get: () => wrap(cursor.value),
    set: (index: number) => {
        const half = Math.floor(albums.length / 2);
        cursor.value += wrap(index - active.value + half) - half;
    },
});
// Stable virtual slots keep adjacent covers moving in the same direction across the boundary.
const visibleAlbums = computed(() =>
    Array.from({ length: 11 }, (_, index) => {
        const slot = cursor.value + index - 5;
        return { slot, index: wrap(slot), album: albums[wrap(slot)]! };
    }),
);
const current = computed(() => albums[active.value]!);
let dragStart: number | null = null;
let suppressClick = false;

function move(direction: number) {
    cursor.value += direction;
}

function select(index: number) {
    if (!suppressClick) cursor.value = index;
    suppressClick = false;
}

function startDrag(event: PointerEvent) {
    if (event.button !== 0) return;
    suppressClick = false;
    dragStart = event.clientX;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function endDrag(event: PointerEvent) {
    if (dragStart === null) return;
    const distance = event.clientX - dragStart;
    if (Math.abs(distance) > 30) {
        move(distance < 0 ? 1 : -1);
        suppressClick = true;
    } else {
        // Pointer capture retargets clicks to the stage; resolve the cover under the pointer.
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.album');
        const slot = (target as HTMLElement | null)?.dataset.slot;
        if (slot !== undefined) cursor.value = Number(slot);
    }
    dragStart = null;
}

function position(index: number) {
    const offset = index - cursor.value;
    const side = Math.sign(offset);
    const distance = Math.abs(offset);
    const rotation = side * Math.min(78, 54 + distance * 6);
    const x = offset === 0 ? 0 : side * 68 + offset * 36;
    const z = offset === 0 ? 70 : -Math.abs(offset) * 32;
    return {
        transform: `translateX(calc(-50% + ${x}%)) translateZ(${z}px) rotateY(${-rotation}deg)`,
        zIndex: albums.length - Math.abs(offset),
        // The outermost covers have no visible albums behind them.
        opacity: distance >= 4 ? Math.max(0, 1 - distance * 0.22) : 1,
        '--cover-dimming': distance >= 4 ? 0 : Math.min(1, distance * 0.22),
        visibility: Math.abs(offset) > 4 ? ('hidden' as const) : ('visible' as const),
    };
}
</script>

<style scoped>
.player {
    overflow: hidden;
    background: radial-gradient(ellipse at 50% 35%, #252b36, #080b10 70%);
    color: #f4f6fb;
    padding: 28px 24px;
    min-height: 620px;
}
header {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    letter-spacing: 0.16em;
    color: #a5adba;
}
.stage {
    position: relative;
    height: 390px;
    perspective: 1000px;
    touch-action: pan-y;
    cursor: grab;
    outline-offset: -4px;
}
.stage:active {
    cursor: grabbing;
}
.album {
    position: absolute;
    left: 50%;
    top: 65px;
    width: clamp(155px, 28vw, 250px);
    aspect-ratio: 1;
    padding: 0;
    border: 0;
    background: transparent;
    color: white;
    transform-style: preserve-3d;
    transition:
        transform 0.55s cubic-bezier(0.22, 0.7, 0.2, 1),
        filter 0.4s,
        opacity 0.4s;
    cursor: pointer;
}
.album.selected {
    filter: drop-shadow(0 15px 24px #0009);
}
.reflection {
    position: absolute;
    inset: calc(100% + 5px) 0 auto;
    height: 100%;
    transform: scaleY(-1);
    opacity: 0.25;
    mask-image: linear-gradient(to top, #000, transparent 70%);
    pointer-events: none;
}
.caption {
    text-align: center;
    position: relative;
    pointer-events: none;
}
h2 {
    margin: 0 0 7px;
    font-size: 24px;
    font-weight: 500;
}
p {
    color: #a5adba;
    margin: 0;
    font-size: 14px;
}
nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin: 25px auto 0;
    max-width: 360px;
}
nav button {
    border: 1px solid #ffffff24;
    border-radius: 50%;
    width: 38px;
    height: 38px;
    background: #ffffff09;
    color: white;
    font-size: 20px;
    cursor: pointer;
}
input {
    min-width: 0;
    flex: 1;
    accent-color: #609dff;
}
footer {
    text-align: center;
    margin-top: 24px;
    color: #8993a3;
    font-size: 12px;
}
@media (max-width: 600px) {
    .player {
        min-height: 530px;
        padding: 24px 12px;
    }
    .stage {
        height: 310px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .album {
        transition: none;
    }
}
</style>
