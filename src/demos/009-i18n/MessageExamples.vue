<template>
    <section :class="styles.panel" aria-label="Message examples">
        <h2 :class="styles.title">
            Messages and fallback
        </h2>
        <label :for="nameId" :class="styles.field">
            Name
            <input
                :id="nameId"
                v-model="name"
                :class="styles.input"
                maxlength="60"
            />
        </label>
        <div :class="styles.output" :lang="locale">
            <p>
                {{ title.text }}
            </p>
            <p>
                {{ greeting.text }}
            </p>
        </div>
        <label :for="keyId" :class="styles.field">
            Message key
            <select
                :id="keyId"
                v-model="key"
                :class="styles.input"
            >
                <option value="order.title">
                    order.title · translated
                </option>
                <option value="order.delivery">
                    order.delivery · English only
                </option>
                <option value="order.missing">
                    order.missing · absent everywhere
                </option>
            </select>
        </label>
        <p :class="styles.output" :lang="message.source ?? 'en'">
            {{ message.text }}
        </p>
        <p :class="styles.help">
            Resolution:
            <code :class="styles.code">
                {{ resolution }}
            </code>
            ·
            {{
                message.source
                    ? message.fallback
                        ? 'English fallback'
                        : 'Selected catalog'
                    : 'No translation; key shown'
            }}
        </p>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { resolveMessage } from './i18n';
import type { Locale } from './catalogs';
import styles from './panels.module.css';

const props = defineProps<{ locale: Locale }>();
const name = ref('Alex');
const key = ref('order.delivery');
const nameId = useId();
const keyId = useId();
const title = computed(() => resolveMessage(props.locale, 'order.title'));
const greeting = computed(() =>
    resolveMessage(props.locale, 'greeting', { name: name.value || '…' }),
);
const message = computed(() => resolveMessage(props.locale, key.value));
const resolution = computed(() => {
    if (message.value.source === props.locale) return props.locale;
    const path = props.locale === 'en' ? 'en' : `${props.locale} → en`;
    return message.value.source ? path : `${path} → key`;
});
</script>
