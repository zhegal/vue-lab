import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { deleteNote, openDatabase, readNotes, saveNote } from './database';
import type { NoteRecord } from './database';

type ConnectionStatus = 'opening' | 'blocked' | 'ready' | 'closed' | 'unavailable' | 'error';

export function useNotesDatabase() {
    const supported = typeof indexedDB !== 'undefined';
    const status = ref<ConnectionStatus>(supported ? 'closed' : 'unavailable');
    const notes = ref<NoteRecord[]>([]);
    const busy = ref(false);
    const error = ref('');
    const message = ref('Open the database to read saved notes.');
    let database: IDBDatabase | undefined;
    let generation = 0;
    let disposed = false;

    function describeError(cause: unknown): string {
        return cause instanceof Error
            ? `${cause.name}: ${cause.message}`
            : 'Storage operation failed.';
    }

    async function connect() {
        if (!supported || busy.value) return;
        const active = ++generation;
        database?.close();
        database = undefined;
        status.value = 'opening';
        busy.value = true;
        error.value = '';
        message.value = 'Opening the database…';

        try {
            const opened = await openDatabase(() => {
                if (disposed || active !== generation) return;
                status.value = 'blocked';
                message.value = 'Opening is blocked. Close older tabs using this database.';
            });
            // An IndexedDB open request cannot be cancelled. Close a late result after unmount.
            if (disposed || active !== generation) {
                opened.close();
                return;
            }
            database = opened;
            const invalidate = (reason: string) => {
                if (disposed || active !== generation) return;
                generation++;
                opened.close();
                database = undefined;
                busy.value = false;
                status.value = 'closed';
                message.value = reason;
            };
            opened.onversionchange = () =>
                invalidate(
                    'Connection closed for a version change in another tab. Reopen to continue.',
                );
            opened.onclose = () => invalidate('Storage closed unexpectedly. Reopen to try again.');
            const loaded = await readNotes(opened);
            if (disposed || active !== generation) return;
            notes.value = loaded;
            status.value = 'ready';
            message.value = 'Database ready. Saved notes survive a page reload.';
        } catch (cause) {
            if (disposed || active !== generation) return;
            database?.close();
            database = undefined;
            status.value = 'error';
            error.value = describeError(cause);
            message.value = 'The database could not be opened. Reopen to try again.';
        } finally {
            if (!disposed && active === generation) busy.value = false;
        }
    }

    async function run(
        operation: (connection: IDBDatabase) => Promise<NoteRecord[]>,
        success: string,
    ): Promise<boolean> {
        if (!database || status.value !== 'ready' || busy.value) return false;
        const active = generation;
        busy.value = true;
        error.value = '';
        message.value = 'Transaction in progress…';
        try {
            const loaded = await operation(database);
            if (disposed || active !== generation) return false;
            notes.value = loaded;
            message.value = success;
            return true;
        } catch (cause) {
            if (!disposed && active === generation) {
                error.value = describeError(cause);
                message.value =
                    'The operation did not finish. Reload from storage to check its state.';
            }
            return false;
        } finally {
            if (!disposed && active === generation) busy.value = false;
        }
    }

    const reload = () => run(readNotes, 'Notes reloaded from storage.');
    const save = (text: string, id?: number) =>
        run(
            async (connection) => {
                await saveNote(connection, text, id);
                return readNotes(connection);
            },
            id === undefined
                ? 'Note added. Transaction committed.'
                : 'Note updated. Transaction committed.',
        );
    const remove = (id: number) =>
        run(async (connection) => {
            await deleteNote(connection, id);
            return readNotes(connection);
        }, 'Note deleted. Transaction committed.');

    onMounted(connect);
    onBeforeUnmount(() => {
        disposed = true;
        generation++;
        database?.close();
    });

    return {
        supported,
        status,
        notes,
        busy,
        error,
        message,
        connect,
        reload,
        save,
        remove,
        ready: computed(() => status.value === 'ready' && !busy.value),
    };
}
