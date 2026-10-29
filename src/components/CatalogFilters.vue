<template>
    <div class="catalog-filters">
        <div
            class="category-filters"
            role="group"
            aria-label="Filter by category"
        >
            <button
                v-for="item in ['All experiments', ...categories]"
                :key="item"
                type="button"
                class="filter-button"
                :class="{ selected: category === item }"
                :aria-pressed="category === item"
                @click="category = item"
            >
                <LabIcon v-if="item === 'All experiments'" name="grid" />
                {{ item }}
                <span v-if="item === 'All experiments'" class="filter-count">
                    {{ total }}
                </span>
            </button>
        </div>
        <label class="search-field">
            <LabIcon name="search" />
            <input
                v-model="search"
                type="search"
                placeholder="Search experiments…"
                aria-label="Search experiments"
            />
        </label>
    </div>
</template>

<script setup lang="ts">
import LabIcon from './LabIcon.vue';

defineProps<{ categories: string[]; total: number }>();
const search = defineModel<string>('search', { required: true });
const category = defineModel<string>('category', { required: true });
</script>
