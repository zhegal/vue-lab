<template>
    <header class="lab-header">
        <div class="shell header-inner">
            <RouterLink
                to="/"
                class="brand"
                aria-label="Vue Lab home"
            >
                <span class="brand-mark" aria-hidden="true">
                    <LabIcon name="flask" />
                </span>
                <span>
                    Vue Lab
                    <span class="brand-dot">
                        .
                    </span>
                </span>
            </RouterLink>
            <nav class="header-nav" aria-label="Main navigation">
                <RouterLink
                    to="/"
                    class="nav-link"
                    :class="{ active: route.name === 'home' }"
                >
                    Experiments
                </RouterLink>
                <a
                    :href="repositoryUrl"
                    class="nav-link github-link"
                    target="_blank"
                    rel="noreferrer"
                >
                    GitHub
                    <LabIcon name="external" />
                </a>
                <span class="nav-divider" aria-hidden="true"></span>
                <button
                    class="icon-button"
                    type="button"
                    :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`"
                    @click="toggleTheme"
                >
                    <LabIcon :name="theme === 'light' ? 'moon' : 'sun'" />
                </button>
            </nav>
        </div>
    </header>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { repositoryUrl } from '../core/source';
import { useTheme } from '../core/theme';
import LabIcon from './LabIcon.vue';

const route = useRoute();
const { theme, toggleTheme } = useTheme();
</script>
