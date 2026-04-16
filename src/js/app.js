import Alpine from 'alpinejs'
import dataStore from './store/data.js'
import themeSwitcher from './components/themeSwticher'

// Stores
Alpine.store('data', dataStore)

// Components
Alpine.data('themeSwitcher', themeSwitcher)

window.Alpine = Alpine
Alpine.start()