# Native dialog

## Overview

Open the same `<dialog>` with `show()` or `showModal()`. Use the background input and counter to
compare page interaction. Change Teleport and the initial focus target while the dialog is closed;
inspect its DOM parent, focus events, close reason, note and native `returnValue`.
The separate Lock document scroll checkbox is on by default and applies only to `showModal()`.

| Behavior            | `show()`                     | `showModal()`                                |
| ------------------- | ---------------------------- | -------------------------------------------- |
| Page interaction    | Available                    | The rest of the document is inert            |
| Placement           | Regular document stacking    | Browser top layer                            |
| `::backdrop`        | None                         | Dimmed background                            |
| Tab navigation      | Can leave the dialog         | Contained by the browser                     |
| Esc / close request | No native modal cancellation | Fires `cancel`, then closes unless prevented |

Close with the explicit `close()` button, the native `method="dialog"` form, or (for a modal) Esc
and optional backdrop dismissal. The page close button demonstrates programmatic closing of a
non-modal dialog. Every close returns focus to the original opening button when it still exists.

## Implementation

`Demo.vue` coordinates the comparison, background controls and a bounded 24-entry event log.
`DialogOptions.vue` owns the configuration UI; `DialogInspector.vue` displays results.
`NativeDialog.vue` owns the native element, form, initial focus and focus restoration. `types.ts`
defines typed modes, focus targets and emitted event/results.

The dialog is opened imperatively through native methods; its `open` attribute is never bound or
toggled manually. The `close` event updates Vue state and captures `returnValue`; opening resets the
previous return value. A native `cancel` event may be prevented without blocking the other close paths.
The form is allowed to submit normally with `method="dialog"`, which closes without a network request.

Teleport moves the DOM node to `document.body` while preserving its Vue component state and scoped
styles. With Teleport off, the transformed inline container is the containing block for fixed
non-modal positioning. A modal uses the top layer and escapes ancestor clipping even without Teleport.
The inline non-modal window scrolls internally when its content exceeds the container height.
Teleport and configuration are locked while open to avoid moving an active native dialog.

Backdrop dismissal uses pointer coordinates and requires both press and release outside the dialog's
border box. Clicking its padding or starting a drag inside does not dismiss it. Modal focus containment
and Esc cancellation are browser behavior, not a custom focus trap or keyboard imitation.

Initial focus can target the input, heading or close button. After native opening, the chosen element
is focused explicitly. On close, focus restoration waits for Vue to re-enable the opener. Unmount
closes an open dialog before its teleported node is removed. No global listeners or dependencies
are added.

`scrollLock.ts` temporarily sets both root/body overflow axes to hidden when the optional modal lock
is enabled. A stable scrollbar gutter avoids a layout shift in supporting browsers. Previous inline
values and their priorities are restored on close or unmount, without resetting unrelated styles.
Preventing `cancel` keeps the scroll lock in place; non-modal dialogs never apply it.

## Key Concepts

- HTMLDialogElement, top layer, inert content, `::backdrop`, `cancel` and `close` events.
- Native dialog-form submission and `returnValue` versus Vue-owned form input state.
- Focus targets, focus return, native Tab containment and imperative component methods.
- Teleport DOM placement versus Vue ownership and scoped styles.
- Temporary document style ownership with cleanup on close and unmount.

See the [dialog reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
and [Vue Teleport guide](https://vuejs.org/guide/built-ins/teleport.html).

## Alternatives

Use native `<dialog>` without Teleport when the top layer already provides the placement you need.
An accessible dialog library can coordinate nested windows, transitions and complex focus policies.
A custom overlay requires implementing inertness, keyboard behavior and focus restoration yourself.

## Limitations

- One dialog at a time; nested modal coordination and animations are outside this experiment.
- Backdrop dismissal is implemented here; it is not implied by calling `showModal()`.
- A modal blocks its own document; opening this demo in an iframe does not make its parent inert.
- Native cancellation keys and assistive-technology behavior can vary across browsers/platforms.
- The explicit focus-return policy also applies after interacting with the non-modal background.
- Native modality alone is not a global page scroll lock; turn off the separate checkbox to compare.
- Scroll locking uses overflow styles rather than fixed-body positioning; mobile browser scroll
  behavior and scrollbar-gutter support can differ.
