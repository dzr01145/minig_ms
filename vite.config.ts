import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      '.sandbox.novita.ai',  // Allow all sandbox domains
      'localhost',
      '127.0.0.1'
    ],
    // HMR (Hot Module Replacement) configuration
    // For local development, use default settings
    // For production/remote deployment, uncomment and set clientPort
    // hmr: {
    //   clientPort: 443,
    // },
  },
})
