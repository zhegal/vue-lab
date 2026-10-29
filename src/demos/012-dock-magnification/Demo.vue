<template>
    <div class="dock-demo">
        <DockPreview :settings="settings" />
        <DockControls v-model="settings" @reset="settings = { ...defaults }" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DockControls from './DockControls.vue';
import DockPreview from './DockPreview.vue';
import { defaults } from './settings';

const settings = ref({ ...defaults });
</script>

<style scoped>
.dock-demo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 280px;
    color: var(--text);
    background: var(--surface);
}

@container (max-width: 960px) {
    .dock-demo {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
