<template>
    <div class="empty-state">
        <span class="eyebrow">
            404 / NOT FOUND
        </span>
        <h1>
            Page not found
        </h1>
        <p>
            The requested page or experiment does not exist.
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
