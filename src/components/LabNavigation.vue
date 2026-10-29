<template>
    <div class="experiment-navigation">
        <div class="navigation-tools">
            <div class="navigation-title">
                <h2>
                    Experiments
                </h2>
                <span>
                    {{ demos.length }}
                </span>
            </div>
            <label class="navigation-search">
                <LabIcon name="search" />
                <input
                    v-model="search"
                    type="search"
                    placeholder="Search experiments"
                    aria-label="Search experiments"
                />
            </label>
            <label class="category-select">
                <span class="sr-only">
                    Category
                </span>
                <select v-model="category" aria-label="Category">
                    <option value="">
                        All categories
                    </option>
                    <option
                        v-for="item in categories"
                        :key="item"
                        :value="item"
                    >
                        {{ item }}
                    </option>
                </select>
                <LabIcon name="chevron" />
            </label>
        </div>
        <nav class="navigation-links" aria-label="Experiments">
            <RouterLink
                to="/"
                class="overview-link"
                @click="$emit('navigate')"
            >
                <LabIcon name="grid" />
                Overview
            </RouterLink>
            <section
                v-for="group in groups"
                :key="group.category"
                class="navigation-group"
            >
                <h3>
                    {{ group.category }}
                </h3>
                <ul>
                    <li v-for="demo in group.demos" :key="demo.id">
                        <RouterLink
                            :to="`/demo/${demo.id}`"
                            class="experiment-link"
                            @click="$emit('navigate')"
                        >
                            <span class="navigation-number">
                                {{ demo.id.split('-')[0] }}
                            </span>
                            <span>
                                {{ demo.title }}
                            </span>
                        </RouterLink>
                    </li>
                </ul>
            </section>
            <div v-if="!filteredDemos.length" class="navigation-empty">
                <p>
                    No experiments found.
                </p>
                <button type="button" @click="clearFilters">
                    Clear filters
                </button>
            </div>
        </nav>
        <p class="sr-only" role="status">
            {{ filteredDemos.length }} of {{ demos.length }} experiments
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { demos } from '../core/registry';
import LabIcon from './LabIcon.vue';

const search = defineModel<string>('search', { required: true });
const category = defineModel<string>('category', { required: true });
defineEmits<{ navigate: [] }>();

const categories = [...new Set(demos.map((demo) => demo.category))].sort();
const filteredDemos = computed(() => {
    const query = search.value.trim().toLocaleLowerCase();
    return demos.filter((demo) => {
        const matchesCategory = !category.value || demo.category === category.value;
        const text = [demo.id, demo.title, demo.description, ...demo.tags]
            .join(' ')
            .toLocaleLowerCase();
        return matchesCategory && text.includes(query);
    });
});
const groups = computed(() => {
    const names = [...new Set(filteredDemos.value.map((demo) => demo.category))];
    return names.map((name) => ({
        category: name,
        demos: filteredDemos.value.filter((demo) => demo.category === name),
    }));
});

function clearFilters() {
    search.value = '';
    category.value = '';
}
</script>

<style scoped>
.experiment-navigation {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
}

.navigation-tools {
    flex-shrink: 0;
    padding: 25px 18px 16px;
}

.navigation-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.navigation-title h2 {
    font-size: 13px;
    font-weight: 600;
}

.navigation-title > span {
    color: var(--muted);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 11px;
}

.navigation-search {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--surface);
}

.navigation-search svg {
    flex-shrink: 0;
    width: 15px;
    height: 15px;
    color: var(--muted);
}

.navigation-search input {
    width: 100%;
    min-width: 0;
    padding: 0;
    outline: none;
    background: transparent;
    font-size: 12px;
}

.navigation-search:focus-within {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}

.category-select {
    position: relative;
    display: block;
    margin-top: 10px;
}

.category-select select {
    width: 100%;
    min-height: 36px;
    padding: 7px 28px 7px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    appearance: none;
    color: var(--secondary);
    background: var(--background);
    font-size: 12px;
    cursor: pointer;
}

.category-select svg {
    position: absolute;
    top: 11px;
    right: 10px;
    width: 14px;
    height: 14px;
    color: var(--muted);
    pointer-events: none;
}

.navigation-links {
    min-height: 0;
    padding: 0 12px 24px;
    overflow-y: auto;
    overscroll-behavior: contain;
}

.overview-link,
.experiment-link {
    display: flex;
    align-items: center;
    gap: 11px;
    min-height: 38px;
    padding: 9px 12px;
    border-radius: 5px;
    color: var(--secondary);
    font-size: 13px;
    line-height: 1.5;
}

.overview-link svg {
    width: 15px;
    height: 15px;
}

.navigation-group {
    margin-top: 24px;
}

.navigation-group h3 {
    margin: 0 12px 7px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 600;
}

.navigation-group ul {
    display: grid;
    gap: 3px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.overview-link:hover,
.experiment-link:hover {
    color: var(--text);
    background: var(--surface);
}

.overview-link[aria-current='page'],
.experiment-link[aria-current='page'] {
    color: var(--accent);
    background: var(--accent-soft);
    box-shadow: inset 2px 0 var(--accent);
    font-weight: 550;
}

.navigation-number {
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 10px;
    opacity: 0.75;
}

.navigation-empty {
    margin: 24px 12px;
    color: var(--secondary);
    font-size: 12px;
    line-height: 1.7;
}

.navigation-empty button {
    margin-top: 10px;
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
}
</style>
