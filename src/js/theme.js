/**
 * =================================================================
 * Theme Switcher
 * =================================================================
 * Handles dark/light mode toggling and persists the user's
 * preference to localStorage.
 */

export function initializeThemeSwitcher() {
    const toggleButton = document.getElementById('theme-toggle-btn');
    const darkIcon = document.querySelector('.dark-mode-icon');
    const lightIcon = document.querySelector('.light-mode-icon');

    if (!toggleButton || !darkIcon || !lightIcon) return;

    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.remove('light-mode');
            darkIcon.classList.remove('hidden');
            lightIcon.classList.add('hidden');
            localStorage.setItem('theme', 'dark');
        }
    };

    toggleButton.addEventListener('click', () => {
        const isLight = document.documentElement.classList.contains('light-mode');
        applyTheme(isLight ? 'dark' : 'light');
    });

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
}