<template>
    <section class="boundary-lab" aria-label="Scroll and clipping test">
        <h3>
            Scroll and clipping
        </h3>
        <p class="help">
            Scroll this box while a trigger has focus. Tooltips follow it outside the box and close
            when the trigger is fully clipped. Near a viewport edge, they flip or shift to fit.
        </p>
        <div class="scroll-box">
            <div class="scroll-content">
                <button
                    v-tooltip:left="
                        'Preferred left. The tooltip can escape this clipped container.'
                    "
                    class="button secondary top-left"
                    type="button"
                >
                    Upper left
                </button>
                <button
                    v-tooltip:right="'Preferred right. Resize the window to test viewport bounds.'"
                    class="button secondary top-right"
                    type="button"
                >
                    Upper right
                </button>
                <p class="scroll-label">
                    Scroll horizontally and vertically
                </p>
                <button
                    v-tooltip:bottom="
                        'Preferred bottom. Scroll the page to test vertical flipping.'
                    "
                    class="button secondary bottom-left"
                    type="button"
                >
                    Lower left
                </button>
                <button
                    v-tooltip:right="
                        'This tooltip stays attached while the scroll position changes.'
                    "
                    class="button secondary bottom-right"
                    type="button"
                >
                    Lower right
                </button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { vTooltip } from './tooltip';
</script>

<style scoped>
.boundary-lab {
    margin-top: 28px;
}
h3 {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 600;
}
.help {
    margin: 0 0 16px;
    color: var(--secondary);
    font-size: 11px;
    line-height: 1.8;
}
.scroll-box {
    height: 210px;
    overflow: auto;
    border: 1px dashed var(--border);
    border-radius: 6px;
    background: var(--canvas);
    transform: translateZ(0);
}
.scroll-content {
    position: relative;
    width: 700px;
    height: 360px;
}
button {
    position: absolute;
}
.top-left {
    top: 20px;
    left: 20px;
}
.top-right {
    top: 20px;
    right: 20px;
}
.bottom-left {
    bottom: 20px;
    left: 20px;
}
.bottom-right {
    right: 20px;
    bottom: 20px;
}
.scroll-label {
    position: absolute;
    top: 160px;
    width: 100%;
    margin: 0;
    color: var(--muted);
    font-family: monospace;
    font-size: 11px;
    text-align: center;
}
</style>
