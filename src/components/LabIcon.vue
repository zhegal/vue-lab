<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path
            v-for="(path, index) in paths[name]"
            :key="index"
            :d="path"
        />
    </svg>
</template>

<script setup lang="ts">
defineProps<{ name: keyof typeof paths }>();

const paths = {
    menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
    arrow: ['M5 12h14', 'm13 6 6 6-6 6'],
    back: ['M19 12H5', 'm11 6-6 6 6 6'],
    external: [
        'M14 3h7v7',
        'm10 14 11-11',
        'M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6',
    ],
    search: ['M21 21l-5-5', 'M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0'],
    sun: [
        'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
        'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
    ],
    moon: ['M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10'],
    code: ['m8 7-5 5 5 5', 'm16 7 5 5-5 5', 'm14 4-4 16'],
    grid: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M14 14h7v7h-7z'],
    reset: ['M3 10a9 9 0 1 1 2 8', 'M3 4v6h6'],
    book: ['M12 5v16', 'M12 5C9 2 5 2 2 3v16c3-1 7-1 10 2 3-3 7-3 10-2V3c-3-1-7-1-10 2'],
    close: ['m6 6 12 12', 'M18 6 6 18'],
    chevron: ['m6 9 6 6 6-6'],
    flask: ['M9 3h6', 'M10 3v7L4 20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1l-6-10V3', 'M7 15h10'],
};
</script>
