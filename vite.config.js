import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    css: true,
    globals: true,
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
    setupFiles: './tests/setup.js',
  },
})
