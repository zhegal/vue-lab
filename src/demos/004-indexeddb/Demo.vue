<template>
    <div class="indexeddb-demo">
        <section class="storage-status" aria-label="Database connection">
            <div class="status-heading">
                <h2>
                    IndexedDB
                </h2>
                <span class="status-badge">
                    {{ busy ? 'Busy' : status }}
                </span>
            </div>
            <p role="status">
                {{ message }}
            </p>
            <p v-if="!supported" role="alert">
                IndexedDB is unavailable in this browser context.
            </p>
            <p
                v-if="error"
                class="error"
                role="alert"
            >
                {{ error }}
            </p>
            <button
                v-if="status !== 'ready' && supported"
                class="button secondary"
                type="button"
                :disabled="busy"
                @click="connect"
            >
                Reopen database
            </button>
        </section>
        <div class="storage-workspace">
            <NoteEditor
                class="editor"
                :editing="editing"
                :ready="ready"
                :reset="editorReset"
                @save="saveDraft"
                @cancel="cancelEdit"
            />
            <NotesList
                class="list"
                :notes="notes"
                :ready="ready"
                @reload="reloadNotes"
                @edit="editing = { ...$event }"
                @remove="removeNote"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NoteEditor from './NoteEditor.vue';
import NotesList from './NotesList.vue';
import { useNotesDatabase } from './useNotesDatabase';
import type { NoteRecord } from './database';

const { supported, status, notes, busy, ready, error, message, connect, reload, save, remove } =
    useNotesDatabase();
const editing = ref<NoteRecord | null>(null);
const editorReset = ref(0);

function cancelEdit() {
    editing.value = null;
    editorReset.value++;
}

async function saveDraft(text: string) {
    if (await save(text, editing.value?.id)) cancelEdit();
}

async function removeNote(id: number) {
    if ((await remove(id)) && editing.value?.id === id) cancelEdit();
}

async function reloadNotes() {
    if (await reload()) cancelEdit();
}
</script>

<style scoped>
.indexeddb-demo {
    color: var(--text);
    background: var(--surface);
}
.storage-status {
    padding: 28px;
    border-bottom: 1px solid var(--border);
}
.status-heading {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
}
h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}
.status-badge {
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--accent);
    font-size: 11px;
    text-transform: capitalize;
}
.storage-status p {
    margin: 12px 0 0;
    color: var(--secondary);
    font-size: 12px;
    line-height: 1.8;
}
.storage-status .error {
    padding: 12px;
    border: 1px solid var(--border);
    overflow-wrap: anywhere;
}
.storage-status button {
    margin-top: 16px;
}
button:disabled {
    opacity: 0.5;
    cursor: default;
}
.storage-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 330px;
}
.list {
    grid-column: 1;
    grid-row: 1;
}
.editor {
    grid-column: 2;
    grid-row: 1;
}
@container (max-width: 800px) {
    .storage-workspace {
        grid-template-columns: minmax(0, 1fr);
    }
    .editor,
    .list {
        grid-column: auto;
        grid-row: auto;
    }
}
@container (max-width: 600px) {
    .storage-status {
        padding: 20px;
    }
}
</style>
