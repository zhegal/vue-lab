import { computed, reactive, ref, watch } from 'vue';
import { createResult, emptyValues, fieldNames, labels, validateForm } from './validation.ts';
import type { FieldError, FieldName, FieldState } from './validation.ts';

export type FocusTarget = FieldName | 'includeProject' | 'result' | 'none';
export interface FocusRequest {
    target: FocusTarget;
    id: number;
}

export function useDemoForm() {
    const values = reactive(emptyValues());
    const includeProject = ref(false);
    const touched = reactive<Record<FieldName, boolean>>({
        fullName: false,
        email: false,
        topic: false,
        projectCode: false,
        message: false,
    });
    const submitted = ref(false);
    const attempts = ref(0);
    const result = ref<ReturnType<typeof createResult> | null>(null);
    const focusRequest = ref<FocusRequest>({ target: 'none', id: 0 });
    let focusSequence = 0;

    const errors = computed(() => validateForm(values, includeProject.value));
    const errorEntries = computed<FieldError[]>(() =>
        fieldNames
            .filter((name) => errors.value[name])
            .map((name) => ({ name, label: labels[name], message: errors.value[name] })),
    );
    const visible = computed(
        () =>
            Object.fromEntries(
                fieldNames.map((name) => [
                    name,
                    !!errors.value[name] && (submitted.value || touched[name]),
                ]),
            ) as Record<FieldName, boolean>,
    );
    const states = computed<FieldState[]>(() =>
        fieldNames
            .filter((name) => name !== 'projectCode' || includeProject.value)
            .map((name) => ({
                name,
                label: labels[name],
                touched: touched[name],
                dirty: values[name] !== '',
            })),
    );
    const status = computed(() => {
        if (result.value) return 'Valid local result created. Nothing was sent or saved.';
        if (!submitted.value) return 'No validation attempt yet.';
        const count = errorEntries.value.length;
        const subject = count === 1 ? 'field needs' : 'fields need';
        return count
            ? `${count} ${subject} attention. Correct them and validate again.`
            : 'All rules pass. Validate again to create a fresh local result.';
    });

    watch(
        [values, includeProject],
        () => {
            result.value = null;
        },
        { deep: true, flush: 'sync' },
    );

    function focus(target: FocusTarget) {
        focusRequest.value = { target, id: ++focusSequence };
    }

    function update(name: FieldName, value: string) {
        values[name] = value;
    }
    function touch(name: FieldName) {
        touched[name] = true;
    }

    function toggleProject(enabled: boolean) {
        includeProject.value = enabled;
        values.projectCode = '';
        touched.projectCode = false;
        focus(enabled ? 'projectCode' : 'includeProject');
    }

    function submit() {
        submitted.value = true;
        attempts.value++;
        const first = errorEntries.value[0];
        if (first) {
            result.value = null;
            focus(first.name);
        } else {
            result.value = createResult(values, includeProject.value);
            focus('result');
        }
    }

    function reset() {
        Object.assign(values, emptyValues());
        includeProject.value = false;
        for (const name of fieldNames) touched[name] = false;
        submitted.value = false;
        attempts.value = 0;
        result.value = null;
        focus('fullName');
    }

    function fillExample() {
        reset();
        Object.assign(values, {
            fullName: 'Alex Example',
            email: 'alex@example.com',
            topic: 'feedback',
            projectCode: 'VL-010',
            message: 'The form examples are clear and easy to explore.',
        });
        includeProject.value = true;
    }

    return {
        values,
        includeProject,
        errors,
        errorEntries,
        visible,
        states,
        submitted,
        attempts,
        result,
        focusRequest,
        status,
        update,
        touch,
        toggleProject,
        submit,
        reset,
        fillExample,
        focus,
    };
}
