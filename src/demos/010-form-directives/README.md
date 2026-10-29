# Form directives

## Overview

Explore a local contact form with name/email inputs, a topic select, a message textarea and an
optional project-code input. All visible fields are required. Errors appear after leaving a field
or attempting validation; correcting a revealed error updates it immediately.

Validate an incomplete form to reveal a summary and focus its first invalid field. Summary buttons
focus individual fields without changing the page URL. Enabling the project field focuses it;
removing it returns focus to its checkbox. Fill example provides valid sample values. A successful
validation creates a local snapshot and focuses its heading; editing clears that snapshot. Reset
clears values, errors, field state and attempts, then focuses the name input. Tab remains native.
There is no initial autofocus, network submission or persistence.

## Implementation

`Demo.vue` coordinates the form, summary, focus inspector and result. `ContactFields.vue` groups
the native controls; `FormInput.vue` renders the repeated input/label/hint/error pattern.
`ErrorSummary.vue` provides focus actions; `FormInspector.vue` displays touched/edited state and
the normalized result. `fields.module.css` scopes shared field styles. `meta.ts` enables discovery.
No global registration, Core changes or new dependencies are required.

`validation.ts` contains readable domain rules and trimming for the result. `useDemoForm.ts` owns
values, touched state, reveal policy, attempts and explicit focus requests. Invalid fields follow
their declared visual order; the hidden project field contributes no error or payload. Removing
it also clears its value and touched state. Edited means different from the initial empty value.
Synchronous result invalidation prevents an older input watcher from clearing a fresh submission.

`directives.ts` implements two locally imported directives on native elements:

- `v-field` receives an error, reveal flag, error ID and touch callback. It installs a blur listener,
  writes `setCustomValidity`, exposes `aria-invalid` only for revealed errors and composes the error
  token with existing `aria-describedby` hints. Updates clear custom validity with an empty string
  when a rule passes. Unmount aborts its listener, removes its description token, restores the
  initial validity/invalid attribute and releases the WeakMap entry.
- `v-focus` receives a monotonically changing positive request ID; zero means no request. It waits
  for the Vue DOM update, then focuses and scrolls the target into view. The result uses the `start`
  argument to reveal the snapshot below its heading. Replaced requests and unmounted targets
  invalidate pending callbacks, so conditional fields cannot steal focus later.

Directives never assign input values or synthesize input events. Vue owns text values through
`v-model` and computed setters, preserving its composition-event handling during IME input.
`novalidate` suppresses browser validation bubbles; the same custom errors still participate in
native constraint validity. Required/type/length attributes remain on the controls. Inline errors
are associated descriptions rather than independent live alerts; a polite form status reports
validation progress. Error text and summaries identify problems without relying only on color.

## Key Concepts

- Vue directive lifecycle, typed native elements, reactive bindings and WeakMap ownership.
- Controlled inputs, touched/edited state, conditional fields and immutable result snapshots.
- Constraint validation, setCustomValidity, native required/email/length constraints and novalidate.
- Labels, composed descriptions, error summaries and explicit post-render focus requests.
- AbortController cleanup and stale nextTick callback cancellation.

See [Vue custom directives](https://vuejs.org/guide/reusability/custom-directives.html),
[setCustomValidity](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setCustomValidity)
and [WAI form validation guidance](https://www.w3.org/WAI/tutorials/forms/validation/).

## Alternatives

Native validation bubbles can be enough for a small form. Declarative component props can own ARIA
attributes directly; directives are useful for the DOM-specific validity and focus work shown here.
A form library can coordinate larger schemas, arrays and asynchronous rules. Real submissions also
need server-side validation and explicit handling of network/server errors.

## Limitations

- This is a local synchronous example, not an account/contact service or a general form library.
- The email rule deliberately supports a limited ASCII subset with a dotted domain; it does not
  prove address ownership, deliverability or support every valid international email address.
- Lengths count JavaScript UTF-16 units. The project code uses the fixed `AA-000` example format.
- No async availability checks, multi-step flow, custom widgets or server errors are simulated.
- Tests: `node --test src/demos/010-form-directives/validation.test.mjs`.
