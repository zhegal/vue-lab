<template>
    <NotFoundView v-if="!demo" />
    <div v-else :class="{ 'demo-page': !standalone }">
        <div v-if="!standalone" class="demo-heading">
            <div class="demo-heading-row">
                <div>
                    <p class="eyebrow category-label">
                        EXPERIMENT {{ demo.id.split('-')[0] }}
                        <span class="meta-separator">
                            /
                        </span>
                        {{ demo.category }}
                    </p>
                    <h1>
                        {{ demo.title }}
                    </h1>
                    <p class="demo-description">
                        {{ demo.description }}
                    </p>
                    <DemoTags :tags="demo.tags" />
                </div>
                <a
                    :href="demoSourceUrl(demo.id)"
                    class="button secondary source-button"
                    target="_blank"
                    rel="noreferrer"
                >
                    <LabIcon name="code" />
                    View source
                    <LabIcon name="external" />
                </a>
            </div>
        </div>
        <section
            class="demo-stage"
            :class="{ 'demo-workspace': !standalone }"
            aria-label="Interactive experiment"
        >
            <div v-if="!standalone" class="workspace-toolbar">
                <span class="workspace-label">
                    Demo
                </span>
                <div class="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        class="toolbar-button"
                        :aria-expanded="documentationOpen"
                        aria-controls="demo-documentation"
                        @click="documentationOpen = !documentationOpen"
                    >
                        <LabIcon name="book" />
                        Documentation
                    </button>
                    <RouterLink
                        :to="{ name: 'demo', params: { id: demo.id }, query: { standalone: '1' } }"
                        class="toolbar-button"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <LabIcon name="external" />
                        Standalone
                    </RouterLink>
                </div>
            </div>
            <DemoRunner :key="demo.id" :demo="demo" />
        </section>
        <div
            v-if="!standalone"
            id="demo-documentation"
            class="documentation-container"
            :hidden="!documentationOpen"
        >
            <DemoDocumentation v-if="documentationOpen" :demo="demo" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { findDemo } from '../core/registry';
import { demoSourceUrl } from '../core/source';
import DemoRunner from '../components/DemoRunner.vue';
import DemoTags from '../components/DemoTags.vue';
import LabIcon from '../components/LabIcon.vue';
import NotFoundView from './NotFoundView.vue';

const DemoDocumentation = defineAsyncComponent(() => import('../components/DemoDocumentation.vue'));
const route = useRoute();
const demo = computed(() => findDemo(String(route.params.id)));
const standalone = computed(() => route.query.standalone === '1');
const documentationOpen = ref(false);

watch(
    demo,
    (value) => {
        documentationOpen.value = false;
        document.title = value ? `${value.title} — Vue Lab` : 'Experiment not found — Vue Lab';
    },
    { immediate: true },
);
</script>
