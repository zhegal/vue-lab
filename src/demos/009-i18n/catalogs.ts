export const locales = {
    en: { label: 'English', tag: 'en-US' },
    ru: { label: 'Русский', tag: 'ru-RU' },
    uk: { label: 'Українська', tag: 'uk-UA' },
} as const;
export type Locale = keyof typeof locales;
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && Object.hasOwn(locales, value);
}

const english = {
    'order.title': 'Order summary',
    greeting: 'Hello, {name}!',
    'order.delivery': 'Delivery is available in selected regions.',
};
export type MessageKey = keyof typeof english;

export const catalogs = {
    en: english,
    ru: {
        'order.title': 'Сводка заказа',
        greeting: 'Привет, {name}!',
    },
    uk: {
        'order.title': 'Підсумок замовлення',
        greeting: 'Вітаємо, {name}!',
    },
} satisfies Record<Locale, Partial<Record<MessageKey, string>>>;

type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
export const pluralForms: Record<Locale, PluralForms> = {
    en: { one: '{count} item', other: '{count} items' },
    ru: {
        one: '{count} товар',
        few: '{count} товара',
        many: '{count} товаров',
        other: '{count} товара',
    },
    uk: {
        one: '{count} товар',
        few: '{count} товари',
        many: '{count} товарів',
        other: '{count} товару',
    },
};
