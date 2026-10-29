<template>
    <div class="welcome-demo">
        <CardPreview :settings="settings" />
        <CardControls v-model="settings" @reset="reset" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { defaultSettings } from './settings';
import CardControls from './CardControls.vue';
import CardPreview from './CardPreview.vue';

const settings = ref({ ...defaultSettings });

function reset() {
    settings.value = { ...defaultSettings };
}
</script>

<style scoped>
.welcome-demo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 310px;
    min-height: 570px;
    color: var(--text);
    background: var(--surface);
}

@media (max-width: 760px) {
    .welcome-demo {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
