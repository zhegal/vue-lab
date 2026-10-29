import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { formatTime } from './media';

export function useFrameCapture(
    video: Ref<HTMLVideoElement | null>,
    file: Ref<File | null>,
    frameReady: Ref<boolean>,
) {
    const capturing = ref(false);
    const error = ref('');
    const message = ref('');
    const downloads = new Map<string, ReturnType<typeof setTimeout>>();
    let disposed = false;

    function releaseDownload(url: string) {
        clearTimeout(downloads.get(url));
        downloads.delete(url);
        URL.revokeObjectURL(url);
    }

    async function captureFrame() {
        const element = video.value;
        const selected = file.value;
        if (!element || !selected || !frameReady.value || capturing.value) return;
        error.value = '';
        message.value = '';
        capturing.value = true;
        try {
            if (element.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || element.seeking) {
                throw new Error('No decoded frame is available.');
            }
            const canvas = document.createElement('canvas');
            canvas.width = element.videoWidth;
            canvas.height = element.videoHeight;
            const context = canvas.getContext('2d');
            if (!context || !canvas.width || !canvas.height) throw new Error('Canvas unavailable.');
            const seconds = element.currentTime;
            context.drawImage(element, 0, 0, canvas.width, canvas.height);
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (result) => (result ? resolve(result) : reject(new Error('PNG failed.'))),
                    'image/png',
                );
            });
            if (disposed || video.value !== element || file.value !== selected) return;

            const base = selected.name.replace(/\.[^.]+$/, '').replace(/[<>:"/\\|?*]/g, '-');
            const milliseconds = String(Math.floor(seconds * 1000) % 1000).padStart(3, '0');
            const stamp = `${formatTime(seconds).replaceAll(':', '-')}-${milliseconds}`;
            const name = `${base.slice(0, 80) || 'video'}-${stamp}.png`;
            const url = URL.createObjectURL(blob);
            // Give the browser time to consume the download URL before revoking it.
            downloads.set(
                url,
                setTimeout(() => releaseDownload(url), 30_000),
            );
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            document.body.append(link);
            try {
                link.click();
            } finally {
                link.remove();
            }
            message.value = `PNG download: ${name}`;
        } catch {
            if (!disposed && video.value === element && file.value === selected) {
                error.value = 'The frame could not be saved. Pause the video and try again.';
            }
        } finally {
            if (!disposed) capturing.value = false;
        }
    }

    watch(file, () => {
        error.value = '';
        message.value = '';
    });

    onBeforeUnmount(() => {
        disposed = true;
        for (const url of downloads.keys()) releaseDownload(url);
    });

    return {
        capturing,
        error,
        message,
        captureFrame,
        canCapture: computed(() => frameReady.value && !capturing.value),
    };
}
