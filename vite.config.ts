import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['react-grid-layout', 'react-resizable'],
  },
  base: './', // Important for Electron to load assets
  build: {
    outDir: 'dist_build',
    sourcemap: false, // Disable source maps in production
    minify: 'esbuild', // Faster minification
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': [
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-slider',
            '@radix-ui/react-toast',
            'framer-motion'
          ],
          'vendor-data': [
            'zustand',
            '@supabase/supabase-js',
            'date-fns',
            'lodash'
          ],
          'vendor-charts': ['recharts', 'react-grid-layout'],
          'vendor-export': ['jspdf', 'docx', 'html2canvas', 'papaparse']
        },
        // Better file naming with hashes for caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    cssCodeSplit: true, // Split CSS by chunk
    reportCompressedSize: false // Faster build
  },
  esbuild: {
    drop: ['console', 'debugger'], // Remove console logs in production
    legalComments: 'none'
  }
})
