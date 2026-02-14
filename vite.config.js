import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // ← Pas 127.0.0.1 !
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,  // Important pour Docker
    },
  }
})