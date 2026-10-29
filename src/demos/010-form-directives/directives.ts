import { nextTick } from 'vue';
import type { ObjectDirective } from 'vue';

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export interface FieldBinding {
    error: string;
    visible: boolean;
    errorId: string;
    touch: () => void;
}

interface FieldOwner {
    binding: FieldBinding;
    events: AbortController;
    initialInvalid: string | null;
    initialValidity: string;
    descriptionId: string;
}

const fields = new WeakMap<Control, FieldOwner>();

function describe(element: Control, owner: FieldOwner, id: string) {
    const current = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    const ids = current.filter((value) => value !== owner.descriptionId);
    if (id && !ids.includes(id)) ids.push(id);
    if (ids.length) element.setAttribute('aria-describedby', ids.join(' '));
    else element.removeAttribute('aria-describedby');
    owner.descriptionId = id;
}

function syncField(element: Control, owner: FieldOwner) {
    const { error, visible, errorId } = owner.binding;
    element.setCustomValidity(error);
    if (error && visible) element.setAttribute('aria-invalid', 'true');
    else element.removeAttribute('aria-invalid');
    describe(element, owner, error && visible ? errorId : '');
}

export const vField: ObjectDirective<Control, FieldBinding> = {
    mounted(element, { value }) {
        const owner: FieldOwner = {
            binding: value,
            events: new AbortController(),
            initialInvalid: element.getAttribute('aria-invalid'),
            initialValidity: element.validity.customError ? element.validationMessage : '',
            descriptionId: '',
        };
        fields.set(element, owner);
        element.addEventListener('blur', () => owner.binding.touch(), {
            signal: owner.events.signal,
        });
        syncField(element, owner);
    },
    updated(element, { value }) {
        const owner = fields.get(element);
        if (!owner) return;
        owner.binding = value;
        syncField(element, owner);
    },
    beforeUnmount(element) {
        const owner = fields.get(element);
        if (!owner) return;
        owner.events.abort();
        describe(element, owner, '');
        element.setCustomValidity(owner.initialValidity);
        if (owner.initialInvalid === null) element.removeAttribute('aria-invalid');
        else element.setAttribute('aria-invalid', owner.initialInvalid);
        fields.delete(element);
    },
};

const focusOwners = new WeakMap<HTMLElement, { version: number }>();

function requestFocus(element: HTMLElement, request: number, block: 'nearest' | 'start') {
    const owner = focusOwners.get(element);
    if (!owner) return;
    const version = ++owner.version;
    if (request <= 0) return;
    // Wait for inline errors/ARIA and conditional fields to finish the same Vue DOM update.
    void nextTick(() => {
        if (owner.version !== version || !element.isConnected || !focusOwners.has(element)) return;
        element.focus({ preventScroll: true });
        if (document.activeElement === element) {
            element.scrollIntoView({ block, inline: 'nearest' });
        }
    });
}

export const vFocus: ObjectDirective<HTMLElement, number> = {
    mounted(element, { value, arg }) {
        focusOwners.set(element, { version: 0 });
        requestFocus(element, value, arg === 'start' ? 'start' : 'nearest');
    },
    updated(element, { value, oldValue, arg }) {
        if (value !== oldValue) requestFocus(element, value, arg === 'start' ? 'start' : 'nearest');
    },
    beforeUnmount(element) {
        const owner = focusOwners.get(element);
        if (owner) owner.version++;
        focusOwners.delete(element);
    },
};
