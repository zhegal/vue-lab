<template>
    <Teleport to="body" :disabled="!teleport">
        <dialog
            ref="dialog"
            class="native-dialog"
            :class="{ 'in-place': !teleport }"
            :aria-labelledby="`${id}-title`"
            :aria-describedby="`${id}-description`"
            @cancel="onCancel"
            @close="onClose"
            @focusin.stop="onFocus"
            @pointerdown="onPointerDown"
            @pointerup="onPointerUp"
            @pointercancel="backdropPointer = null"
        >
            <p class="eyebrow">
                {{ mode === 'modal' ? 'showModal()' : 'show()' }}
            </p>
            <h2
                :id="`${id}-title`"
                ref="heading"
                tabindex="-1"
                data-focus-name="Dialog heading"
            >
                Native dialog
            </h2>
            <p :id="`${id}-description`" class="description">
                {{
                    mode === 'modal'
                        ? 'The rest of this page is inert.'
                        : 'The rest of this page remains interactive.'
                }}
                Use Tab and Shift+Tab to compare focus behavior.
            </p>
            <form method="dialog" @submit="onSubmit">
                <label :for="`${id}-note`">
                    Dialog note
                </label>
                <input
                    :id="`${id}-note`"
                    ref="input"
                    v-model="note"
                    maxlength="80"
                    autocomplete="off"
                    data-focus-name="Dialog note"
                />
                <p class="form-help">
                    The form closes the dialog without a network request.
                </p>
                <div class="dialog-actions">
                    <button
                        ref="closeButton"
                        class="button secondary"
                        type="button"
                        data-focus-name="Close button"
                        @click="close('button')"
                    >
                        Close with close()
                    </button>
                    <button
                        class="button primary"
                        type="submit"
                        value="confirmed"
                        data-focus-name="Confirm button"
                    >
                        Confirm with form
                    </button>
                </div>
            </form>
        </dialog>
    </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import type { DialogMode, DialogRecord, DialogResult, FocusTarget } from './types';
import { lockDocumentScroll } from './scrollLock';

const props = defineProps<{
    teleport: boolean;
    initialFocus: FocusTarget;
    preventCancel: boolean;
    closeOnBackdrop: boolean;
    lockScroll: boolean;
}>();
const emit = defineEmits<{
    opened: [mode: DialogMode];
    closed: [result: DialogResult];
    record: [event: DialogRecord];
    focused: [label: string];
    placement: [parent: string];
    error: [message: string];
    scrollLock: [locked: boolean];
}>();
const dialog = ref<HTMLDialogElement | null>(null);
const heading = ref<HTMLHeadingElement | null>(null);
const input = ref<HTMLInputElement | null>(null);
const closeButton = ref<HTMLButtonElement | null>(null);
const mode = ref<DialogMode>('non-modal');
const note = ref('');
const id = useId();
let opener: HTMLElement | null = null;
let reason = '';
let disposed = false;
let opening = false;
let backdropPointer: number | null = null;
let releaseScroll: (() => void) | null = null;

function unlockScroll() {
    releaseScroll?.();
    releaseScroll = null;
    if (!disposed) emit('scrollLock', false);
}

function record(name: string, detail: string) {
    if (!disposed) emit('record', { name, detail });
}

function reportPlacement() {
    const parent = dialog.value?.parentElement;
    emit('placement', parent === document.body ? 'document.body' : '.dialog-host');
}

async function show(nextMode: DialogMode, trigger: HTMLElement) {
    const element = dialog.value;
    if (!element || element.open || opening) return;
    opening = true;
    opener = trigger;
    mode.value = nextMode;
    reason = '';
    backdropPointer = null;
    element.returnValue = '';
    try {
        await nextTick();
        if (disposed || !element.isConnected) return;
        record(nextMode === 'modal' ? 'showModal()' : 'show()', 'Opening the native dialog.');
        if (nextMode === 'modal') element.showModal();
        else element.show();
        if (nextMode === 'modal' && props.lockScroll) {
            releaseScroll = lockDocumentScroll(document);
            emit('scrollLock', true);
            record('scroll lock', 'Document scrolling is temporarily disabled.');
        }
        emit('opened', nextMode);
        const target =
            props.initialFocus === 'heading'
                ? heading.value
                : props.initialFocus === 'close'
                  ? closeButton.value
                  : input.value;
        target?.focus({ preventScroll: true });
        reportPlacement();
    } catch {
        emit('error', 'The dialog could not open. Close any existing dialog and try again.');
    } finally {
        opening = false;
    }
}

function close(value: string) {
    if (!dialog.value?.open) return;
    reason =
        value === 'page' ? 'page button' : value === 'backdrop' ? 'backdrop' : 'close() button';
    record('close()', `Requested with returnValue ${JSON.stringify(value)}.`);
    dialog.value.close(value);
}

function onCancel(event: Event) {
    if (props.preventCancel) {
        event.preventDefault();
        record('cancel', 'Prevented: the dialog stays open.');
    } else {
        reason = 'native cancel request';
        record('cancel', 'Allowed: the browser will close the modal.');
    }
}

function onSubmit(event: SubmitEvent) {
    reason = 'method="dialog" form';
    const button = event.submitter as HTMLButtonElement | null;
    record('submit', `Native dialog form · value ${JSON.stringify(button?.value ?? '')}.`);
}

async function onClose() {
    const element = dialog.value;
    if (disposed || !element || element.open) return;
    backdropPointer = null;
    unlockScroll();
    record('close', `returnValue = ${JSON.stringify(element.returnValue)}.`);
    emit('closed', {
        value: element.returnValue,
        note: note.value,
        reason: reason || 'native close',
    });
    // The parent re-enables its opener after close; wait for that DOM update before focusing it.
    await nextTick();
    if (!disposed && !element.open && opener?.isConnected) {
        opener.focus({ preventScroll: true });
        record('restore focus', 'Returned focus to the opening button.');
    }
}

function onFocus(event: FocusEvent) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const label = target.dataset.focusName ?? target.tagName.toLowerCase();
    emit('focused', label);
    record('focus', label);
}

function isOutside(event: PointerEvent): boolean {
    const element = dialog.value;
    if (!element || event.target !== element) return false;
    const rect = element.getBoundingClientRect();
    return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
    );
}

function onPointerDown(event: PointerEvent) {
    backdropPointer = event.button === 0 && isOutside(event) ? event.pointerId : null;
}

function onPointerUp(event: PointerEvent) {
    const startedOutside = backdropPointer === event.pointerId;
    backdropPointer = null;
    if (mode.value !== 'modal' || !props.closeOnBackdrop || !startedOutside || !isOutside(event)) {
        return;
    }
    record('backdrop', 'Pointer pressed and released outside the dialog.');
    close('backdrop');
}

onMounted(reportPlacement);
watch(() => props.teleport, reportPlacement, { flush: 'post' });
onBeforeUnmount(() => {
    disposed = true;
    opener = null;
    unlockScroll();
    if (dialog.value?.open) dialog.value.close();
});

defineExpose({ show, close });
</script>

<style scoped>
.native-dialog {
    position: fixed;
    inset: 0;
    width: min(420px, calc(100% - 32px));
    max-height: calc(100dvh - 32px);
    margin: auto;
    padding: 24px;
    overflow: auto;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    background: var(--surface);
    box-shadow: 0 16px 56px rgb(0 0 0 / 0.16);
}
.native-dialog::backdrop {
    background: rgb(10 20 35 / 0.48);
}
.native-dialog.in-place:not(:modal) {
    max-height: calc(100% - 24px);
}
.eyebrow {
    margin: 0;
    color: var(--accent);
}
h2 {
    margin: 8px 0 12px;
    font-size: 21px;
    font-weight: 600;
}
.description,
.form-help {
    margin: 0;
    color: var(--secondary);
    font-size: 12px;
    line-height: 1.8;
}
form {
    margin-top: 20px;
}
label {
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
}
input {
    width: 100%;
    padding: 9px 10px;
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text);
    background: var(--surface);
    font: inherit;
    font-size: 13px;
}
.form-help {
    margin-top: 10px;
    font-size: 11px;
}
.dialog-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;
}
</style>
