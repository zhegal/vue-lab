# Local video player

## Overview

Choose one local video or drop it onto the player. Playback starts paused. Use play/pause, seeking,
mute, volume and fullscreen controls. Screenshot downloads the current decoded frame as PNG at the
video's original resolution. Source videos are not uploaded or retained by the app.

While the video is playing, Record captures a clip from its current position. Stop recording
finalizes the clip without stopping playback. Player pause/resume also pauses/resumes recording;
playback ending, removing/replacing a source or a guard limit finishes the clip automatically.
Download clip saves it locally; Discard releases the completed clip. A successful new take replaces
the previous one, while a failed take leaves the previous completed clip available.

Recording captures the media element's source tracks, including source audio when available.
Playback mute/volume do not reliably suppress that audio; the recording UI states this explicitly.
The format and captured tracks are reported, with the actual encoder MIME determining the download
extension. No camera, microphone or screen-capture permission is requested.

Focus the video viewport for shortcuts: Space/K toggles playback, Left/Right seeks five seconds,
Up/Down changes volume by five percentage points, M toggles mute and F toggles fullscreen.
The wheel adjusts volume only while the viewport itself is focused; hovering does not intercept page
scrolling or move focus. Controls retain their normal keyboard behavior. Esc exits fullscreen.

Single-click the video to toggle playback; double-click it to toggle fullscreen. Single clicks have
a short delay to distinguish them from a double click. In fullscreen, controls overlay the video:
move the pointer to the bottom edge to reveal them, then away to hide them. Tab reveals hidden
controls and focuses the first control (Shift+Tab focuses the last). Keyboard focus and slider drags
keep the panel visible. A touch on the video reveals it briefly.

## Implementation

`Demo.vue` owns the drop zone, viewport and media element. `VideoFilePanel.vue` handles the file picker
and metadata; `VideoControls.vue` exposes labelled native buttons and range inputs.
`useVideoPlayer.ts` owns playback, media events, object URLs and fullscreen lifecycle; `media.ts`
contains file validation, bounds and display formatting. No extra dependencies are used.
`useFrameCapture.ts` owns PNG encoding/downloads; `useFullscreenControls.ts` owns the fullscreen
panel's pointer, keyboard, focus and idle behavior.
`RecordingControls.vue` and `useVideoRecorder.ts` own the recording UI and session lifecycle;
`recording.ts` contains MIME negotiation, filenames, limits and typed recording view data.

The regular player is left-aligned and capped at 720px; fullscreen uses the full viewport. Volume sits
separately on the right, with fixed button widths and output columns so mute labels and zero volume
do not move its slider. On narrow screens buttons use two columns and volume occupies its own row.

Validation rejects empty files, multiple drops and non-video MIME types. Known extensions are a
fallback only for missing/generic MIME types; the browser decoder decides actual codec support.
Invalid selection preserves the current video. The file input resets after each choice so selecting
the same file again works. Decoder and rejected play/fullscreen requests display errors.

Replacing or removing a file pauses the old element, detaches its source and revokes its Object URL.
A keyed video element separates old-file events from the new source; event guards and a generation
counter prevent stale playback promises from changing current state. Unmount performs the same cleanup,
removes event listeners and exits this player's fullscreen session. Pending single clicks, panel
timers and download URLs are cleaned up on unmount. No document styles change.

Fullscreen includes the viewport and controls, with actual state tracked through `fullscreenchange`.
The panel initially appears for 1.8 seconds, then hides unless hovered, dragged, keyboard-focused or
showing an error. Moving away schedules a 600ms hide. Hidden controls are inert and excluded from
assistive technology; pointer-focused controls return focus to the viewport before hiding.
Transitions respect reduced-motion preferences.
Recording has a separate row so playback buttons and the volume layout remain stable. A visible
REC badge remains while the fullscreen toolbar hides; recording errors/finalization reveal the
toolbar. Long fullscreen panels scroll within 80% of the viewport height, with native keyboard
focus bringing hidden controls into view.

Frame capture draws the video into a detached canvas before asynchronous PNG encoding with `toBlob`.
It does not include controls or letterboxing, and does not pause playback. Capture requires a decoded
frame and is disabled while seeking or encoding. The filename includes the source name and playback
timestamp. Late encodes after source replacement/unmount do not trigger downloads. Each download URL
is revoked after 30 seconds or sooner on unmount.

Recording uses `HTMLMediaElement.captureStream()` (or its Firefox-prefixed equivalent), then
MediaRecorder with supported MP4 or WebM/VP8/Opus options, falling back to the browser's default
when no preferred type is advertised. Capture requires a decoded, actively playing video track.
Unavailable APIs disable Record and explain the limitation without affecting playback.

Each recording owns its capture stream, abortable listeners, chunks and monotonic clock. Data is
collected in roughly one-second chunks; final `dataavailable` is consumed before `stop` publishes
the Blob. Pause time is excluded from elapsed time; chunk count is not used as a clock. The demo
auto-stops after five active minutes or approximately 128 MiB (checked when callbacks run, so these
are soft limits). A five-second finalization timeout handles stalled encoders.

Finalization and failure stop captured tracks, clear the clock and remove listeners. Session
identity checks reject stale events. Source changes finalize the old session; completed clips are
independent of the current source. Unmount cancels an unfinished session, ignores late events and
releases completed data plus download URLs. Download URLs last 30 seconds so another take or
Discard does not immediately interrupt a download.
Released capture streams stop late-added tracks too, because replay/source changes can create them.
That stateless stream-local listener retains no component/session references and is garbage-collected
with the stream; it is separate from the aborted recording-session listeners.

## Key Concepts

- File input, drag events, Blob/Object URL ownership and `URL.revokeObjectURL`.
- HTMLMediaElement events, asynchronous `play()`, seeking, volume and mute.
- Fullscreen API, feature detection, keyboard scoping and native accessible range inputs.
- Canvas frame capture, asynchronous PNG encoding and temporary download URLs.
- Fullscreen control overlays, interaction timers, focus modality and inert controls.
- MediaRecorder lifecycle, captured tracks, MIME negotiation, pause/resume and final data ordering.
- Vue refs, keyed elements, composables, lifecycle cleanup and scoped/container styles.

See [media playback](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play),
[Object URL cleanup](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static)
and the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen).
See also [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) and
[media-element capture](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream).

Run file-validation and media-boundary tests with
`node --test src/demos/005-local-video-player/media.test.mjs` (Node.js 24+).
Recording-format tests: `node --test src/demos/005-local-video-player/recording.test.mjs`.

## Alternatives

Native `<video controls>` provides a browser-owned playback UI and additional platform features.
VueUse can wrap drop zones and fullscreen lifecycle. A dedicated player library is useful for adaptive
streaming, playlists or captions. Custom controls here keep the browser API interactions visible.

## Limitations

- Container, codec and platform determine playback support; a video extension does not ensure decoding.
- Fullscreen and programmatic volume depend on browser/device support. Some mobile browsers keep volume
  under hardware control; denied fullscreen requests display an error.
- One local file at a time; no remote streams, playlists, captions UI or playback persistence.
- Custom controls cover this experiment's playback functions, not every native player feature.
- Files are not size-limited or transcoded; large files can use substantial browser resources.
- Leaving the demo releases its file. Reopening requires choosing a video again.
- Media-element capture has narrower support than MediaRecorder itself; not every browser can record.
- Recording is real-time re-encoding, rather than an exact file cut or a lossless export. Seeking
  changes captured content; buffering, background throttling and encoder load can affect timing.
- Container metadata is browser-dependent. Native WebM recordings may lack duration/seek indexes even
  when the media decodes correctly; no extra container-repair/transcoding dependency is included.
- One completed clip is kept in memory. This is a bounded recording demo, not a streaming-to-disk tool.
