<template>
    <div
        class="form-demo"
        @focusin="onFocusIn"
        @focusout="onFocusOut"
    >
        <div class="form-layout">
            <form
                class="demo-form"
                aria-label="Contact demo form"
                autocomplete="off"
                novalidate
                @submit.prevent="submit"
                @reset.prevent="reset"
            >
                <h2>
                    Local contact form
                </h2>
                <p class="help">
                    All visible fields are required. Errors appear after blur or validation. Nothing
                    is sent or saved. Focus moves only after an explicit action.
                </p>
                <ErrorSummary
                    v-if="submitted && errorEntries.length"
                    :errors="errorEntries"
                    @focus="focus"
                />
                <ContactFields
                    :values="values"
                    :errors="errors"
                    :visible="visible"
                    :include-project="includeProject"
                    :focus-request="focusRequest"
                    @update="update"
                    @touch="touch"
                    @toggle="toggleProject"
                />
                <div class="form-actions">
                    <button class="button primary" type="submit">
                        Validate form
                    </button>
                    <button
                        class="button secondary"
                        type="button"
                        @click="fillExample"
                    >
                        Fill example
                    </button>
                    <button class="button secondary" type="reset">
                        Reset
                    </button>
                </div>
                <p class="status" role="status">
                    {{ status }}
                </p>
            </form>
            <FormInspector
                :states="states"
                :focused="focused"
                :attempts="attempts"
                :result="result"
                :result-focus="focusRequest.target === 'result' ? focusRequest.id : 0"
            />
        </div>
        <p class="footnote">
            v-field connects validation to native validity and ARIA descriptions. v-focus applies
            explicit focus requests after Vue updates the DOM. Tab keeps its normal behavior.
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ContactFields from './ContactFields.vue';
import ErrorSummary from './ErrorSummary.vue';
import FormInspector from './FormInspector.vue';
import { useDemoForm } from './useDemoForm';
import { labels } from './validation';
import type { FieldName } from './validation';

const {
    values,
    includeProject,
    errors,
    errorEntries,
    visible,
    states,
    submitted,
    attempts,
    result,
    focusRequest,
    status,
    update,
    touch,
    toggleProject,
    submit,
    reset,
    fillExample,
    focus,
} = useDemoForm();
const focused = ref('Outside demo');

function onFocusIn(event: FocusEvent) {
    if (!(event.target instanceof HTMLElement)) return;
    const field = event.target.dataset.field;
    focused.value =
        field && Object.hasOwn(labels, field)
            ? labels[field as FieldName]
            : (event.target.dataset.focusLabel ?? 'Form action');
}

function onFocusOut(event: FocusEvent) {
    const root = event.currentTarget as HTMLElement;
    if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) {
        focused.value = 'Outside demo';
    }
}
</script>

<style scoped>
.form-demo {
    color: var(--text);
    background: var(--surface);
}
.form-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 330px;
}
.demo-form {
    min-width: 0;
    padding: 26px;
}
h2 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 600;
}
.help,
.footnote {
    margin: 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
.form-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 24px;
}
.status {
    margin: 16px 0 0;
    color: var(--secondary);
    font-size: 12px;
    line-height: 1.8;
}
.footnote {
    padding: 18px 26px;
    border-top: 1px solid var(--border);
}
@container (max-width: 900px) {
    .form-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
@container (max-width: 600px) {
    .demo-form {
        padding: 20px;
    }
}
</style>
