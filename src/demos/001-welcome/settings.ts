export interface CardSettings {
    color: string;
    radius: number;
    size: number;
    shadow: number;
}

export const defaultSettings: Readonly<CardSettings> = {
    color: '#b6dbc8',
    radius: 24,
    size: 280,
    shadow: 24,
};

export const colorPresets = ['#b6dbc8', '#b9c9ed', '#dfc0dd', '#edc8a7', '#d8d8d0'];
