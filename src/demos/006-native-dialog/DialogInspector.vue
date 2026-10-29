<template>
    <section class="dialog-inspector" aria-label="Dialog inspector">
        <div class="state-panel">
            <h2>
                Inspector
            </h2>
            <dl>
                <div>
                    <dt>
                        open
                    </dt>
                    <dd>
                        {{ open }}
                    </dd>
                </div>
                <div>
                    <dt>
                        Modal / top layer
                    </dt>
                    <dd>
                        {{ open && mode === 'modal' }}
                    </dd>
                </div>
                <div>
                    <dt>
                        DOM parent
                    </dt>
                    <dd>
                        {{ placement }}
                    </dd>
                </div>
                <div>
                    <dt>
                        Scroll lock applied
                    </dt>
                    <dd>
                        {{ scrollLocked }}
                    </dd>
                </div>
                <div>
                    <dt>
                        Last focused control
                    </dt>
                    <dd>
                        {{ focus || '—' }}
                    </dd>
                </div>
                <div>
                    <dt>
                        Last returnValue
                    </dt>
                    <dd>
                        {{ result ? JSON.stringify(result.value) : '—' }}
                    </dd>
                </div>
                <div>
                    <dt>
                        Closed by
                    </dt>
                    <dd>
                        {{ result?.reason ?? '—' }}
                    </dd>
                </div>
                <div>
                    <dt>
                        Last note
                    </dt>
                    <dd>
                        {{ result?.note || '—' }}
                    </dd>
                </div>
            </dl>
        </div>
        <div class="event-panel">
            <div class="log-heading">
                <h2>
                    Events
                </h2>
                <button
                    class="button secondary"
                    type="button"
                    :disabled="!events.length"
                    data-focus-name="Clear events"
                    @click="$emit('clear')"
                >
                    Clear events
                </button>
            </div>
            <p class="help">
                Latest 24 events, newest first.
            </p>
            <ol v-if="events.length">
                <li v-for="entry in events" :key="entry.id">
                    <div class="event-meta">
                        <code>
                            {{ entry.name }}
                        </code>
                        <time>
                            {{ entry.time }}
                        </time>
                    </div>
                    <p>
                        {{ entry.detail }}
                    </p>
                </li>
            </ol>
            <p v-else class="help">
                Open a dialog to inspect its events.
            </p>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { DialogLogEntry, DialogMode, DialogResult } from './types';

defineProps<{
    open: boolean;
    mode: DialogMode;
    placement: string;
    scrollLocked: boolean;
    focus: string;
    result: DialogResult | null;
    events: DialogLogEntry[];
}>();
defineEmits<{ clear: [] }>();
</script>

<style scoped>
.dialog-inspector {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}
.state-panel,
.event-panel {
    min-width: 0;
    padding: 26px;
    border-top: 1px solid var(--border);
}
.event-panel {
    border-left: 1px solid var(--border);
}
h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}
dl {
    display: grid;
    gap: 12px;
    margin: 20px 0 0;
}
dl div {
    display: grid;
    grid-template-columns: minmax(100px, 0.8fr) minmax(0, 1fr);
    gap: 12px;
}
dt,
dd {
    font-size: 11px;
    overflow-wrap: anywhere;
}
dt {
    color: var(--secondary);
}
dd {
    margin: 0;
    font-family: monospace;
}
.log-heading,
.event-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.help {
    margin: 10px 0 16px;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
ol {
    max-height: 280px;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow: auto;
}
li {
    padding: 10px 0;
    border-top: 1px solid var(--border);
}
code {
    color: var(--accent);
    font-size: 11px;
}
time {
    color: var(--muted);
    font-size: 10px;
}
li p {
    margin: 6px 0 0;
    font-size: 11px;
    overflow-wrap: anywhere;
}
button:disabled {
    opacity: 0.5;
    cursor: default;
}
@container (max-width: 700px) {
    .dialog-inspector {
        grid-template-columns: minmax(0, 1fr);
    }
    .event-panel {
        border-left: 0;
    }
}
</style>
