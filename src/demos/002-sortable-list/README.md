# A little order

## Overview

A sortable list with live neighbor animations. Drag a grip with a mouse, pen, or touch, use the
up/down buttons, or reorder from a focused grip with the keyboard. Compare animation on/off,
adjust its duration, shuffle the list, and restore the original order.

Keyboard: Space or Enter picks up an item; arrows move it; Home/End move it to an edge.
Enter or Space drops it, Escape restores the order from pickup, and Tab drops before leaving.
Pointer drags also support Escape, cancellation, and automatic scrolling near viewport edges.

## Implementation

`Demo.vue` owns the ordered array and animation settings. `SortingControls.vue` exposes the settings
and current IDs. `SortableList.vue` renders keyed list items inside Vue's `TransitionGroup`;
`SortableRow.vue` contains the grip, content, and accessible move buttons.

`useSortable.ts` handles pointer capture, hit testing, keyboard interaction, and cancellation.
The stable list wrapper captures the pointer because the keyed rows move in the DOM. A noninteractive,
screen-reader-hidden preview is teleported to the body and follows the pointer vertically, while
the original row marks the insertion slot. The array updates as the dragged center crosses rows.

Hit testing uses layout offsets rather than animated bounding rectangles, so in-progress transforms
do not make the insertion target oscillate. The animation frame loop also handles edge scrolling;
it stops on drop, cancellation, window blur/resize, and unmount. Global listeners are removed on unmount.

## Key Concepts

- Stable `:key="item.id"` identity versus changing array positions; never use the index as the key.
- `TransitionGroup` measures layout changes and applies FLIP movement with a CSS move class.
- The `.sort-move` class transitions only `transform`; duration is a local CSS custom property.
- The floating preview and the animated list use separate elements to avoid transform conflicts.
- Pointer Events, pointer capture, `touch-action: none` on grips, and `requestAnimationFrame`.
- Typed component models, emits, computed state, lifecycle cleanup, and live status announcements.
- Native ordered-list semantics and keyboard controls; `prefers-reduced-motion` disables movement.

See the [Vue TransitionGroup guide](https://vuejs.org/guide/built-ins/transition-group.html)
and [pointer capture reference](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture).

## Alternatives

Native HTML Drag and Drop can supply a browser drag preview, but touch and keyboard behavior need
separate consideration. A dedicated sorting library is useful for multi-list transfers, virtualization,
and more complex collision rules. Manual FLIP or the Web Animations API offers more control at the
cost of taking over the layout measurement that TransitionGroup already provides here.

## Limitations

- A single vertical list; no cross-list drops, persistence, or virtualization.
- Reordering happens live. The floating preview snaps into its slot on drop; neighbors animate.
- Edge scrolling targets the page, not nested scroll containers.
- Only grips disable touch scrolling; the rest of the page remains scrollable.
- Animation settings do not override the operating system's reduced-motion preference.
- Standalone retains the lab's theme tokens and baseline CSS. No external libraries are used.
