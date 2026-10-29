# Vue Lab

A personal laboratory for Vue, CSS, and browser API experiments. Each experiment provides an
interactive demo, implementation notes, and source links. New directories are registered automatically.

## Interface

A persistent sidebar lists experiments by category, with search across IDs, titles, descriptions,
and tags. Filters remain in place when switching pages. The overview is a compact text index;
demo pages keep the navigation available alongside the experiment.

On narrow screens, navigation opens in a native modal dialog with keyboard focus management,
Escape dismissal, and background scroll locking. Standalone mode hides the entire lab shell.
Light and dark themes use muted blue interface colors; Vue branding retains its green.
Use concise, factual interface text without taglines or decorative promotional sections.
The demo stage is an inline-size container. Use container queries to adapt demo layouts to their
available width alongside the sidebar, including when running in standalone mode.

## Stack

Vue 3 Composition API, TypeScript, Vite, Vue Router hash history, and Tailwind CSS through its Vite
plugin. Markdown-it renders documentation with raw HTML disabled. No global store or UI framework.
ESLint, Prettier, vue-tsc, and Node's built-in test runner provide development checks.

TypeScript stays on the latest 6.0 patch because the installed vue-tsc and typescript-eslint
versions do not yet support TypeScript 7's changed compiler API.

The formatting script applies Prettier, then ESLint's Vue template fixes in memory. This preserves
the lab's explicit multiline text and attribute rules, which Prettier alone would compact.
Check mode compares the resulting text without modifying files.

## Development

Use Node.js 24+ and npm.

```sh
npm ci
npm run dev
```

| Command                | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Vite development server                               |
| `npm run type-check`   | Check application, Vue SFCs, configuration, and tests |
| `npm run lint`         | ESLint, with warnings treated as errors               |
| `npm run lint:fix`     | Apply available lint fixes                            |
| `npm run format`       | Format project files                                  |
| `npm run format:check` | Verify formatting                                     |
| `npm test`             | Focused Core registry tests, with no test framework   |
| `npm run check`        | Formatting, lint, types, and tests                    |
| `npm run build`        | Check types and create `dist/`                        |
| `npm run preview`      | Serve the production build locally                    |

## Structure

```text
src/
    components/          Navigation, header, demo loader, and documentation viewer
    core/                Types, validated automatic registry, source links, and theme
    demos/
        001-welcome/     Reactive card styles
        002-sortable-list/ Pointer-based sorting and TransitionGroup
    layouts/             Persistent sidebar and mobile navigation dialog
    router/              Generic hash-based routes
    views/               Experiment index, demo page, and not-found page
    App.vue
    main.ts
    style.css            Tailwind import, shared tokens, and lab shell styles
tests/                   Focused Core tests
.github/workflows/       Official GitHub Pages deployment
```

## Add an experiment

Choose the next available sequential number and create `src/demos/NNN-descriptive-name/`:

```text
002-example/
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
components and Markdown. The catalog sorts IDs numerically. Missing files, missing default exports,
invalid metadata, and invalid directory names produce console warnings and skip the affected demo.
Syntax errors or broken imports remain build errors, so they cannot silently ship.

All demos share `/demo/:id`; no manual registration is needed. Examples:

```text
/#/demo/001-welcome
/#/demo/001-welcome?standalone=1
```

Standalone hides the header, footer, metadata, and workspace controls. It keeps theme tokens and
global baseline styles. The demo stage has no fixed maximum width.

Use scoped CSS, keep demo-specific code in its directory, and clean up resources on unmount.
Use README sections: Overview, Implementation, Key Concepts, Alternatives, and Limitations.
Documentation supports standard Markdown with raw HTML disabled; prefer absolute links for resources.
Run `npm run check` and `npm run build` before finishing a change.

## Theme

The initial theme follows the operating system unless a stored light/dark choice exists. A small
head script applies it before the app renders to avoid a theme flash. The header toggle saves the
choice in localStorage; unavailable storage falls back to session-only behavior.

## GitHub Pages

The workflow runs on pushes to `main`, or manually from Actions. It installs with `npm ci`, checks
formatting, lint, TypeScript and registry behavior, builds, and publishes `dist/` with the official
Pages actions. Source links in deployed builds point at the deployed commit.

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
