export function lockDocumentScroll(document: Document): () => void {
    const root = document.documentElement;
    const changes = [
        { element: root, property: 'scrollbar-gutter', value: 'stable' },
        { element: root, property: 'overflow-x', value: 'hidden' },
        { element: root, property: 'overflow-y', value: 'hidden' },
        { element: document.body, property: 'overflow-x', value: 'hidden' },
        { element: document.body, property: 'overflow-y', value: 'hidden' },
    ];
    const previous = changes.map(({ element, property }) => ({
        style: element.style,
        property,
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property),
    }));

    for (const { element, property, value } of changes) {
        element.style.setProperty(property, value);
    }

    let released = false;
    return () => {
        if (released) return;
        released = true;
        for (const { style, property, value, priority } of previous) {
            if (value) style.setProperty(property, value, priority);
            else style.removeProperty(property);
        }
    };
}
