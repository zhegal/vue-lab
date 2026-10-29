import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { initialSnapshot, isChannelMessage, isNewer, protocol, validRoom } from './protocol';
import type { ChannelEvent, ChannelMessage, SharedState } from './protocol';

export function useBroadcastState(initialRoom: string) {
    const supported = typeof BroadcastChannel !== 'undefined';
    const clientId =
        globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const room = ref(initialRoom);
    const connected = ref(false);
    const error = ref('');
    const snapshot = ref(initialSnapshot());
    const events = ref<ChannelEvent[]>([]);
    const sent = ref(0);
    const received = ref(0);
    let channel: BroadcastChannel | undefined;
    let sequence = 0;
    let clock = 0;

    function log(direction: ChannelEvent['direction'], detail: string) {
        events.value = [
            {
                id: ++sequence,
                time: new Date().toLocaleTimeString(),
                direction,
                detail,
            },
            ...events.value,
        ].slice(0, 40);
    }

    function disconnect() {
        if (channel) {
            channel.onmessage = null;
            channel.onmessageerror = null;
            channel.close();
            channel = undefined;
            log('system', 'Channel closed.');
        }
        connected.value = false;
    }

    function send(message: ChannelMessage): boolean {
        if (!channel) return false;
        try {
            channel.postMessage(message);
            sent.value++;
            log(
                'sent',
                message.type === 'request'
                    ? 'Requested the current state.'
                    : `State r${message.snapshot.revision} · ${message.snapshot.value.language}`,
            );
            return true;
        } catch {
            disconnect();
            error.value = 'The message could not be sent. Reconnect to try again.';
            return false;
        }
    }

    function requestState() {
        if (send({ protocol, sender: clientId, type: 'request' })) error.value = '';
    }

    function connect(nextRoom: string) {
        if (!supported || !validRoom(nextRoom)) return;
        disconnect();
        error.value = '';
        room.value = nextRoom;
        snapshot.value = initialSnapshot();
        clock = 0;
        events.value = [];
        sent.value = 0;
        received.value = 0;

        try {
            channel = new BroadcastChannel(`vue-lab:003-broadcast-channel:${nextRoom}`);
            channel.onmessage = ({ data }: MessageEvent<unknown>) => {
                if (!isChannelMessage(data)) {
                    log('system', 'Ignored an invalid or incompatible message.');
                    return;
                }
                if (data.sender === clientId) return;
                if (data.type === 'state' && data.target && data.target !== clientId) return;
                received.value++;

                if (data.type === 'request') {
                    log('received', `State request from ${data.sender.slice(0, 8)}.`);
                    send({
                        protocol,
                        sender: clientId,
                        type: 'state',
                        snapshot: {
                            revision: snapshot.value.revision,
                            author: snapshot.value.author,
                            value: { ...snapshot.value.value },
                        },
                        target: data.sender,
                    });
                    return;
                }

                clock = Math.max(clock, data.snapshot.revision);
                const newer = isNewer(data.snapshot, snapshot.value);
                const outcome = newer ? 'applied' : 'already current / older';
                log(
                    'received',
                    `State r${data.snapshot.revision} from ` +
                        `${data.sender.slice(0, 8)} · ${outcome}`,
                );
                if (newer) snapshot.value = data.snapshot;
            };
            channel.onmessageerror = () => {
                error.value = 'A received message could not be decoded. Request state to retry.';
                log('system', 'Message decoding failed.');
            };
            connected.value = true;
            log('system', `Connected to ${nextRoom}.`);
            requestState();
        } catch {
            disconnect();
            error.value = 'BroadcastChannel could not be opened in this browser context.';
        }
    }

    function update(value: SharedState) {
        if (!connected.value) return;
        // Plain objects cross the channel; Vue's reactive proxies cannot be structured-cloned.
        const next = {
            revision: ++clock,
            author: clientId,
            value: { language: value.language, note: value.note },
        };
        if (send({ protocol, sender: clientId, type: 'state', snapshot: next })) {
            snapshot.value = next;
            error.value = '';
        }
    }

    onMounted(() => connect(initialRoom));
    onBeforeUnmount(disconnect);

    return {
        supported,
        clientId,
        room,
        connected,
        error,
        snapshot,
        events,
        sent,
        received,
        state: computed(() => snapshot.value.value),
        connect,
        disconnect,
        update,
        requestState,
        clearEvents: () => {
            events.value = [];
        },
    };
}
