import { createCatalog } from './catalog';
import type { DemoEntry } from './types';

const { demos, issues } = createCatalog({
    metadata: import.meta.glob<{ default?: unknown }>('../demos/*/meta.ts', { eager: true }),
    components: import.meta.glob<Awaited<ReturnType<DemoEntry['loadComponent']>>>(
        '../demos/*/Demo.vue',
    ),
    documents: import.meta.glob<string>('../demos/*/README.md', {
        query: '?raw',
        import: 'default',
    }),
});

for (const issue of issues) {
    console.warn(`[Vue Lab] Skipping ${issue.id}: ${issue.message}`);
}

export { demos };
export const findDemo = (id: string) => demos.find((demo) => demo.id === id);
