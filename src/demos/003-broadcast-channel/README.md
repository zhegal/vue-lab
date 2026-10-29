# BroadcastChannel

## Overview

Synchronize a note and an English/Ukrainian preview between tabs. Open a second tab with the provided
link, edit either tab, and inspect the event logs. Join a different room to isolate a conversation;
disconnect to stop receiving updates. The lab's language and theme are unaffected.

Open both tabs from the same development, preview or deployed URL. Different hostnames or ports
use different origins and cannot share this channel.

## Implementation

`Demo.vue` owns connection controls and generates a base-aware standalone link with the active room.
`SharedStatePanel.vue` renders inputs and a locally translated preview. `EventLog.vue` keeps the latest
40 events visible. `useBroadcastState.ts` owns the native channel and counters; `protocol.ts` defines
and validates the versioned messages.

Each connection starts with defaults and requests a snapshot from existing tabs. Replies target the
requesting tab. Local edits increment a logical revision; snapshots compare revision first, then
author ID to resolve concurrent edits deterministically. Received state is applied without rebroadcast,
preventing feedback loops. Reconnect requests the current room state again.

The channel is namespaced to this demo. Disconnect and unmount remove handlers and close it.
Unsupported APIs, send failures, decoding errors and invalid messages have explicit UI/log states.

## Key Concepts

- BroadcastChannel, structured cloning, runtime validation of `unknown` messages.
- State requests, targeted replies, logical revisions and deterministic conflict resolution.
- Vue refs, computed state, typed emits, lifecycle cleanup and scoped styles.
- A local `lang` attribute keeps preview language semantics in sync without changing the document.

See the [Broadcast Channel API guide](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API).

Run the demo's protocol validation and conflict-ordering tests with
`node --test src/demos/003-broadcast-channel/protocol.test.mjs` (Node.js 24+).

## Alternatives

The `storage` event can signal localStorage changes across tabs. SharedWorker can coordinate a central
state owner. A server or WebSocket is needed for communication between devices. None is needed here.

## Limitations

- Tabs must share the same origin, browser storage partition and room; no cross-device sync.
- Messages are ephemeral: closing every tab loses state. This is not persistent storage.
- Whole snapshots use last-writer-wins ordering, not collaborative text merging. Concurrent edits
  can overwrite each other; the author ID breaks equal-revision ties rather than measuring wall time.
- Sent counts mean posted messages, not delivery acknowledgements or connected-peer counts.
- Room names isolate examples, not access: other same-origin code can join a known channel.
- No external dependencies; the supported browser must provide BroadcastChannel.
