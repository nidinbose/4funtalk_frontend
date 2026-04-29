import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ─── Build Output ─────────────────────────────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },

  // ─── Dev Server Proxy (development only) ──────────────────────────────────
  // In production the frontend is served from the same origin as the backend,
  // so /api/* and /socket.io requests go directly to the backend.
  server: {
    proxy: {
      '/api': {
        target: 'https://api.support4funtalk.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://api.support4funtalk.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
