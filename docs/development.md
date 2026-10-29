# Development and verification

## Overview

Use Node.js 24+ and npm from the repository directory. Install the locked dependency tree with
`npm ci`, then start Vite with `npm run dev`. The application needs no backend or external services.

## Implementation

### Change verification

After editing, run:

```sh
npm run format
npm run check
node --test src/demos/*/*.test.mjs
npm run build
```

`format` runs Prettier and applies ESLint's Vue template fixes in memory before writing. This keeps
the project's four-space indentation, semicolons, multiline template text and attribute rules.
`format:check` uses the same transformation without writing files.

`check` runs formatting verification, ESLint with no warnings, `vue-tsc --build`, then `npm test`.
Type checking includes application TypeScript/Vue files, Vite configuration and Core TypeScript
tests. The demo `.test.mjs` files execute separately and are not type-checked by that command.
`build` checks types again and writes Vite's production output to `dist/`.

### Automated suites

Node's built-in test runner executes all suites; no additional test framework is required.

| Scope            | Test file                                             | Coverage                                                               |
| ---------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| Core             | `tests/catalog.test.ts`                               | Metadata validation/normalization, discovery, sorting and lazy loaders |
| BroadcastChannel | `src/demos/003-broadcast-channel/protocol.test.mjs`   | Message validation, conflict ordering and room names                   |
| Local video      | `src/demos/005-local-video-player/media.test.mjs`     | File validation, time display and numeric bounds                       |
| Recording        | `src/demos/005-local-video-player/recording.test.mjs` | MIME negotiation and download filenames                                |
| Tooltip          | `src/demos/007-tooltip-directive/position.test.mjs`   | Flipping, viewport bounds and visual viewport offsets                  |
| Markdown         | `src/demos/008-markdown-playground/markdown.test.mjs` | Escaping, link policy, image suppression and file validation           |
| I18n             | `src/demos/009-i18n/i18n.test.mjs`                    | Fallback, plurals, input parsing, formatting and storage failures      |
| Form             | `src/demos/010-form-directives/validation.test.mjs`   | Domain rules, normalized results, reveal policy and state transitions  |

Run one suite by passing its path to `node --test`. The GitHub Pages workflow runs `npm run check`
and `npm run build`; it does not currently execute the demo-local suites.

### Browser verification

For interactive changes, open the affected demo through the shell and via
`/#/demo/<id>?standalone=1`. Check narrow and wide stage widths, both themes, keyboard controls and
cleanup when leaving the route. Use the console to check for registry warnings or runtime errors.
These are manual checks; the repository has no browser automation suite.

| Experiment          | Useful checks                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------- |
| Card styles         | Change each setting, reset, and constrain the preview width                               |
| Sortable list       | Pointer and keyboard reorder, Escape cancellation and reduced motion                      |
| BroadcastChannel    | Two same-origin tabs in one room, separate rooms and reconnect                            |
| IndexedDB           | Create/edit/delete, reload persistence and manual refresh after another tab writes        |
| Local video player  | Local file replacement, seek/volume/fullscreen, PNG capture and recording where supported |
| Native dialog       | Modal/non-modal interaction, Tab/Esc, focus return and optional scroll lock               |
| Tooltip directive   | Hover/focus/Esc, text updates, clipping, scroll and unmount                               |
| Markdown playground | View switching, UTF-8 import, invalid-file preservation and literal HTML/images           |
| I18n                | Three locales, fallback, fractional plurals, time zones and saved-language removal        |
| Form directives     | Blur/submit errors, summary focus, conditional field, successful result and reset         |

### Hosting-path verification

Use a non-root base to check the static-hosting path locally:

```sh
VITE_BASE_PATH=/vue-lab/ npm run build
VITE_BASE_PATH=/vue-lab/ npm run preview
```

Open the preview URL under `/vue-lab/`, then navigate directly to
`/vue-lab/#/demo/001-welcome` and `/vue-lab/#/demo/001-welcome?standalone=1`.
Check asset loading and documentation as well as navigation. Use the actual preview port printed
by Vite. This local check does not publish the site or confirm GitHub Pages account settings.
Build again without the override when you need root-path output.

## Key Concepts

- Reproducible installs through `package-lock.json` and `npm ci`.
- Separate formatting, lint, type, unit-test and production-build checks.
- Explicit demo-suite execution alongside the Core checks used by CI.
- Manual browser verification for native APIs, accessibility interactions and resource cleanup.

## Alternatives

Run individual npm scripts or demo suites while developing, then the complete checks before
delivery. A browser test runner could automate stable interaction regressions if the project needs
it; media codecs, device behavior and assistive technology would still need targeted manual checks.

## Limitations

Node suites do not exercise the rendered Vue interface, native dialog focus, IndexedDB transactions,
live BroadcastChannel delivery or media recording. Passing a build does not prove those browser
behaviors. Browser API availability and storage/media policies must be checked in the target browser.
