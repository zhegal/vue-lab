# Dock magnification

## Overview

A seven-icon dock with proximity magnification. Move across the icons to grow nearby apps
and smoothly push their neighbors aside. Adjust resting icon size, maximum magnification,
and influence radius; disable animation to inspect the distance curve directly.
Reset restores the settings. Click or tap an icon to select it and play two decreasing hops.
Enter/Space activation plays the same bounce; repeated activation restarts it from its current height.

Tab focuses each button; Left/Right wrap through the dock, Home/End jump to its edges,
and Enter/Space select. Keyboard focus magnifies the focused icon and its neighbors.

## Implementation

`Demo.vue` owns settings. `DockControls.vue` edits them and `DockPreview.vue` renders the
preview, native buttons, labels, and selection. `settings.ts` contains defaults and local SVG
glyphs. `useDockMotion.ts` owns geometry, input handling, and the magnification lifecycle.
`useDockBounce.ts` handles click feedback with the Web Animations API.

Influence follows a cosine falloff from one at the pointer to zero at the radius. Horizontal
distance uses fixed resting centers, so animated icon positions cannot feed back into the
distance calculation. Pointer magnification starts only on an icon button. Once activated, it
continues across gaps and the shelf until the pointer leaves the dock's visible shelf/icon envelope.
The surrounding preview background never activates it. Only pointer movement activates a button,
so icons moving under a stationary pointer cannot retrigger the effect. Leaving the dock restores
keyboard focus magnification, or the resting dock if no keyboard target exists.
Touch selects without persistent hover magnification.

Each icon width follows a damped spring. Cumulative animated widths determine positions in a
centered row with constant gaps and a shared bottom baseline. The icon buttons use transforms;
labels and selection dots follow their animated centers without scaling their text.
Retargeting preserves velocity. Animation frames stop when the dock settles.

Bounce translates a separate wrapper around the icon and label, leaving the magnification
transform and shelf indicator independent. Its height follows the displayed icon size, capped
at 28px. Each icon has at most one bounce animation; different icons can bounce independently.
Disabling Animate changes or enabling reduced motion cancels active bounces, as does unmounting.

A sampled influence envelope reserves room for the widest dock before interaction. Geometry
scales down together in narrow containers, without changing the influence curve during hover.
`ResizeObserver` recalculates this fit when the preview changes size.

## Key Concepts

- Stable distance coordinates versus animated presentation coordinates.
- Cosine falloff, cumulative layout, and bottom-aligned magnification.
- Damped springs with bounded time steps and transform-based icon rendering.
- Independent transform layers and cancellable Web Animations API click feedback.
- Pointer Events, native button activation, keyboard navigation, and focus-visible behavior.
- Scoped styles, existing theme tokens, and automatic demo discovery.
- Cleanup of frames, observers, media queries, and window/document listeners on unmount.
- Live reduced-motion preference changes disable both magnification and bounce.

## Alternatives

CSS hover scaling is shorter, but needs extra logic to affect neighboring icons and avoid
overlap. Animating flex widths delegates placement to layout, but measuring those moving
positions for proximity can cause feedback. A motion library can handle springs when a larger
experiment needs coordinated animation; this demo adds no dependencies.

## Limitations

- App buttons demonstrate selection; they do not launch applications or navigate elsewhere.
- The seven app glyphs are local illustrations, not operating-system app assets.
- The row remains centered as it expands; it does not exactly reproduce a platform dock.
- Narrow containers reduce the effective icon size and influence radius below their requested values.
- Settings and selection last only while the demo is mounted.
