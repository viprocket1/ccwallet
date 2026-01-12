// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // Optional: simpler if you install this plugin

// OR use this manual config:
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    'global': 'window',
  },
})
