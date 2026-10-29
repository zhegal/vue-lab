# Architecture

## Overview

Vue Lab separates infrastructure in `src/core/` from self-contained experiments in `src/demos/`.
The shell provides navigation, theme, routing, lazy loading and documentation. Experiments own their
UI, state and browser resources without adding routes or changing global configuration.

## Implementation

### Discovery and validation

`src/core/registry.ts` uses three single-level `import.meta.glob()` patterns for `meta.ts`, `Demo.vue`
and `README.md`. Metadata is eager; component and raw Markdown imports remain lazy. Only direct
children of `src/demos/` are discovered.

`src/core/catalog.ts` builds entries from the union of those file paths. A directory must match
`NNN-descriptive-name` (three or more digits and lowercase alphanumeric hyphen-separated words),
provide valid default metadata, and contain both the component and README. Invalid entries produce
console warnings and are skipped. Compile errors in discovered files still fail the build.
An otherwise empty directory with none of these files is outside discovery.

`DemoMeta` in `src/core/types.ts` requires `title`, `description`, `category` and `tags`. Validation
trims strings and deduplicates tags; catalog entries add the directory ID and lazy loader functions.
Entries sort by ID with numeric comparison. Sequential numbering is a project convention; the
validator does not enforce continuity or unique numeric prefixes.

### Routes and loading

`src/router/index.ts` uses hash history with Vite's `BASE_URL`. The routes are `/`, `/demo/:id` and
a catch-all not-found page. `DemoView.vue` resolves IDs from the catalog; an unknown ID displays
`NotFoundView.vue`. The browser title follows the active view or experiment.

`DemoRunner.vue` loads the selected component and provides loading, error and retry states. A key
based on the demo ID remounts it when switching experiments. Async result guards prevent an older
load from replacing the current component. Descendant runtime errors also show the retry state.

The Documentation button lazily mounts `DemoDocumentation.vue`, which then loads the README. Its
markdown-it parser disables raw HTML. This viewer renders repository documentation; the stricter
link allowlist and image suppression in `008-markdown-playground` belong to that demo alone.
Relative README links are not rewritten to repository or demo asset URLs.

`App.vue` bypasses `LabLayout.vue` only for the demo route with `standalone=1`. Standalone keeps the
same component loader and `.demo-stage` container, while hiding the shell and documentation controls.
Entering or leaving it changes the component tree and can reset local state.

### Shell, styling and state

`LabLayout.vue` owns search and category refs shared by desktop and mobile navigation. They persist
while the shell stays mounted. `LabNavigation.vue` filters its own list; `HomeView.vue` reads the
complete catalog independently. The mobile drawer uses native `dialog.showModal()`, and a global
CSS rule locks body scrolling while that navigation dialog is open.

`src/style.css` imports Tailwind and defines light/dark tokens and shared shell styles. `.demo-stage`
is an inline-size container without a fixed maximum width. Demos use scoped styles or local CSS
Modules, and container queries let them respond to stage width beside the sidebar or standalone.
They still share global baseline styles and the document; Teleport/body portals need their own
style and resource ownership.

The inline head script in `index.html` applies the stored theme or initial system preference before
Vue mounts. `src/core/theme.ts` exposes the shared theme ref and toggle; it catches storage failures.
There is no Pinia store. Persistent notes, locale preferences and channel state stay in their demos.

`src/core/source.ts` creates repository and experiment source URLs from the configured repository
and source ref. `vite.config.ts` resolves those values and the hosting base path at build time.
The deployment workflow supplies the commit SHA as `VITE_SOURCE_REF`.

## Key Concepts

- Eager metadata discovery with lazy component and Markdown imports.
- Runtime metadata validation alongside TypeScript's `satisfies DemoMeta` checks.
- Generic hash routes, keyed component lifetimes and stale async result guards.
- Local state ownership, scoped styling and explicit cleanup of browser resources.
- Build-time hosting configuration independent of any particular repository name.

## Alternatives

A manual registry is simpler for a fixed set of screens but requires editing infrastructure for
each addition. A global store becomes useful if experiments need real shared application state.
An iframe can provide stronger document/style isolation for a future demo that requires it.

## Limitations

- Discovery is build-time and single-level; arbitrary runtime plugins are not supported.
- Registry warnings skip invalid entries instead of failing validation as a separate CI gate.
- Scoped CSS does not isolate storage, global DOM mutations or browser APIs.
- Repository Markdown is rendered without syntax highlighting or relative-resource resolution.
- Persistence and multi-tab synchronization are explicit demo features, not shell services.
