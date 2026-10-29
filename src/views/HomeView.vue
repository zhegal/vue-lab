<template>
    <div class="shell">
        <section class="home-hero" aria-labelledby="home-title">
            <div class="hero-copy">
                <p class="eyebrow hero-eyebrow">
                    <span class="status-dot" aria-hidden="true"></span>
                    A PERSONAL FRONTEND PLAYGROUND
                </p>
                <h1 id="home-title">
                    Small experiments.
                    <br />
                    <span>
                        Endless possibilities.
                    </span>
                </h1>
                <p class="hero-description">
                    A space to explore ideas, break things, and see what works.
                    <br class="desktop-br" />
                    Interactive experiments in Vue, CSS, and the browser.
                </p>
                <div class="hero-meta">
                    <span class="flex items-center gap-2">
                        <LabIcon name="flask" />
                        {{ demos.length }} {{ demos.length === 1 ? 'experiment' : 'experiments' }}
                    </span>
                    <span class="meta-separator" aria-hidden="true">
                        /
                    </span>
                    <span>
                        Always a work in progress
                    </span>
                </div>
            </div>
            <div class="hero-illustration" aria-hidden="true">
                <div class="orbit orbit-one"></div>
                <div class="orbit orbit-two"></div>
                <div class="hero-code-tag tag-top">
                    &lt;script setup&gt;
                </div>
                <div class="hero-tile">
                    <svg viewBox="0 0 100 86" fill="none">
                        <path d="M0 0h20l30 52L80 0h20L50 86Z" fill="currentColor" />
                        <path d="M20 0h18l12 21L62 0h18L50 52Z" fill="var(--text)" />
                    </svg>
                </div>
                <div class="hero-code-tag tag-bottom">
                    ideas → interactions
                </div>
                <span class="orbit-point"></span>
            </div>
        </section>

        <section class="catalog-section" aria-labelledby="catalog-title">
            <div class="section-heading">
                <h2 id="catalog-title">
                    The experiments
                    <span class="section-count">
                        {{ demos.length.toString().padStart(2, '0') }}
                    </span>
                </h2>
                <span class="section-caption">
                    Explore. Adjust. Learn.
                </span>
            </div>
            <CatalogFilters
                v-model:search="search"
                v-model:category="category"
                :categories="categories"
                :total="demos.length"
            />
            <p class="results-caption" role="status">
                Showing {{ filteredDemos.length }} of {{ demos.length }} experiments
            </p>
            <div v-if="filteredDemos.length" class="demo-grid">
                <DemoCard
                    v-for="demo in filteredDemos"
                    :key="demo.id"
                    :demo="demo"
                />
            </div>
            <div v-else class="empty-state">
                <LabIcon name="search" />
                <h3>
                    No experiments found
                </h3>
                <p>
                    Try a different keyword or explore all categories.
                </p>
                <button
                    class="button secondary"
                    type="button"
                    @click="clearFilters"
                >
                    Clear filters
                </button>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { demos } from '../core/registry';
import CatalogFilters from '../components/CatalogFilters.vue';
import DemoCard from '../components/DemoCard.vue';
import LabIcon from '../components/LabIcon.vue';

const search = ref('');
const category = ref('All experiments');
const categories = [...new Set(demos.map((demo) => demo.category))].sort();
const filteredDemos = computed(() => {
    const query = search.value.trim().toLocaleLowerCase();
    return demos.filter((demo) => {
        const matchesCategory =
            category.value === 'All experiments' || demo.category === category.value;
        const searchable = [demo.title, demo.description, ...demo.tags]
            .join(' ')
            .toLocaleLowerCase();
        return matchesCategory && searchable.includes(query);
    });
});

function clearFilters() {
    search.value = '';
    category.value = 'All experiments';
}
</script>
