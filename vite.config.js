import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  // This ensures that all routes are redirected to index.html for client-side routing
  preview: {
    port: 5173
  }
})