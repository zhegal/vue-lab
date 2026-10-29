const repository = import.meta.env.VITE_REPOSITORY_URL.replace(/\.git$/, '').replace(/\/$/, '');
const ref = encodeURIComponent(import.meta.env.VITE_SOURCE_REF);

export const repositoryUrl = repository;

export function demoSourceUrl(id: string) {
    return `${repository}/tree/${ref}/src/demos/${encodeURIComponent(id)}`;
}
