<template>
    <a
        v-if="!standalone"
        href="#main-content"
        class="skip-link"
        @click.prevent="focusMain"
    >
        Skip to content
    </a>
    <LabHeader v-if="!standalone" />
    <main
        id="main-content"
        tabindex="-1"
        :class="{ 'lab-main': !standalone }"
    >
        <RouterView />
    </main>
    <LabFooter v-if="!standalone" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import LabHeader from './components/LabHeader.vue';
import LabFooter from './components/LabFooter.vue';

const route = useRoute();
const standalone = computed(() => route.name === 'demo' && route.query.standalone === '1');

function focusMain() {
    document.getElementById('main-content')?.focus();
}
</script>
