import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://api-gateway:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/sever-ryba': {  // Add proxy for sever-ryba endpoints
        target: 'http://api-gateway:8080',
        changeOrigin: true
      },
      '/ais': {  // Add proxy for ais endpoints if needed
        target: 'http://api-gateway:8080',
        changeOrigin: true
      }
    }
  }
})