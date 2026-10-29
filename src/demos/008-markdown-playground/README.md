# Markdown playground

## Overview

Edit Markdown and see the rendered preview update immediately. Source, Split and Preview select
the visible panes; on narrow screens Split stacks them vertically. Switching views preserves the
document and mounted editor. The preview scroll region is keyboard-focusable.

Open one local `.md` or `.markdown` file, restore the bundled example, or clear the editor. The
document name, character count and line count describe the current source. Imports replace the
document only after successful reading and validation. All editing is in memory, with no upload,
automatic persistence or external resource loading.

## Implementation

`Demo.vue` owns the view mode and coordinates `MarkdownToolbar.vue`, `MarkdownEditor.vue` and
`MarkdownPreview.vue`. `example.md` is bundled as raw text; `meta.ts` provides discovered metadata.
`useMarkdownDocument.ts` owns document state, import validation and stale-read guards.
`markdown.ts` configures the existing markdown-it dependency; no dependencies or Core changes are added.

The renderer enables normal Markdown formatting, tables, strikethrough and fenced code. Raw HTML
is disabled, so tags appear as escaped text. Code is escaped without a syntax-highlighting plugin.
Link destinations must pass markdown-it validation and the HTTP(S)/mailto allowlist. Generated
anchors use `target="_blank"` and `rel="noopener noreferrer"`; relative links and fragments stay
literal rather than navigating the lab or pretending to resolve against a local file directory.
Images become escaped alt-text descriptions without `img` elements or network requests.

Only this configured parser's output reaches the preview's `v-html`; raw source never does. Scoped
deep selectors style generated elements within the preview only. Parser settings are fixed rather
than exposing a switch that enables untrusted HTML. This is a restricted Markdown renderer, not
an arbitrary HTML sanitizer.

The file picker resets after each selection so the same file can be selected again. Extension,
byte size, strict UTF-8 decoding, null-byte checks and character limits are validated before applying
an import. Empty Markdown files are valid. The limit is 256 KiB per file and 100,000 UTF-16 code
units in the editor. MIME types are not trusted as a text-format guarantee.

Selecting another file, editing the source, clearing/restoring the example or unmounting invalidates
an outstanding read. A late result cannot overwrite newer work. Browser Blob reads cannot be
aborted here, but their size is bounded and stale results are discarded. Errors preserve the current
document and are announced separately from import status; preview updates are not live announcements.

## Key Concepts

- Vue computed values, controlled textarea input, component models and persistent view panes.
- Markdown parsing versus raw HTML, URL validation, escaping and a restricted HTML sink.
- File input, strict TextDecoder decoding, resource limits and asynchronous result ownership.
- Scoped deep styles, local raw-text assets and responsive CSS grid layout.

See the [markdown-it documentation](https://markdown-it.github.io/markdown-it/) and
[CommonMark syntax guide](https://commonmark.org/help/).

## Alternatives

A Markdown editor library can add selection-aware formatting commands and richer editing. A worker
can move large-document parsing off the main thread. Supporting arbitrary HTML requires a maintained
HTML sanitizer and a separate policy for links, embedded resources and document isolation.

## Limitations

- Reloading or leaving the demo discards edits. Opening a file or resetting replaces the source.
- HTML, interactive widgets, embedded resources, relative links and image loading are excluded.
- Preview is synchronous and size-bounded; there is no worker, debounce or syntax highlighting.
- UTF-16 and legacy encodings are rejected; saving/exporting files is outside this experiment.
- Character limits count JavaScript string units; a Unicode character can occupy more than one unit.
- Tests: `node --test src/demos/008-markdown-playground/markdown.test.mjs`.
