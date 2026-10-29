export interface SortableItem {
    id: string;
    title: string;
    description: string;
    category: string;
}

const initialItems: readonly SortableItem[] = [
    {
        id: 'idea',
        title: 'Sketch the idea',
        description: 'Start with a little curiosity.',
        category: 'Explore',
    },
    {
        id: 'structure',
        title: 'Build the structure',
        description: 'Give the idea somewhere to live.',
        category: 'Vue',
    },
    {
        id: 'style',
        title: 'Find its character',
        description: 'A little space, color, and contrast.',
        category: 'CSS',
    },
    {
        id: 'motion',
        title: 'Make it move',
        description: 'Let the interface tell the story.',
        category: 'Motion',
    },
    {
        id: 'details',
        title: 'Check the details',
        description: 'Try the keyboard. Try a small screen.',
        category: 'Polish',
    },
    {
        id: 'ship',
        title: 'Put it out there',
        description: 'There is always another experiment.',
        category: 'Share',
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
