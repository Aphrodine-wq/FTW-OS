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
        // Simplified chunk splitting - prioritize stability over granular splitting
        // Group related dependencies together to avoid cross-chunk issues
        // Enhanced with getModuleInfo to detect transitive React dependencies
        manualChunks: (id, { getModuleInfo }) => {
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
            
            // Bundle ALL React ecosystem together to avoid "React is undefined" errors
            // This includes react, react-dom, scheduler, react-query, and ALL React-dependent libraries
            // IMPORTANT: All libraries that use React must be in this chunk
            // This comprehensive check ensures no React-dependent code ends up in vendor-other
            
            // Direct React dependencies
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('scheduler') ||
                id.includes('@tanstack') ||
                id.includes('@radix-ui') ||  // Radix UI depends on React
                id.includes('framer-motion') ||  // framer-motion depends on React
                id.includes('lucide-react') ||  // lucide-react depends on React
                id.includes('react-grid-layout') ||  // react-grid-layout depends on React
                id.includes('react-resizable') ||  // react-resizable depends on React
                id.includes('react-markdown') ||  // react-markdown depends on React
                id.includes('react-big-calendar') ||  // react-big-calendar depends on React
                id.includes('@hello-pangea/dnd') ||  // drag and drop depends on React
                id.includes('@monaco-editor/react') ||  // Monaco React wrapper depends on React
                id.includes('recharts') ||  // recharts depends on React
                id.includes('cmdk') ||  // cmdk may have React dependencies
                id.includes('tailwindcss-animate') ||  // tailwindcss-animate may be used with React
                isQs) {
              return 'vendor-react'
            }
            
            // Check for any library that might transitively depend on React
            // This catches libraries that import from 'react' but don't have 'react' in their name
            // We check the path structure to identify node_modules packages
            const nodeModulesIndex = id.indexOf('node_modules')
            if (nodeModulesIndex > -1) {
              const afterNodeModules = id.substring(nodeModulesIndex + 'node_modules'.length)
              const packagePath = afterNodeModules.split(/[\/\\]/).filter(Boolean)
              
              // Check if this package might have React as a peer dependency
              // Common patterns: UI libraries, component libraries, etc.
              // We'll be conservative and include anything that looks like it might use React
              const suspiciousPackages = [
                'cmdk', 'vaul', 'sonner', 'embla', 'ariakit', 
                'headlessui', 'react-aria', 'react-stately'
              ]
              
              if (packagePath.length > 0 && suspiciousPackages.some(pkg => packagePath[0] === pkg)) {
                return 'vendor-react'
              }
              
              // Check if this module imports from React by examining its dependencies
              // This catches transitive dependencies that use React
              try {
                const moduleInfo = getModuleInfo(id)
                if (moduleInfo) {
                  // Check if this module's importedIds include React
                  const importedIds = moduleInfo.importedIds || []
                  const hasReactImport = importedIds.some(importId => 
                    importId.includes('react') || 
                    importId.includes('react-dom') ||
                    importId.includes('react/jsx-runtime')
                  )
                  
                  if (hasReactImport) {
                    return 'vendor-react'
                  }
                }
              } catch (e) {
                // If we can't get module info, continue with normal logic
              }
            }
            
            // Monaco Editor is now externalized - loaded from CDN
            // No need to bundle it, which prevents initialization order issues
            // Skip Monaco in chunk splitting since it's external
            
            // Heavy libraries - separate chunks
            if (id.includes('puppeteer')) {
              return 'vendor-puppeteer'
            }
            // react-grid-layout and react-resizable are now in vendor-react
            
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
            
            // Markdown/Content (react-markdown is now in vendor-react)
            if (id.includes('dompurify')) {
              return 'vendor-markdown'
            }
            
            // react-big-calendar, @hello-pangea/dnd, and cmdk are now in vendor-react
            
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
