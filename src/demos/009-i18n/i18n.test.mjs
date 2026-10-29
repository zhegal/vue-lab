import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isLocale } from './catalogs.ts';
import { createFormatters, formatPlural, parseNumber, parseUtc, resolveMessage } from './i18n.ts';
import {
    readPreference,
    removePreference,
    STORAGE_KEY,
    writePreference,
} from './useLocalePreference.ts';

test('messages resolve locally, fall back to English, then return missing keys', () => {
    assert.deepEqual(resolveMessage('uk', 'order.title'), {
        text: 'Підсумок замовлення',
        source: 'uk',
        fallback: false,
    });
    assert.deepEqual(resolveMessage('ru', 'order.delivery'), {
        text: 'Delivery is available in selected regions.',
        source: 'en',
        fallback: true,
    });
    for (const key of ['order.missing', 'toString', '__proto__']) {
        assert.deepEqual(resolveMessage('ru', key), { text: key, source: null, fallback: false });
    }
    assert.equal(
        resolveMessage('ru', 'greeting', { name: '$& <b>Alex</b>' }).text,
        'Привет, $& <b>Alex</b>!',
    );
    assert.equal(resolveMessage('en', 'greeting').text, 'Hello, {name}!');
});

test('cardinal rules cover English, Russian, Ukrainian, teens and fractions', () => {
    assert.equal(formatPlural('en', 21).text, '21 items');
    assert.equal(formatPlural('en', 1).text, '1 item');
    for (const locale of ['ru', 'uk']) {
        const expected = ['many', 'one', 'few', 'many', 'many', 'many', 'one', 'other'];
        [0, 1, 2, 5, 11, 14, 21, 1.5].forEach((value, index) => {
            assert.equal(formatPlural(locale, value).category, expected[index]);
        });
    }
    assert.equal(formatPlural('ru', 2).text, '2 товара');
    assert.equal(formatPlural('uk', 2).text, '2 товари');
    assert.equal(formatPlural('ru', 11).text, '11 товаров');
    assert.equal(formatPlural('uk', 1.5).text, '1,5 товару');
    assert.deepEqual(formatPlural('ru', 1.0001), { category: 'one', text: '1 товар' });
    for (const value of [NaN, Infinity, -1])
        assert.throws(() => formatPlural('en', value), RangeError);
});

test('empty, nonfinite, nondecimal and out-of-range inputs never become misleading numbers', () => {
    for (const value of ['', ' ', 'NaN', 'Infinity', '0x10', '0b11', '1e1000', '-1', '10001']) {
        assert.equal(parseNumber(value, 0, 10000), null);
    }
    assert.equal(parseNumber('1.5', 0, 10000), 1.5);
    assert.equal(parseNumber('1e3', 0, 10000), 1000);
    assert.equal(parseNumber('-12.5', -1e9, 1e9), -12.5);
    assert.equal(Object.is(parseNumber('-0', 0, 10000), -0), false);
});

test('UTC input preserves the instant and rejects normalized invalid calendar dates', () => {
    assert.equal(parseUtc('2026-10-29T12:30')?.toISOString(), '2026-10-29T12:30:00.000Z');
    assert.equal(parseUtc('2024-02-29T00:00')?.getUTCDate(), 29);
    for (const value of [
        '',
        '2026-02-29T00:00',
        '2026-02-30T12:00',
        '2026-13-01T12:00',
        '2026-10-29T24:00',
        '2026-10-29T12:60',
        '0000-01-01T00:00',
        '2026-10-29',
    ])
        assert.equal(parseUtc(value), null);
});

test('formatters use the selected locale, currency and explicit display time zone', () => {
    const en = createFormatters('en', 'USD', 'UTC');
    const ru = createFormatters('ru', 'EUR', 'UTC');
    const uk = createFormatters('uk', 'UAH', 'America/New_York');
    assert.equal(en.decimal.formatToParts(1234.5).find((p) => p.type === 'decimal')?.value, '.');
    assert.equal(ru.decimal.formatToParts(1234.5).find((p) => p.type === 'decimal')?.value, ',');
    assert.equal(uk.money.resolvedOptions().currency, 'UAH');
    assert.equal(ru.money.resolvedOptions().currency, 'EUR');
    assert.equal(en.percent.formatToParts(0.215).find((p) => p.type === 'integer')?.value, '21');
    const instant = new Date('2026-01-01T00:30:00.000Z');
    const utc = en.date.formatToParts(instant);
    const newYork = uk.date.formatToParts(instant);
    assert.equal(utc.find((p) => p.type === 'year')?.value, '2026');
    assert.equal(newYork.find((p) => p.type === 'year')?.value, '2025');
    assert.equal(newYork.find((p) => p.type === 'day')?.value, '31');
});

test('saved locales are validated and removal preserves unrelated storage', () => {
    const entries = new Map([['shell-setting', 'keep']]);
    const storage = {
        getItem: (key) => entries.get(key) ?? null,
        setItem: (key, value) => entries.set(key, value),
        removeItem: (key) => entries.delete(key),
    };
    assert.deepEqual(readPreference(storage), { locale: 'en', state: 'default' });
    assert.equal(writePreference(storage, 'uk'), 'saved');
    assert.deepEqual(readPreference(storage), { locale: 'uk', state: 'saved' });
    entries.set(STORAGE_KEY, 'not-a-locale');
    assert.deepEqual(readPreference(storage), { locale: 'en', state: 'default' });
    assert.equal(removePreference(storage), 'default');
    assert.equal(entries.has(STORAGE_KEY), false);
    assert.equal(entries.get('shell-setting'), 'keep');
    for (const value of [null, 'en-US', 'toString', '__proto__', 1])
        assert.equal(isLocale(value), false);
});

test('blocked or unavailable storage safely falls back to session behavior', () => {
    const blocked = {
        getItem() {
            throw new Error('Blocked');
        },
        setItem() {
            throw new Error('Quota exceeded');
        },
        removeItem() {
            throw new Error('Blocked');
        },
    };
    for (const storage of [null, blocked]) {
        assert.deepEqual(readPreference(storage), { locale: 'en', state: 'unavailable' });
        assert.equal(writePreference(storage, 'ru'), 'unavailable');
        assert.equal(removePreference(storage), 'unavailable');
    }
});
