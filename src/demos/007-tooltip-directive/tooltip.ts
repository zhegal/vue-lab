import type { ObjectDirective } from 'vue';
import { createTooltip } from './tooltipController';
import { placements } from './position';
import type { Placement } from './position';

export type TooltipValue = string | { text: string; delay?: number; disabled?: boolean };

const controllers = new WeakMap<HTMLElement, ReturnType<typeof createTooltip>>();

function config(value: TooltipValue, arg?: string) {
    const options = typeof value === 'string' ? { text: value } : value;
    return {
        text: options.text,
        delay:
            typeof options.delay === 'number' && Number.isFinite(options.delay)
                ? Math.max(0, Math.min(options.delay, 1500))
                : 350,
        disabled: options.disabled ?? false,
        placement: placements.includes(arg as Placement) ? (arg as Placement) : 'top',
    };
}

export const vTooltip: ObjectDirective<HTMLElement, TooltipValue> = {
    mounted(element, binding) {
        controllers.set(element, createTooltip(element, config(binding.value, binding.arg)));
    },
    updated(element, binding) {
        controllers.get(element)?.update(config(binding.value, binding.arg));
    },
    beforeUnmount(element) {
        controllers.get(element)?.destroy();
        controllers.delete(element);
    },
};
