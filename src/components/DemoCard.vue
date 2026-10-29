<template>
    <RouterLink :to="`/demo/${demo.id}`" class="demo-card">
        <div class="card-art" aria-hidden="true">
            <div class="mini-card">
                <span class="mini-symbol">
                    ✳
                </span>
                <span class="mini-line"></span>
                <span class="mini-line short"></span>
                <span class="mini-pill"></span>
            </div>
            <span class="art-label">
                {{ demo.id.split('-')[0] }} / EXPERIMENT
            </span>
            <span class="art-arrow">
                <LabIcon name="arrow" />
            </span>
        </div>
        <div class="card-body">
            <div class="flex items-center justify-between gap-3">
                <span class="eyebrow category-label">
                    {{ demo.category }}
                </span>
                <span class="demo-number">
                    #{{ demo.id.split('-')[0] }}
                </span>
            </div>
            <h3>
                {{ demo.title }}
            </h3>
            <p>
                {{ demo.description }}
            </p>
            <DemoTags :tags="demo.tags" />
        </div>
    </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { DemoEntry } from '../core/types';
import DemoTags from './DemoTags.vue';
import LabIcon from './LabIcon.vue';

defineProps<{ demo: DemoEntry }>();
</script>
