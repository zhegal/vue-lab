<template>
    <div :class="styles.field">
        <label :for="inputId" :class="styles.label">
            {{ label }}
        </label>
        <input
            :id="inputId"
            v-model="model"
            v-field="{ error, visible, errorId, touch: () => emit('touch') }"
            v-focus="focus"
            :name="name"
            :type="type"
            :maxlength="maxLength"
            :minlength="minLength"
            :class="styles.control"
            :aria-describedby="hintId"
            :data-field="name"
            required
        />
        <p :id="hintId" :class="styles.hint">
            {{ hint }}
        </p>
        <p
            v-if="visible && error"
            :id="errorId"
            :class="styles.error"
        >
            Error: {{ error }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import { vField, vFocus } from './directives';
import type { FieldName } from './validation';
import styles from './fields.module.css';

const props = withDefaults(
    defineProps<{
        name: FieldName;
        label: string;
        value: string;
        error: string;
        visible: boolean;
        focus: number;
        hint: string;
        maxLength: number;
        minLength?: number;
        type?: 'text' | 'email';
    }>(),
    { type: 'text', minLength: undefined },
);
const emit = defineEmits<{ update: [value: string]; touch: [] }>();
const inputId = useId();
const hintId = `${inputId}-hint`;
const errorId = `${inputId}-error`;
const model = computed({
    get: () => props.value,
    set: (value: string) => emit('update', value),
});
</script>
