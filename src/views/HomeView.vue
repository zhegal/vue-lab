<template>
    <section aria-labelledby="index-title">
        <div class="index-heading">
            <h1 id="index-title">
                Experiments
            </h1>
            <span class="index-count">
                {{ demos.length }}
            </span>
        </div>
        <p class="index-description">
            Vue, CSS, and browser API experiments.
        </p>
        <ul v-if="demos.length" class="experiment-index">
            <li v-for="demo in demos" :key="demo.id">
                <RouterLink :to="`/demo/${demo.id}`" class="index-row">
                    <span class="index-number">
                        {{ demo.id.split('-')[0] }}
                    </span>
                    <div class="index-copy">
                        <h2>
                            {{ demo.title }}
                        </h2>
                        <p>
                            {{ demo.description }}
                        </p>
                        <DemoTags :tags="demo.tags" />
                    </div>
                    <span class="index-category">
                        {{ demo.category }}
                    </span>
                    <LabIcon name="arrow" />
                </RouterLink>
            </li>
        </ul>
        <p v-else class="empty-state">
            No experiments available.
        </p>
    </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { demos } from '../core/registry';
import DemoTags from '../components/DemoTags.vue';
import LabIcon from '../components/LabIcon.vue';
</script>

<style scoped>
.index-heading {
    display: flex;
    align-items: center;
    gap: 12px;
}

.index-heading h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.04em;
}

.index-count {
    padding: 3px 8px;
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--muted);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 11px;
}

.index-description {
    margin: 12px 0 28px;
    color: var(--secondary);
    font-size: 13px;
    line-height: 1.8;
}

.experiment-index {
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--border);
    list-style: none;
}

.index-row {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) 64px 20px;
    align-items: start;
    gap: 16px;
    padding: 24px 12px;
    border-bottom: 1px solid var(--border);
}

.index-row:hover {
    background: var(--surface-hover);
}

.index-number,
.index-category {
    padding-top: 3px;
    color: var(--muted);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 11px;
}

.index-category {
    color: var(--accent);
}

.index-copy h2 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 550;
}

.index-copy p {
    margin: 0 0 14px;
    color: var(--secondary);
    font-size: 13px;
    line-height: 1.7;
}

.index-row > svg {
    width: 16px;
    height: 16px;
    margin-top: 4px;
    color: var(--muted);
}

@media (max-width: 600px) {
    .index-row {
        grid-template-columns: 28px minmax(0, 1fr) 16px;
        gap: 12px;
        padding-inline: 0;
    }

    .index-category {
        display: none;
    }
}
</style>
