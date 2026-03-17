import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
      https: {
      key: readFileSync('docker/dev/app/certificates/lm.local.key'),
      cert: readFileSync('docker/dev/app/certificates/lm.local.crt'),
    },
    strictPort: true,
    watch: {
      usePolling: true, 
    },
  }
})
