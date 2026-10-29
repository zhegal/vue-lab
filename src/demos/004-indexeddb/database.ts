export const databaseName = 'vue-lab-004-indexeddb';
export const databaseVersion = 1;
export const storeName = 'notes';
export const textLimit = 300;

export interface NoteRecord {
    id: number;
    text: string;
    updatedAt: number;
}

export function openDatabase(onBlocked: () => void): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, databaseVersion);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(storeName)) {
                request.result.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onblocked = onBlocked;
        request.onerror = () => reject(request.error ?? new Error('The database could not open.'));
        request.onsuccess = () => resolve(request.result);
    });
}

function storeRequest<T>(
    database: IDBDatabase,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const request = operation(transaction.objectStore(storeName));
        let result: T;
        request.onsuccess = () => {
            result = request.result;
        };
        // A successful request can still be rolled back; expose results only after commit.
        transaction.oncomplete = () => resolve(result);
        transaction.onabort = () =>
            reject(transaction.error ?? new Error('The transaction was aborted.'));
    });
}

export async function readNotes(database: IDBDatabase): Promise<NoteRecord[]> {
    const records = await storeRequest<NoteRecord[]>(database, 'readonly', (store) =>
        store.getAll(),
    );
    return records.sort((a, b) => b.updatedAt - a.updatedAt || b.id - a.id);
}

export function saveNote(database: IDBDatabase, text: string, id?: number): Promise<IDBValidKey> {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > textLimit) {
        return Promise.reject(new Error(`Enter a note between 1 and ${textLimit} characters.`));
    }
    const value = { text: trimmed, updatedAt: Date.now() };
    return storeRequest(database, 'readwrite', (store) =>
        id === undefined ? store.add(value) : store.put({ ...value, id }),
    );
}

export function deleteNote(database: IDBDatabase, id: number): Promise<undefined> {
    return storeRequest(database, 'readwrite', (store) => store.delete(id));
}
