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
    // Ensure qs is resolved correctly
    dedupe: ['qs'],
  },
  optimizeDeps: {
    include: [
      'react-grid-layout',
      'react-resizable',
      'react',
      'react-dom',
      'react/jsx-runtime',
      'qs' // Ensure qs library is pre-bundled (used by react-query and other libs)
    ],
    // Don't pre-bundle Monaco Editor - it needs to load dynamically
    exclude: ['monaco-editor', '@monaco-editor/react'],
  },
  base: './', // Important for Electron to load assets
  build: {
    outDir: 'dist_build',
    sourcemap: 'hidden', // Hidden source maps for production debugging without exposing sources
    minify: 'esbuild', // Faster minification
    target: 'esnext',
    chunkSizeWarningLimit: 500, // Lower limit for better splitting
    // Ensure Monaco Editor is handled properly - don't break its internal structure
    commonjsOptions: {
      // Monaco Editor uses CommonJS internally - ensure proper handling
      include: [/monaco-editor/, /node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      // Externalize Monaco Editor to prevent bundling issues
      // Monaco will be loaded from CDN instead
      external: ['monaco-editor'],
      output: {
        // Simplified automatic chunk splitting
        // Vite will automatically split based on imports and dependencies
        // Only specify essential manual chunks for critical dependencies
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Heavy libraries that should be separate
            if (id.includes('@supabase/supabase-js')) {
              return 'vendor-supabase'
            }
            if (id.includes('zustand')) {
              return 'vendor-zustand'
            }
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf'
            }
            if (id.includes('docx')) {
              return 'vendor-docx'
            }
            if (id.includes('exceljs')) {
              return 'vendor-excel'
            }
            if (id.includes('xterm')) {
              return 'vendor-terminal'
            }
            // Monaco Editor is externalized, but just in case
            if (id.includes('monaco-editor')) {
              return 'vendor-monaco'
            }

            // Critical: Bundle React and all other vendor code together
            // This prevents "React is undefined" errors from libraries in "vendor-other"
            // trying to access React before it's fully loaded
            return 'vendor-core'
          }

          // Application code - let Vite handle automatic splitting
          if (id.includes('/src/lib/lazy-modules')) {
            return 'lib-lazy-modules'
          }
        },
        // Better file naming with hashes for caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    cssCodeSplit: true, // Split CSS by chunk
    reportCompressedSize: false, // Faster build
    // Enable build caching
    emptyOutDir: true,
    // CSS optimization
    cssMinify: 'esbuild', // Faster CSS minification
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none'
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    'process.env': '{}', // Polyfill process.env for libraries
    'process.platform': JSON.stringify(process.platform),
    'process.versions': JSON.stringify({
      electron: process.versions.electron || 'N/A',
      node: process.versions.node || 'N/A'
    })
  }
})
