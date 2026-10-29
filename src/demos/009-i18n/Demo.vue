<template>
    <div class="i18n-demo" lang="en">
        <div class="locale-toolbar">
            <label :for="localeId" class="locale-field">
                Preview language
                <select
                    :id="localeId"
                    :value="locale"
                    @change="onLocaleChange"
                >
                    <option
                        v-for="(option, code) in locales"
                        :key="code"
                        :value="code"
                        :lang="code"
                    >
                        {{ option.label }} · {{ option.tag }}
                    </option>
                </select>
            </label>
            <button
                class="button secondary"
                type="button"
                @click="forgetLocale"
            >
                Forget saved language
            </button>
            <p class="storage-status" role="status">
                {{
                    storageState === 'saved'
                        ? 'Language saved for the next visit.'
                        : storageState === 'unavailable'
                            ? 'Storage unavailable; using this session only.'
                            : 'Default language · English. Select a language to save it.'
                }}
            </p>
        </div>
        <div class="examples">
            <MessageExamples :locale="locale" />
            <PluralExamples :locale="locale" />
            <NumberExamples :locale="locale" />
            <DateExamples :locale="locale" />
        </div>
        <p class="footnote">
            Controls stay in English. Example text and values follow the selected locale. Missing
            messages resolve through English, then the key. Only this demo's language is saved.
        </p>
    </div>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import { isLocale, locales } from './catalogs';
import { useLocalePreference } from './useLocalePreference';
import MessageExamples from './MessageExamples.vue';
import PluralExamples from './PluralExamples.vue';
import NumberExamples from './NumberExamples.vue';
import DateExamples from './DateExamples.vue';

const localeId = useId();
const { locale, storageState, selectLocale, forgetLocale } = useLocalePreference();

function onLocaleChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (isLocale(value)) selectLocale(value);
}
</script>

<style scoped>
.i18n-demo {
    color: var(--text);
    background: var(--surface);
}
.locale-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 22px 24px;
    border-bottom: 1px solid var(--border);
}
.locale-field {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 12px;
}
select {
    max-width: 100%;
    padding: 9px 10px;
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text);
    background: var(--surface);
    font-size: 12px;
}
.storage-status {
    flex-basis: 100%;
    margin: 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
.examples {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    padding: 24px;
}
.footnote {
    margin: 0;
    padding: 18px 24px;
    border-top: 1px solid var(--border);
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
@container (max-width: 800px) {
    .examples {
        grid-template-columns: minmax(0, 1fr);
    }
}
@container (max-width: 600px) {
    .locale-toolbar,
    .examples {
        padding: 16px;
    }
}
</style>
