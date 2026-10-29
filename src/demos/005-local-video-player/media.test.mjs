import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clamp, formatTime, validateVideoFiles } from './media.ts';

test('file validation rejects ambiguous inputs and respects known MIME types', () => {
    const video = { name: 'clip.mp4', type: 'video/mp4', size: 42 };
    assert.equal(validateVideoFiles([video]), '');
    assert.equal(validateVideoFiles([{ ...video, type: '' }]), '');
    assert.equal(validateVideoFiles([{ ...video, type: 'application/octet-stream' }]), '');
    for (const files of [
        [],
        [video, video],
        [{ ...video, size: 0 }],
        [{ ...video, type: 'text/plain' }],
        [{ ...video, name: 'notes.txt', type: '' }],
    ])
        assert.notEqual(validateVideoFiles(files), '');
});

test('time display handles unloaded metadata, hour boundaries and fractional seconds', () => {
    assert.equal(formatTime(NaN), '0:00');
    assert.equal(formatTime(Infinity), '0:00');
    assert.equal(formatTime(-3), '0:00');
    assert.equal(formatTime(59.9), '0:59');
    assert.equal(formatTime(60), '1:00');
    assert.equal(formatTime(3661), '1:01:01');
});

test('seek and volume bounds reject nonfinite input and preserve values within limits', () => {
    assert.equal(clamp(-5, 0, 100), 0);
    assert.equal(clamp(105, 0, 100), 100);
    assert.equal(clamp(24.5, 0, 100), 24.5);
    assert.equal(clamp(NaN, 0, 100), 0);
});
