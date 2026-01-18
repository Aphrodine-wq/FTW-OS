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
    sourcemap: false, // Disable source maps in production
    minify: 'esbuild', // Faster minification
    target: 'esnext',
    chunkSizeWarningLimit: 500, // Lower limit for better splitting
    rollupOptions: {
      output: {
        // Simplified chunk splitting - prioritize stability over granular splitting
        // Group related dependencies together to avoid cross-chunk issues
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // SIMPLIFIED: Bundle ALL React ecosystem together
            // This includes react, react-dom, scheduler, react-query, qs, and ALL dependencies
            // Check for qs - must match the actual package path structure
            const pathParts = id.split(/[\/\\]/)
            const qsIndex = pathParts.findIndex(part => part === 'qs')
            const isQs = qsIndex > 0 && 
                         pathParts[qsIndex - 1] === 'node_modules' &&
                         !id.includes('qrcode') && 
                         !id.includes('request')
            
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('scheduler') ||
                id.includes('@tanstack') ||
                isQs) {
              return 'vendor-react'
            }
            
            // Monaco Editor - ONLY monaco-editor core
            // We use Monaco directly, NOT the React wrapper (@monaco-editor/react)
            // The React wrapper is not imported anywhere, so it won't be bundled
            if (id.includes('monaco-editor') && !id.includes('@monaco-editor')) {
              return 'vendor-monaco'
            }
            
            // Radix UI - split by component for better caching
            if (id.includes('@radix-ui')) {
              const match = id.match(/@radix-ui\/([^/]+)/)
              if (match) {
                return `vendor-radix-${match[1]}`
              }
              return 'vendor-radix'
            }
            
            // Heavy libraries - separate chunks
            if (id.includes('puppeteer')) {
              return 'vendor-puppeteer'
            }
            
            // UI libraries
            if (id.includes('framer-motion')) {
              return 'vendor-framer'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide'
            }
            if (id.includes('recharts')) {
              return 'vendor-recharts'
            }
            if (id.includes('react-grid-layout') || id.includes('react-resizable')) {
              return 'vendor-grid'
            }
            
            // Data/State management
            if (id.includes('zustand')) {
              return 'vendor-zustand'
            }
            // react-query is already handled above with React
            
            // Supabase - only create chunk if actually used
            if (id.includes('@supabase/supabase-js')) {
              return 'vendor-supabase'
            }
            
            // Export libraries
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf'
            }
            if (id.includes('docx')) {
              return 'vendor-docx'
            }
            if (id.includes('papaparse')) {
              return 'vendor-csv'
            }
            
            // Utilities
            if (id.includes('date-fns') || id.includes('moment')) {
              return 'vendor-dates'
            }
            if (id.includes('lodash')) {
              return 'vendor-lodash'
            }
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'vendor-utils'
            }
            
            // Split remaining vendor code into smaller chunks
            // File system and OS utilities
            if (id.includes('fs-extra') || id.includes('chokidar')) {
              return 'vendor-fs'
            }
            
            // Communication libraries
            if (id.includes('nodemailer') || id.includes('imap-simple') || id.includes('twilio')) {
              return 'vendor-communication'
            }
            
            // Terminal/Shell
            if (id.includes('xterm') || id.includes('node-pty')) {
              return 'vendor-terminal'
            }
            
            // GitHub/API clients
            if (id.includes('@octokit')) {
              return 'vendor-github'
            }
            
            // Markdown/Content
            if (id.includes('react-markdown') || id.includes('dompurify')) {
              return 'vendor-markdown'
            }
            
            // Calendar/Date
            if (id.includes('react-big-calendar')) {
              return 'vendor-calendar'
            }
            
            // Drag and drop
            if (id.includes('@hello-pangea/dnd')) {
              return 'vendor-dnd'
            }
            
            // Command palette
            if (id.includes('cmdk')) {
              return 'vendor-cmdk'
            }
            
            // Excel/Spreadsheet
            if (id.includes('exceljs')) {
              return 'vendor-excel'
            }
            
            // QR Code
            if (id.includes('qrcode')) {
              return 'vendor-qrcode'
            }
            
            // Remaining vendor code - keep together to avoid dependency issues
            // Splitting by filename breaks dependencies between libraries
            return 'vendor-other'
          }
          
          // Split by feature/module category
          if (id.includes('/src/components/modules/')) {
            // Core modules
            if (id.includes('/core/') || id.includes('/dashboard/')) {
              return 'modules-core'
            }
            // Finance modules
            if (id.includes('/finance/')) {
              return 'modules-finance'
            }
            // Productivity modules
            if (id.includes('/productivity/')) {
              return 'modules-productivity'
            }
            // Infrastructure modules
            if (id.includes('/infra/') || id.includes('/automation/')) {
              return 'modules-infra'
            }
            // Knowledge modules
            if (id.includes('/knowledge/')) {
              return 'modules-knowledge'
            }
            // Marketing modules
            if (id.includes('/marketing/')) {
              return 'modules-marketing'
            }
            // Other modules
            return 'modules-other'
          }
          
          // Widgets - split by category
          if (id.includes('/src/components/widgets/')) {
            if (id.includes('/core/')) {
              return 'widgets-core'
            }
            if (id.includes('/api/')) {
              return 'widgets-api'
            }
            if (id.includes('/fun/')) {
              return 'widgets-fun'
            }
            if (id.includes('/finance/')) {
              return 'widgets-finance'
            }
            if (id.includes('/revolutionary/')) {
              return 'widgets-revolutionary'
            }
            return 'widgets-other'
          }
          
          // Services - split to avoid circular deps with stores
          if (id.includes('/src/services/')) {
            // Heavy services in separate chunks
            if (id.includes('workflow-engine') || id.includes('sync-service')) {
              return 'services-heavy'
            }
            return 'services'
          }
          
          // Stores - split to avoid circular deps
          if (id.includes('/src/stores/')) {
            // Core stores that are used everywhere
            if (id.includes('auth-store') || id.includes('theme-store') || id.includes('settings-store')) {
              return 'stores-core'
            }
            return 'stores'
          }
          
          // Lib/utils - split lazy-modules to avoid dynamic/static import conflict
          if (id.includes('/src/lib/')) {
            // lazy-modules should be in its own chunk since it's dynamically imported
            if (id.includes('lazy-modules')) {
              return 'lib-lazy-modules'
            }
            // Other lib files
            return 'lib'
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
    // drop: ['console', 'debugger'], // Keep console logs for debugging white screen issues
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
