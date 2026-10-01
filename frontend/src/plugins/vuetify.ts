import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { uk } from 'vuetify/locale'

// Components are auto-imported by vite-plugin-vuetify. UI is Ukrainian only (SAD §8).
export default createVuetify({
  locale: { locale: 'uk', messages: { uk } },
  theme: { defaultTheme: 'light' },
})
