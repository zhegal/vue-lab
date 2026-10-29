import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCatalog, parseMetadata } from '../src/core/catalog.ts';

const meta = {
    title: 'Example',
    description: 'A working demo',
    category: 'UI',
    tags: ['vue', 'css'],
};

test('metadata rejects incomplete, blank, and incorrectly typed fields', () => {
    for (const value of [
        null,
        {},
        'text',
        { ...meta, title: ' ' },
        { ...meta, category: 42 },
        { ...meta, tags: ['vue', ''] },
        { ...meta, tags: 'vue' },
        { ...meta, description: undefined },
    ]) {
        assert.equal(parseMetadata(value), undefined);
    }
});

test('metadata normalizes whitespace and duplicate tags without mutating input', () => {
    const input = { ...meta, title: ' Example ', tags: [' vue ', 'vue', 'css'] };
    assert.deepEqual(parseMetadata(input), meta);
    assert.deepEqual(input.tags, [' vue ', 'vue', 'css']);
});

test('catalog discovers, sorts, and keeps component and document loading lazy', async () => {
    let componentLoads = 0;
    let documentLoads = 0;
    const components = {};
    const metadata = {};
    const documents = {};
    for (const id of ['010-last', '002-second', '001-first']) {
        const path = `../demos/${id}`;
        Object.assign(metadata, { [`${path}/meta.ts`]: { default: meta } });
        Object.assign(components, {
            [`${path}/Demo.vue`]: async () => {
                componentLoads++;
                return { default: {} };
            },
        });
        Object.assign(documents, {
            [`${path}/README.md`]: async () => {
                documentLoads++;
                return '# Overview';
            },
        });
    }
    const catalog = createCatalog({ metadata, components, documents });
    assert.deepEqual(
        catalog.demos.map((demo) => demo.id),
        ['001-first', '002-second', '010-last'],
    );
    assert.deepEqual(catalog.issues, []);
    assert.equal(componentLoads, 0);
    assert.equal(documentLoads, 0);
    await catalog.demos[0]?.loadComponent();
    await catalog.demos[0]?.loadReadme();
    assert.equal(componentLoads, 1);
    assert.equal(documentLoads, 1);
});

test('catalog reports incomplete folders and invalid metadata without breaking valid demos', () => {
    const component = async () => ({ default: {} });
    const document = async () => '# Overview';
    const catalog = createCatalog({
        metadata: {
            '../demos/001-valid/meta.ts': { default: meta },
            '../demos/002-no-readme/meta.ts': { default: meta },
            '../demos/003-invalid-meta/meta.ts': { default: {} },
            '../demos/004-no-default/meta.ts': {},
            '../demos/wrong-folder/meta.ts': { default: meta },
        },
        components: {
            '../demos/001-valid/Demo.vue': component,
            '../demos/002-no-readme/Demo.vue': component,
            '../demos/005-no-meta/Demo.vue': component,
        },
        documents: { '../demos/001-valid/README.md': document },
    });
    assert.deepEqual(
        catalog.demos.map((demo) => demo.id),
        ['001-valid'],
    );
    assert.equal(catalog.issues.length, 5);
    assert.ok(catalog.issues.every((issue) => issue.id && issue.message));
});
