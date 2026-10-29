<template>
    <section class="source-pane" :aria-labelledby="labelId">
        <h2 :id="labelId" class="pane-heading">
            Markdown source
        </h2>
        <textarea
            :value="source"
            :aria-labelledby="labelId"
            :maxlength="MAX_SOURCE_LENGTH"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
            wrap="off"
            placeholder="Write Markdown here…"
            @input="onInput"
        ></textarea>
    </section>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import { MAX_SOURCE_LENGTH } from './useMarkdownDocument';

defineProps<{ source: string }>();
const emit = defineEmits<{ update: [source: string] }>();
const labelId = useId();

function onInput(event: Event) {
    emit('update', (event.target as HTMLTextAreaElement).value);
}
</script>

<style scoped>
.source-pane {
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
textarea {
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 500px;
    min-height: 240px;
    max-height: 900px;
    padding: 20px;
    resize: vertical;
    border: 0;
    border-radius: 0;
    color: var(--text);
    background: var(--canvas);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 12px;
    line-height: 1.8;
    tab-size: 4;
}
textarea:focus-visible {
    outline-offset: -3px;
}
</style>
