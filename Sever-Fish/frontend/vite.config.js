import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Проксирование API запросов
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Проксирование других эндпоинтов
      '/orders': 'http://127.0.0.1:8000',
      '/users': 'http://127.0.0.1:8000',
      '/auth': 'http://127.0.0.1:8000',
      '/products': 'http://127.0.0.1:8000',
      '/cart': 'http://127.0.0.1:8000'
    }
  }
})