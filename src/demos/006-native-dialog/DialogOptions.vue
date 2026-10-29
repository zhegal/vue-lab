<template>
    <aside class="dialog-options" aria-label="Dialog options">
        <h2>
            Options
        </h2>
        <p class="help">
            Close the dialog before changing its configuration.
        </p>
        <fieldset :disabled="locked">
            <label class="checkbox-option">
                <input v-model="teleport" type="checkbox" />
                <span>
                    Teleport to body
                </span>
            </label>
            <p class="help">
                Moves the DOM node out of the inline container. Vue state is preserved.
            </p>
            <label :for="focusId" class="focus-label">
                Initial focus
            </label>
            <select :id="focusId" v-model="initialFocus">
                <option value="input">
                    Dialog note
                </option>
                <option value="heading">
                    Dialog heading
                </option>
                <option value="close">
                    Close button
                </option>
            </select>
            <label class="checkbox-option">
                <input v-model="preventCancel" type="checkbox" />
                <span>
                    Prevent cancel (Esc)
                </span>
            </label>
            <p class="help">
                Calls preventDefault() on the native cancel event.
            </p>
            <label class="checkbox-option">
                <input v-model="closeOnBackdrop" type="checkbox" />
                <span>
                    Close on backdrop
                </span>
            </label>
            <p class="help">
                Custom pointer handling, available only for showModal().
            </p>
            <label class="checkbox-option">
                <input v-model="lockScroll" type="checkbox" />
                <span>
                    Lock document scroll
                </span>
            </label>
            <p class="help">
                Applies only to showModal(). Previous document styles are restored on close.
            </p>
        </fieldset>
    </aside>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import type { FocusTarget } from './types';

defineProps<{ locked: boolean }>();
const teleport = defineModel<boolean>('teleport', { required: true });
const initialFocus = defineModel<FocusTarget>('initialFocus', { required: true });
const preventCancel = defineModel<boolean>('preventCancel', { required: true });
const closeOnBackdrop = defineModel<boolean>('closeOnBackdrop', { required: true });
const lockScroll = defineModel<boolean>('lockScroll', { required: true });
const focusId = useId();
</script>

<style scoped>
.dialog-options {
    min-width: 0;
    padding: 26px;
    border-left: 1px solid var(--border);
}
h2 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
}
.help {
    margin: 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
fieldset {
    margin: 0;
    padding: 0;
    border: 0;
}
fieldset:disabled {
    opacity: 0.5;
}
.checkbox-option {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 24px 0 8px;
    font-size: 12px;
}
input {
    width: 16px;
    height: 16px;
    accent-color: var(--accent);
}
.focus-label {
    display: block;
    margin: 24px 0 8px;
    font-size: 12px;
}
select {
    width: 100%;
    padding: 9px;
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text);
    background: var(--surface);
    font-size: 12px;
}
@container (max-width: 900px) {
    .dialog-options {
        border-left: 0;
        border-top: 1px solid var(--border);
    }
}
</style>
