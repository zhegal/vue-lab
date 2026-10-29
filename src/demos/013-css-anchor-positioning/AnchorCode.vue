<template>
    <section class="code-panel" aria-label="CSS for current settings">
        <div class="code-heading">
            <h2>
                CSS · current settings
            </h2>
            <span>
                {{ mode === 'popover' ? 'popover="auto" + CSS' : 'No JS positioning' }}
            </span>
        </div>
        <pre tabindex="0">
<code>
{{ code }}
</code>
</pre>
        <p>
            The preview uses a unique anchor name per instance. This snippet uses --demo-anchor for
            readability. Drag coordinates and decorative styles are omitted.
        </p>
        <div class="reference-links">
            <a
                href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning"
                target="_blank"
                rel="noreferrer"
            >
                Anchor positioning ↗
            </a>
            <a
                href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-try-fallbacks"
                target="_blank"
                rel="noreferrer"
            >
                Overflow fallbacks ↗
            </a>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AnchorMode, AnchorSettings } from './settings';

const props = defineProps<{ mode: AnchorMode; settings: AnchorSettings }>();
const code = computed(() => {
    const { mode, settings: s } = props;
    const anchor = `.anchor {\n    anchor-name: --demo-anchor;\n}\n\n`;
    if (mode === 'anchor') {
        const bottom = s.gap ? `calc(anchor(top) + ${s.gap}px)` : 'anchor(top)';
        return (
            anchor +
            '.orange {\n' +
            '    position: absolute;\n' +
            '    position-anchor: --demo-anchor;\n' +
            `    bottom: ${bottom};\n` +
            '    left: anchor(center);\n' +
            (s.centered ? '    translate: -50% 0;\n' : '') +
            '}'
        );
    }
    const selector = mode === 'popover' ? '[popover]' : '.attached';
    const width = s.matchWidth ? 'anchor-size(width)' : mode === 'popover' ? '216px' : '148px';
    const fallbacks = s.flip ? 'flip-block, flip-inline, flip-block flip-inline' : 'none';
    return (
        anchor +
        `${selector} {\n` +
        `    position: ${mode === 'popover' ? 'fixed' : 'absolute'};\n` +
        (mode === 'popover' ? '    inset: auto; /* reset the popover UA styles */\n' : '') +
        '    position-anchor: --demo-anchor;\n' +
        `    position-area: ${s.area};\n` +
        `    margin: ${s.gap}px;\n` +
        `    width: ${width};\n` +
        `    position-try-fallbacks: ${fallbacks};\n` +
        '}' +
        (mode === 'popover'
            ? '\n\n/* Pair a button popovertarget="info" with a panel id="info" popover="auto". */'
            : '')
    );
});
</script>

<style scoped>
.code-panel {
    min-width: 0;
    padding: 22px 26px;
    border-top: 1px solid var(--border);
}

.code-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
}

h2 {
    margin: 0;
    font-size: 12px;
    font-weight: 550;
}

.code-heading > span {
    color: var(--muted);
    font-size: 10px;
}

pre {
    margin: 16px 0 12px;
    padding: 18px;
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 7px;
    color: var(--accent);
    background: var(--canvas);
    font-size: 11px;
    line-height: 1.9;
    tab-size: 4;
}

p {
    margin: 0;
    color: var(--muted);
    font-size: 10px;
    line-height: 1.8;
}

.reference-links {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    margin-top: 14px;
    color: var(--accent);
    font-size: 11px;
}

a:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
}

@container (max-width: 480px) {
    .code-panel {
        padding: 20px 18px;
    }
}
</style>
