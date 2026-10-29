# Tooltip directive

## Overview

Try a locally registered `v-tooltip` on native buttons and a text input. Hover opens after a
configurable delay; focus opens immediately. The pointer can move from a trigger onto its tooltip.
Esc closes the tooltip without moving focus and suppresses reopening until the interaction ends.

Change the preview text, preferred placement or hover delay. Edit the Tooltip text field while it
has focus to see a live update. Empty text and the disable option suppress the preview description.
The mount checkbox exercises directive cleanup. The scroll box demonstrates attachment, clipping
and escaping a transformed overflow container.

## Implementation

`Demo.vue` coordinates the preview; `TooltipOptions.vue` owns controls and the live text example.
`TooltipBoundaryLab.vue` provides scrollable targets. No global registration or dependencies are added.

`tooltip.ts` implements `mounted`, `updated` and `beforeUnmount`. It accepts a string or
`{ text, delay?, disabled? }`; the optional directive argument selects top/right/bottom/left.

```vue
<button v-tooltip:top="'Extra information'">
    Help
</button>
<button v-tooltip:[placement]="{ text, delay: 350, disabled }">
    Preview
</button>
```

`tooltipController.ts` owns each trigger's DOM and interaction state. A description node with a
unique ID and `role="tooltip"` is appended to `document.body`, with isolated CSS Module styles.
`aria-describedby` includes the owned ID while retaining existing descriptions. The hidden node
remains available as a referenced description; the visual tooltip never receives focus. Content
uses `textContent`, so markup is literal text. Only one tooltip can open or wait to open at a time.

Trigger hover, tooltip hover and focus are tracked independently. A 160ms close grace period lets
the pointer cross the gap. Focus keeps the tooltip visible even after the pointer leaves. Esc also
cancels pending opens. Disabled/empty bindings close immediately. Unmount removes the description,
its owned ARIA token, timers, animation frames, event listeners and observers.

`position.ts` computes fixed coordinates from measured rectangles. If the preferred side lacks
space and its opposite has more, it flips; both axes then shift inside an 8px viewport margin.
The bubble wraps to at most 280px and is bounded by the visual viewport. Scroll (including nested
containers), resize and ResizeObserver updates are batched with requestAnimationFrame. An
IntersectionObserver dismisses a tooltip whose anchor is fully clipped. Global listeners and
observers are attached only while opening/open, and released on close.

## Key Concepts

- Typed local Vue directives, dynamic arguments, reactive updates and lifecycle ownership.
- Pointer/focus state, delayed opening, hoverable descriptions and Escape dismissal.
- `role="tooltip"`, composed `aria-describedby` values and visible trigger labels.
- Fixed body portals, rectangle measurement, flipping, shifting and visual viewport bounds.
- AbortController, WeakMap, ResizeObserver, IntersectionObserver and resource cleanup.

See [Vue custom directives](https://vuejs.org/guide/reusability/custom-directives.html) and the
[ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/), which is still a draft.

## Alternatives

Use the native `title` attribute for basic browser-managed hints with limited presentation control.
A Vue component with Teleport offers declarative rendering and richer coordination. A positioning
library is useful for complex collision policies; interactive content belongs in a popover or dialog.

## Limitations

- Tooltips contain short supplementary text only. Essential information must stay visible elsewhere.
- Use a natively focusable trigger; this directive does not add tabindex, labels or keyboard behavior.
- Touch has no hover or custom long-press gesture; focus can show a description where supported.
- Body portals do not appear above native modal top-layer elements. Iframe bounds are local.
- Positioning handles scroll, viewport/element resize and binding updates, rather than continuously
  tracking arbitrary CSS animations or unrelated layout shifts. Fully clipped anchors dismiss.
- The directive owns an ARIA description token. Avoid also binding a native title tooltip; runtime
  changes to a trigger's native disabled state should be accompanied by a binding update.
- Geometry tests: `node --test src/demos/007-tooltip-directive/position.test.mjs`.
