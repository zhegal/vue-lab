import { catalogs, DEFAULT_LOCALE, locales, pluralForms } from './catalogs.ts';
import type { Locale } from './catalogs.ts';

export const currencies = ['USD', 'EUR', 'UAH'] as const;
export type Currency = (typeof currencies)[number];
export const timeZones = ['UTC', 'Europe/Kyiv', 'America/New_York'] as const;
export type TimeZone = (typeof timeZones)[number];

function interpolate(template: string, values: Readonly<Record<string, string | number>>) {
    return template.replace(/\{(\w+)\}/g, (token, key: string) =>
        Object.hasOwn(values, key) ? String(values[key]) : token,
    );
}

function lookup(locale: Locale, key: string) {
    const catalog: Readonly<Record<string, string>> = catalogs[locale];
    return Object.hasOwn(catalog, key) ? catalog[key] : undefined;
}

export function resolveMessage(
    locale: Locale,
    key: string,
    values: Readonly<Record<string, string | number>> = {},
) {
    let template = lookup(locale, key);
    let source: Locale | null = locale;
    if (template === undefined) {
        template = lookup(DEFAULT_LOCALE, key);
        source = template === undefined ? null : DEFAULT_LOCALE;
    }
    return {
        text: template === undefined ? key : interpolate(template, values),
        source,
        fallback: source !== null && source !== locale,
    };
}

export function formatPlural(locale: Locale, count: number) {
    if (!Number.isFinite(count) || count < 0)
        throw new RangeError('Count must be finite and >= 0.');
    const options = { maximumFractionDigits: 3 };
    const category = new Intl.PluralRules(locales[locale].tag, options).select(count);
    const forms = pluralForms[locale];
    const formattedCount = new Intl.NumberFormat(locales[locale].tag, options).format(count);
    return {
        category,
        text: interpolate(forms[category] ?? forms.other, { count: formattedCount }),
    };
}

export function createFormatters(locale: Locale, currency: Currency, timeZone: TimeZone) {
    const tag = locales[locale].tag;
    return {
        decimal: new Intl.NumberFormat(tag, { maximumFractionDigits: 3 }),
        money: new Intl.NumberFormat(tag, { style: 'currency', currency }),
        percent: new Intl.NumberFormat(tag, { style: 'percent', maximumFractionDigits: 1 }),
        date: new Intl.DateTimeFormat(tag, { timeZone, dateStyle: 'full' }),
        dateTime: new Intl.DateTimeFormat(tag, {
            timeZone,
            dateStyle: 'medium',
            timeStyle: 'short',
        }),
    };
}

export function parseNumber(value: string, min: number, max: number): number | null {
    const text = value.trim();
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
    const number = Number(text);
    if (!Number.isFinite(number) || number < min || number > max) return null;
    return Object.is(number, -0) ? 0 : number;
}

export function parseUtc(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || Number(value.slice(0, 4)) < 1)
        return null;
    const date = new Date(`${value}:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 16) === value
        ? date
        : null;
}
