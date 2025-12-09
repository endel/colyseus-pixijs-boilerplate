import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: 'src/client',
  build: {
    outDir: '../../build',
    emptyOutDir: true,
    target: 'es2020',
  },
  server: {
    port: 1234,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/client'),
    },
  },
  esbuild: {
    target: 'es2020',
  },
})
