<template>
    <section :class="styles.panel" aria-label="Number examples">
        <h2 :class="styles.title">
            Number formatting
        </h2>
        <div :class="styles.fields">
            <label :for="amountId" :class="styles.field">
                Amount
                <input
                    :id="amountId"
                    :value="rawAmount"
                    :class="styles.input"
                    :aria-invalid="amount === null"
                    :aria-describedby="helpId"
                    type="number"
                    min="-1000000000"
                    max="1000000000"
                    step="any"
                    @input="rawAmount = ($event.target as HTMLInputElement).value"
                />
            </label>
            <label :for="currencyId" :class="styles.field">
                Currency
                <select
                    :id="currencyId"
                    v-model="currency"
                    :class="styles.input"
                >
                    <option
                        v-for="code in currencies"
                        :key="code"
                        :value="code"
                    >
                        {{ code }}
                    </option>
                </select>
            </label>
        </div>
        <label :for="ratioId" :class="styles.field">
            Ratio · 0.215 means 21.5%
            <input
                :id="ratioId"
                :value="rawRatio"
                :class="styles.input"
                :aria-invalid="ratio === null"
                :aria-describedby="helpId"
                type="number"
                min="0"
                max="1"
                step="any"
                @input="rawRatio = ($event.target as HTMLInputElement).value"
            />
        </label>
        <dl :class="styles.results">
            <div>
                <dt>
                    Decimal
                </dt>
                <dd :lang="locale">
                    {{ amount === null ? '—' : formatters.decimal.format(amount) }}
                </dd>
            </div>
            <div>
                <dt>
                    Currency · {{ currency }}
                </dt>
                <dd :lang="locale">
                    {{ amount === null ? '—' : formatters.money.format(amount) }}
                </dd>
            </div>
            <div>
                <dt>
                    Percent
                </dt>
                <dd :lang="locale">
                    {{ ratio === null ? '—' : formatters.percent.format(ratio) }}
                </dd>
            </div>
        </dl>
        <p :id="helpId" :class="styles.help">
            {{
                amount === null || ratio === null
                    ? 'Enter an amount between −1 billion and 1 billion, and a ratio from 0 to 1.'
                    : 'Currency changes formatting only; it does not convert the amount.'
            }}
        </p>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { createFormatters, currencies, parseNumber } from './i18n';
import type { Currency } from './i18n';
import type { Locale } from './catalogs';
import styles from './panels.module.css';

const props = defineProps<{ locale: Locale }>();
const rawAmount = ref('12345.678');
const rawRatio = ref('0.215');
const currency = ref<Currency>('USD');
const amountId = useId();
const ratioId = useId();
const currencyId = useId();
const helpId = useId();
const amount = computed(() => parseNumber(rawAmount.value, -1e9, 1e9));
const ratio = computed(() => parseNumber(rawRatio.value, 0, 1));
const formatters = computed(() => createFormatters(props.locale, currency.value, 'UTC'));
</script>
