<template>
    <LabLayout v-if="!standalone">
        <RouterView />
    </LabLayout>
    <main
        v-else
        id="main-content"
        tabindex="-1"
    >
        <RouterView />
    </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import LabLayout from './layouts/LabLayout.vue';

const route = useRoute();
const standalone = computed(() => route.name === 'demo' && route.query.standalone === '1');
</script>
