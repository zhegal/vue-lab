export const protocol = 'vue-lab.broadcast.v1';
export const noteLimit = 500;

export type Language = 'en' | 'uk';

export interface SharedState {
    language: Language;
    note: string;
}

export interface Snapshot {
    revision: number;
    author: string;
    value: SharedState;
}

export type ChannelMessage = {
    protocol: typeof protocol;
    sender: string;
} & ({ type: 'request' } | { type: 'state'; snapshot: Snapshot; target?: string });

export interface ChannelEvent {
    id: number;
    time: string;
    direction: 'sent' | 'received' | 'system';
    detail: string;
}

export function initialSnapshot(): Snapshot {
    return { revision: 0, author: '', value: { language: 'en', note: 'A shared note.' } };
}

export function validRoom(value: string): boolean {
    return /^[a-zA-Z0-9_-]{1,32}$/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isClientId(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0 && value.length <= 80;
}

export function isChannelMessage(value: unknown): value is ChannelMessage {
    if (!isRecord(value) || value.protocol !== protocol || !isClientId(value.sender)) return false;
    if (value.type === 'request') return true;
    if (value.type !== 'state' || !isRecord(value.snapshot)) return false;
    if (value.target !== undefined && !isClientId(value.target)) return false;

    const snapshot = value.snapshot;
    if (
        !Number.isSafeInteger(snapshot.revision) ||
        (snapshot.revision as number) < 0 ||
        (snapshot.revision as number) >= Number.MAX_SAFE_INTEGER ||
        !(isClientId(snapshot.author) || (snapshot.revision === 0 && snapshot.author === '')) ||
        !isRecord(snapshot.value)
    )
        return false;

    return (
        (snapshot.value.language === 'en' || snapshot.value.language === 'uk') &&
        typeof snapshot.value.note === 'string' &&
        snapshot.value.note.length <= noteLimit
    );
}

export function isNewer(incoming: Snapshot, current: Snapshot): boolean {
    return (
        incoming.revision > current.revision ||
        (incoming.revision === current.revision && incoming.author > current.author)
    );
}
