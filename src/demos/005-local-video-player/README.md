# Local video player

## Overview

Choose one local video or drop it onto the player. Playback starts paused. Use play/pause, seeking,
mute, volume and fullscreen controls. Screenshot downloads the current decoded frame as PNG at the
video's original resolution. Source videos are not uploaded or retained by the app.

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

Frame capture draws the video into a detached canvas before asynchronous PNG encoding with `toBlob`.
It does not include controls or letterboxing, and does not pause playback. Capture requires a decoded
frame and is disabled while seeking or encoding. The filename includes the source name and playback
timestamp. Late encodes after source replacement/unmount do not trigger downloads. Each download URL
is revoked after 30 seconds or sooner on unmount.

## Key Concepts

- File input, drag events, Blob/Object URL ownership and `URL.revokeObjectURL`.
- HTMLMediaElement events, asynchronous `play()`, seeking, volume and mute.
- Fullscreen API, feature detection, keyboard scoping and native accessible range inputs.
- Canvas frame capture, asynchronous PNG encoding and temporary download URLs.
- Fullscreen control overlays, interaction timers, focus modality and inert controls.
- Vue refs, keyed elements, composables, lifecycle cleanup and scoped/container styles.

See [media playback](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play),
[Object URL cleanup](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static)
and the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen).

Run file-validation and media-boundary tests with
`node --test src/demos/005-local-video-player/media.test.mjs` (Node.js 24+).

## Alternatives

Native `<video controls>` provides a browser-owned playback UI and additional platform features.
VueUse can wrap drop zones and fullscreen lifecycle. A dedicated player library is useful for adaptive
streaming, playlists or captions. Custom controls here keep the browser API interactions visible.

## Limitations

- Container, codec and platform determine playback support; a video extension does not ensure decoding.
- Fullscreen and programmatic volume depend on browser/device support. Some mobile browsers keep volume
  under hardware control; denied fullscreen requests display an error.
- One local file at a time; no recording, remote streams, playlists, captions UI or playback persistence.
- Custom controls cover this experiment's playback functions, not every native player feature.
- Files are not size-limited or transcoded; large files can use substantial browser resources.
- Leaving the demo releases its file. Reopening requires choosing a video again.
