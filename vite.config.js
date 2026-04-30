import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
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
