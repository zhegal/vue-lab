<template>
    <div class="markdown-demo">
        <MarkdownToolbar
            v-model="mode"
            @select="loadFile"
            @reset="reset"
            @clear="clear"
        />
        <div class="document-info">
            <p class="document-name">
                {{ name }}
            </p>
            <p class="document-stats">
                {{ source.length.toLocaleString('en') }} characters · {{ lines }} lines
            </p>
        </div>
        <p
            v-if="error"
            class="import-error"
            role="alert"
        >
            {{ error }} Your current document was kept.
        </p>
        <p
            v-if="loading || message"
            class="import-status"
            role="status"
        >
            {{ loading ? 'Reading local file…' : message }}
        </p>
        <div class="panels" :class="{ 'split-view': mode === 'split' }">
            <MarkdownEditor
                v-show="mode !== 'preview'"
                :source="source"
                @update="updateSource"
            />
            <MarkdownPreview v-show="mode !== 'source'" :source="source" />
        </div>
        <p class="rendering-policy">
            Raw HTML is shown as text. Links accept HTTP(S) or mailto and open in a new tab. Images
            show their descriptions. Files stay in memory; nothing is uploaded or saved. UTF-8 · up
            to 256 KiB per file · {{ MAX_SOURCE_LENGTH.toLocaleString('en') }} characters.
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import MarkdownToolbar from './MarkdownToolbar.vue';
import MarkdownEditor from './MarkdownEditor.vue';
import MarkdownPreview from './MarkdownPreview.vue';
import { MAX_SOURCE_LENGTH, useMarkdownDocument } from './useMarkdownDocument';
import type { ViewMode } from './useMarkdownDocument';
import example from './example.md?raw';

const mode = ref<ViewMode>('split');
const { source, name, loading, error, message, updateSource, loadFile, reset, clear } =
    useMarkdownDocument(example);
const lines = computed(() => (source.value ? source.value.split('\n').length : 0));
</script>

<style scoped>
.markdown-demo {
    color: var(--text);
    background: var(--surface);
}
.document-info {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 14px 22px;
    border-bottom: 1px solid var(--border);
}
.document-name {
    min-width: 0;
    margin: 0;
    font-size: 12px;
    font-weight: 550;
    overflow-wrap: anywhere;
}
.document-stats {
    margin: 0;
    color: var(--muted);
    font-family: monospace;
    font-size: 11px;
}
.import-error,
.import-status {
    margin: 0;
    padding: 12px 22px;
    border-bottom: 1px solid var(--border);
    font-size: 12px;
    line-height: 1.8;
    overflow-wrap: anywhere;
}
.import-error {
    color: var(--text);
    background: var(--accent-soft);
}
.import-status {
    color: var(--secondary);
}
.panels {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1px;
    background: var(--border);
}
.split-view {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}
.rendering-policy {
    margin: 0;
    padding: 16px 22px;
    border-top: 1px solid var(--border);
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
@container (max-width: 800px) {
    .split-view {
        grid-template-columns: minmax(0, 1fr);
    }
}
@container (max-width: 600px) {
    .document-info,
    .import-error,
    .import-status,
    .rendering-policy {
        padding-inline: 16px;
    }
}
</style>
