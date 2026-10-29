<template>
    <section class="notes-list" aria-label="Stored notes">
        <div class="list-heading">
            <h2>
                Stored notes
                <span>
                    {{ notes.length }}
                </span>
            </h2>
            <button
                class="button secondary"
                type="button"
                :disabled="!ready"
                @click="$emit('reload')"
            >
                Reload from storage
            </button>
        </div>
        <p class="help">
            Newest updates first. Other tabs' changes appear when you reload from storage.
        </p>
        <ul v-if="notes.length">
            <li v-for="note in notes" :key="note.id">
                <div class="note-meta">
                    <code>
                        #{{ note.id }}
                    </code>
                    <time :datetime="new Date(note.updatedAt).toISOString()">
                        {{ new Date(note.updatedAt).toLocaleString() }}
                    </time>
                </div>
                <p>
                    {{ note.text }}
                </p>
                <div class="note-actions">
                    <button
                        class="button secondary"
                        type="button"
                        :disabled="!ready"
                        :aria-label="`Edit note ${note.id}`"
                        @click="$emit('edit', note)"
                    >
                        Edit
                    </button>
                    <button
                        class="button secondary"
                        type="button"
                        :disabled="!ready"
                        :aria-label="`Delete note ${note.id}`"
                        @click="$emit('remove', note.id)"
                    >
                        Delete
                    </button>
                </div>
            </li>
        </ul>
        <div v-else class="no-notes">
            <p>
                {{ ready ? 'No saved notes.' : 'Waiting for storage.' }}
            </p>
            <p class="help">
                Add a note using the editor.
            </p>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { NoteRecord } from './database';

defineProps<{ notes: NoteRecord[]; ready: boolean }>();
defineEmits<{ reload: []; edit: [note: NoteRecord]; remove: [id: number] }>();
</script>

<style scoped>
.notes-list {
    min-width: 0;
    padding: 28px;
}
.list-heading {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
}
h2 {
    margin: 0;
    align-self: center;
    font-size: 16px;
    font-weight: 600;
}
h2 span {
    margin-left: 6px;
    color: var(--muted);
    font-size: 12px;
}
.help {
    margin: 12px 0 20px;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 12px;
}
li {
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--canvas);
}
.note-meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: var(--muted);
}
code,
time {
    font-size: 10px;
}
li p {
    margin: 16px 0;
    font-size: 13px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}
.note-actions {
    display: flex;
    gap: 8px;
}
button:disabled {
    opacity: 0.5;
    cursor: default;
}
.no-notes {
    padding: 48px 16px;
    text-align: center;
    color: var(--secondary);
    font-size: 13px;
}
@container (max-width: 600px) {
    .notes-list {
        padding: 20px;
    }
}
</style>
