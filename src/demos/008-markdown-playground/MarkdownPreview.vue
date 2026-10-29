<template>
    <section class="preview-pane" :aria-labelledby="headingId">
        <h2 :id="headingId" class="pane-heading">
            Rendered preview
        </h2>
        <div
            class="preview-scroll"
            tabindex="0"
            role="region"
            aria-label="Markdown preview"
        >
            <!-- Only output from the restricted parser is allowed into this HTML sink. -->
            <!-- eslint-disable vue/no-v-html -->
            <article
                v-if="html"
                class="preview-content"
                v-html="html"
            ></article>
            <!-- eslint-enable vue/no-v-html -->
            <p v-else class="empty-preview">
                Nothing to preview. Write Markdown or open a .md file.
            </p>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import { renderMarkdown } from './markdown';

const props = defineProps<{ source: string }>();
const headingId = useId();
const html = computed(() => renderMarkdown(props.source));
</script>

<style scoped>
.preview-pane {
    min-width: 0;
    background: var(--surface);
}
.pane-heading {
    margin: 0;
    padding: 13px 20px;
    border-bottom: 1px solid var(--border);
    color: var(--secondary);
    font-size: 12px;
    font-weight: 500;
}
.preview-scroll {
    height: 500px;
    padding: 22px;
    overflow: auto;
}
.preview-scroll:focus-visible {
    outline-offset: -3px;
}
.preview-content {
    color: var(--text);
    font-size: 13px;
    line-height: 1.85;
    overflow-wrap: anywhere;
}
.preview-content :deep(:first-child) {
    margin-top: 0;
}
.preview-content :deep(:is(h1, h2, h3, h4, h5, h6)) {
    margin: 24px 0 12px;
    font-weight: 600;
    line-height: 1.4;
}
.preview-content :deep(h1) {
    font-size: 24px;
    letter-spacing: -0.03em;
}
.preview-content :deep(h2) {
    font-size: 19px;
}
.preview-content :deep(h3) {
    font-size: 16px;
}
.preview-content :deep(:is(p, ul, ol, blockquote, pre, table)) {
    margin: 14px 0;
}
.preview-content :deep(:is(ul, ol)) {
    padding-left: 24px;
    list-style: revert;
}
.preview-content :deep(a) {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 3px;
}
.preview-content :deep(blockquote) {
    margin-inline: 0;
    padding-left: 14px;
    border-left: 3px solid var(--accent);
    color: var(--secondary);
}
.preview-content :deep(code) {
    padding: 2px 5px;
    border-radius: 3px;
    background: var(--canvas);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 0.9em;
}
.preview-content :deep(pre) {
    padding: 14px;
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 5px;
    background: var(--canvas);
}
.preview-content :deep(pre code) {
    padding: 0;
}
.preview-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
}
.preview-content :deep(:is(th, td)) {
    padding: 7px 10px;
    border: 1px solid var(--border);
    text-align: left;
}
.preview-content :deep(th) {
    background: var(--canvas);
    font-weight: 600;
}
.preview-content :deep(hr) {
    margin: 24px 0;
    border-color: var(--border);
}
.preview-content :deep(.image-description),
.empty-preview {
    color: var(--secondary);
    font-size: 12px;
}
.empty-preview {
    margin: 0;
    line-height: 1.8;
}
</style>
