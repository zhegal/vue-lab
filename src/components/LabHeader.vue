<template>
    <header class="lab-header">
        <div class="header-brand">
            <button
                type="button"
                class="icon-button menu-button"
                aria-label="Open navigation"
                :aria-controls="navigationId"
                :aria-expanded="navigationOpen"
                @click="$emit('openNavigation')"
            >
                <LabIcon name="menu" />
            </button>
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
                </span>
            </RouterLink>
        </div>
        <nav class="header-actions" aria-label="Project links and appearance">
            <a
                :href="repositoryUrl"
                class="repository-link"
                target="_blank"
                rel="noreferrer"
            >
                GitHub
                <LabIcon name="external" />
            </a>
            <button
                class="icon-button"
                type="button"
                :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`"
                @click="toggleTheme"
            >
                <LabIcon :name="theme === 'light' ? 'moon' : 'sun'" />
            </button>
        </nav>
    </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { repositoryUrl } from '../core/source';
import { useTheme } from '../core/theme';
import LabIcon from './LabIcon.vue';

defineProps<{ navigationId: string; navigationOpen: boolean }>();
defineEmits<{ openNavigation: [] }>();
const { theme, toggleTheme } = useTheme();
</script>

<style scoped>
.lab-header {
    position: sticky;
    z-index: 10;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    min-height: var(--header-height);
    padding: 10px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--background);
}

.header-brand,
.header-actions,
.brand {
    display: flex;
    align-items: center;
}

.header-brand {
    gap: 12px;
}

.brand {
    gap: 10px;
    font-size: 18px;
    font-weight: 650;
    letter-spacing: -0.04em;
    white-space: nowrap;
}

.brand-mark {
    display: grid;
    width: 30px;
    height: 32px;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: #42b883;
    background: color-mix(in srgb, #42b883 10%, var(--background));
}

.brand-mark svg {
    width: 17px;
    height: 17px;
}

.header-actions {
    gap: 22px;
}

.repository-link {
    display: inline-flex;
    align-items: center;
    min-height: 38px;
    gap: 7px;
    color: var(--secondary);
    font-size: 12px;
}

.repository-link:hover {
    color: var(--text);
}

.repository-link svg {
    width: 13px;
    height: 13px;
}

.menu-button {
    display: none;
}

@media (max-width: 900px) {
    .lab-header {
        padding-inline: 16px;
    }

    .menu-button {
        display: grid;
    }
}

@media (max-width: 480px) {
    .lab-header {
        padding-inline: 12px;
    }

    .header-brand {
        gap: 8px;
    }

    .header-actions {
        gap: 12px;
    }

    .brand-mark {
        display: none;
    }
}
</style>
