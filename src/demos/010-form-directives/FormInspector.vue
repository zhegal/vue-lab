<template>
    <aside class="form-inspector" aria-label="Form inspector">
        <h2>
            Field state
        </h2>
        <p class="help">
            Touched means the field lost focus. Edited compares its value with the empty form.
        </p>
        <div class="state-table">
            <table>
                <thead>
                    <tr>
                        <th scope="col">
                            Field
                        </th>
                        <th scope="col">
                            Touched
                        </th>
                        <th scope="col">
                            Edited
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="field in states" :key="field.name">
                        <th scope="row">
                            {{ field.label }}
                        </th>
                        <td>
                            {{ field.touched ? 'Yes' : 'No' }}
                        </td>
                        <td>
                            {{ field.dirty ? 'Yes' : 'No' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <dl>
            <div>
                <dt>
                    Focused control
                </dt>
                <dd>
                    {{ focused }}
                </dd>
            </div>
            <div>
                <dt>
                    Validation attempts
                </dt>
                <dd>
                    {{ attempts }}
                </dd>
            </div>
        </dl>
        <section
            v-if="result"
            class="local-result"
            aria-label="Local validation result"
        >
            <h2
                v-focus:start="resultFocus"
                tabindex="-1"
                data-focus-label="Local result"
            >
                Local result
            </h2>
            <p class="help">
                A trimmed snapshot, created only after validation. Editing a field clears it.
            </p>
            <pre v-text="JSON.stringify(result, null, 2)"></pre>
        </section>
        <p v-else class="help">
            Validate a complete form to inspect the local result here.
        </p>
    </aside>
</template>

<script setup lang="ts">
import { vFocus } from './directives';
import type { FieldState } from './validation';
import type { createResult } from './validation';

defineProps<{
    states: FieldState[];
    focused: string;
    attempts: number;
    result: ReturnType<typeof createResult> | null;
    resultFocus: number;
}>();
</script>

<style scoped>
.form-inspector {
    min-width: 0;
    padding: 26px;
    border-left: 1px solid var(--border);
}
h2 {
    margin: 0 0 12px;
    font-size: 15px;
    font-weight: 600;
    scroll-margin-top: calc(var(--header-height) + 16px);
}
.help {
    margin: 0;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
.state-table {
    overflow-x: auto;
    margin: 20px 0;
}
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
}
th,
td {
    padding: 9px 5px;
    border-bottom: 1px solid var(--border);
    text-align: left;
}
th {
    color: var(--secondary);
    font-weight: 500;
}
dl {
    display: grid;
    gap: 16px;
    margin: 24px 0;
    font-size: 12px;
}
dt {
    margin-bottom: 6px;
    color: var(--secondary);
    font-size: 11px;
}
dd {
    margin: 0;
}
.local-result {
    padding-top: 20px;
    border-top: 1px solid var(--border);
}
pre {
    margin: 16px 0 0;
    padding: 12px;
    overflow: auto;
    border-radius: 5px;
    background: var(--canvas);
    font-size: 11px;
    line-height: 1.8;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}
@container (max-width: 900px) {
    .form-inspector {
        border-top: 1px solid var(--border);
        border-left: 0;
    }
}
</style>
