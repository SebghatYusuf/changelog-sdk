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
  appType: 'mpa',
  plugins: [react()],
  resolve: {
    alias: {
      'next/link': resolve(__dirname, 'src/shims/next-link.tsx'),
      'next/navigation': resolve(__dirname, 'src/shims/next-navigation.tsx'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        docs: resolve(__dirname, 'docs/index.html'),
        docsFrameworks: resolve(__dirname, 'docs/frameworks/index.html'),
        docsApiServerActions: resolve(__dirname, 'docs/api/server-actions/index.html'),
        docsApiTypes: resolve(__dirname, 'docs/api/types/index.html'),
        docsGuideAi: resolve(__dirname, 'docs/guides/ai/index.html'),
        docsGuideRepo: resolve(__dirname, 'docs/guides/repo/index.html'),
        docsGuideStyling: resolve(__dirname, 'docs/guides/styling/index.html'),
      },
    },
  },
  server: {
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()
        const [path, query] = req.url.split('?')
        if (!path.startsWith('/docs')) return next()
        if (path.endsWith('/')) return next()
        if (path.includes('.')) return next()
        res.statusCode = 302
        res.setHeader('Location', `${path}/${query ? `?${query}` : ''}`)
        res.end()
      })
    },
  },
})
