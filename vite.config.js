import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/starter-template/' : '/',
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    css: true,
    globals: true,
    environment: 'happy-dom',
    exclude: ['**/node_modules/**', '**/tests/e2e/**', '**/docs/**'],
    setupFiles: './tests/setup.js',
  },
})
