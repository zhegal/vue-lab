<template>
    <div class="video-demo">
        <VideoFilePanel
            :file="file"
            :dimensions="dimensions"
            @select="selectFiles"
            @remove="clear"
        />
        <p
            v-if="inputError"
            class="error-notice"
            role="alert"
        >
            {{ inputError }}
        </p>
        <section
            ref="surface"
            class="player-surface"
            aria-label="Local video player"
            @keydown.esc="onEscape"
            @dragenter.prevent="onDragEnter"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
        >
            <div
                class="video-viewport"
                :class="{ 'drop-active': dragging }"
                tabindex="0"
                role="group"
                aria-label="Video viewport"
                :aria-describedby="helpId"
                @keydown="onKeydown"
                @wheel="onWheel"
            >
                <video
                    v-if="source"
                    :key="source"
                    ref="video"
                    :src="source"
                    playsinline
                    preload="metadata"
                    aria-label="Selected local video"
                    @loadedmetadata="sync"
                    @durationchange="sync"
                    @timeupdate="sync"
                    @play="sync"
                    @playing="sync"
                    @pause="sync"
                    @ended="sync"
                    @volumechange="sync"
                    @waiting="sync"
                    @error="onMediaError"
                    @click="togglePlayback"
                ></video>
                <div v-else class="empty-video">
                    <p>
                        Choose a video or drop it here
                    </p>
                    <span>
                        Local playback · no upload
                    </span>
                </div>
                <div
                    v-if="dragging"
                    class="drop-overlay"
                    aria-hidden="true"
                >
                    Drop one video file
                </div>
            </div>
            <VideoControls
                :ready="ready"
                :playing="playing"
                :current-time="currentTime"
                :duration="duration"
                :volume="volume"
                :muted="muted"
                :fullscreen="fullscreen"
                :fullscreen-supported="fullscreenSupported"
                @play="togglePlayback"
                @seek="seek"
                @volume="setVolume"
                @mute="toggleMute"
                @fullscreen="toggleFullscreen"
            />
            <p
                v-if="mediaError || actionError"
                class="playback-error"
                role="alert"
            >
                {{ mediaError || actionError }}
            </p>
        </section>
        <div class="player-info">
            <p class="player-status" role="status">
                {{ status }}
            </p>
            <p :id="helpId" class="keyboard-help">
                Focus the video area: Space / K to play or pause, ← / → to seek 5 seconds, ↑ / ↓ or
                the wheel for volume, M to mute, F for fullscreen. Esc exits fullscreen. Hovering
                does not change focus or page scrolling.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue';
import VideoFilePanel from './VideoFilePanel.vue';
import VideoControls from './VideoControls.vue';
import { useVideoPlayer } from './useVideoPlayer';

const video = ref<HTMLVideoElement | null>(null);
const surface = ref<HTMLElement | null>(null);
const helpId = useId();
const dragging = ref(false);
let dragDepth = 0;
const {
    file,
    source,
    inputError,
    mediaError,
    actionError,
    status,
    ready,
    playing,
    currentTime,
    duration,
    volume,
    muted,
    dimensions,
    fullscreen,
    fullscreenSupported,
    selectFiles,
    clear,
    sync,
    onMediaError,
    togglePlayback,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    onEscape,
    onKeydown,
    onWheel,
} = useVideoPlayer(video, surface);

function isFileDrag(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
}

function onDragEnter(event: DragEvent) {
    if (!isFileDrag(event)) return;
    dragDepth++;
    dragging.value = true;
}

function onDragOver(event: DragEvent) {
    if (isFileDrag(event) && event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
}

function onDragLeave() {
    dragDepth = Math.max(0, dragDepth - 1);
    dragging.value = dragDepth > 0;
}

function onDrop(event: DragEvent) {
    dragDepth = 0;
    dragging.value = false;
    if (event.dataTransfer?.files.length) selectFiles(Array.from(event.dataTransfer.files));
}
</script>

<style scoped>
.video-demo {
    color: var(--text);
    background: var(--surface);
}
.player-surface {
    margin: 0 24px;
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
}
.video-viewport {
    position: relative;
    aspect-ratio: 16 / 9;
    background: #090c11;
}
.video-viewport:focus-visible {
    outline-offset: -4px;
}
video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    cursor: pointer;
}
.empty-video {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    color: #d5deeb;
    text-align: center;
}
.empty-video p {
    margin: 0;
    font-size: 15px;
}
.empty-video span {
    color: #99a8bf;
    font-size: 11px;
}
.drop-overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 20px;
    color: #e6efff;
    background: #182e4ae6;
    border: 2px dashed #8bb9f5;
    font-size: 16px;
    pointer-events: none;
}
.player-info {
    padding: 18px 24px 24px;
}
.player-status {
    margin: 0 0 8px;
    color: var(--accent);
    font-size: 12px;
}
.keyboard-help {
    margin: 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
.error-notice,
.playback-error {
    margin: 0 24px 16px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text);
    background: var(--canvas);
    font-size: 12px;
    line-height: 1.7;
}
.playback-error {
    margin: 0;
    border-radius: 0;
}
.player-surface:fullscreen {
    display: flex;
    flex-direction: column;
    margin: 0;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 0;
    background: #090c11;
}
.player-surface:fullscreen .video-viewport {
    flex: 1;
    min-height: 0;
    aspect-ratio: auto;
}
@container (max-width: 600px) {
    .player-surface {
        margin-inline: 14px;
    }
    .player-info {
        padding-inline: 20px;
    }
    .error-notice {
        margin-inline: 14px;
    }
}
</style>
