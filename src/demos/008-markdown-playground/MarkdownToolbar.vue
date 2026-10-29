<template>
    <div class="markdown-toolbar">
        <div class="file-actions">
            <label class="button secondary file-picker">
                <input
                    type="file"
                    accept=".md,.markdown,text/markdown"
                    aria-label="Open Markdown file"
                    @change="onFileChange"
                />
                <span>
                    Open .md
                </span>
            </label>
            <button
                class="button secondary"
                type="button"
                @click="$emit('reset')"
            >
                Reset example
            </button>
            <button
                class="button secondary"
                type="button"
                @click="$emit('clear')"
            >
                Clear
            </button>
        </div>
        <div
            class="mode-buttons"
            role="group"
            aria-label="Editor view"
        >
            <button
                v-for="view in views"
                :key="view.value"
                class="view-button"
                type="button"
                :aria-pressed="mode === view.value"
                @click="mode = view.value"
            >
                {{ view.label }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ViewMode } from './useMarkdownDocument';

const mode = defineModel<ViewMode>({ required: true });
const emit = defineEmits<{ select: [file: File]; reset: []; clear: [] }>();
const views: { value: ViewMode; label: string }[] = [
    { value: 'source', label: 'Source' },
    { value: 'split', label: 'Split' },
    { value: 'preview', label: 'Preview' },
];

function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) emit('select', file);
}
</script>

<style scoped>
.markdown-toolbar,
.file-actions,
.mode-buttons {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}
.markdown-toolbar {
    justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1px solid var(--border);
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
.mode-buttons {
    gap: 2px;
    padding: 3px;
    border: 1px solid var(--border);
    border-radius: 6px;
}
.view-button {
    min-height: 32px;
    padding: 6px 10px;
    border-radius: 3px;
    color: var(--secondary);
    font-size: 11px;
    cursor: pointer;
}
.view-button[aria-pressed='true'] {
    color: var(--accent);
    background: var(--accent-soft);
}
.view-button:hover {
    background: var(--surface-hover);
}
@container (max-width: 600px) {
    .markdown-toolbar {
        padding: 16px;
        gap: 14px;
    }
}
</style>
