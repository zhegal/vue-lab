<template>
    <section class="documentation-panel" aria-label="Experiment documentation">
        <div
            v-if="failed"
            class="empty-state"
            role="alert"
        >
            <p>
                Documentation couldn’t load. Please try again.
            </p>
            <button
                class="button secondary"
                type="button"
                @click="attempt++"
            >
                Retry
            </button>
        </div>
        <!-- Only repository Markdown is rendered; raw HTML is disabled in the parser. -->
        <!-- eslint-disable vue/no-v-html -->
        <article
            v-else-if="html"
            class="markdown-content"
            v-html="html"
        ></article>
        <!-- eslint-enable vue/no-v-html -->
        <p
            v-else
            class="loading-state"
            role="status"
        >
            Loading documentation…
        </p>
    </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import MarkdownIt from 'markdown-it';
import type { DemoEntry } from '../core/types';

const props = defineProps<{ demo: DemoEntry }>();
const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });
const html = ref('');
const failed = ref(false);
const attempt = ref(0);

watch(
    [() => props.demo, attempt],
    async ([demo], _, onCleanup) => {
        let active = true;
        onCleanup(() => {
            active = false;
        });
        html.value = '';
        failed.value = false;

        try {
            const content = await demo.loadReadme();
            if (active) html.value = markdown.render(content) || '<p>No documentation yet.</p>';
        } catch (error) {
            if (active) failed.value = true;
            console.error('[Vue Lab] Documentation failed to load.', error);
        }
    },
    { immediate: true },
);
</script>
