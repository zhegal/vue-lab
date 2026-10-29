<template>
    <FormInput
        name="fullName"
        label="Full name"
        :value="values.fullName"
        :error="errors.fullName"
        :visible="visible.fullName"
        :focus="focusFor('fullName')"
        :max-length="60"
        :min-length="2"
        hint="2–60 characters. Spaces at the edges are trimmed in the result."
        @update="emit('update', 'fullName', $event)"
        @touch="emit('touch', 'fullName')"
    />
    <FormInput
        name="email"
        label="Email"
        type="email"
        :value="values.email"
        :error="errors.email"
        :visible="visible.email"
        :focus="focusFor('email')"
        :max-length="120"
        hint="Use an ASCII address such as alex@example.com."
        @update="emit('update', 'email', $event)"
        @touch="emit('touch', 'email')"
    />
    <div :class="styles.field">
        <label :for="topicId" :class="styles.label">
            Topic
        </label>
        <select
            :id="topicId"
            v-field="field('topic', topicId)"
            v-focus="focusFor('topic')"
            name="topic"
            :value="values.topic"
            :class="styles.control"
            :aria-describedby="`${topicId}-hint`"
            data-field="topic"
            required
            @change="emit('update', 'topic', ($event.target as HTMLSelectElement).value)"
        >
            <option value="">
                Choose a topic
            </option>
            <option
                v-for="(label, code) in topics"
                :key="code"
                :value="code"
            >
                {{ label }}
            </option>
        </select>
        <p :id="`${topicId}-hint`" :class="styles.hint">
            Choose one of the available topics.
        </p>
        <p
            v-if="visible.topic && errors.topic"
            :id="`${topicId}-error`"
            :class="styles.error"
        >
            Error: {{ errors.topic }}
        </p>
    </div>
    <label :class="styles.checkbox">
        <input
            v-focus="focusFor('includeProject')"
            name="includeProject"
            :checked="includeProject"
            type="checkbox"
            data-focus-label="Project code toggle"
            @change="emit('toggle', ($event.target as HTMLInputElement).checked)"
        />
        <span>
            Include a project code
        </span>
    </label>
    <FormInput
        v-if="includeProject"
        name="projectCode"
        label="Project code"
        :value="values.projectCode"
        :error="errors.projectCode"
        :visible="visible.projectCode"
        :focus="focusFor('projectCode')"
        :max-length="20"
        hint="Two uppercase letters and three digits, such as VL-010."
        @update="emit('update', 'projectCode', $event)"
        @touch="emit('touch', 'projectCode')"
    />
    <div :class="styles.field">
        <label :for="messageId" :class="styles.label">
            Message
        </label>
        <textarea
            :id="messageId"
            v-model="messageModel"
            v-field="field('message', messageId)"
            v-focus="focusFor('message')"
            name="message"
            :class="styles.control"
            :aria-describedby="`${messageId}-hint`"
            minlength="20"
            maxlength="500"
            rows="5"
            data-field="message"
            required
        ></textarea>
        <p :id="`${messageId}-hint`" :class="styles.hint">
            20–500 characters after trimming · {{ values.message.length }} / 500
        </p>
        <p
            v-if="visible.message && errors.message"
            :id="`${messageId}-error`"
            :class="styles.error"
        >
            Error: {{ errors.message }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import FormInput from './FormInput.vue';
import { vField, vFocus } from './directives';
import { topics } from './validation';
import type { FieldName, FormValues } from './validation';
import type { FocusRequest, FocusTarget } from './useDemoForm';
import styles from './fields.module.css';

const props = defineProps<{
    values: FormValues;
    errors: FormValues;
    visible: Record<FieldName, boolean>;
    focusRequest: FocusRequest;
    includeProject: boolean;
}>();
const emit = defineEmits<{
    update: [name: FieldName, value: string];
    touch: [name: FieldName];
    toggle: [enabled: boolean];
}>();
const topicId = useId();
const messageId = useId();
const messageModel = computed({
    get: () => props.values.message,
    set: (value: string) => emit('update', 'message', value),
});

function focusFor(target: FocusTarget) {
    return props.focusRequest.target === target ? props.focusRequest.id : 0;
}

function field(name: FieldName, id: string) {
    return {
        error: props.errors[name],
        visible: props.visible[name],
        errorId: `${id}-error`,
        touch: () => emit('touch', name),
    };
}
</script>
