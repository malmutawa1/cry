import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Web is served from https://<user>.github.io/cry/, so the asset base must match
// the repo name. Native (Capacitor) builds load from the app bundle root, so
// they use a relative base — set CAP_BUILD=1 for those (see `npm run build:ios`).
const isCap = process.env.CAP_BUILD === '1'

export default defineConfig(({ mode }) => ({
  base: isCap ? './' : mode === 'production' ? '/cry/' : '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        // Customer app (existing).
        main: 'index.html',
        // Standalone in-store POS — a separate site that shares nothing with
        // the customer app besides the brand look. Reachable at /pos.html.
        pos: 'pos.html',
      },
    },
  },
}))
