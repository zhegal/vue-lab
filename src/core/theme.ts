import { ref } from 'vue';

const theme = ref(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export function useTheme() {
    function toggleTheme() {
        theme.value = theme.value === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = theme.value;

        try {
            localStorage.setItem('vue-lab-theme', theme.value);
        } catch {
            // Storage may be unavailable; the theme still works for this session.
        }
    }

    return { theme, toggleTheme };
}
