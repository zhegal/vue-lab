import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chooseRecordingMime, recordingName } from './recording.ts';

test('MIME negotiation uses supported video types and permits the browser default', () => {
    assert.equal(
        chooseRecordingMime((type) => type === 'video/mp4'),
        'video/mp4',
    );
    assert.equal(
        chooseRecordingMime((type) => type === 'video/webm'),
        'video/webm',
    );
    assert.equal(
        chooseRecordingMime(() => true),
        'video/mp4',
    );
    assert.equal(
        chooseRecordingMime(() => false),
        undefined,
    );
});

test('download extension follows the actual encoder MIME, including codec parameters', () => {
    assert.equal(
        recordingName('clip.mov', 65.25, 'video/webm;codecs=vp8,opus'),
        'clip-clip-1-05-250.webm',
    );
    assert.equal(recordingName('clip.webm', 0, 'VIDEO/MP4;codecs=avc1'), 'clip-clip-0-00-000.mp4');
    assert.equal(recordingName('clip.mp4', 0, 'unknown'), 'clip-clip-0-00-000.bin');
});

test('names bound untrusted filenames and handle missing, negative or nonfinite timestamps', () => {
    const name = recordingName('a<>:"/\\|?*\0\n.mp4', 0, 'video/webm');
    assert.doesNotMatch(name, /[<>:"/\\|?*\p{Cc}]/u);
    assert.ok(recordingName('x'.repeat(200) + '.mp4', 0, 'video/webm').length < 110);
    assert.equal(recordingName('', -1, 'video/webm'), 'video-clip-0-00-000.webm');
    assert.equal(recordingName('a.mp4', Infinity, 'video/webm'), 'a-clip-0-00-000.webm');
});
