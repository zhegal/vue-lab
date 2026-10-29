# Liquid tabs

## Overview

A horizontal pill tab bar with a liquid selection capsule. The capsule stretches toward the next
tab, then softly contracts to its measured width. Start with five tabs, add labeled tabs, and reset
the example. New tabs become active and scroll into view automatically. A separate Tab order block
lets you drag tabs by their grips or move them with arrows without changing selection.
Reset restores the initial order.

The Overflow menu switch compares two behaviors: horizontal scrolling (default) or a `»` button
that opens the remaining tabs in a vertical popover. Selection flows through the right edge of the
horizontal pill and enters the vertical list from above; the reverse path exits upward and enters
the pill from the right. The list stays open after selection so the transition remains visible.

## Implementation

`Demo.vue` owns stable tab IDs, selection and the add form. `LiquidTabs.vue` measures real button
offsets and widths, implements keyboard navigation, and keeps the active tab visible inside a native
horizontal scroll container. Touch swipes, horizontal trackpad scrolling and overflow arrow buttons
are supported. Scrolling never moves the page to reveal a selected tab.

`OverflowTabs.vue` measures intrinsic label widths in an inert, clipped measuring row and reserves
space for `»` before choosing a visible prefix. Resizing, font readiness, additions and reordering
recalculate the split without changing tab identity. `OverflowMenu.vue` uses the native Popover API
top layer, positions near the trigger, wraps long labels and scrolls a tall list. Outside clicks,
Escape and the trigger close it; ArrowUp/ArrowDown and Home/End navigate, Enter/Space selects.
When a hidden tab is selected while the list is closed, the trigger carries the selection capsule.

`useOverflowMotion.ts` coordinates the horizontal and vertical springs. The outgoing spring resolves
as soon as its capsule crosses the clipped panel edge, then the incoming one starts beyond the
other edge. A revision counter discards interrupted transfers; the latest selection wins without
timeouts or duplicate capsules. Reduced motion places the capsule at its destination immediately.

`TabOrder.vue` updates the same ordered array through a typed component model. Stable IDs preserve
selection when tabs move; the tab bar remeasures after Vue patches the new order, so the capsule
animates to the selected tab's new position. Native arrow buttons work with mouse, touch and keyboard,
announce the new position, and retain focus after a row moves. Long labels wrap in the order list.

`useTabOrderDrag.ts` handles mouse, pen and touch with Pointer Events and capture on the stable list.
A noninteractive preview follows the pointer while the array reorders live as the dragged row's
center crosses neighboring midpoints. The order list scrolls automatically near its vertical edges.
Escape, pointer cancellation, window blur and resize restore the original order; drop commits it.
Only grips disable touch scrolling. Animation frames and window listeners are cleaned up on unmount.

Buttons keep their intrinsic text width plus horizontal padding instead of sharing spare space.
The outer pill fits the tab row until it reaches the available width, then scrolls horizontally.
The indicator animates both its position and measured width when switching between different labels.
Labels are never ellipsized or capped in width. A tab wider than the viewport is revealed from its
start; horizontal scrolling exposes the rest of its full label.

`useLiquidIndicator.ts` integrates damped springs for the capsule's center and width with
`requestAnimationFrame`. Speed drives a separate stretch spring, capped at 38px. More of that length
extends in the direction of travel, while a small vertical compression suggests a pulled droplet.
Retargeting preserves the current position and velocity, including during rapid direction changes.
Small integration steps prevent instability after a slow frame.

The capsule shares the tabs' content coordinate system, so it stays aligned while scrolling.
`ResizeObserver` and font readiness update measurements after layout changes. Animation frames,
observers and media-query listeners are cleaned up on unmount.

## Key Concepts

- Vue Composition API, typed `defineModel`, stable keyed items and post-render watchers.
- Spring integration, velocity-based deformation and direct style writes inside animation frames.
- Native overflow scrolling with local `scrollTo` / `scrollBy` and boundary-aware controls.
- Tab roles, associated tab panel, roving tabindex, ArrowLeft/ArrowRight wrapping and Home/End.
- Scoped theme-token styles and container queries for normal and standalone layouts.
- `prefers-reduced-motion` immediately settles selection and disables smooth scrolling.

## Alternatives

CSS transitions can animate position and width with less code, but require extra keyframes for
stretching and handle interruptions less naturally. Web Animations API keyframes offer a timed
choreography. An animation library is useful for shared motion across many components; this small
experiment uses no additional dependencies.

## Limitations

- This is a visual tab interaction demo; each tab displays its label in one shared panel.
- Tabs are local to the mounted demo, without persistence, deletion or virtualization.
- The droplet is an elastic rounded capsule, not a fluid simulation or an SVG goo filter.
- Overflow menu mode requires a browser with the native Popover API.
- A label wider than the whole pill moves entirely into the menu; horizontal scrolling mode keeps
  its full single-line label. Tabs in the vertical menu can wrap onto multiple lines.
