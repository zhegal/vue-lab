export const MAX_RECORDING_MS = 5 * 60 * 1000;
export const MAX_RECORDING_BYTES = 128 * 1024 * 1024;
const mimeTypes = ['video/mp4', 'video/webm;codecs=vp8,opus', 'video/webm'];

export type RecordingPhase = 'idle' | 'recording' | 'paused' | 'stopping';
export interface RecordingClip {
    name: string;
    size: number;
    mimeType: string;
    seconds: number;
    tracks: string;
    reason: string;
}
export interface RecordingView {
    supported: boolean;
    phase: RecordingPhase;
    canStart: boolean;
    seconds: number;
    bytes: number;
    tracks: string;
    mimeType: string;
    clip: RecordingClip | null;
}

export function chooseRecordingMime(supports: (type: string) => boolean): string | undefined {
    return mimeTypes.find(supports);
}

export function recordingName(source: string, startSeconds: number, mimeType: string): string {
    const base = source
        .replace(/\.[^.]+$/, '')
        .replace(/[<>:"/\\|?*]/g, '-')
        .replace(/\p{Cc}/gu, '-');
    const total = Math.max(0, Number.isFinite(startSeconds) ? Math.floor(startSeconds * 1000) : 0);
    const seconds = String(Math.floor(total / 1000) % 60).padStart(2, '0');
    const milliseconds = String(total % 1000).padStart(3, '0');
    const stamp = `${Math.floor(total / 60000)}-${seconds}-${milliseconds}`;
    const type = mimeType.split(';')[0]?.trim().toLowerCase();
    const extension = type === 'video/mp4' ? 'mp4' : type === 'video/webm' ? 'webm' : 'bin';
    return `${base.slice(0, 80) || 'video'}-clip-${stamp}.${extension}`;
}
