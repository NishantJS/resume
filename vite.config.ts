import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { routes } from './scripts/route-data.mjs'

/* How many projects, apps and games exist, counted at build time.
   The landing page's Explore rows show these numbers; importing the
   data modules to derive them at runtime would pull ~60 kB of project,
   app and game copy into the landing chunk to render three integers.
   As defines they are substituted into the bundle as literals and cost
   nothing — and they cannot drift, because the same reader also builds
   the sitemap. */
const { projects, apps, games } = routes()

export default defineConfig({
  define: {
    __COUNT_WORK__: projects.length,
    __COUNT_APPS__: apps.length,
    __COUNT_GAMES__: games.length,
  },
  plugins: [react()],
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
