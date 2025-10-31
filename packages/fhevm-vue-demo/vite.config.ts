import { fileURLToPath, URL } from 'node:url'


import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ['ethers'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  resolve: {
    dedupe: ['ethers'],   // <-- important
    alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))

    }
  }
})
