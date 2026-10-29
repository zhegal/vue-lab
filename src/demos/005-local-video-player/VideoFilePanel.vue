<template>
    <section class="file-panel" aria-label="Local video file">
        <div class="file-actions">
            <label class="button secondary file-picker">
                <input
                    type="file"
                    accept="video/*,.mp4,.m4v,.webm,.ogv,.ogg,.mov,.mkv,.avi"
                    aria-label="Choose video"
                    @change="onChange"
                />
                <span>
                    Choose video
                </span>
            </label>
            <button
                v-if="file"
                class="button secondary"
                type="button"
                @click="$emit('remove')"
            >
                Remove video
            </button>
        </div>
        <div class="file-details">
            <p class="file-name">
                {{ file?.name ?? 'No file selected' }}
            </p>
            <p class="file-info">
                {{
                    file
                        ? `${formatBytes(file.size)} · ${file.type || 'Type not provided'}`
                        : 'Choose or drop one video. Files stay in your browser.'
                }}
                <span v-if="dimensions">
                    · {{ dimensions }}
                </span>
            </p>
        </div>
    </section>
</template>

<script setup lang="ts">
import { formatBytes } from './media';

defineProps<{ file: File | null; dimensions: string }>();
const emit = defineEmits<{ select: [files: File[]]; remove: [] }>();

function onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) emit('select', Array.from(input.files));
    input.value = '';
}
</script>

<style scoped>
.file-panel {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 18px;
    padding: 22px 24px;
}
.file-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.file-picker {
    position: relative;
    overflow: hidden;
}
.file-picker input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}
.file-picker:focus-within {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
}
.file-details {
    flex: 1 1 240px;
    min-width: 0;
}
.file-name {
    margin: 0;
    font-size: 12px;
    font-weight: 550;
    overflow-wrap: anywhere;
}
.file-info {
    margin: 6px 0 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
@container (max-width: 600px) {
    .file-panel {
        padding: 20px;
    }
}
</style>
