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
}))
