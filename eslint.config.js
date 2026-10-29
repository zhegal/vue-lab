import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormatting from 'eslint-config-prettier';

export default defineConfigWithVueTs(
    { ignores: ['dist/**', 'node_modules/**'] },
    pluginVue.configs['flat/recommended'],
    vueTsConfigs.recommended,
    skipFormatting,
    {
        rules: {
            'vue/multi-word-component-names': ['error', { ignores: ['App', 'Demo'] }],
            'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
            'vue/max-attributes-per-line': ['error', { singleline: 2, multiline: { max: 1 } }],
            'vue/singleline-html-element-content-newline': [
                'error',
                { ignores: [], ignoreWhenNoAttributes: false },
            ],
            'vue/html-indent': ['error', 4],
            'vue/html-closing-bracket-newline': [
                'error',
                { singleline: 'never', multiline: 'always' },
            ],
            'vue/multiline-html-element-content-newline': 'error',
            'max-len': ['error', { code: 100, ignoreUrls: true }],
        },
    },
);
