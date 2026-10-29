<template>
    <a
        href="#main-content"
        class="skip-link"
        @click.prevent="focusMain"
    >
        Skip to content
    </a>
    <LabHeader
        :navigation-id="drawerId"
        :navigation-open="navigationOpen"
        @open-navigation="openNavigation"
    />
    <aside class="lab-sidebar" aria-label="Experiment sidebar">
        <LabNavigation v-model:search="search" v-model:category="category" />
    </aside>
    <dialog
        :id="drawerId"
        ref="drawer"
        class="navigation-dialog"
        :aria-labelledby="drawerTitleId"
        @close="navigationOpen = false"
        @click="closeOnBackdrop"
    >
        <div class="drawer-content">
            <div class="drawer-heading">
                <h2 :id="drawerTitleId">
                    Navigation
                </h2>
                <button
                    type="button"
                    class="icon-button"
                    aria-label="Close navigation"
                    @click="closeNavigation"
                >
                    <LabIcon name="close" />
                </button>
            </div>
            <LabNavigation
                v-model:search="search"
                v-model:category="category"
                @navigate="selectPage"
            />
        </div>
    </dialog>
    <main
        id="main-content"
        class="lab-main"
        tabindex="-1"
    >
        <slot></slot>
    </main>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { useRoute } from 'vue-router';
import LabHeader from '../components/LabHeader.vue';
import LabNavigation from '../components/LabNavigation.vue';
import LabIcon from '../components/LabIcon.vue';

const route = useRoute();
const search = ref('');
const category = ref('');
const drawer = ref<HTMLDialogElement | null>(null);
const navigationOpen = ref(false);
const drawerId = useId();
const drawerTitleId = useId();
const desktop = window.matchMedia('(min-width: 901px)');

function focusMain() {
    document.getElementById('main-content')?.focus({ preventScroll: true });
}

function openNavigation() {
    if (!drawer.value || drawer.value.open) return;
    drawer.value.showModal();
    navigationOpen.value = true;
}

function closeNavigation() {
    drawer.value?.close();
    navigationOpen.value = false;
}

async function selectPage() {
    closeNavigation();
    await nextTick();
    focusMain();
}

function closeOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) closeNavigation();
}

function onBreakpointChange() {
    if (desktop.matches) closeNavigation();
}

watch(() => route.fullPath, closeNavigation);
onMounted(() => desktop.addEventListener('change', onBreakpointChange));
onBeforeUnmount(() => {
    closeNavigation();
    desktop.removeEventListener('change', onBreakpointChange);
});
</script>

<style scoped>
.lab-sidebar {
    position: fixed;
    top: var(--header-height);
    bottom: 0;
    left: 0;
    width: var(--sidebar-width);
    border-right: 1px solid var(--border);
    background: var(--background);
}

.lab-main {
    flex: 1;
    min-width: 0;
    margin-left: var(--sidebar-width);
    padding: 32px clamp(20px, 2.5vw, 40px) 40px;
}

.navigation-dialog {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(320px, calc(100vw - 32px));
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    border-right: 1px solid var(--border);
    color: var(--text);
    background: var(--background);
}

.navigation-dialog::backdrop {
    background: rgb(0 0 0 / 45%);
}

.drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.drawer-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    min-height: var(--header-height);
    padding: 12px 18px;
    border-bottom: 1px solid var(--border);
}

.drawer-heading h2 {
    font-size: 14px;
    font-weight: 600;
}

@media (max-width: 900px) {
    .lab-sidebar {
        display: none;
    }

    .lab-main {
        margin-left: 0;
        padding: 24px 20px 32px;
    }
}

@media (max-width: 480px) {
    .lab-main {
        padding-inline: 12px;
    }
}
</style>
