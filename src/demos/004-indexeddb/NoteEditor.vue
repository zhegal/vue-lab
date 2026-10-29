<template>
    <section class="note-editor" aria-label="Note editor">
        <h2>
            {{ editing ? `Edit note #${editing.id}` : 'Add a note' }}
        </h2>
        <p class="help">
            Notes are stored in this browser. Reload the page to check persistence.
        </p>
        <form @submit.prevent="submit">
            <fieldset :disabled="!ready">
                <label :for="inputId">
                    Note text
                </label>
                <textarea
                    :id="inputId"
                    v-model="text"
                    :maxlength="textLimit"
                    required
                    rows="5"
                ></textarea>
                <p class="characters">
                    {{ text.length }} / {{ textLimit }}
                </p>
                <div class="editor-actions">
                    <button
                        class="button primary"
                        type="submit"
                        :disabled="!text.trim()"
                    >
                        {{ editing ? 'Save changes' : 'Add note' }}
                    </button>
                    <button
                        v-if="editing"
                        class="button secondary"
                        type="button"
                        @click="$emit('cancel')"
                    >
                        Cancel edit
                    </button>
                </div>
            </fieldset>
        </form>
        <dl class="schema">
            <div>
                <dt>
                    Database
                </dt>
                <dd>
                    {{ databaseName }}
                </dd>
            </div>
            <div>
                <dt>
                    Version / store
                </dt>
                <dd>
                    {{ databaseVersion }} / {{ storeName }}
                </dd>
            </div>
            <div>
                <dt>
                    Key
                </dt>
                <dd>
                    id · auto increment
                </dd>
            </div>
            <div>
                <dt>
                    Fields
                </dt>
                <dd>
                    text, updatedAt
                </dd>
            </div>
        </dl>
    </section>
</template>

<script setup lang="ts">
import { ref, useId, watch } from 'vue';
import { databaseName, databaseVersion, storeName, textLimit } from './database';
import type { NoteRecord } from './database';

const props = defineProps<{ editing: NoteRecord | null; ready: boolean; reset: number }>();
const emit = defineEmits<{ save: [text: string]; cancel: [] }>();
const text = ref('');
const inputId = useId();

watch(
    [() => props.editing, () => props.reset],
    () => {
        text.value = props.editing?.text ?? '';
    },
    { immediate: true },
);

function submit() {
    if (props.ready && text.value.trim()) emit('save', text.value);
}
</script>

<style scoped>
.note-editor {
    min-width: 0;
    padding: 28px;
    border-left: 1px solid var(--border);
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
    padding: 0;
    margin: 24px 0;
    border: 0;
}
fieldset:disabled {
    opacity: 0.5;
}
label {
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
}
textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    background: var(--surface);
    font: inherit;
    font-size: 13px;
    resize: vertical;
}
.characters {
    margin: 4px 0 14px;
    color: var(--muted);
    font-size: 10px;
    text-align: right;
}
.editor-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
button:disabled {
    opacity: 0.5;
    cursor: default;
}
.schema {
    display: grid;
    gap: 14px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
}
.schema div {
    display: grid;
    gap: 5px;
}
dt {
    color: var(--muted);
    font-size: 11px;
}
dd {
    margin: 0;
    font-family: monospace;
    font-size: 11px;
    overflow-wrap: anywhere;
}
@container (max-width: 800px) {
    .note-editor {
        border-left: 0;
        border-bottom: 1px solid var(--border);
    }
}
@container (max-width: 600px) {
    .note-editor {
        padding: 20px;
    }
}
</style>
