import { ref } from 'vue';
import { DEFAULT_LOCALE, isLocale } from './catalogs.ts';
import type { Locale } from './catalogs.ts';

export const STORAGE_KEY = 'vue-lab:009-i18n:locale';
export type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type StorageState = 'default' | 'saved' | 'unavailable';

export function readPreference(storage: PreferenceStorage | null): {
    locale: Locale;
    state: StorageState;
} {
    try {
        if (!storage) throw new Error('Storage unavailable.');
        const value = storage.getItem(STORAGE_KEY);
        return isLocale(value)
            ? { locale: value, state: 'saved' }
            : { locale: DEFAULT_LOCALE, state: 'default' };
    } catch {
        return { locale: DEFAULT_LOCALE, state: 'unavailable' };
    }
}

export function writePreference(storage: PreferenceStorage | null, locale: Locale): StorageState {
    try {
        if (!storage) return 'unavailable';
        storage.setItem(STORAGE_KEY, locale);
        return 'saved';
    } catch {
        return 'unavailable';
    }
}

export function removePreference(storage: PreferenceStorage | null): StorageState {
    try {
        if (!storage) return 'unavailable';
        storage.removeItem(STORAGE_KEY);
        return 'default';
    } catch {
        return 'unavailable';
    }
}

export function useLocalePreference() {
    let storage: PreferenceStorage | null = null;
    try {
        storage = window.localStorage;
    } catch {
        // Locale switching remains available when the browser blocks storage access.
    }
    const preference = readPreference(storage);
    const locale = ref(preference.locale);
    const storageState = ref(preference.state);

    function selectLocale(value: Locale) {
        locale.value = value;
        storageState.value = writePreference(storage, value);
    }

    function forgetLocale() {
        locale.value = DEFAULT_LOCALE;
        storageState.value = removePreference(storage);
    }

    return { locale, storageState, selectLocale, forgetLocale };
}
