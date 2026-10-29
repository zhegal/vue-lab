# Card styles

## Overview

An interactive card editor that demonstrates the lab infrastructure and Vue reactivity.
Adjust background color, corner radius, width, and shadow; reset restores the initial values.

## Implementation

`Demo.vue` owns a typed settings object. `CardControls.vue` emits replacements through `defineModel()`;
`CardPreview.vue` derives inline styles with `computed()`. `settings.ts` contains defaults and types.
Styles are scoped, with no timers, global listeners, or third-party demo dependencies.

The preview chooses dark or light text from a weighted RGB brightness estimate.
Width is clamped to the available canvas so the card remains usable on small screens.

## Key Concepts

- Vue `ref()`, `computed()`, component props, and component `v-model`.
- Native color and range inputs with accessible labels and visible values.
- CSS aspect ratio, scoped styles, Grid, container queries, and reduced-motion preferences.
- Lazy loading, automatic registry discovery, and standalone routing provided by the lab.

## Alternatives

CSS custom properties can replace the computed style object. A composable would be useful if multiple
previews needed shared behavior. Pinia would add little value for this local component state.

## Limitations

- Changes stay in memory and reset when the experiment unmounts or the page reloads.
- The selected width is a target width; narrow screens constrain the actual rendered width.
- Brightness estimation is approximate and does not guarantee WCAG contrast for every custom color.
- The experiment uses lab color tokens and Tailwind's baseline reset, rather than iframe isolation.
- Standalone hides the lab interface and retains its theme and baseline styles.
