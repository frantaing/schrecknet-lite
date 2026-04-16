import Alpine from 'alpinejs'
import themeSwitcher from './components/themeSwticher'

// Stores will be registered here (issue #38)
// Alpine.store('data', dataStore)

// Components
Alpine.data('themeSwitcher', themeSwitcher)

window.Alpine = Alpine
Alpine.start()