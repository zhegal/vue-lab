import type { DemoEntry, DemoMeta, RegistryIssue } from './types.ts';

interface DemoFiles {
    metadata: Record<string, { default?: unknown }>;
    components: Record<string, DemoEntry['loadComponent']>;
    documents: Record<string, DemoEntry['loadReadme']>;
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

export function parseMetadata(value: unknown): DemoMeta | undefined {
    if (!value || typeof value !== 'object') return;
    const meta = value as Record<string, unknown>;

    if (
        !isNonEmptyString(meta.title) ||
        !isNonEmptyString(meta.description) ||
        !isNonEmptyString(meta.category) ||
        !Array.isArray(meta.tags) ||
        !meta.tags.every(isNonEmptyString)
    ) {
        return;
    }

    return {
        title: meta.title.trim(),
        description: meta.description.trim(),
        category: meta.category.trim(),
        tags: [...new Set(meta.tags.map((tag) => tag.trim()))],
    };
}

export function createCatalog({ metadata, components, documents }: DemoFiles) {
    const demos: DemoEntry[] = [];
    const issues: RegistryIssue[] = [];
    const paths = [...Object.keys(metadata), ...Object.keys(components), ...Object.keys(documents)];
    const folders = new Set(paths.map((path) => path.slice(0, path.lastIndexOf('/'))));

    for (const folder of folders) {
        const id = folder.split('/').at(-1) ?? '';
        const meta = parseMetadata(metadata[`${folder}/meta.ts`]?.default);
        const loadComponent = components[`${folder}/Demo.vue`];
        const loadReadme = documents[`${folder}/README.md`];

        if (!/^\d{3,}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
            issues.push({ id, message: 'Directory must use NNN-descriptive-name.' });
        } else if (!meta) {
            issues.push({ id, message: 'Missing or invalid default metadata export in meta.ts.' });
        } else if (!loadComponent || !loadReadme) {
            issues.push({ id, message: 'Both Demo.vue and README.md are required.' });
        } else {
            demos.push({ id, ...meta, loadComponent, loadReadme });
        }
    }

    demos.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
    return { demos, issues };
}
