import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initialSnapshot, isChannelMessage, isNewer, protocol, validRoom } from './protocol.ts';

test('channel messages validate their protocol, routing and complete snapshot at runtime', () => {
    const message = {
        protocol,
        sender: 'tab-a',
        type: 'state',
        snapshot: initialSnapshot(),
        target: 'tab-b',
    };
    assert.equal(isChannelMessage(message), true);
    assert.equal(isChannelMessage({ protocol, sender: 'tab-a', type: 'request' }), true);
    for (const value of [
        null,
        [],
        {},
        { ...message, protocol: 'another-app' },
        { ...message, type: 'unknown' },
        { ...message, sender: '' },
        { ...message, target: 42 },
        { ...message, snapshot: { ...message.snapshot, revision: -1 } },
        { ...message, snapshot: { ...message.snapshot, revision: Infinity } },
        { ...message, snapshot: { ...message.snapshot, revision: 1.5 } },
        { ...message, snapshot: { ...message.snapshot, value: { language: 'fr', note: '' } } },
        { ...message, snapshot: { ...message.snapshot, value: { language: 'en', note: 3 } } },
        {
            ...message,
            snapshot: { ...message.snapshot, value: { language: 'en', note: 'x'.repeat(501) } },
        },
    ])
        assert.equal(isChannelMessage(value), false);
});

test('concurrent snapshots converge in either order; old and repeated ones lose', () => {
    const a = { revision: 1, author: 'a', value: { language: 'en', note: 'A' } };
    const b = { revision: 1, author: 'b', value: { language: 'uk', note: 'B' } };
    function apply(snapshots) {
        return snapshots.reduce(
            (current, next) => (isNewer(next, current) ? next : current),
            initialSnapshot(),
        );
    }
    assert.deepEqual(apply([a, b]), b);
    assert.deepEqual(apply([b, a]), b);
    assert.equal(isNewer(b, b), false);
    assert.equal(isNewer(a, b), false);
    assert.equal(isNewer({ ...a, revision: 2 }, b), true);
});

test('room names are bounded and safe to include in a namespaced channel and URL', () => {
    assert.equal(validRoom('test-room_2'), true);
    for (const value of ['', 'a b', 'a/b', 'x'.repeat(33)]) assert.equal(validRoom(value), false);
});
