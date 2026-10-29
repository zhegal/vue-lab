import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import type { Ref } from 'vue';
import { clamp, validateVideoFiles } from './media';

export function useVideoPlayer(
    video: Ref<HTMLVideoElement | null>,
    surface: Ref<HTMLElement | null>,
) {
    const file = shallowRef<File | null>(null);
    const source = ref('');
    const inputError = ref('');
    const mediaError = ref('');
    const actionError = ref('');
    const ready = ref(false);
    const frameReady = ref(false);
    const playing = ref(false);
    const ended = ref(false);
    const buffering = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const volume = ref(70);
    const muted = ref(false);
    const dimensions = ref('');
    const fullscreen = ref(false);
    const fullscreenSupported = ref(false);
    let generation = 0;
    let disposed = false;
    let playPending = false;
    let clickTimer: ReturnType<typeof setTimeout> | undefined;

    function cancelVideoClick() {
        clearTimeout(clickTimer);
        clickTimer = undefined;
    }

    const status = computed(() => {
        if (!source.value) return 'No video selected';
        if (mediaError.value) return 'Playback unavailable';
        if (!ready.value) return 'Loading video…';
        if (buffering.value && playing.value) return 'Buffering…';
        if (ended.value) return 'Ended';
        return playing.value ? 'Playing' : 'Paused';
    });

    function releaseSource() {
        cancelVideoClick();
        generation++;
        playPending = false;
        const element = video.value;
        if (element) {
            element.pause();
            element.removeAttribute('src');
            element.load();
        }
        if (source.value) URL.revokeObjectURL(source.value);
    }

    function resetPlayback() {
        ready.value = false;
        frameReady.value = false;
        playing.value = false;
        ended.value = false;
        buffering.value = false;
        currentTime.value = 0;
        duration.value = 0;
        dimensions.value = '';
        mediaError.value = '';
        actionError.value = '';
    }

    function selectFiles(files: readonly File[]) {
        inputError.value = validateVideoFiles(files);
        if (inputError.value) return;
        const selected = files[0];
        if (!selected) return;
        try {
            const nextSource = URL.createObjectURL(selected);
            releaseSource();
            resetPlayback();
            file.value = selected;
            source.value = nextSource;
        } catch {
            inputError.value = 'The file could not be opened. Try choosing it again.';
        }
    }

    function clear() {
        releaseSource();
        source.value = '';
        file.value = null;
        inputError.value = '';
        resetPlayback();
    }

    function isCurrent(event: Event): boolean {
        return (
            !disposed &&
            event.currentTarget === video.value &&
            video.value?.getAttribute('src') === source.value
        );
    }

    function sync(event: Event) {
        if (!isCurrent(event) || !video.value) return;
        const element = video.value;
        ready.value = element.readyState >= HTMLMediaElement.HAVE_METADATA && !mediaError.value;
        frameReady.value =
            ready.value &&
            element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            !element.seeking &&
            element.videoWidth > 0 &&
            element.videoHeight > 0;
        playing.value = !element.paused && !element.ended;
        ended.value = element.ended;
        currentTime.value = element.currentTime;
        duration.value = Number.isFinite(element.duration) ? element.duration : 0;
        volume.value = element.volume * 100;
        muted.value = element.muted;
        dimensions.value = element.videoWidth
            ? `${element.videoWidth} × ${element.videoHeight}`
            : '';
        if (event.type === 'playing' || event.type === 'pause' || event.type === 'ended') {
            buffering.value = false;
        }
        if (event.type === 'waiting') buffering.value = true;
    }

    function onMediaError(event: Event) {
        if (!isCurrent(event)) return;
        video.value?.pause();
        ready.value = false;
        frameReady.value = false;
        playing.value = false;
        buffering.value = false;
        mediaError.value =
            'This video could not be played. The file may be damaged or its ' +
            'format or codec is not supported by this browser. Choose another video.';
    }

    async function togglePlayback() {
        cancelVideoClick();
        const element = video.value;
        if (!element || !ready.value) return;
        actionError.value = '';
        if (playPending || !element.paused) {
            element.pause();
            generation++;
            playPending = false;
            return;
        }
        const active = ++generation;
        playPending = true;
        try {
            if (element.ended) element.currentTime = 0;
            await element.play();
        } catch (cause) {
            if (!disposed && active === generation && element === video.value) {
                actionError.value =
                    cause instanceof DOMException && cause.name === 'NotAllowedError'
                        ? 'Playback was blocked by the browser. Press Play to try again.'
                        : 'Playback could not start. Try again or choose another video.';
            }
        } finally {
            if (active === generation) playPending = false;
        }
    }

    function seek(seconds: number) {
        if (!video.value || !ready.value || duration.value <= 0) return;
        video.value.currentTime = clamp(seconds, 0, duration.value);
        currentTime.value = video.value.currentTime;
    }

    function setVolume(percent: number) {
        volume.value = clamp(percent, 0, 100);
        if (volume.value > 0) muted.value = false;
        if (video.value) {
            video.value.volume = volume.value / 100;
            video.value.muted = muted.value;
        }
    }

    function toggleMute() {
        muted.value = !muted.value;
        if (!muted.value && volume.value === 0) volume.value = 70;
        if (video.value) {
            video.value.volume = volume.value / 100;
            video.value.muted = muted.value;
        }
    }

    function syncFullscreen() {
        fullscreen.value = document.fullscreenElement === surface.value;
    }

    async function toggleFullscreen() {
        if (!surface.value || !fullscreenSupported.value) return;
        actionError.value = '';
        try {
            if (document.fullscreenElement === surface.value) await document.exitFullscreen();
            else await surface.value.requestFullscreen();
        } catch {
            if (!disposed)
                actionError.value = 'Fullscreen is unavailable or was denied by the browser.';
        }
    }

    function onVideoClick(event: MouseEvent) {
        cancelVideoClick();
        if (event.detail > 1) return;
        const element = video.value;
        clickTimer = setTimeout(() => {
            clickTimer = undefined;
            if (!disposed && element === video.value) void togglePlayback();
        }, 300);
    }

    function onVideoDoubleClick() {
        cancelVideoClick();
        void toggleFullscreen();
    }

    function onEscape(event: KeyboardEvent) {
        if (document.fullscreenElement !== surface.value) return;
        event.preventDefault();
        void toggleFullscreen();
    }

    function onKeydown(event: KeyboardEvent) {
        if (
            event.target !== event.currentTarget ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey
        ) {
            return;
        }
        if (!ready.value) return;
        switch (event.key.toLowerCase()) {
            case ' ':
            case 'k':
                if (!event.repeat) void togglePlayback();
                break;
            case 'arrowleft':
                seek(currentTime.value - 5);
                break;
            case 'arrowright':
                seek(currentTime.value + 5);
                break;
            case 'arrowup':
                setVolume(volume.value + 5);
                break;
            case 'arrowdown':
                setVolume(volume.value - 5);
                break;
            case 'm':
                if (!event.repeat) toggleMute();
                break;
            case 'f':
                if (!event.repeat) void toggleFullscreen();
                break;
            default:
                return;
        }
        event.preventDefault();
    }

    function onWheel(event: WheelEvent) {
        if (event.currentTarget !== document.activeElement || !ready.value || event.ctrlKey) return;
        if (event.deltaY === 0) return;
        event.preventDefault();
        const delta =
            event.deltaY * (event.deltaMode === 1 ? 2 : event.deltaMode === 2 ? 10 : 0.05);
        setVolume(volume.value - clamp(delta, -5, 5));
    }

    watch(video, (element) => {
        if (!element) return;
        element.volume = volume.value / 100;
        element.muted = muted.value;
    });

    onMounted(() => {
        fullscreenSupported.value =
            document.fullscreenEnabled && typeof surface.value?.requestFullscreen === 'function';
        document.addEventListener('fullscreenchange', syncFullscreen);
    });

    onBeforeUnmount(() => {
        disposed = true;
        releaseSource();
        document.removeEventListener('fullscreenchange', syncFullscreen);
        if (document.fullscreenElement === surface.value) {
            void document.exitFullscreen().catch(() => {});
        }
    });

    return {
        file,
        source,
        inputError,
        mediaError,
        actionError,
        status,
        ready,
        frameReady,
        playing,
        currentTime,
        duration,
        volume,
        muted,
        dimensions,
        fullscreen,
        fullscreenSupported,
        selectFiles,
        clear,
        sync,
        onMediaError,
        togglePlayback,
        seek,
        setVolume,
        toggleMute,
        toggleFullscreen,
        onVideoClick,
        onVideoDoubleClick,
        onEscape,
        onKeydown,
        onWheel,
    };
}
