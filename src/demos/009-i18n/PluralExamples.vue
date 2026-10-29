<template>
    <section :class="styles.panel" aria-label="Plural examples">
        <h2 :class="styles.title">
            Cardinal plural forms
        </h2>
        <label :for="countId" :class="styles.field">
            Quantity
            <input
                :id="countId"
                :value="rawCount"
                :class="styles.input"
                :aria-invalid="count === null"
                :aria-describedby="helpId"
                type="number"
                min="0"
                max="10000"
                step="any"
                @input="rawCount = ($event.target as HTMLInputElement).value"
            />
        </label>
        <div
            :class="styles.samples"
            role="group"
            aria-label="Sample quantities"
        >
            <button
                v-for="sample in samples"
                :key="sample"
                class="button secondary"
                type="button"
                @click="rawCount = String(sample)"
            >
                {{ sample }}
            </button>
        </div>
        <p :class="styles.output" :lang="locale">
            {{ plural?.text ?? '—' }}
        </p>
        <p :class="styles.help">
            Selected category:
            <code :class="styles.code">
                {{ plural?.category ?? '—' }}
            </code>
        </p>
        <p :id="helpId" :class="styles.help">
            {{
                count === null
                    ? 'Enter a quantity from 0 to 10,000.'
                    : 'Try 1, 2, 5, 11, 21 and 1.5. The language controls the rule and the wording.'
            }}
            Counts and plural rules use the same rounding, up to three decimal places.
        </p>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { formatPlural, parseNumber } from './i18n';
import type { Locale } from './catalogs';
import styles from './panels.module.css';

const props = defineProps<{ locale: Locale }>();
const rawCount = ref('21');
const samples = [0, 1, 2, 5, 11, 21, 1.5];
const countId = useId();
const helpId = useId();
const count = computed(() => parseNumber(rawCount.value, 0, 10000));
const plural = computed(() =>
    count.value === null ? null : formatPlural(props.locale, count.value),
);
</script>
