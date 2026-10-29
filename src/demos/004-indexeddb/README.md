# IndexedDB

## Overview

Create, read, edit and delete notes stored in the current browser. Reload the page to check persistence.
The schema panel shows the database, store and fields. Open the same demo in another tab and use
Reload from storage to read its changes. Normal and standalone modes share the same database.

## Implementation

`database.ts` defines the record shape and wraps the native IndexedDB open/request events in promises.
Version 1 creates the `notes` store with an auto-incrementing `id` key. Each operation starts a fresh
transaction. Results resolve on `transaction.oncomplete`, so request success alone never confirms a
write. Read results are sorted by update time and then ID.

`useNotesDatabase.ts` owns the connection, loading/error states and asynchronous operations.
`NoteEditor.vue` owns an unsaved draft; `NotesList.vue` emits record actions. `Demo.vue` coordinates
editing. Controls are disabled while opening or running transactions. Failed saves retain the draft;
successful saves reset it after a committed write and fresh read. Reload from storage cancels editing.

Blocked opens show an instruction to close older tabs. Version changes close the connection so another
tab can upgrade, and offer reopening. Unexpected closure is recoverable. Unmount closes the connection;
an open request that finishes after unmount is also closed without updating the old component.

## Key Concepts

- Native IndexedDB object stores, inline keys, schema versions and upgrade transactions.
- `readonly` versus `readwrite`, request success versus transaction completion/abort.
- Typed records, Vue composables, local drafts and lifecycle-aware asynchronous state.
- Persistent browser storage without a backend, global store or extra dependency.

See the [IndexedDB guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB).

## Alternatives

`idb` adds schema-aware TypeScript types and a promise API with less event-handling code. Dexie is useful
for larger schemas and reactive queries. localStorage is simpler for small string settings but lacks
IndexedDB's transactions and structured object stores. This demo uses the native API to expose its
lifecycle directly.

## Limitations

- Storage belongs to the origin and browser profile, not the URL path. It is not encrypted backup
  or cross-device sync; clearing site data removes notes, and browsers can evict storage.
- Private modes, quota limits or storage policies can deny operations; errors are displayed.
- The list reads every record; pagination, indexes and schema migrations beyond version 1 are omitted.
- Other tabs do not automatically update this list. Reload from storage reads their changes and
  cancels the current edit. Concurrent saves use the last committed value; saving an outdated edit
  can recreate a record deleted by another tab.
- Deletion is immediate and has no undo. Only this demo's namespaced database is used.
- Reload persistence concerns records; unsaved editor text is intentionally not persisted.
