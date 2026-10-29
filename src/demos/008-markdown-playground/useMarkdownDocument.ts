import { onBeforeUnmount, ref } from 'vue';

export const MAX_FILE_BYTES = 256 * 1024;
export const MAX_SOURCE_LENGTH = 100_000;
export type ViewMode = 'source' | 'split' | 'preview';

export async function readMarkdownFile(file: File): Promise<string> {
    if (!/\.(md|markdown)$/i.test(file.name)) {
        throw new Error('Choose a .md or .markdown file.');
    }
    if (file.size > MAX_FILE_BYTES) throw new Error('The file exceeds the 256 KiB limit.');
    const content = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
    if (content.includes('\0')) throw new Error('The file contains null bytes; choose UTF-8 text.');
    if (content.length > MAX_SOURCE_LENGTH) {
        throw new Error('The document exceeds the 100,000 character limit.');
    }
    return content;
}

export function useMarkdownDocument(example: string) {
    const source = ref(example);
    const name = ref('example.md');
    const loading = ref(false);
    const error = ref('');
    const message = ref('');
    let request = 0;
    let disposed = false;

    function cancelImport() {
        request++;
        loading.value = false;
        error.value = '';
        message.value = '';
    }

    function updateSource(value: string) {
        const wasLoading = loading.value;
        cancelImport();
        source.value = value.slice(0, MAX_SOURCE_LENGTH);
        if (wasLoading) message.value = 'Import cancelled because the source was edited.';
    }

    async function loadFile(file: File) {
        cancelImport();
        const current = request;
        loading.value = true;
        try {
            const content = await readMarkdownFile(file);
            if (disposed || current !== request) return;
            source.value = content;
            name.value = file.name;
            message.value = `Loaded ${file.name}.`;
        } catch (reason) {
            if (disposed || current !== request) return;
            error.value =
                reason instanceof TypeError
                    ? 'The file could not be decoded as UTF-8 text.'
                    : reason instanceof Error
                      ? reason.message
                      : 'The file could not be read. Try another Markdown file.';
        } finally {
            if (!disposed && current === request) loading.value = false;
        }
    }

    function reset() {
        cancelImport();
        source.value = example;
        name.value = 'example.md';
        message.value = 'Example restored.';
    }

    function clear() {
        cancelImport();
        source.value = '';
        name.value = 'Untitled.md';
        message.value = 'Editor cleared.';
    }

    onBeforeUnmount(() => {
        disposed = true;
        request++;
    });

    return { source, name, loading, error, message, updateSource, loadFile, reset, clear };
}
