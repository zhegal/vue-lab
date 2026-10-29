<template>
    <div
        v-if="failed"
        class="empty-state"
        role="alert"
    >
        <h2>
            The experiment couldn’t load.
        </h2>
        <p>
            Check your connection and try again.
        </p>
        <button
            class="button secondary"
            type="button"
            @click="attempt++"
        >
            Try again
        </button>
    </div>
    <component :is="component" v-else-if="component" />
    <div
        v-else
        class="loading-state"
        role="status"
    >
        Loading experiment…
    </div>
</template>

<script setup lang="ts">
import { onErrorCaptured, ref, shallowRef, watch } from 'vue';
import type { Component } from 'vue';
import type { DemoEntry } from '../core/types';

const props = defineProps<{ demo: DemoEntry }>();
const component = shallowRef<Component>();
const failed = ref(false);
const attempt = ref(0);

watch(
    [() => props.demo, attempt],
    async ([demo], _, onCleanup) => {
        let active = true;
        onCleanup(() => {
            active = false;
        });
        component.value = undefined;
        failed.value = false;

        try {
            const module = await demo.loadComponent();
            if (active) component.value = module.default;
        } catch (error) {
            if (active) failed.value = true;
            console.error('[Vue Lab] Experiment failed to load.', error);
        }
    },
    { immediate: true },
);

onErrorCaptured((error) => {
    failed.value = true;
    console.error('[Vue Lab] Experiment runtime error.', error);
    return false;
});
</script>
