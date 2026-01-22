import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// CRITICAL: Make React available globally before any chunks load
// This ensures React is available to all chunks, preventing "React is undefined" errors
// This is a fallback in case chunk loading order issues occur
if (typeof window !== 'undefined') {
  // Making React available globally for chunk compatibility
  window.React = React
  // Also make ReactDOM available for components that might need it
  window.ReactDOM = ReactDOM
}

import { logger } from '@/lib/logger'

// Debug logging
logger.debug('[React] Initializing app...')
logger.debug('[React] Root element:', { element: document.getElementById('root') })

// Fallback App Component - Works even if main app fails
const FallbackApp = ({ error }: { error: Error }) => {
  const [retryCount, setRetryCount] = React.useState(0)

  const handleRetry = () => {
    setRetryCount(c => c + 1)
    // Clear any cached state that might be causing issues
    try {
      sessionStorage.clear()
      // Don't clear localStorage as it has user data
    } catch (e) {
      logger.error('Failed to clear session storage', e)
    }
    window.location.reload()
  }

  const handleClearAndRetry = () => {
    try {
      sessionStorage.clear()
      localStorage.removeItem('auth-storage')
      localStorage.removeItem('fairtrade-widgets-v5')
      localStorage.removeItem('ftw-theme-storage')
    } catch (e) {
      logger.error('Failed to clear storage', e)
    }
    window.location.reload()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '36px'
          }}>
            ⚠️
          </div>
          <h1 style={{
            color: '#fff',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 12px'
          }}>
            Initialization Error
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '14px',
            margin: 0,
            lineHeight: '1.6'
          }}>
            The application encountered an error during startup.
            This is usually caused by a temporary glitch.
          </p>
        </div>

        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{
            color: '#fca5a5',
            fontSize: '12px',
            fontFamily: 'monospace',
            margin: 0,
            wordBreak: 'break-word'
          }}>
            {error.message}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleRetry}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.4)'
            }}
          >
            🔄 Retry Loading
          </button>

          <button
            onClick={handleClearAndRetry}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
          >
            🧹 Clear Cache & Retry
          </button>
        </div>

        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '11px',
          textAlign: 'center',
          marginTop: '24px'
        }}>
          If the problem persists, try restarting the application.
        </p>
      </div>
    </div>
  )
}

async function init() {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    logger.error('[React] Root element not found')
    return
  }

  logger.debug('[React] Creating root...')
  const root = ReactDOM.createRoot(rootElement)

  try {
    // CRITICAL: Defer Monaco Editor initialization to prevent circular dependency issues
    // Monaco initialization is now deferred until actually needed by components
    // This prevents "Cannot access before initialization" errors
    // Components that need Monaco should call initializeMonaco() explicitly
    // import('@/lib/monaco-config').then(({ initializeMonaco }) => {
    //   initializeMonaco().catch((error) => {
    //     logger.warn('[React] Monaco Editor pre-initialization failed (non-critical)', error)
    //   })
    // }).catch(() => {
    //   // Ignore if Monaco config fails to load
    // })

    // Dynamic import QueryClient first (no dependencies)
    logger.debug('[React] Importing QueryClient...')
    const { queryClient } = await import('@/lib/query-client')
    const { QueryClientProvider } = await import('@tanstack/react-query')

    // Dynamic import ErrorBoundary
    logger.debug('[React] Importing ErrorBoundary...')
    const { ErrorBoundary } = await import('@/components/ErrorBoundary')

    // Dynamic import App with retry logic
    logger.debug('[React] Importing App...')
    let AppWithSplash: React.ComponentType

    try {
      const appModule = await import('./AppWithSplash')
      AppWithSplash = appModule.AppWithSplash
    } catch (appError) {
      logger.error('[React] Failed to import AppWithSplash', appError)
      // Try importing a simpler version
      try {
        const { App } = await import('./App')
        AppWithSplash = App
      } catch (fallbackError) {
        logger.error('[React] Failed to import App', fallbackError)
        const errorToThrow = appError instanceof Error ? appError : new Error(String(appError))
        throw errorToThrow // Re-throw original error
      }
    }

    logger.debug('[React] Rendering...')
    root.render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AppWithSplash />
        </ErrorBoundary>
      </QueryClientProvider>
    )

    logger.debug('[React] App rendered successfully')
  } catch (error) {
    logger.error('[React] Fatal error', error)

    // Render fallback UI
    const errorObj = error instanceof Error ? error : new Error(String(error))
    root.render(<FallbackApp error={errorObj} />)
  }
}

init()

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration)
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error)
      })
  })
}

// Remove loading screen if it exists from Electron
postMessage({ payload: 'removeLoading' }, '*')
