import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import type { Ref } from 'vue';
import {
    chooseRecordingMime,
    MAX_RECORDING_BYTES,
    MAX_RECORDING_MS,
    recordingName,
} from './recording';
import type { RecordingClip, RecordingPhase, RecordingView } from './recording';

type CapturableVideo = HTMLVideoElement & {
    captureStream?: () => MediaStream;
    mozCaptureStream?: () => MediaStream;
};
interface Session {
    element: HTMLVideoElement;
    file: File;
    stream: MediaStream;
    recorder: MediaRecorder;
    events: AbortController;
    chunks: Blob[];
    size: number;
    elapsed: number;
    segmentStart: number | null;
    startSeconds: number;
    stopTime: number | null;
    reason: string;
    failed: boolean;
}

function stopLateTrack(event: MediaStreamTrackEvent) {
    event.track.stop();
}

function releaseStream(stream: MediaStream) {
    // A replay/source change can add tracks even after the original capture tracks were stopped.
    // This stateless listener dies with the stream and retains no component/session references.
    stream.addEventListener('addtrack', stopLateTrack);
    for (const track of stream.getTracks()) track.stop();
}

export function useVideoRecorder(
    video: Ref<HTMLVideoElement | null>,
    file: Ref<File | null>,
    frameReady: Ref<boolean>,
    playing: Ref<boolean>,
) {
    const supported = ref(false);
    const phase = ref<RecordingPhase>('idle');
    const seconds = ref(0);
    const bytes = ref(0);
    const tracks = ref('');
    const mimeType = ref('');
    const clip = shallowRef<RecordingClip | null>(null);
    const error = ref('');
    const downloads = new Map<string, ReturnType<typeof setTimeout>>();
    let clipBlob: Blob | null = null;
    let session: Session | null = null;
    let clock: ReturnType<typeof setInterval> | undefined;
    let disposed = false;

    function captureMethod(element: CapturableVideo) {
        return element.captureStream ?? element.mozCaptureStream;
    }

    function checkSupport() {
        supported.value =
            typeof MediaRecorder === 'function' &&
            typeof MediaStream === 'function' &&
            typeof captureMethod(HTMLVideoElement.prototype) === 'function';
    }

    function freezeClock(active: Session) {
        if (active.segmentStart !== null) {
            active.elapsed += performance.now() - active.segmentStart;
            active.segmentStart = null;
        }
        seconds.value = active.elapsed / 1000;
    }

    function release(active: Session) {
        active.events.abort();
        clearInterval(clock);
        clock = undefined;
        try {
            if (active.recorder.state !== 'inactive') active.recorder.stop();
        } catch {
            /* The stream is released even when the encoder has already failed. */
        }
        releaseStream(active.stream);
        active.chunks.length = 0;
        if (session === active) session = null;
    }

    function fail(active: Session, message: string) {
        if (session !== active || disposed) return;
        freezeClock(active);
        error.value = message;
        active.failed = true;
        release(active);
        phase.value = 'idle';
    }

    function stop(reason = 'Stopped manually') {
        const active = session;
        if (!active || phase.value === 'stopping') return;
        freezeClock(active);
        phase.value = 'stopping';
        active.reason = reason;
        active.stopTime = performance.now();
        try {
            if (active.recorder.state !== 'inactive') active.recorder.stop();
        } catch {
            fail(active, 'The recording could not be finalized. Try another recording.');
        }
    }

    function finish(active: Session) {
        if (session !== active || disposed) return;
        freezeClock(active);
        try {
            const actualType =
                active.recorder.mimeType || active.chunks.find((part) => part.type)?.type;
            if (!actualType || !active.size) throw new Error('No recorded data.');
            const blob = new Blob(active.chunks, { type: actualType });
            clipBlob = blob;
            clip.value = {
                name: recordingName(active.file.name, active.startSeconds, actualType),
                size: blob.size,
                mimeType: actualType,
                seconds: active.elapsed / 1000,
                tracks: tracks.value,
                reason:
                    active.reason || (active.element.ended ? 'Playback ended' : 'Capture ended'),
            };
        } catch {
            error.value = 'No playable recording was produced. Let the video play before stopping.';
        } finally {
            release(active);
            phase.value = 'idle';
        }
    }

    function pause(active: Session) {
        if (session !== active || phase.value !== 'recording') return;
        try {
            if (active.recorder.state !== 'recording') return;
            active.recorder.pause();
            freezeClock(active);
            phase.value = 'paused';
        } catch {
            fail(active, 'Recording could not pause with playback. Try another recording.');
        }
    }

    function resume(active: Session) {
        if (session !== active || phase.value !== 'paused') return;
        try {
            if (active.recorder.state !== 'paused') return;
            active.recorder.resume();
            active.segmentStart = performance.now();
            phase.value = 'recording';
        } catch {
            fail(active, 'Recording could not resume with playback. Try another recording.');
        }
    }

    function start() {
        const element = video.value as CapturableVideo | null;
        const selected = file.value;
        if (
            !supported.value ||
            session ||
            !element ||
            !selected ||
            !frameReady.value ||
            element.paused ||
            element.ended ||
            element.seeking
        )
            return;
        error.value = '';
        let stream: MediaStream | undefined;
        try {
            stream = captureMethod(element)?.call(element);
            if (!stream?.getVideoTracks().some((track) => track.readyState === 'live')) {
                throw new Error('No live video track.');
            }
            const type = chooseRecordingMime((value) => MediaRecorder.isTypeSupported(value));
            const recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
            const active: Session = {
                element,
                file: selected,
                stream,
                recorder,
                events: new AbortController(),
                chunks: [],
                size: 0,
                elapsed: 0,
                segmentStart: null,
                startSeconds: element.currentTime,
                stopTime: null,
                reason: '',
                failed: false,
            };
            session = active;
            const { signal } = active.events;
            recorder.addEventListener(
                'dataavailable',
                (event: BlobEvent) => {
                    if (session !== active || active.failed || disposed || !event.data.size) return;
                    active.chunks.push(event.data);
                    active.size += event.data.size;
                    bytes.value = active.size;
                    if (active.size >= MAX_RECORDING_BYTES) stop('Memory limit reached');
                },
                { signal },
            );
            recorder.addEventListener('stop', () => finish(active), { signal });
            recorder.addEventListener(
                'error',
                () => {
                    fail(active, 'The browser encoder failed. Try another file or recording.');
                },
                { signal },
            );
            element.addEventListener('pause', () => pause(active), { signal });
            element.addEventListener('playing', () => resume(active), { signal });
            element.addEventListener('ended', () => stop('Playback ended'), { signal });
            element.addEventListener('emptied', () => stop('Source removed or replaced'), {
                signal,
            });
            element.addEventListener('error', () => stop('Playback error'), { signal });
            recorder.start(1000);
            active.segmentStart = performance.now();
            seconds.value = 0;
            bytes.value = 0;
            mimeType.value = recorder.mimeType || type || 'Browser default';
            tracks.value = stream.getAudioTracks().length ? 'Video + audio' : 'Video only';
            phase.value = 'recording';
            clock = setInterval(() => {
                if (session !== active || disposed) return;
                const now = performance.now();
                seconds.value =
                    (active.elapsed +
                        (active.segmentStart === null ? 0 : now - active.segmentStart)) /
                    1000;
                if (active.stopTime !== null && now - active.stopTime > 5000) {
                    fail(active, 'The encoder did not finish in time. Try another recording.');
                } else if (seconds.value * 1000 >= MAX_RECORDING_MS) stop('Time limit reached');
            }, 250);
        } catch {
            if (session) release(session);
            else if (stream) releaseStream(stream);
            phase.value = 'idle';
            error.value = 'This video could not be recorded. Try another file or browser.';
        }
    }

    function releaseDownload(url: string) {
        clearTimeout(downloads.get(url));
        downloads.delete(url);
        URL.revokeObjectURL(url);
    }

    function download() {
        if (!clipBlob || !clip.value || disposed) return;
        let url: string | undefined;
        try {
            url = URL.createObjectURL(clipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = clip.value.name;
            document.body.append(link);
            try {
                link.click();
            } finally {
                link.remove();
            }
            const downloadUrl = url;
            downloads.set(
                url,
                setTimeout(() => releaseDownload(downloadUrl), 30_000),
            );
        } catch {
            if (url) URL.revokeObjectURL(url);
            error.value = 'The recording could not be downloaded. Try again.';
        }
    }

    function discard() {
        if (session) return;
        clipBlob = null;
        clip.value = null;
        error.value = '';
    }

    watch(
        file,
        () => {
            error.value = '';
            stop('Source removed or replaced');
        },
        { flush: 'sync' },
    );
    onMounted(checkSupport);
    onBeforeUnmount(() => {
        disposed = true;
        if (session) release(session);
        for (const url of downloads.keys()) releaseDownload(url);
        clipBlob = null;
    });

    return {
        error,
        start,
        stop: () => stop(),
        download,
        discard,
        view: computed<RecordingView>(() => ({
            supported: supported.value,
            phase: phase.value,
            canStart:
                supported.value && phase.value === 'idle' && frameReady.value && playing.value,
            seconds: seconds.value,
            bytes: bytes.value,
            tracks: tracks.value,
            mimeType: mimeType.value,
            clip: clip.value,
        })),
    };
}
