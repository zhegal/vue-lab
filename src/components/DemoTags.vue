<template>
    <ul class="tags" aria-label="Tags">
        <li v-for="tag in tags" :key="tag">
            {{ tag }}
        </li>
    </ul>
</template>

<script setup lang="ts">
defineProps<{ tags: string[] }>();
</script>
