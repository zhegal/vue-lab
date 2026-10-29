<template>
    <div class="shell empty-state not-found">
        <span class="eyebrow">
            404 / NOT FOUND
        </span>
        <h1>
            This experiment is still an idea.
        </h1>
        <p>
            We couldn’t find that page. There’s more to explore in the catalog.
        </p>
        <RouterLink to="/" class="button primary">
            <LabIcon name="back" />
            Back to experiments
        </RouterLink>
    </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import LabIcon from '../components/LabIcon.vue';
</script>
