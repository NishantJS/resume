import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
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
