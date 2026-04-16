export default function themeSwitcher() {
    return {
        isLight: false,

        init() {
            this.isLight = localStorage.getItem('theme') === 'light'
            this.applyTheme()
        },

        toggleTheme() {
            this.isLight = !this.isLight
            this.applyTheme()
        },

        applyTheme() {
            document.documentElement.classList.toggle('light-mode', this.isLight)
            localStorage.setItem('theme', this.isLight ? 'light' : 'dark')
        }
    }
}