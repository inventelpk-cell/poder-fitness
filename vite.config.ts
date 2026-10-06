import { copyFileSync, cpSync, createReadStream, existsSync, mkdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import pool from './data/exercises/plan-pool.es.json'

function contentType(file: string): string {
  if (file.endsWith('.webp')) return 'image/webp'
  if (file.endsWith('.json')) return 'application/json'
  if (file.endsWith('.svg')) return 'image/svg+xml'
  if (file.endsWith('.md')) return 'text/markdown; charset=utf-8'
  if (file.endsWith('.txt')) return 'text/plain; charset=utf-8'
  return 'application/octet-stream'
}

function exercisesPlugin(): Plugin {
  const root = path.resolve('data/exercises')
  return {
    name: 'poder-exercises',
    configureServer(server) {
      server.middlewares.use('/exercises', (req, res, next) => {
        const url = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/')
        const file = path.normalize(path.join(root, url))
        if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
          next()
          return
        }
        res.setHeader('Content-Type', contentType(file))
        createReadStream(file).pipe(res)
      })
    },
    closeBundle() {
      const dest = path.resolve('dist/exercises')
      if (existsSync(root)) cpSync(root, dest, { recursive: true })
      const index = path.resolve('dist/index.html')
      if (existsSync(index)) copyFileSync(index, path.resolve('dist/404.html'))
    },
  }
}

function poolImageEntries() {
  const entries: { url: string; revision: string }[] = []
  for (const exercise of pool) {
    for (const frame of ['0', '1']) {
      const file = path.resolve('data/exercises/images', exercise.id, `${frame}.webp`)
      if (!existsSync(file)) continue
      const hash = createHash('sha1').update(String(statSync(file).mtimeMs)).digest('hex').slice(0, 8)
      entries.push({ url: `exercises/images/${exercise.id}/${frame}.webp`, revision: hash })
    }
  }
  return entries
}

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [
    react(),
    tailwindcss(),
    exercisesPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand/favicon.svg', 'brand/apple-touch-180.png', 'brand/logo.svg', 'brand/logo-mark.svg'],
      manifest: {
        name: 'Poder Fitness',
        short_name: 'Poder',
        description: 'Cuaderno de entreno personal, en el navegador.',
        start_url: '/',
        display: 'standalone',
        background_color: '#090B10',
        theme_color: '#090B10',
        lang: 'es',
        icons: [
          { src: 'brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'brand/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,webp,txt,md}'],
        globIgnores: ['**/exercises/images/**', '**/exercises/scripts/**'],
        additionalManifestEntries: poolImageEntries(),
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/exercises\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/exercises/images/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'poder-exercise-images',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173, host: '127.0.0.1' },
  preview: { port: 4173, host: '127.0.0.1' },
})
