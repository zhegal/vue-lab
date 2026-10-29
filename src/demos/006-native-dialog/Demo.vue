<template>
    <div class="dialog-demo" @focusin="onPageFocus">
        <p
            v-if="!supported"
            class="notice"
            role="alert"
        >
            This browser does not support the native dialog methods used by this experiment.
        </p>
        <p
            v-if="error"
            class="notice"
            role="alert"
        >
            {{ error }}
        </p>
        <div class="dialog-layout">
            <section class="interaction-stage" aria-label="Dialog comparison">
                <div class="launchers">
                    <button
                        class="button secondary"
                        type="button"
                        :disabled="!supported || open"
                        data-focus-name="Open show()"
                        @click="launch('non-modal', $event)"
                    >
                        Open with show()
                    </button>
                    <button
                        class="button primary"
                        type="button"
                        :disabled="!supported || open"
                        data-focus-name="Open showModal()"
                        @click="launch('modal', $event)"
                    >
                        Open with showModal()
                    </button>
                    <button
                        class="button secondary"
                        type="button"
                        :disabled="!open"
                        data-focus-name="Close from page"
                        @click="nativeDialog?.close('page')"
                    >
                        Close from page
                    </button>
                </div>
                <div class="comparison-notes">
                    <p>
                        <code>
                            show()
                        </code>
                        leaves the page interactive, without a backdrop.
                    </p>
                    <p>
                        <code>
                            showModal()
                        </code>
                        uses the top layer, a backdrop and native focus containment.
                    </p>
                </div>
                <div class="page-probe">
                    <h2>
                        Background interaction
                    </h2>
                    <label :for="probeId">
                        Background input
                    </label>
                    <input
                        :id="probeId"
                        v-model="backgroundText"
                        data-focus-name="Background input"
                        placeholder="Try this while the dialog is open"
                    />
                    <button
                        class="button secondary"
                        type="button"
                        data-focus-name="Background counter"
                        @click="incrementCounter"
                    >
                        Background counter: {{ clicks }}
                    </button>
                </div>
                <div class="dialog-host">
                    <div class="host-description">
                        <span class="eyebrow">
                            Inline container
                        </span>
                        <p>
                            With Teleport off, show() stays here. showModal() still uses the top
                            layer.
                        </p>
                    </div>
                    <NativeDialog
                        ref="nativeDialog"
                        :teleport="teleport"
                        :initial-focus="initialFocus"
                        :prevent-cancel="preventCancel"
                        :close-on-backdrop="closeOnBackdrop"
                        :lock-scroll="lockScroll"
                        @opened="onOpened"
                        @closed="onClosed"
                        @record="record"
                        @focused="focus = $event"
                        @placement="placement = $event"
                        @error="error = $event"
                        @scroll-lock="scrollLocked = $event"
                    />
                </div>
                <p class="status" role="status">
                    {{
                        open
                            ? `Open · ${mode === 'modal' ? 'showModal()' : 'show()'}`
                            : 'Dialog closed'
                    }}
                </p>
            </section>
            <DialogOptions
                v-model:teleport="teleport"
                v-model:initial-focus="initialFocus"
                v-model:prevent-cancel="preventCancel"
                v-model:close-on-backdrop="closeOnBackdrop"
                v-model:lock-scroll="lockScroll"
                :locked="open || !supported"
            />
        </div>
        <DialogInspector
            :open="open"
            :mode="mode"
            :placement="placement"
            :scroll-locked="scrollLocked"
            :focus="focus"
            :result="result"
            :events="events"
            @clear="events = []"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue';
import NativeDialog from './NativeDialog.vue';
import DialogOptions from './DialogOptions.vue';
import DialogInspector from './DialogInspector.vue';
import type { DialogLogEntry, DialogMode, DialogRecord, DialogResult, FocusTarget } from './types';

const supported =
    typeof HTMLDialogElement !== 'undefined' &&
    typeof HTMLDialogElement.prototype.show === 'function' &&
    typeof HTMLDialogElement.prototype.showModal === 'function';
const nativeDialog = ref<InstanceType<typeof NativeDialog> | null>(null);
const open = ref(false);
const mode = ref<DialogMode>('non-modal');
const teleport = ref(true);
const initialFocus = ref<FocusTarget>('input');
const preventCancel = ref(false);
const closeOnBackdrop = ref(true);
const lockScroll = ref(true);
const scrollLocked = ref(false);
const placement = ref('document.body');
const focus = ref('');
const result = ref<DialogResult | null>(null);
const events = ref<DialogLogEntry[]>([]);
const error = ref('');
const backgroundText = ref('');
const clicks = ref(0);
const probeId = useId();
let sequence = 0;

function record(event: DialogRecord) {
    events.value = [
        { ...event, id: ++sequence, time: new Date().toLocaleTimeString() },
        ...events.value,
    ].slice(0, 24);
}

function launch(nextMode: DialogMode, event: MouseEvent) {
    error.value = '';
    if (event.currentTarget instanceof HTMLElement) {
        nativeDialog.value?.show(nextMode, event.currentTarget);
    }
}

function onOpened(nextMode: DialogMode) {
    mode.value = nextMode;
    open.value = true;
}

function onClosed(value: DialogResult) {
    open.value = false;
    result.value = value;
}

function onPageFocus(event: FocusEvent) {
    if (!(event.target instanceof HTMLElement)) return;
    focus.value = event.target.dataset.focusName ?? event.target.tagName.toLowerCase();
}

function incrementCounter() {
    clicks.value++;
    record({ name: 'background', detail: `Counter changed to ${clicks.value}.` });
}
</script>

<style scoped>
.dialog-demo {
    color: var(--text);
    background: var(--surface);
}
.dialog-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
}
.interaction-stage {
    min-width: 0;
    padding: 26px;
}
.launchers {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.comparison-notes {
    display: grid;
    gap: 8px;
    margin: 20px 0;
}
.comparison-notes p {
    margin: 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
code {
    color: var(--accent);
}
.page-probe {
    padding: 18px;
    border: 1px solid var(--border);
    border-radius: 6px;
}
h2 {
    margin: 0 0 16px;
    font-size: 14px;
    font-weight: 600;
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
    font-size: 12px;
}
.page-probe button {
    margin-top: 12px;
}
.dialog-host {
    position: relative;
    transform: translateZ(0);
    height: 360px;
    margin-top: 20px;
    overflow: hidden;
    border: 1px dashed var(--border);
    border-radius: 6px;
    background: var(--canvas);
}
.host-description {
    padding: 20px;
}
.host-description span {
    color: var(--muted);
}
.host-description p {
    max-width: 40ch;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
.status {
    margin: 16px 0 0;
    color: var(--accent);
    font-size: 12px;
}
.notice {
    margin: 0;
    padding: 20px 26px;
    border-bottom: 1px solid var(--border);
    font-size: 12px;
}
button:disabled {
    opacity: 0.45;
    cursor: default;
}
@container (max-width: 900px) {
    .dialog-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
@container (max-width: 600px) {
    .interaction-stage {
        padding: 20px;
    }
}
</style>
