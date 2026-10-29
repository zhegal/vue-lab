export interface SortableItem {
    id: string;
    title: string;
    description: string;
    category: string;
}

const initialItems: readonly SortableItem[] = [
    {
        id: 'idea',
        title: 'Define requirements',
        description: 'Specify behavior and inputs.',
        category: 'Scope',
    },
    {
        id: 'structure',
        title: 'Build components',
        description: 'Define components and reactive data.',
        category: 'Vue',
    },
    {
        id: 'style',
        title: 'Style the interface',
        description: 'Configure layout, spacing, and colors.',
        category: 'CSS',
    },
    {
        id: 'motion',
        title: 'Add transitions',
        description: 'Animate changes in item positions.',
        category: 'Motion',
    },
    {
        id: 'details',
        title: 'Test behavior',
        description: 'Check keyboard controls and responsive layout.',
        category: 'Checks',
    },
    {
        id: 'ship',
        title: 'Build and publish',
        description: 'Generate and deploy the production build.',
        category: 'Deploy',
    },
];

export function createItems() {
    return initialItems.map((item) => ({ ...item }));
}

export function moveItem(items: SortableItem[], from: number, to: number) {
    const next = [...items];
    const [item] = next.splice(from, 1);
    if (item) next.splice(to, 0, item);
    return next;
}
