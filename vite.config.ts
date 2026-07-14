import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://<user>.github.io/cry/ in production, so the asset base
// must match the repo name. Dev keeps the root base.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/cry/' : '/',
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
