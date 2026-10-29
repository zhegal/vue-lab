<template>
    <div class="preview-area">
        <span class="preview-label">
            Preview
        </span>
        <div class="preview-center">
            <div class="preview-card" :style="cardStyle">
                <div class="card-topline">
                    <span class="card-symbol" aria-hidden="true">
                        ✳
                    </span>
                    <span class="card-edition">
                        NO. 001
                    </span>
                </div>
                <div>
                    <p class="card-overline">
                        CSS STYLES
                    </p>
                    <h2>
                        Card
                        <br />
                        preview
                    </h2>
                    <p class="card-caption">
                        Background, radius, size, and shadow.
                    </p>
                </div>
                <div class="card-bottomline">
                    <span>
                        Vue Lab
                    </span>
                    <span aria-hidden="true">
                        ↗
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CardSettings } from './settings';

const props = defineProps<{ settings: CardSettings }>();
const cardStyle = computed(() => {
    const { color, radius, size, shadow } = props.settings;
    const hex = color.slice(1);
    const rgb = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
    const [red = 0, green = 0, blue = 0] = rgb;
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

    return {
        backgroundColor: color,
        borderRadius: `${radius}px`,
        width: `${size}px`,
        color: brightness > 145 ? '#20324a' : '#ffffff',
        boxShadow: `0 ${shadow / 2}px ${shadow * 1.8}px -${shadow / 3}px rgb(0 0 0 / 22%)`,
    };
});
</script>

<style scoped>
.preview-area {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 28px;
    background-color: var(--canvas);
    background-image: radial-gradient(var(--dot) 0.8px, transparent 0.8px);
    background-size: 18px 18px;
}

.preview-label {
    color: var(--muted);
    font-size: 11px;
    letter-spacing: 0.08em;
}

.preview-center {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    flex: 1;
    place-items: center;
    min-height: 390px;
    padding: 28px 0;
}

.preview-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 100%;
    min-height: 300px;
    aspect-ratio: 0.85;
    padding: 28px;
    transition:
        background-color 120ms,
        border-radius 120ms,
        box-shadow 120ms;
}

.card-topline,
.card-bottomline {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.card-symbol {
    font-size: 38px;
    line-height: 1;
}

.card-edition,
.card-overline,
.card-bottomline {
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 9px;
    letter-spacing: 0.06em;
}

.preview-card h2 {
    margin: 12px 0;
    font-size: clamp(28px, 4vw, 39px);
    font-weight: 550;
    line-height: 1.05;
    letter-spacing: -0.06em;
}

.card-caption {
    max-width: 150px;
    font-size: 11px;
    line-height: 1.6;
}

.card-bottomline {
    margin-top: 24px;
}

.card-bottomline span:last-child {
    font-size: 21px;
}

@media (prefers-reduced-motion: reduce) {
    .preview-card {
        transition: none;
    }
}
</style>
