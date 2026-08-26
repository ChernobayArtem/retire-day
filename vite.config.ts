import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

const colorTokenSource = [
  './src/ui/tokens/color-primitives.css',
  './src/ui/tokens/color-aliases.css',
  './src/ui/tokens/color-semantic.css',
]
  .map((file) => readFileSync(new URL(file, import.meta.url), 'utf8'))
  .join('\n')

function resolveColorToken(name: string, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`Circular color token reference: ${name}`)
  seen.add(name)

  const match = colorTokenSource.match(new RegExp(`${name}:\\s*([^;]+);`))
  if (!match) throw new Error(`Missing color token: ${name}`)

  const value = match[1].trim()
  const reference = value.match(/^var\((--[\w-]+)\)$/)
  return reference ? resolveColorToken(reference[1], seen) : value
}

const pwaThemeColor = resolveColorToken('--color-alias-platform-theme')
const pwaBackgroundColor = resolveColorToken('--color-alias-platform-background')

const colorTokenHtmlPlugin = {
  name: 'color-token-html',
  transformIndexHtml(html: string) {
    return html.replace('__APP_THEME_COLOR__', pwaThemeColor)
  },
}

// Keep the existing GitHub Pages path stable so an installed PWA can update.
// The product brand is "ридэй"; /retire-day/ is a technical compatibility URL.
export default defineConfig({
  base: '/retire-day/',
  build: {
    // Never inline font files. A subset small enough to be base64'd into the CSS
    // (cyrillic-ext is ~2 KB) would defeat its own unicode-range: every visitor
    // would download glyphs almost none of them render, inside the render-blocking
    // stylesheet, with no separate cache entry. Keep all four subsets as files.
    assetsInlineLimit: (filePath) => (filePath.endsWith('.woff2') ? false : undefined),
  },
  plugins: [
    colorTokenHtmlPlugin,
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registration is done by hand in main.tsx so a new build can reload itself.
      injectRegister: null,
      // All public assets are already covered by workbox.globPatterns below.
      // Do not add manifest icons a second time to the precache manifest.
      includeManifestIcons: false,
      manifest: {
        name: 'ридэй',
        short_name: 'ридэй',
        description: 'Наш отсчёт',
        lang: 'ru',
        dir: 'ltr',
        theme_color: pwaThemeColor,
        background_color: pwaBackgroundColor,
        display: 'standalone',
        orientation: 'portrait',
        scope: '/retire-day/',
        start_url: '/retire-day/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,woff,woff2,mp4,webm,mov,json,bin}'],
        // Media blobs (now including several MB of video) are deliberately kept
        // OUT of the precache: the service worker has to fetch every precached
        // file before it can activate, and a fat precache is exactly what stalled
        // updates on the phone. They are served by the runtime cache below —
        // fetched on first view, then available offline.
        globIgnores: ['**/vault/media/*.bin'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/vault/media/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'vault-media',
              // ciphertext is content-addressed, so a cached blob is never stale
              // Keep the complete current vault (69 items) plus enough room for
              // future days without evicting early memories from offline use.
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 180 },
              cacheableResponse: { statuses: [0, 200] },
              rangeRequests: true, // Safari seeks video with Range requests
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
})
