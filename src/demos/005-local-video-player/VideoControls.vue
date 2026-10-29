<template>
    <div
        class="video-controls"
        role="group"
        aria-label="Playback controls"
    >
        <div class="seek-row">
            <label class="sr-only" :for="`${id}-seek`">
                Playback position
            </label>
            <input
                :id="`${id}-seek`"
                type="range"
                min="0"
                :max="duration || 1"
                step="0.1"
                :value="currentTime"
                :disabled="!ready || !duration"
                :aria-valuetext="`${formatTime(currentTime)} of ${formatTime(duration)}`"
                @input="$emit('seek', Number(($event.target as HTMLInputElement).value))"
            />
            <output class="time">
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </output>
        </div>
        <div class="buttons-row">
            <button
                class="button secondary"
                type="button"
                :disabled="!ready"
                @click="$emit('play')"
            >
                {{ playing ? 'Pause' : 'Play' }}
            </button>
            <button
                class="button secondary"
                type="button"
                :disabled="!ready"
                :aria-label="muted || volume === 0 ? 'Unmute' : 'Mute'"
                :aria-pressed="muted || volume === 0"
                @click="$emit('mute')"
            >
                {{ muted || volume === 0 ? 'Unmute' : 'Mute' }}
            </button>
            <div class="volume-control">
                <label :for="`${id}-volume`">
                    Volume
                </label>
                <input
                    :id="`${id}-volume`"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    :value="Math.round(volume)"
                    :disabled="!ready"
                    :aria-valuetext="`${Math.round(volume)} percent${muted ? ', muted' : ''}`"
                    @input="$emit('volume', Number(($event.target as HTMLInputElement).value))"
                />
                <output :for="`${id}-volume`">
                    {{ muted ? 'Muted' : `${Math.round(volume)}%` }}
                </output>
            </div>
            <button
                class="button secondary fullscreen-button"
                type="button"
                :disabled="!fullscreenSupported"
                :aria-pressed="fullscreen"
                @click="$emit('fullscreen')"
            >
                {{ fullscreen ? 'Exit fullscreen' : 'Fullscreen' }}
            </button>
        </div>
        <p v-if="!fullscreenSupported" class="fullscreen-help">
            The Fullscreen API is unavailable in this browser context.
        </p>
    </div>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import { formatTime } from './media';

defineProps<{
    ready: boolean;
    playing: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    muted: boolean;
    fullscreen: boolean;
    fullscreenSupported: boolean;
}>();
defineEmits<{
    play: [];
    mute: [];
    seek: [seconds: number];
    volume: [percent: number];
    fullscreen: [];
}>();
const id = useId();
</script>

<style scoped>
.video-controls {
    flex-shrink: 0;
    padding: 16px 20px;
    background: var(--surface);
}
.seek-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-bottom: 14px;
}
.seek-row input {
    flex: 1 1 160px;
    min-width: 0;
}
input[type='range'] {
    height: 20px;
    margin: 0;
    accent-color: var(--accent);
    cursor: pointer;
}
.time {
    font-family: monospace;
    font-size: 11px;
    color: var(--secondary);
}
.buttons-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}
.volume-control {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1 1 240px;
    font-size: 11px;
}
.volume-control input {
    flex: 1;
    min-width: 60px;
    max-width: 160px;
}
.volume-control output {
    min-width: 42px;
    color: var(--secondary);
}
.fullscreen-button {
    margin-left: auto;
}
.fullscreen-help {
    margin: 12px 0 0;
    color: var(--muted);
    font-size: 11px;
}
button:disabled,
input:disabled {
    opacity: 0.45;
    cursor: default;
}
@container (max-width: 600px) {
    .video-controls {
        padding: 14px;
    }
    .volume-control {
        order: 1;
        flex-basis: 100%;
        margin-top: 8px;
    }
    .volume-control input {
        max-width: none;
    }
}
</style>
