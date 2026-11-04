<template>
    <div class="cover" :style="{ '--cover': album.color, '--accent': album.accent }">
        <span class="artist">
            {{ album.artist }}
        </span>
        <div class="art" />
        <span class="title">
            {{ album.title }}
        </span>
        <span class="edition">
            STEREO / {{ album.year }}
        </span>
    </div>
</template>

<script setup lang="ts">
import type { Album } from './albums';
defineProps<{ album: Album }>();
</script>

<style scoped>
.cover {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--cover);
    text-align: left;
    box-shadow: inset 0 0 0 1px #ffffff30;
}
/* Darken an opaque cover instead of exposing the albums behind it. */
.cover::after {
    content: '';
    position: absolute;
    inset: 0;
    background: #000;
    opacity: var(--cover-dimming, 0);
    transition: opacity 0.4s;
    pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
    .cover::after {
        transition: none;
    }
}
.artist {
    position: absolute;
    top: 9%;
    left: 9%;
    font-size: clamp(9px, 1.1vw, 12px);
    text-transform: uppercase;
    letter-spacing: 0.14em;
}
.art {
    position: absolute;
    width: 76%;
    height: 76%;
    left: 30%;
    top: 20%;
    border-radius: 50%;
    background: repeating-radial-gradient(
        ellipse at center,
        transparent 0 8px,
        var(--accent) 9px 12px,
        transparent 13px 19px
    );
    transform: rotate(-30deg) scaleX(0.7);
}
.title {
    position: absolute;
    bottom: 18%;
    left: 9%;
    max-width: 80%;
    font-size: clamp(22px, 3vw, 34px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
}
.edition {
    position: absolute;
    bottom: 7%;
    left: 9%;
    font-size: 8px;
    letter-spacing: 0.15em;
    opacity: 0.7;
}
</style>
