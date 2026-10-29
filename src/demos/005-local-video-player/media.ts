const videoExtension = /\.(mp4|m4v|webm|ogv|ogg|mov|mkv|avi)$/i;

export function validateVideoFiles(files: readonly Pick<File, 'name' | 'type' | 'size'>[]): string {
    if (files.length !== 1) return 'Choose or drop exactly one video file.';
    const file = files[0];
    if (!file || file.size === 0) return 'The selected file is empty.';
    const mime = file.type.toLowerCase();
    const unknownType = mime === '' || mime === 'application/octet-stream';
    if (!mime.startsWith('video/') && !(unknownType && videoExtension.test(file.name))) {
        return 'Choose a video file, such as MP4, WebM or Ogg.';
    }
    return '';
}

export function formatTime(seconds: number): string {
    const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor(total / 60) % 60;
    const rest = String(total % 60).padStart(2, '0');
    return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function clamp(value: number, min: number, max: number): number {
    return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min;
}
