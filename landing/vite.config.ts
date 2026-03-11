import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const normalizeBase = (value?: string) => {
  if (!value) return './'
  if (value === '/') return '/'
  return `/${value.replace(/^\/+|\/+$/g, '')}/`
}

export default defineConfig({
  base: normalizeBase(process.env.VITE_BASE_PATH),
  plugins: [react()],
  resolve: {
    alias: {
      'next/link': resolve(__dirname, 'src/shims/next-link.tsx'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        docs: resolve(__dirname, 'docs/index.html'),
      },
    },
  },
})
