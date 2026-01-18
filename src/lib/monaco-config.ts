/**
 * Monaco Editor Configuration for Electron
 * Ensures Monaco Editor loads correctly in Electron environment
 */

// Initialize Monaco Editor loader early
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
      console.log('[Monaco] Starting initialization...')
      
      // CRITICAL: Load monaco-editor core FIRST and ensure it's available globally
      // The React wrapper depends on the global `monaco` object being available
      const monacoCore = await import('monaco-editor')
      
      // Verify core is loaded
      if (!monacoCore || !monacoCore.editor) {
        throw new Error('Monaco Editor core failed to load - editor object not available')
      }
      
      // Make Monaco available globally (some libraries expect this)
      if (typeof window !== 'undefined' && !(window as any).monaco) {
        (window as any).monaco = monacoCore
      }
      
      console.log('[Monaco] Core loaded, editor API available:', !!monacoCore.editor)
      
      // Configure Monaco workers directly - NO React wrapper needed
      const isElectron = typeof window !== 'undefined' && window.process?.type === 'renderer'
      
      if (isElectron) {
        // For Electron, configure worker paths using MonacoEnvironment
        const currentPath = window.location.pathname
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'))
        
        // Use CDN for workers in Electron (most reliable)
        const workerPath = 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs'
        console.log('[Monaco] Configuring Electron worker path (CDN):', workerPath)
        
        // Set up Monaco environment for workers
        ;(self as any).MonacoEnvironment = {
          getWorkerUrl: function (_moduleId: string, label: string) {
            if (label === 'json') {
              return `${workerPath}/worker/json.worker.js`
            }
            if (label === 'css' || label === 'scss' || label === 'less') {
              return `${workerPath}/worker/css.worker.js`
            }
            if (label === 'html' || label === 'handlebars' || label === 'razor') {
              return `${workerPath}/worker/html.worker.js`
            }
            if (label === 'typescript' || label === 'javascript') {
              return `${workerPath}/worker/ts.worker.js`
            }
            return `${workerPath}/worker/editor.worker.js`
          }
        }
      } else {
        // For web development - use local workers
        const workerPath = '/node_modules/monaco-editor/min/vs'
        ;(self as any).MonacoEnvironment = {
          getWorkerUrl: function (_moduleId: string, label: string) {
            if (label === 'json') {
              return `${workerPath}/worker/json.worker.js`
            }
            if (label === 'css' || label === 'scss' || label === 'less') {
              return `${workerPath}/worker/css.worker.js`
            }
            if (label === 'html' || label === 'handlebars' || label === 'razor') {
              return `${workerPath}/worker/html.worker.js`
            }
            if (label === 'typescript' || label === 'javascript') {
              return `${workerPath}/worker/ts.worker.js`
            }
            return `${workerPath}/worker/editor.worker.js`
          }
        }
      }
      
      console.log('[Monaco] Worker configuration complete')
      
      // Double-check that Monaco is available after init
      if (!monacoCore.editor || typeof monacoCore.editor.create !== 'function') {
        throw new Error('Monaco Editor core not properly initialized - create function not available')
      }
      
      monacoInitialized = true
      console.log('[Monaco] Initialization completed successfully')
    } catch (error) {
      console.error('[Monaco] Initialization failed:', error)
      monacoInitialized = false
      // Re-throw so components know initialization failed
      throw error
    }
  })()
  
  return monacoInitPromise
}

// Auto-initialize on module load if in browser
if (typeof window !== 'undefined') {
  // Initialize Monaco early, but don't block
  initializeMonaco().catch((error) => {
    console.warn('Monaco Editor pre-initialization failed:', error)
  })
}

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

