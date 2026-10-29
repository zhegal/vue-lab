import assert from 'node:assert/strict';
import { test } from 'node:test';
import { placeTooltip, placements } from './position.ts';

const viewport = { left: 0, top: 0, width: 320, height: 240 };
const bubble = { width: 140, height: 50 };

test('preferred sides flip when the opposite side has room near a viewport edge', () => {
    for (const [preferred, anchor, expected] of [
        ['top', { left: 100, top: 8, width: 80, height: 30 }, 'bottom'],
        ['bottom', { left: 100, top: 202, width: 80, height: 30 }, 'top'],
        ['left', { left: 8, top: 100, width: 80, height: 30 }, 'right'],
        ['right', { left: 232, top: 100, width: 80, height: 30 }, 'left'],
    ]) {
        assert.equal(placeTooltip(anchor, bubble, viewport, preferred).placement, expected);
    }
});

test('all sides remain bounded at corners, including a viewport-sized bubble', () => {
    for (const size of [bubble, { width: 304, height: 224 }]) {
        for (const left of [0, 280]) {
            for (const top of [0, 210]) {
                for (const side of placements) {
                    const result = placeTooltip(
                        { left, top, width: 40, height: 30 },
                        size,
                        viewport,
                        side,
                    );
                    assert.ok(result.x >= 8 && result.x + size.width <= 312);
                    assert.ok(result.y >= 8 && result.y + size.height <= 232);
                }
            }
        }
    }
});

test('visual viewport offsets are included when shifting and flipping', () => {
    const shifted = { ...viewport, left: 50, top: 80 };
    const result = placeTooltip(
        { left: 50, top: 80, width: 40, height: 30 },
        bubble,
        shifted,
        'top',
    );
    assert.equal(result.placement, 'bottom');
    assert.equal(result.x, 58);
    assert.equal(result.y, 118);
});
