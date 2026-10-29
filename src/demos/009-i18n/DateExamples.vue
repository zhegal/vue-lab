<template>
    <section :class="styles.panel" aria-label="Date examples">
        <h2 :class="styles.title">
            Date and time formatting
        </h2>
        <label :for="instantId" :class="styles.field">
            UTC date and time
            <input
                :id="instantId"
                v-model="rawInstant"
                :class="styles.input"
                :aria-invalid="instant === null"
                :aria-describedby="helpId"
                type="datetime-local"
                step="60"
                min="0001-01-01T00:00"
                max="9999-12-31T23:59"
            />
        </label>
        <label :for="zoneId" :class="styles.field">
            Display time zone
            <select
                :id="zoneId"
                v-model="timeZone"
                :class="styles.input"
            >
                <option
                    v-for="zone in timeZones"
                    :key="zone"
                    :value="zone"
                >
                    {{ zone }}
                </option>
            </select>
        </label>
        <dl :class="styles.results">
            <div>
                <dt>
                    Date · {{ timeZone }}
                </dt>
                <dd :lang="locale">
                    {{ instant ? formatters.date.format(instant) : '—' }}
                </dd>
            </div>
            <div>
                <dt>
                    Date and time · {{ timeZone }}
                </dt>
                <dd :lang="locale">
                    {{ instant ? formatters.dateTime.format(instant) : '—' }}
                </dd>
            </div>
            <div>
                <dt>
                    Same instant · ISO 8601
                </dt>
                <dd :class="styles.code">
                    {{ instant?.toISOString() ?? '—' }}
                </dd>
            </div>
        </dl>
        <p :id="helpId" :class="styles.help">
            {{
                instant
                    ? 'Input is interpreted as UTC, independently of the device time zone.'
                    : 'Enter a valid UTC date and time, including hours and minutes.'
            }}
            Change the display zone to compare the same instant.
        </p>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { createFormatters, parseUtc, timeZones } from './i18n';
import type { TimeZone } from './i18n';
import type { Locale } from './catalogs';
import styles from './panels.module.css';

const props = defineProps<{ locale: Locale }>();
const rawInstant = ref('2026-10-29T12:30');
const timeZone = ref<TimeZone>('UTC');
const instantId = useId();
const zoneId = useId();
const helpId = useId();
const instant = computed(() => parseUtc(rawInstant.value));
const formatters = computed(() => createFormatters(props.locale, 'USD', timeZone.value));
</script>
