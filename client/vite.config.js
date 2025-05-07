import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 👇👇 Add this proxy section!
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // 👈 backend ka URL
        changeOrigin: true,
        secure: false
      }
    }
  }
})
