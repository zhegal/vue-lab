# Vue Lab

A personal laboratory for Vue, CSS, and browser API experiments. Each experiment provides an
interactive demo, implementation notes, and source links. New directories are registered automatically.

## Experiments

| ID  | Experiment                                                         | Focus                                              |
| --- | ------------------------------------------------------------------ | -------------------------------------------------- |
| 001 | [Card styles](src/demos/001-welcome/README.md)                     | Reactive color, radius, size and shadow            |
| 002 | [Sortable list](src/demos/002-sortable-list/README.md)             | Pointer/keyboard sorting and TransitionGroup       |
| 003 | [BroadcastChannel](src/demos/003-broadcast-channel/README.md)      | Cross-tab state, rooms and conflict ordering       |
| 004 | [IndexedDB](src/demos/004-indexeddb/README.md)                     | Persistent notes and transaction lifecycle         |
| 005 | [Local video player](src/demos/005-local-video-player/README.md)   | Local playback, PNG frames and clip recording      |
| 006 | [Native dialog](src/demos/006-native-dialog/README.md)             | show/showModal, focus, Teleport and scroll locking |
| 007 | [Tooltip directive](src/demos/007-tooltip-directive/README.md)     | Directive lifecycle and viewport positioning       |
| 008 | [Markdown playground](src/demos/008-markdown-playground/README.md) | Live preview and validated local file imports      |
| 009 | [I18n](src/demos/009-i18n/README.md)                               | Catalog fallback, plurals, numbers and time zones  |
| 010 | [Form directives](src/demos/010-form-directives/README.md)         | Validation, error summaries and explicit focus     |

Each experiment README describes its implementation, alternatives and limitations. In the app,
open **Documentation** below the experiment heading to load those notes.

## Interface

A persistent sidebar lists experiments by category, with search across IDs, titles, descriptions,
and tags. Search and category filters affect sidebar results; the overview always lists all demos.
Filters survive navigation within the lab shell, but reset on reload or when the shell remounts.
The overview is a compact text index; demo pages keep navigation alongside the experiment.

On narrow screens, navigation opens in a native modal dialog with keyboard focus management,
Escape dismissal, and background scroll locking. Standalone mode hides the entire lab shell.
Light and dark themes use muted blue interface colors; Vue branding retains its green.
The demo stage is an inline-size container. Use container queries to adapt demo layouts to their
available width alongside the sidebar, including when running in standalone mode.

## Stack

Vue 3 Composition API, TypeScript, Vite, Vue Router hash history, and Tailwind CSS through its Vite
plugin. Markdown-it renders documentation with raw HTML disabled. No global store or UI framework.
ESLint, Prettier, vue-tsc, and Node's built-in test runner provide development checks.

`package.json` constrains TypeScript to `~6.0.3`; `package-lock.json` records the resolved toolchain.
Use `npm ci` to reproduce it and check Vue/compiler/linter compatibility when upgrading.

The formatting script applies Prettier, then ESLint's Vue template fixes in memory. This preserves
the lab's explicit multiline text and attribute rules, which Prettier alone would compact.
Check mode compares the resulting text without modifying files.

## Development

Use Node.js 24+ and npm.

```sh
npm ci
npm run dev
```

Run these commands from the repository directory (`vue-lab/` in the surrounding workspace).
Open the URL printed by Vite. To serve an existing production build, use `npm run preview`.

| Command                | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Vite development server                                   |
| `npm run type-check`   | Check application, Vue SFCs, configuration and Core tests |
| `npm run lint`         | ESLint, with warnings treated as errors                   |
| `npm run lint:fix`     | Apply available lint fixes                                |
| `npm run format`       | Format project files                                      |
| `npm run format:check` | Verify formatting                                         |
| `npm test`             | Focused Core registry tests, with no test framework       |
| `npm run check`        | Formatting, lint, types, and tests                        |
| `npm run build`        | Check types and create `dist/`                            |
| `npm run preview`      | Serve the production build locally                        |

`npm test` and `npm run check` include only `tests/*.test.ts`. Demo-local `.test.mjs` suites
run separately:

```sh
node --test src/demos/*/*.test.mjs
```

See [development and verification](docs/development.md) for suite coverage and browser checks.

## Structure

```text
src/
    components/          Navigation, header, demo loader, and documentation viewer
    core/                Types, catalog validation, discovery, source links and theme
    demos/               001-welcome through 010-form-directives; each demo is self-contained
    layouts/             Persistent sidebar and mobile navigation dialog
    router/              Generic hash-based routes
    views/               Experiment index, demo page, and not-found page
    App.vue
    main.ts
    style.css            Tailwind import, shared tokens, and lab shell styles
tests/                   Focused Core tests
scripts/format.mjs       Prettier with Vue template fixes
docs/                    Architecture and verification notes
.github/workflows/       Official GitHub Pages deployment
```

See [architecture](docs/architecture.md) for module responsibilities, loading and state ownership.

## Add an experiment

Choose the next available sequential number and create `src/demos/NNN-descriptive-name/`:

```text
NNN-descriptive-name/
    Demo.vue
    meta.ts
    README.md
```

```ts
import type { DemoMeta } from '../../core/types';

export default {
    title: 'Example',
    description: 'What this experiment demonstrates.',
    category: 'UI',
    tags: ['vue', 'css'],
} satisfies DemoMeta;
```

The directory name defines the ID. `import.meta.glob()` eagerly reads metadata and lazily loads
components and Markdown. IDs use at least three digits followed by lowercase words separated by
hyphens; the next sequential number after the current catalog is `011`. Metadata requires nonempty
title, description and category strings plus a string-array `tags` field (which may be empty).
The catalog trims metadata strings, removes duplicate tags and sorts IDs numerically.
Missing files, missing default exports,
invalid metadata, and invalid directory names produce console warnings and skip the affected demo.
Syntax errors or broken imports remain build errors, so they cannot silently ship.

All demos share `/demo/:id`; no manual registration is needed. Examples:

```text
/#/demo/001-welcome
/#/demo/001-welcome?standalone=1
```

Standalone hides navigation, the header, demo metadata, source links, documentation and workspace
controls. It keeps theme tokens and global baseline styles. The demo stage has no fixed maximum
width; individual demos may constrain their own content. The query belongs after the hash route.
Switching into or out of standalone remounts the shell/demo; in-memory demo state can reset.

Use scoped CSS, keep demo-specific code in its directory, and clean up resources on unmount.
Use README sections: Overview, Implementation, Key Concepts, Alternatives, and Limitations.
Documentation supports standard Markdown with raw HTML disabled. Prefer absolute web links in demo
READMEs: the in-app viewer does not resolve relative links or assets against the demo directory.
Run `npm run format`, `npm run check`, relevant demo suites and `npm run build` after edits.
Verify interactive changes in both normal and standalone modes.

## Theme

The initial theme follows the operating system unless a stored light/dark choice exists. A small
head script applies it before the app renders to avoid a theme flash. The header toggle saves the
choice under `vue-lab-theme` in localStorage; unavailable storage keeps the choice in memory.
Operating-system preference is read at page load, with no live system-theme or cross-tab watcher.

## GitHub Pages

The workflow runs on pushes to `main`, or manually from Actions. It installs with `npm ci`, checks
formatting, lint, TypeScript and registry behavior, builds, and publishes `dist/` with the official
Pages actions. Source links in deployed builds point at the deployed commit. Demo-local tests are
not part of this workflow; run them explicitly before publishing changes to their logic.

Initial repository setup:

1. Push the project to your repository's `main` branch when ready.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions** as Source.
3. Make sure Actions is enabled, then run the workflow or push to `main`.
4. Open the URL returned by the deployment. Hash routes support direct links on static hosting.

Vite derives `/<repository-name>/` from `GITHUB_REPOSITORY` in Actions, or `/` locally. A repository
named `<owner>.github.io` defaults to `/`. For a custom domain or another mount point, set the
repository Actions variable `VITE_BASE_PATH` to `/` or `/your-path/`.

Copy `.env.example` to `.env.local` for local overrides:

| Variable              | Default                                                       |
| --------------------- | ------------------------------------------------------------- |
| `VITE_BASE_PATH`      | Derived repository path in Actions; `/` locally               |
| `VITE_REPOSITORY_URL` | GitHub repository in Actions; package.json repository locally |
| `VITE_SOURCE_REF`     | Deployed SHA in Actions; `main` locally                       |

Update package.json's repository URL when moving the project. For a production-path smoke check,
build with `VITE_BASE_PATH=/vue-lab/ npm run build`, then use
`VITE_BASE_PATH=/vue-lab/ npm run preview` and open `/vue-lab/`.
For a custom domain, also add the appropriate `public/CNAME` file and configure your domain in Pages.

## Working with Codex

Agent instructions live in `../AGENTS.md`, outside this repository, alongside the original TASK.md.
They apply to the nested checkout. Keep agent-only documents and screenshots outside the repository;
application and experiment README files belong here.

Use Vue Composition API and TypeScript, SFC order template/script/style, four spaces, semicolons,
100-character lines, and logical component decomposition. Follow references closely, explain
nontrivial choices, and avoid changes to unrelated demos. Add dependencies only with a concrete need.
Codex must not commit or push without an explicit user request.

## Limitations

The lab runs as a static browser app without a backend. Demos share the origin, document and theme;
scoped styles and resource cleanup provide component isolation, rather than an iframe sandbox.
Browser API availability, storage policies, codecs and device behavior can affect individual demos.
IndexedDB notes and the I18n locale persist locally; other demo state is generally in memory.
See each experiment README for its exact persistence and browser-support behavior.
