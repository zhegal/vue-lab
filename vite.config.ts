import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import packageJson from './package.json' with { type: 'json' };

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const repository = process.env.GITHUB_REPOSITORY;
    const repositoryName = repository?.split('/')[1];
    const pagesBase = repositoryName?.endsWith('.github.io') ? '/' : `/${repositoryName}/`;
    const base = env.VITE_BASE_PATH || (repositoryName ? pagesBase : '/');

    if (!base.startsWith('/') || !base.endsWith('/')) {
        throw new Error('VITE_BASE_PATH must start and end with /, for example /vue-lab/.');
    }

    return {
        plugins: [vue(), tailwindcss()],
        base,
        define: {
            'import.meta.env.VITE_REPOSITORY_URL': JSON.stringify(
                env.VITE_REPOSITORY_URL ||
                    (repository ? `https://github.com/${repository}` : packageJson.repository.url),
            ),
            'import.meta.env.VITE_SOURCE_REF': JSON.stringify(env.VITE_SOURCE_REF || 'main'),
        },
    };
});
