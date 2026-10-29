<template>
    <section class="recording-controls" aria-label="Video recording">
        <div class="recording-actions">
            <button
                class="button secondary record-button"
                type="button"
                :disabled="state.phase === 'idle' ? !state.canStart : state.phase === 'stopping'"
                @click="state.phase === 'idle' ? $emit('start') : $emit('stop')"
            >
                {{
                    state.phase === 'idle'
                        ? 'Record'
                        : state.phase === 'stopping'
                            ? 'Finishing…'
                            : 'Stop recording'
                }}
            </button>
            <p class="recording-state" role="status">
                {{
                    state.phase === 'recording'
                        ? 'Recording'
                        : state.phase === 'paused'
                            ? 'Recording paused with player'
                            : state.phase === 'stopping'
                                ? 'Finalizing clip…'
                                : state.clip
                                    ? 'Recording ready'
                                    : 'No recording'
                }}
            </p>
            <span v-if="state.phase !== 'idle'" class="recording-time">
                {{ formatTime(state.seconds) }} · {{ formatBytes(state.bytes) }}
            </span>
        </div>
        <p v-if="!state.supported" class="help">
            Video recording is unavailable here. Use a browser with video captureStream() and
            MediaRecorder support, such as current Chromium or Firefox.
        </p>
        <p v-else-if="state.phase !== 'idle'" class="help">
            {{ state.tracks }} · {{ state.mimeType }}. Pause follows the player; Stop keeps playback
            running. Automatic limits: 5 minutes of recording or about 128 MiB.
        </p>
        <p v-else class="help">
            Play the video, then Record to capture from the current position. Source audio may be
            recorded even when playback is muted. A completed take replaces the previous clip.
        </p>
        <div v-if="state.clip && state.phase === 'idle'" class="recording-result">
            <p class="clip-name">
                {{ state.clip.name }}
            </p>
            <p class="help">
                {{ formatTime(state.clip.seconds) }} · {{ formatBytes(state.clip.size) }} ·
                {{ state.clip.tracks }} · {{ state.clip.reason }}
            </p>
            <p class="help">
                {{ state.clip.mimeType }}
            </p>
            <div class="result-actions">
                <button
                    class="button secondary"
                    type="button"
                    @click="$emit('download')"
                >
                    Download clip
                </button>
                <button
                    class="button secondary"
                    type="button"
                    @click="$emit('discard')"
                >
                    Discard clip
                </button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { formatBytes, formatTime } from './media';
import type { RecordingView } from './recording';

defineProps<{ state: RecordingView }>();
defineEmits<{ start: []; stop: []; download: []; discard: [] }>();
</script>

<style scoped>
.recording-controls {
    padding: 14px 20px;
    border-top: 1px solid var(--border);
    background: var(--surface);
}
.recording-actions,
.result-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}
.record-button {
    width: 136px;
}
.record-button:disabled {
    opacity: 0.45;
    cursor: default;
}
.recording-state {
    margin: 0;
    color: var(--accent);
    font-size: 11px;
}
.recording-time {
    margin-left: auto;
    font-family: monospace;
    font-size: 11px;
    color: var(--secondary);
}
.help {
    margin: 8px 0 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.7;
    overflow-wrap: anywhere;
}
.recording-result {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
}
.clip-name {
    margin: 0;
    font-family: monospace;
    font-size: 11px;
    overflow-wrap: anywhere;
}
.result-actions {
    margin-top: 10px;
}
@container (max-width: 600px) {
    .recording-controls {
        padding-inline: 14px;
    }
    .recording-time {
        flex-basis: 100%;
        margin-left: 0;
    }
}
</style>
