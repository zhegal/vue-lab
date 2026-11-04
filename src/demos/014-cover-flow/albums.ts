export interface Album {
    title: string;
    artist: string;
    year: number;
    color: string;
    accent: string;
}

export const albums: Album[] = [
    { title: 'Daybreak', artist: 'North Shore', year: 2004, color: '#a13c36', accent: '#ffc08b' },
    {
        title: 'Ultraviolet',
        artist: 'Static Forms',
        year: 2006,
        color: '#493c83',
        accent: '#f4a8ef',
    },
    { title: 'Open Water', artist: 'The Tides', year: 2003, color: '#165362', accent: '#a8e5d6' },
    {
        title: 'Parallel Lines',
        artist: 'Motion Study',
        year: 2007,
        color: '#193c98',
        accent: '#8fc7ff',
    },
    {
        title: 'Golden Hour',
        artist: 'Slow Cinema',
        year: 2005,
        color: '#b36225',
        accent: '#ffe39d',
    },
    { title: 'Afterimage', artist: 'Soft Focus', year: 2008, color: '#91435f', accent: '#ffd0d5' },
    { title: 'Night Maps', artist: 'Low Signal', year: 2002, color: '#24534b', accent: '#bcdf8b' },
];
