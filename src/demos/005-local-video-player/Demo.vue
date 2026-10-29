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
            @keydown.capture="onControlsKeydown"
            @keydown.esc="onEscape"
            @pointermove="onControlsPointerMove"
            @pointerdown.capture="onControlsPointerDown"
            @pointerleave="onControlsPointerLeave"
            @dragenter.prevent="onDragEnter"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
        >
            <div
                ref="viewport"
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
                    @loadeddata="sync"
                    @seeking="sync"
                    @seeked="sync"
                    @durationchange="sync"
                    @timeupdate="sync"
                    @play="sync"
                    @playing="sync"
                    @pause="sync"
                    @ended="sync"
                    @volumechange="sync"
                    @waiting="sync"
                    @error="onMediaError"
                    @click="onVideoClick"
                    @dblclick="onVideoDoubleClick"
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
                    v-if="recording.phase !== 'idle'"
                    class="recording-indicator"
                    aria-hidden="true"
                >
                    {{
                        recording.phase === 'paused'
                            ? 'REC paused'
                            : recording.phase === 'stopping'
                                ? 'Finishing'
                                : 'REC'
                    }}
                    · {{ formatTime(recording.seconds) }}
                </div>
                <div
                    v-if="dragging"
                    class="drop-overlay"
                    aria-hidden="true"
                >
                    Drop one video file
                </div>
            </div>
            <div
                ref="controlsPanel"
                class="controls-panel"
                :class="{ 'is-hidden': fullscreen && !controlsVisible }"
                :inert="fullscreen && !controlsVisible"
                :aria-hidden="fullscreen && !controlsVisible ? true : undefined"
                @focusin="onControlsFocusIn"
                @focusout="onControlsFocusOut"
            >
                <VideoControls
                    :ready="ready"
                    :playing="playing"
                    :current-time="currentTime"
                    :duration="duration"
                    :volume="volume"
                    :muted="muted"
                    :fullscreen="fullscreen"
                    :fullscreen-supported="fullscreenSupported"
                    :can-capture="canCapture"
                    :capturing="capturing"
                    @play="togglePlayback"
                    @seek="seek"
                    @volume="setVolume"
                    @mute="toggleMute"
                    @fullscreen="toggleFullscreen"
                    @screenshot="captureFrame"
                />
                <RecordingControls
                    :state="recording"
                    @start="startRecording"
                    @stop="stopRecording"
                    @download="downloadRecording"
                    @discard="discardRecording"
                />
                <p
                    v-if="playbackError"
                    class="playback-error"
                    role="alert"
                >
                    {{ playbackError }}
                </p>
            </div>
        </section>
        <div class="player-info">
            <p class="player-status" role="status">
                {{ status }}
            </p>
            <p
                v-if="captureMessage"
                class="capture-message"
                role="status"
            >
                {{ captureMessage }}
            </p>
            <p :id="helpId" class="keyboard-help">
                Focus the video area: Space / K to play or pause, ← / → to seek 5 seconds, ↑ / ↓ or
                the wheel for volume, M to mute, F for fullscreen. Esc exits fullscreen. Hovering
                does not change focus or page scrolling. Double-click the video for fullscreen. In
                fullscreen, move to the bottom to reveal controls, or press Tab. Screenshot saves
                the current frame as PNG.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import VideoFilePanel from './VideoFilePanel.vue';
import VideoControls from './VideoControls.vue';
import RecordingControls from './RecordingControls.vue';
import { useVideoPlayer } from './useVideoPlayer';
import { useFrameCapture } from './useFrameCapture';
import { useFullscreenControls } from './useFullscreenControls';
import { useVideoRecorder } from './useVideoRecorder';
import { formatTime } from './media';

const video = ref<HTMLVideoElement | null>(null);
const surface = ref<HTMLElement | null>(null);
const viewport = ref<HTMLElement | null>(null);
const controlsPanel = ref<HTMLElement | null>(null);
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
    frameReady,
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
    onVideoClick,
    onVideoDoubleClick,
    onEscape,
    onKeydown,
    onWheel,
} = useVideoPlayer(video, surface);
const {
    capturing,
    canCapture,
    captureFrame,
    error: captureError,
    message: captureMessage,
} = useFrameCapture(video, file, frameReady);
const {
    view: recording,
    error: recordingError,
    start: startRecording,
    stop: stopRecording,
    download: downloadRecording,
    discard: discardRecording,
} = useVideoRecorder(video, file, frameReady, playing);
const playbackError = computed(
    () => mediaError.value || actionError.value || captureError.value || recordingError.value,
);
const controlsPinned = computed(
    () => !!playbackError.value || capturing.value || recording.value.phase === 'stopping',
);
const {
    visible: controlsVisible,
    onPointerMove: onControlsPointerMove,
    onPointerDown: onControlsPointerDown,
    onPointerLeave: onControlsPointerLeave,
    onKeydown: onControlsKeydown,
    onFocusIn: onControlsFocusIn,
    onFocusOut: onControlsFocusOut,
} = useFullscreenControls(fullscreen, surface, viewport, controlsPanel, controlsPinned);

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
    width: calc(100% - 48px);
    max-width: 720px;
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
.recording-indicator {
    position: absolute;
    z-index: 1;
    top: 12px;
    left: 12px;
    max-width: calc(100% - 24px);
    padding: 6px 9px;
    border-radius: 4px;
    color: #fff;
    background: #9d2b3a;
    font-family: monospace;
    font-size: 11px;
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
.capture-message {
    margin: 0 0 8px;
    color: var(--secondary);
    font-size: 11px;
    overflow-wrap: anywhere;
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
    display: block;
    margin: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    border: 0;
    border-radius: 0;
    background: #090c11;
}
.player-surface:fullscreen .video-viewport {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    aspect-ratio: auto;
}
.player-surface:fullscreen .controls-panel {
    position: absolute;
    z-index: 2;
    inset-inline: 0;
    bottom: 0;
    max-height: 80%;
    overflow-y: auto;
    overscroll-behavior: contain;
    opacity: 1;
    transform: translateY(0);
    transition:
        opacity 180ms ease,
        transform 180ms ease;
}
.player-surface:fullscreen .controls-panel.is-hidden {
    opacity: 0;
    transform: translateY(100%);
    pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
    .player-surface:fullscreen .controls-panel {
        transition: none;
    }
}
@container (max-width: 600px) {
    .player-surface {
        width: calc(100% - 28px);
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
