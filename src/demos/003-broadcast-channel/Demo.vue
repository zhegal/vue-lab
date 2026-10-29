<template>
    <div class="broadcast-demo">
        <section class="connection-panel" aria-label="Channel connection">
            <div class="connection-heading">
                <h2>
                    BroadcastChannel
                </h2>
                <span class="connection-status" role="status">
                    {{ !supported ? 'Unavailable' : connected ? 'Connected' : 'Disconnected' }}
                </span>
            </div>
            <p class="help">
                Open a second tab, then edit the note or language in either tab. Tabs must share an
                origin and room. Messages are not stored.
            </p>
            <form class="connection-form" @submit.prevent="connect(roomDraft)">
                <label class="room-field">
                    <span>
                        Room
                    </span>
                    <input
                        v-model="roomDraft"
                        pattern="[a-zA-Z0-9_-]{1,32}"
                        maxlength="32"
                        required
                        :disabled="!supported"
                        :aria-describedby="roomHelpId"
                    />
                </label>
                <button
                    class="button secondary"
                    type="submit"
                    :disabled="!supported || !validRoom(roomDraft)"
                >
                    {{ connected ? 'Join / reconnect' : 'Connect' }}
                </button>
                <button
                    class="button secondary"
                    type="button"
                    :disabled="!connected"
                    @click="disconnect"
                >
                    Disconnect
                </button>
                <a
                    class="button secondary"
                    :href="peerUrl"
                    target="_blank"
                    rel="noreferrer"
                >
                    Open second tab
                </a>
            </form>
            <p :id="roomHelpId" class="help">
                1–32 letters, numbers, hyphens or underscores. Active room: {{ room }}.
            </p>
            <div class="connection-details">
                <code>
                    Tab {{ clientId.slice(0, 8) }} · revision {{ snapshot.revision }}
                </code>
                <button
                    class="button secondary"
                    type="button"
                    :disabled="!connected"
                    @click="requestState"
                >
                    Request state
                </button>
            </div>
            <p
                v-if="!supported"
                class="notice"
                role="alert"
            >
                This browser does not support BroadcastChannel. Try a browser with this API enabled.
            </p>
            <p
                v-if="error"
                class="notice"
                role="alert"
            >
                {{ error }}
            </p>
        </section>
        <div class="channel-workspace">
            <SharedStatePanel
                :state="state"
                :connected="connected"
                @update="update"
            />
            <EventLog
                :events="events"
                :sent="sent"
                :received="received"
                @clear="clearEvents"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EventLog from './EventLog.vue';
import SharedStatePanel from './SharedStatePanel.vue';
import { validRoom } from './protocol';
import { useBroadcastState } from './useBroadcastState';

const route = useRoute();
const router = useRouter();
const queryRoom = route.query.room;
const initialRoom =
    typeof queryRoom === 'string' && validRoom(queryRoom) ? queryRoom : 'playground';
const roomDraft = ref(initialRoom);
const roomHelpId = useId();
const {
    supported,
    clientId,
    room,
    connected,
    error,
    snapshot,
    state,
    events,
    sent,
    received,
    connect,
    disconnect,
    update,
    requestState,
    clearEvents,
} = useBroadcastState(initialRoom);
const peerUrl = computed(
    () =>
        router.resolve({
            name: 'demo',
            params: { id: '003-broadcast-channel' },
            query: { standalone: '1', room: room.value },
        }).href,
);
</script>

<style scoped>
.broadcast-demo {
    color: var(--text);
    background: var(--surface);
}
.connection-panel {
    padding: 28px;
    border-bottom: 1px solid var(--border);
}
.connection-heading,
.connection-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}
h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}
.connection-status {
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--accent);
    font-size: 11px;
}
.help {
    margin: 12px 0;
    color: var(--secondary);
    font-size: 12px;
    line-height: 1.8;
}
.connection-form {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 10px;
    margin-top: 22px;
}
.room-field {
    display: grid;
    gap: 8px;
    flex: 1 1 180px;
    font-size: 12px;
}
input {
    min-width: 0;
    width: 100%;
    padding: 9px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    background: var(--surface);
    font-size: 13px;
}
.connection-details {
    margin-top: 20px;
}
code {
    color: var(--muted);
    font-size: 11px;
}
.notice {
    padding: 12px;
    border: 1px solid var(--border);
    font-size: 12px;
}
.channel-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr);
}
button:disabled {
    opacity: 0.5;
    cursor: default;
}
@container (max-width: 850px) {
    .channel-workspace {
        grid-template-columns: minmax(0, 1fr);
    }
}
@container (max-width: 600px) {
    .connection-panel {
        padding: 20px;
    }
}
</style>
