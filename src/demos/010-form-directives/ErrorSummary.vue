<template>
    <section class="error-summary" aria-label="Form errors">
        <h2>
            {{ errors.length }}
            {{ errors.length === 1 ? 'field needs' : 'fields need' }} attention
        </h2>
        <ul>
            <li v-for="error in errors" :key="error.name">
                <button type="button" @click="$emit('focus', error.name)">
                    {{ error.label }}: {{ error.message }}
                </button>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import type { FieldError, FieldName } from './validation';

defineProps<{ errors: FieldError[] }>();
defineEmits<{ focus: [name: FieldName] }>();
</script>

<style scoped>
.error-summary {
    margin: 20px 0;
    padding: 16px;
    border: 1px solid var(--accent);
    border-radius: 5px;
    background: var(--accent-soft);
}
h2 {
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 600;
}
ul {
    display: grid;
    gap: 8px;
    padding-left: 18px;
    margin: 0;
    list-style: disc;
}
button {
    color: var(--text);
    font-size: 12px;
    line-height: 1.7;
    text-align: left;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
}
</style>
