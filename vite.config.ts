import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/circle-api': {
        target: 'https://api.circle.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/circle-api/, '')
      }
    }
  }
})
