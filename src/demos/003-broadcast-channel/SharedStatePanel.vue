<template>
    <section class="state-panel" aria-label="Shared state">
        <h2>
            Shared state
        </h2>
        <p class="help">
            Changes are sent immediately to other connected tabs in this room.
        </p>
        <fieldset :disabled="!connected">
            <label :for="`${id}-language`">
                Preview language
            </label>
            <select
                :id="`${id}-language`"
                :value="state.language"
                @change="changeLanguage"
            >
                <option value="en">
                    English
                </option>
                <option value="uk">
                    Українська
                </option>
            </select>
            <label :for="`${id}-note`">
                Shared note
            </label>
            <textarea
                :id="`${id}-note`"
                :value="state.note"
                :maxlength="noteLimit"
                rows="4"
                @input="changeNote"
            ></textarea>
            <p class="characters">
                {{ state.note.length }} / {{ noteLimit }}
            </p>
        </fieldset>
        <div class="preview" :lang="state.language">
            <span class="eyebrow">
                {{ copy.label }}
            </span>
            <h3>
                {{ copy.title }}
            </h3>
            <p>
                {{ state.note || copy.empty }}
            </p>
        </div>
        <p class="help">
            The preview language is local to this experiment.
        </p>
    </section>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import { noteLimit } from './protocol';
import type { SharedState } from './protocol';

const props = defineProps<{ state: SharedState; connected: boolean }>();
const emit = defineEmits<{ update: [state: SharedState] }>();
const id = useId();
const messages = {
    en: { label: 'Preview', title: 'Shared note', empty: 'The note is empty.' },
    uk: { label: 'Перегляд', title: 'Спільна нотатка', empty: 'Нотатка порожня.' },
};
const copy = computed(() => messages[props.state.language]);

function changeLanguage(event: Event) {
    const language = (event.target as HTMLSelectElement).value;
    if (language === 'en' || language === 'uk') emit('update', { ...props.state, language });
}

function changeNote(event: Event) {
    emit('update', { ...props.state, note: (event.target as HTMLTextAreaElement).value });
}
</script>

<style scoped>
.state-panel {
    min-width: 0;
    padding: 28px;
}
h2 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
}
.help {
    color: var(--secondary);
    font-size: 12px;
    line-height: 1.8;
}
fieldset {
    margin: 24px 0;
    padding: 0;
    border: 0;
}
label {
    display: block;
    margin: 18px 0 8px;
    font-size: 12px;
}
select,
textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    background: var(--surface);
    font: inherit;
    font-size: 13px;
}
textarea {
    resize: vertical;
}
fieldset:disabled {
    opacity: 0.5;
}
.characters {
    margin: 4px 0 0;
    color: var(--muted);
    font-size: 10px;
    text-align: right;
}
.preview {
    padding: 22px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--canvas);
    overflow-wrap: anywhere;
}
.preview span {
    color: var(--accent);
}
h3 {
    margin: 10px 0;
    font-size: 18px;
    font-weight: 550;
}
.preview p {
    min-height: 40px;
    font-size: 13px;
    white-space: pre-wrap;
}
@container (max-width: 600px) {
    .state-panel {
        padding: 20px;
    }
}
</style>
