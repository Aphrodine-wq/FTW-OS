/**
 * Monaco Editor Configuration for Electron
 * Monaco Editor is now loaded from CDN (externalized) to prevent bundling issues
 */

// Initialize Monaco Editor - now uses global window.monaco from CDN
let monacoInitialized = false
let monacoInitPromise: Promise<void> | null = null

export async function initializeMonaco(): Promise<void> {
  if (monacoInitialized) {
    return Promise.resolve()
  }
  
  if (monacoInitPromise) {
    return monacoInitPromise
  }
  
  monacoInitPromise = (async () => {
    try {
      console.log('[Monaco] Starting initialization from CDN...')
      
      // CRITICAL: Monaco is now loaded from CDN in index.html
      // Wait for it to be available globally as window.monaco
      let attempts = 0
      const maxAttempts = 50 // 5 seconds max wait
      
      while (attempts < maxAttempts) {
        if (typeof window !== 'undefined' && (window as any).monaco) {
          const monaco = (window as any).monaco
          
          // Verify Monaco is properly loaded
          if (monaco && monaco.editor && typeof monaco.editor.create === 'function') {
            console.log('[Monaco] Loaded from CDN, editor API available:', !!monaco.editor)
            monacoInitialized = true
            return
          }
        }
        
        // Wait a bit before checking again
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      
      throw new Error('Monaco Editor not available from CDN after waiting')
      
      // Worker configuration is handled by CDN loader in index.html
      // The CDN loader automatically configures workers
      console.log('[Monaco] Worker configuration handled by CDN loader')
      
      // Double-check that Monaco is available after init
      const monaco = (window as any).monaco
      if (!monaco || !monaco.editor || typeof monaco.editor.create !== 'function') {
        throw new Error('Monaco Editor not properly loaded from CDN - create function not available')
      }
      
      monacoInitialized = true
      console.log('[Monaco] Initialization completed successfully from CDN')
    } catch (error) {
      console.error('[Monaco] Initialization failed:', error)
      monacoInitialized = false
      // Re-throw so components know initialization failed
      throw error
    }
  })()
  
  return monacoInitPromise
}

// CRITICAL: Do NOT auto-initialize on module load
// This can cause circular dependency issues and initialization order problems
// Monaco should be initialized explicitly when needed, not automatically
// Auto-initialization is disabled to prevent "Cannot access before initialization" errors
// if (typeof window !== 'undefined') {
//   // Initialize Monaco early, but don't block
//   initializeMonaco().catch((error) => {
//     console.warn('Monaco Editor pre-initialization failed:', error)
//   })
// }

/**
 * Verify that Monaco Editor is fully initialized and ready to use
 * @returns true if Monaco is ready, false otherwise
 */
export function isMonacoReady(): boolean {
  if (!monacoInitialized) {
    return false
  }
  
  // Double-check that Monaco is actually available
  try {
    if (typeof window !== 'undefined' && (window as any).monaco) {
      const monaco = (window as any).monaco
      return !!(monaco.editor && typeof monaco.editor.create === 'function')
    }
  } catch (error) {
    console.warn('[Monaco] Verification check failed:', error)
    return false
  }
  
  return false
}

/**
 * Wait for Monaco to be ready with a timeout
 * @param timeoutMs Maximum time to wait in milliseconds (default: 10000)
 * @returns Promise that resolves when Monaco is ready or rejects on timeout
 */
export async function waitForMonaco(timeoutMs: number = 10000): Promise<void> {
  const startTime = Date.now()
  
  while (!isMonacoReady()) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Monaco Editor not ready after ${timeoutMs}ms`)
    }
    
    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // If initialization hasn't started, trigger it
    if (!monacoInitPromise) {
      initializeMonaco().catch(() => {
        // Ignore errors here, we'll check again
      })
    }
  }
}

export { monacoInitialized }

