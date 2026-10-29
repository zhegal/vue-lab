import assert from 'node:assert/strict';
import { test } from 'node:test';
import { effectScope, nextTick } from 'vue';
import { createResult, emptyValues, validateForm } from './validation.ts';
import { useDemoForm } from './useDemoForm.ts';

const valid = {
    fullName: 'Alex Example',
    email: 'alex@example.com',
    topic: 'feedback',
    projectCode: 'VL-010',
    message: 'A complete message for this local form example.',
};

test('required and conditional fields reject empty values and unsupported topics', () => {
    const empty = validateForm(emptyValues(), false);
    assert.equal(Object.values(empty).filter(Boolean).length, 4);
    assert.equal(empty.projectCode, '');
    assert.notEqual(validateForm(emptyValues(), true).projectCode, '');
    assert.ok(Object.values(validateForm(valid, true)).every((error) => error === ''));
    for (const topic of ['toString', '__proto__', 'unknown']) {
        assert.notEqual(validateForm({ ...valid, topic }, false).topic, '');
    }
    assert.equal(validateForm({ ...valid, projectCode: 'invalid' }, false).projectCode, '');
    for (const projectCode of ['vl-010', 'VL-01', 'VL-0100', 'ABC-010']) {
        assert.notEqual(validateForm({ ...valid, projectCode }, true).projectCode, '');
    }
});

test('name and message lengths use meaningful trimmed text, including their boundaries', () => {
    for (const fullName of ['', '   ', ' A ', 'a'.repeat(61)]) {
        assert.notEqual(validateForm({ ...valid, fullName }, false).fullName, '');
    }
    for (const message of [' ', 'x'.repeat(19), 'x'.repeat(501)]) {
        assert.notEqual(validateForm({ ...valid, message }, false).message, '');
    }
    for (const length of [20, 500]) {
        assert.equal(validateForm({ ...valid, message: 'x'.repeat(length) }, false).message, '');
    }
});

test('the limited email policy rejects malformed addresses and overlong domain labels', () => {
    for (const email of [
        'alex',
        'alex@example',
        'alex@@example.com',
        'a b@example.com',
        'alex@-example.com',
        'alex@example..com',
        `alex@${'a'.repeat(64)}.com`,
        'алекс@example.com',
        'a'.repeat(121),
    ])
        assert.notEqual(validateForm({ ...valid, email }, false).email, '');
    for (const email of ['alex+demo@example.com', 'Alex.Example@sub.example.com']) {
        assert.equal(validateForm({ ...valid, email }, false).email, '');
    }
});

test('result normalization preserves source values and omits hidden project data', () => {
    const input = { ...valid, fullName: '  Alex Example  ', message: `  ${valid.message}  ` };
    const result = createResult(input, false);
    assert.equal(result.fullName, valid.fullName);
    assert.equal(result.message, valid.message);
    assert.equal(Object.hasOwn(result, 'projectCode'), false);
    assert.equal(input.fullName, '  Alex Example  ');
    assert.equal(createResult(input, true).projectCode, 'VL-010');
});

test('errors reveal after blur or submit and corrected fields clear immediately', () => {
    const scope = effectScope();
    try {
        const form = scope.run(() => useDemoForm());
        assert.equal(Object.values(form.visible.value).some(Boolean), false);
        form.touch('email');
        assert.equal(form.visible.value.email, true);
        assert.equal(form.visible.value.fullName, false);
        form.submit();
        assert.equal(form.errorEntries.value.length, 4);
        assert.equal(form.focusRequest.value.target, 'fullName');
        form.update('fullName', 'Alex');
        assert.equal(form.visible.value.fullName, false);
        form.submit();
        assert.equal(form.focusRequest.value.target, 'email');
    } finally {
        scope.stop();
    }
});

test('conditional field removal clears its state and focus returns to the toggle', () => {
    const scope = effectScope();
    try {
        const form = scope.run(() => useDemoForm());
        form.toggleProject(true);
        assert.equal(form.focusRequest.value.target, 'projectCode');
        form.update('projectCode', 'bad');
        form.touch('projectCode');
        form.toggleProject(false);
        assert.equal(form.focusRequest.value.target, 'includeProject');
        assert.equal(form.errors.value.projectCode, '');
        assert.equal(
            form.states.value.some((field) => field.name === 'projectCode'),
            false,
        );
        form.toggleProject(true);
        const project = form.states.value.find((field) => field.name === 'projectCode');
        assert.equal(project.touched, false);
        assert.equal(project.dirty, false);
    } finally {
        scope.stop();
    }
});

test('edits invalidate snapshots and fresh submissions survive the Vue update', async () => {
    const scope = effectScope();
    try {
        const form = scope.run(() => useDemoForm());
        form.fillExample();
        form.submit();
        assert.equal(form.focusRequest.value.target, 'result');
        assert.equal(form.result.value.fullName, valid.fullName);
        form.update('fullName', 'Another Example');
        assert.equal(form.result.value, null);
        form.submit();
        await nextTick();
        assert.equal(form.result.value.fullName, 'Another Example');
        form.reset();
        assert.equal(form.result.value, null);
        assert.equal(form.attempts.value, 0);
        assert.equal(form.includeProject.value, false);
        assert.equal(form.focusRequest.value.target, 'fullName');
        assert.equal(Object.values(form.visible.value).some(Boolean), false);
    } finally {
        scope.stop();
    }
});
