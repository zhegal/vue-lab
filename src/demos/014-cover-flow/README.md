# Cover Flow

## Overview

An infinite album carousel inspired by early iPhone Cover Flow. Select covers, drag or swipe,
use arrow keys, Home / End, or the range control. Albums and artwork are fictional.

## Implementation

Vue Composition API stores the selected index. CSS perspective, translation and Y rotation
position each cover relative to that index. A mirrored copy with a gradient mask creates
floor reflections. Side covers progressively darken with an opaque black overlay and rotate further as their distance
from the selected album increases. Overlapping covers remain opaque so albums do not show through. The outermost covers
use real transparency without a black overlay because no visible covers sit behind them. AlbumCover keeps artwork rendering separate from interaction logic.

## Key Concepts

- CSS 3D transforms and depth ordering.
- Pointer capture for mouse and touch gestures.
- Keyboard controls, live announcements and reduced motion support.
- Local procedural artwork without external image requests or dependencies.

## Alternatives

WebGL allows richer lighting but adds rendering and accessibility complexity. Native scroll
snap is simpler for flat carousels but offers less control over this perspective arrangement.

## Limitations

Gestures advance one album per swipe after release. The album sequence wraps in both directions using stable virtual slots.
This is an album browser without audio playback. Reflections use CSS masks in modern browsers.
