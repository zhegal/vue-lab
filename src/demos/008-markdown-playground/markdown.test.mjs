import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderMarkdown } from './markdown.ts';
import { MAX_FILE_BYTES, MAX_SOURCE_LENGTH, readMarkdownFile } from './useMarkdownDocument.ts';

test('Markdown formatting works while raw HTML and code content stay escaped', () => {
    const html = renderMarkdown(
        [
            '# Heading',
            '',
            '**bold** and *emphasis* and ~~removed~~',
            '',
            '| A | B |',
            '| --- | --- |',
            '| 1 | 2 |',
            '',
            '<script>alert(1)</script>',
            '<img src=x onerror=alert(1)>',
            '<svg onload=alert(1)></svg>',
            '',
            '```html',
            '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
            '```',
        ].join('\n'),
    );
    assert.match(html, /<h1>Heading<\/h1>/);
    assert.match(html, /<strong>bold<\/strong>/);
    assert.match(html, /<em>emphasis<\/em>/);
    assert.match(html, /<s>removed<\/s>/);
    assert.match(html, /<table>/);
    assert.match(html, /&lt;script&gt;/);
    assert.doesNotMatch(html, /<(script|img|svg|iframe)\b/i);
});

test('unsafe, obfuscated and unsupported link destinations never become anchors', () => {
    for (const url of [
        'javascript:alert(1)',
        'jAvAsCrIpT:alert(1)',
        'java&#x73;cript:alert(1)',
        'javascript&#58;alert(1)',
        'vbscript:alert(1)',
        'file:///etc/passwd',
        'data:text/html;base64,PHNjcmlwdD4=',
        'ftp://example.com/file',
        '//example.com/file',
        './other.md',
        '#heading',
    ]) {
        assert.doesNotMatch(renderMarkdown(`[link](${url})`), /<a\b/);
    }
});

test('allowed links open separately with safe attributes and escaped titles', () => {
    for (const url of ['https://example.com/', 'http://example.com/', 'mailto:a@example.com']) {
        const html = renderMarkdown(`[link](${url} '" onmouseover="alert(1)')`);
        assert.match(html, /target="_blank"/);
        assert.match(html, /rel="noopener noreferrer"/);
        assert.match(html, /title="&quot; onmouseover=&quot;alert\(1\)"/);
        assert.doesNotMatch(html, / onmouseover="/);
    }
});

test('images produce escaped descriptions without loading resources', () => {
    const html = renderMarkdown('![<img src=x onerror=alert(1)>](https://example.com/image.png)');
    assert.match(html, /\[Image: &lt;img/);
    assert.doesNotMatch(html, /<(img|script|iframe)\b/i);
    assert.equal(renderMarkdown(''), '');
});

test('local import accepts UTF-8, BOM, empty files and missing MIME types', async () => {
    assert.equal(await readMarkdownFile(new File(['# Hello'], 'readme.MD')), '# Hello');
    assert.equal(
        await readMarkdownFile(new File(['\uFEFF# Привет'], 'notes.markdown')),
        '# Привет',
    );
    assert.equal(await readMarkdownFile(new File([], 'empty.md')), '');
});

test('invalid imports reject before replacing a document', async () => {
    const cases = [
        [new File(['# Hello'], 'notes.txt'), /\.md or \.markdown/],
        [new File([new Uint8Array(MAX_FILE_BYTES + 1)], 'large.md'), /256 KiB/],
        [new File(['x'.repeat(MAX_SOURCE_LENGTH + 1)], 'long.md'), /100,000/],
        [new File(['\0binary'], 'binary.md'), /null bytes/],
    ];
    for (const [file, error] of cases) await assert.rejects(readMarkdownFile(file), error);
    await assert.rejects(
        readMarkdownFile(new File([new Uint8Array([0xff])], 'invalid.md')),
        TypeError,
    );
});
