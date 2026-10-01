import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // The SPA calls relative /api/... URLs, like behind Caddy in prod (SAD §7).
  // `npm run dev` proxies to the local api (.env.development); `npm run dev:mock` to Prism (.env.mock).
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:3000'

  return {
    plugins: [
      vue({ template: { transformAssetUrls } }),
      vuetify({ autoImport: true }),
      tailwindcss(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': apiTarget,
        '/health': apiTarget,
      },
    },
  }
})
