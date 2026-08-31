import { existsSync } from 'fs'
import { join } from 'path'
import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { routes } from './scripts/route-data.mjs'

/* `vite preview` rewrites every extensionless path to index.html without
   looking at the filesystem first, so the per-route documents written by
   prerender.mjs were invisible locally — preview showed the landing
   page's title on every URL while the deployed site showed the right
   one. Vercel and Netlify both check the filesystem before their SPA
   rewrite; this makes preview do the same, so what you read locally is
   what a crawler is served. */
const previewStatic = (): PluginOption => ({
  name: 'preview-directory-index',
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      const path = (req.url ?? '/').split('?')[0]
      const candidate = join('dist', path, 'index.html')
      if (path !== '/' && existsSync(candidate)) {
        // Hand the middleware chain the concrete file, so vite's own
        // static handler serves it before the SPA fallback is reached.
        req.url = join(path, 'index.html')
      }
      next()
    })
  },
})

/* How many projects, apps and games exist, counted at build time.
   The landing page's Explore rows show these numbers; importing the
   data modules to derive them at runtime would pull ~60 kB of project,
   app and game copy into the landing chunk to render three integers.
   As defines they are substituted into the bundle as literals and cost
   nothing — and they cannot drift, because the same reader also builds
   the sitemap. */
const { projects, apps, games, appColors } = routes()

export default defineConfig({
  define: {
    __COUNT_WORK__: projects.length,
    __COUNT_APPS__: apps.length,
    __COUNT_GAMES__: games.length,
    __APP_TINTS__: JSON.stringify(appColors),
  },
  plugins: [react(), previewStatic()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — always needed
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation libraries — large, split from app code
          'vendor-motion': ['motion/react'],
          'vendor-gsap':   ['gsap', '@gsap/react'],
        },
      },
    },
    // Smaller inline threshold — keep critical CSS inline
    cssCodeSplit: true,
  },
})
