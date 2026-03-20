// client/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.57.60:3001',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://192.168.57.60:3001',
        changeOrigin: true
      }
    }
  }
})