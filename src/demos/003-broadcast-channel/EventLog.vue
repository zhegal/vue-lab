<template>
    <section class="event-log" aria-label="Channel event log">
        <div class="log-heading">
            <h2>
                Event log
            </h2>
            <button
                class="button secondary"
                type="button"
                :disabled="!events.length"
                @click="$emit('clear')"
            >
                Clear log
            </button>
        </div>
        <p class="help">
            Sent {{ sent }} · Received {{ received }}. Latest 40 events, newest first.
        </p>
        <p class="sr-only" role="status">
            {{ events[0]?.detail }}
        </p>
        <ol v-if="events.length">
            <li v-for="event in events" :key="event.id">
                <div class="event-meta">
                    <span :class="{ transfer: event.direction !== 'system' }">
                        {{ event.direction }}
                    </span>
                    <time>
                        {{ event.time }}
                    </time>
                </div>
                <p>
                    {{ event.detail }}
                </p>
            </li>
        </ol>
        <p v-else class="help">
            No events yet.
        </p>
    </section>
</template>

<script setup lang="ts">
import type { ChannelEvent } from './protocol';

defineProps<{ events: ChannelEvent[]; sent: number; received: number }>();
defineEmits<{ clear: [] }>();
</script>

<style scoped>
.event-log {
    min-width: 0;
    padding: 28px;
    border-left: 1px solid var(--border);
}
.log-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}
.help {
    margin: 12px 0 20px;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
ol {
    max-height: 440px;
    overflow: auto;
    padding: 0;
    margin: 0;
    list-style: none;
}
li {
    padding: 12px 0;
    border-top: 1px solid var(--border);
}
.event-meta {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 10px;
}
.event-meta span {
    text-transform: uppercase;
}
.event-meta,
time {
    color: var(--muted);
}
.transfer {
    color: var(--accent);
}
li p {
    margin: 7px 0 0;
    font-size: 12px;
    overflow-wrap: anywhere;
}
button:disabled {
    opacity: 0.5;
    cursor: default;
}
@container (max-width: 850px) {
    .event-log {
        border-left: 0;
        border-top: 1px solid var(--border);
    }
}
@container (max-width: 600px) {
    .event-log {
        padding: 20px;
    }
}
</style>
