import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppWithSplash } from './AppWithSplash'
import './index.css'

// Debug logging
console.log('[React] Initializing app...')
console.log('[React] Root element:', document.getElementById('root'))

// Initialize app
try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  console.log('[React] Creating root...')
  const root = ReactDOM.createRoot(rootElement)

  console.log('[React] Rendering App component with splash screen...')
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AppWithSplash />
      </ErrorBoundary>
    </React.StrictMode>
  )

  console.log('[React] App rendered successfully')
} catch (error) {
  console.error('[React] Fatal error:', error)
  // Fallback error display
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;">
      <h1>Failed to load application</h1>
      <p>${error instanceof Error ? error.message : String(error)}</p>
    </div>`
  }
}

// Remove loading screen
postMessage({ payload: 'removeLoading' }, '*')
