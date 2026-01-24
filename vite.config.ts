import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable fast refresh with better error overlay
      fastRefresh: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Ensure qs is resolved correctly
    dedupe: ['qs', 'react', 'react-dom', 'zustand'],
  },
  optimizeDeps: {
    include: [
      'react-grid-layout',
      'react-resizable',
      'react',
      'react-dom',
      'react/jsx-runtime',
      'qs', // Ensure qs library is pre-bundled (used by react-query and other libs)
      'zustand',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      'framer-motion',
    ],
    // Don't pre-bundle Monaco Editor - it needs to load dynamically
    exclude: ['monaco-editor', '@monaco-editor/react'],
    // Force consistent module IDs for better caching
    esbuildOptions: {
      target: 'esnext',
    },
  },
  base: './', // Important for Electron to load assets
  build: {
    outDir: 'dist_build',
    sourcemap: 'hidden', // Hidden source maps for production debugging without exposing sources
    minify: 'esbuild', // Faster minification
    target: 'esnext',
    chunkSizeWarningLimit: 500, // Lower limit for better splitting
    modulePreload: {
      // Enable module preloading for faster navigation
      polyfill: true,
    },
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
        // Optimized chunk splitting strategy for enterprise apps
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Critical path: React ecosystem - must load first
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react'
            }
            // State management - load early
            if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
              return 'vendor-state'
            }
            // UI framework essentials - load early
            if (id.includes('@radix-ui') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'vendor-ui'
            }
            // Animation library - used throughout
            if (id.includes('framer-motion')) {
              return 'vendor-animation'
            }
            // Icons - used throughout
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            // Backend/Auth - can load slightly deferred
            if (id.includes('@supabase/supabase-js')) {
              return 'vendor-supabase'
            }
            // Heavy document generation libraries - lazy load
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf'
            }
            if (id.includes('docx')) {
              return 'vendor-docx'
            }
            if (id.includes('exceljs')) {
              return 'vendor-excel'
            }
            // Terminal emulation - lazy load
            if (id.includes('xterm')) {
              return 'vendor-terminal'
            }
            // Charts - lazy load
            if (id.includes('recharts')) {
              return 'vendor-charts'
            }
            // Calendar - lazy load
            if (id.includes('react-big-calendar') || id.includes('moment')) {
              return 'vendor-calendar'
            }
            // Grid layout - lazy load
            if (id.includes('react-grid-layout') || id.includes('react-resizable')) {
              return 'vendor-grid'
            }
            // Monaco Editor is externalized, but just in case
            if (id.includes('monaco-editor')) {
              return 'vendor-monaco'
            }
            // Remaining vendor code
            return 'vendor-misc'
          }

          // Application code splitting by feature domain
          if (id.includes('/src/components/modules/finance/')) {
            return 'app-finance'
          }
          if (id.includes('/src/components/modules/productivity/')) {
            return 'app-productivity'
          }
          if (id.includes('/src/components/modules/crm/')) {
            return 'app-crm'
          }
          if (id.includes('/src/components/modules/automation/')) {
            return 'app-automation'
          }
          if (id.includes('/src/components/modules/infra/')) {
            return 'app-infra'
          }
          if (id.includes('/src/components/modules/marketing/')) {
            return 'app-marketing'
          }
          if (id.includes('/src/lib/lazy-modules')) {
            return 'lib-lazy-modules'
          }
        },
        // Better file naming with hashes for long-term caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: (chunkInfo) => {
          // Prioritize chunks for preloading hints
          const priorityChunks = ['vendor-react', 'vendor-state', 'vendor-ui']
          if (priorityChunks.some(p => chunkInfo.name?.includes(p))) {
            return 'assets/priority/[name]-[hash].js'
          }
          return 'assets/[name]-[hash].js'
        },
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
