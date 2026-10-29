import type { Component } from 'vue';

export interface DemoMeta {
    title: string;
    description: string;
    category: string;
    tags: string[];
}

export interface DemoEntry extends DemoMeta {
    id: string;
    loadComponent: () => Promise<{ default: Component }>;
    loadReadme: () => Promise<string>;
}

export interface RegistryIssue {
    id: string;
    message: string;
}
