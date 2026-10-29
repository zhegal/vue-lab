# CSS anchor positioning

## Overview

Three interactive examples of native CSS anchor positioning:

- **anchor()** reproduces the reference: an orange square above a blue anchor, with its left
  edge at the anchor's center. Centering adds `translate: -50% 0`.
- **Placement** explores nine `position-area` regions, overflow flips, gaps, and
  `anchor-size(width)`. Its containing block is the dotted canvas.
- **Popover** combines explicit anchoring with a native `popover="auto"` panel in the top layer.
  Its containing block is the viewport, so it can leave the canvas. Click the blue trigger to
  toggle; Escape, clicking outside, or the close button dismisses it.

Drag the blue anchor with mouse, pen, or touch. Focus it and use arrow keys (2 percentage points)
or Shift + arrows (10 points). Sliders provide another keyboard and touch input path. Reset returns
to the first example and its defaults. CSS updates with the settings.

Only a screenshot was supplied, so movement and the additional examples are learning controls
rather than a reconstruction of unseen video behavior.

## Implementation

`Demo.vue` owns local settings and mode selection. `AnchorControls.vue` edits the settings;
`AnchorStage.vue` renders the anchor and its attached element. `AnchorCode.vue` displays the
corresponding placement CSS. `settings.ts` contains defaults, modes, and feature detection.

Every stage instance gets a unique anchor name using Vue's `useId()`. The anchor precedes its
positioned element in DOM order. JavaScript changes only the blue anchor's coordinates and size;
CSS calculates the attached element's position and optional matching width. A `ResizeObserver`
measures the canvas for normalized drag coordinates and keeps the anchor inside a 12px inset.
Requested anchor width is capped to fit narrow canvases.

Pointer capture keeps dragging active outside the button. Movement suppresses the subsequent
pointer click so dragging a popover trigger does not toggle it. Native `popovertarget` attributes
handle activation, dismissal, and keyboard behavior. Switching examples remounts the stage, closes
any popover, and disconnects its observer; unmount also releases pointer capture.

## Key Concepts

- `anchor-name` identifies an anchor; `position-anchor` associates its positioned element.
- `bottom: anchor(top)` aligns two edges. `left: anchor(center)` positions the left edge,
  not the center of the attached element.
- `position-area` expresses placement on a 3 × 3 grid around the anchor.
- `position-try-fallbacks` tries block, inline, and combined flips, in that order.
  If nothing fits, the original placement wins. Center placement overlaps and cannot flip.
- `anchor-size(width)` follows the rendered anchor width without a JS measurement of the anchor.
- Popover visibility and top-layer behavior are separate from CSS placement. Reset `inset` and
  `margin` from the browser's default centered popover styling before positioning it.
- `CSS.supports()` and Popover API detection gate unsupported examples. Optional features have
  individually disabled controls.

## Alternatives

Flexbox or grid is simpler when elements belong in the same layout flow. A relatively positioned
wrapper can place a small tooltip, but does not provide top-layer escape or overflow flips.
Floating UI is useful for older-browser support, more collision strategies, and complex overlays.
This experiment adds no dependencies or JavaScript positioning fallback so native behavior stays
visible.

## Limitations

- Native support varies by browser/version. Detection checks accepted syntax, not rendering bugs.
  The displayed CSS represents requested settings; unsupported optional features are not applied.
- The reference example intentionally clips at the canvas boundary; it has no collision handling.
  Placement may clip or shift over its anchor if none of its flips fits, depending on default
  overflow alignment. Popover fallbacks use the viewport instead.
- At `center`, the attached element overlaps the anchor; the placement card ignores pointer input
  so the blue anchor remains draggable. A popover can cover its trigger; close it to drag again.
- The live CSS is a placement excerpt, not a standalone HTML document. It omits the drag coordinates,
  canvas setup, dimensions of the orange square, and presentation styles.
- Settings last only while mounted. The panel demonstrates a nonmodal popover, not an ARIA menu
  or a reusable production tooltip implementation.

References: [CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning),
[position-area](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-area),
[overflow fallbacks](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-try-fallbacks),
and [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API).
