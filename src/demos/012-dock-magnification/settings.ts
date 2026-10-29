export interface DockSettings {
    size: number;
    magnification: number;
    radius: number;
    animated: boolean;
}

export const defaults: DockSettings = {
    size: 52,
    magnification: 1.9,
    radius: 150,
    animated: true,
};

export const dockApps = [
    {
        name: 'Files',
        color: '#2587df',
        shade: '#1252ab',
        paths: ['M4 8V6a2 2 0 0 1 2-2h5l2 3h5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z'],
    },
    {
        name: 'Browser',
        color: '#23adca',
        shade: '#1462bc',
        paths: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', 'm15.5 8.5-2 5-5 2 2-5Z'],
    },
    {
        name: 'Photos',
        color: '#f3a74d',
        shade: '#d55076',
        paths: ['M4 5h16v14H4Z', 'm4 16 5-5 4 4 3-3 4 4', 'M16 8h.01'],
    },
    {
        name: 'Music',
        color: '#ec6896',
        shade: '#b73675',
        paths: [
            'M10 17V6l9-2v11M10 9l9-2',
            'M10 17c0 1.1-1.3 2-3 2s-3-.9-3-2 1.3-2 3-2 3 .9 3 2Z',
            'M19 15c0 1.1-1.3 2-3 2s-3-.9-3-2 1.3-2 3-2 3 .9 3 2Z',
        ],
    },
    {
        name: 'Mail',
        color: '#7596ed',
        shade: '#4e55b9',
        paths: ['M4 5h16v14H4Z', 'm4 6 8 7 8-7'],
    },
    {
        name: 'Terminal',
        color: '#41556b',
        shade: '#1c2b3d',
        paths: ['m5 7 5 5-5 5', 'M13 17h6'],
    },
    {
        name: 'Settings',
        color: '#8b99ab',
        shade: '#53657d',
        paths: ['M7 3v5m0 4v9M17 3v9m0 4v5M3 8h8v4H3ZM13 12h8v4h-8Z'],
    },
];
