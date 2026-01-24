import React, { useState, Suspense, useEffect, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import '@/styles/themes.css'

// Lazy load ErrorBoundary to avoid circular deps
const ErrorBoundary = lazy(() => import('@/components/ErrorBoundary').then(m => ({ default: m.ErrorBoundary })))
import { Toaster } from 'sonner'
import OnboardingContainer from '@/components/onboarding/OnboardingContainer'
import { useOnboardingStore } from '@/stores/onboarding-store'

// Import extracted modules
import { ModuleRouter } from '@/lib/module-router'
import { useStoreInitialization } from '@/hooks/useStoreInitialization'
import { useTheme } from '@/hooks/useTheme'
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '@/hooks/useKeyboardShortcuts'
import { useFocusMode } from '@/hooks/useFocusMode'
// Lazy load layout components to avoid static import of lazy-modules
const PhotonNav = React.lazy(() => import('@/components/layout/PhotonNav').then(m => ({ default: m.PhotonNav })))
const CommandPalette = React.lazy(() => import('@/components/layout/CommandPalette').then(m => ({ default: m.CommandPalette })))
const TitleBar = React.lazy(() => import('@/components/ui/title-bar').then(m => ({ default: m.TitleBar })))
// Lazy load secondary layout components for better initial load performance
const NotificationCenter = React.lazy(() => import('@/components/layout/NotificationCenter').then(m => ({ default: m.NotificationCenter })))
const QuickCapture = React.lazy(() => import('@/components/workflow/QuickCapture').then(m => ({ default: m.QuickCapture })))
const ContextSidebar = React.lazy(() => import('@/components/layout/ContextSidebar').then(m => ({ default: m.ContextSidebar })))
const KeyboardShortcutsHelp = React.lazy(() => import('@/components/layout/KeyboardShortcutsHelp').then(m => ({ default: m.KeyboardShortcutsHelp })))
import { initializePreloading } from '@/lib/module-preloader'
// Lazy load workflow engine
type WorkflowEngine = {
  initialize: () => void
  cleanup: () => void
}

let workflowEngine: WorkflowEngine | null = null
const loadWorkflowEngine = async (): Promise<WorkflowEngine> => {
  if (!workflowEngine) {
    const { workflowEngine: engine } = await import('@/services/workflow-engine')
    workflowEngine = engine
  }
  return workflowEngine
}

// Inner App Component - Only rendered after stores are ready
const AppInner = ({ storeState }: { storeState: NonNullable<ReturnType<typeof useStoreInitialization>['storeState']> }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [cmdOpen, setCmdOpen] = useState(false)
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false)
  const [contextSidebarOpen, setContextSidebarOpen] = useState(true)
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)

  const { focusMode, toggleFocus } = useFocusMode()

  // Initialize workflow engine (lazy loaded)
  useEffect(() => {
    let mounted = true
    loadWorkflowEngine().then((engine) => {
      if (mounted) {
        engine.initialize()
      }
    })
    return () => {
      mounted = false
      if (workflowEngine) {
        workflowEngine.cleanup()
      }
    }
  }, [])

  const {
    loadSettings,
    mode,
    initializeListener,
    loadAllKeys
  } = storeState

  // Use theme hook
  const { themeClassName, themeStyle } = useTheme({
    mode
  })

  // Initialize auth listener
  useEffect(() => {
    const cleanup = initializeListener()
    return () => { if (cleanup) cleanup() }
  }, [initializeListener])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
    loadAllKeys()
    // Initialize module preloading after stores are ready
    initializePreloading()
    // Defer performance monitoring initialization to idle time
    const initPerformance = () => {
      import('@/services/performance-service').then(({ performanceService }) => {
        performanceService.initialize()
      })
    }
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number }).requestIdleCallback(initPerformance, { timeout: 5000 })
    } else {
      setTimeout(initPerformance, 3000)
    }
  }, [loadSettings, loadAllKeys])

  // Navigation handled via event listener below
  useEffect(() => {
    const eventName = 'navigate-to-tab' as keyof WindowEventMap
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) setActiveTab(customEvent.detail)
    }
    window.addEventListener(eventName, handler)
    return () => window.removeEventListener(eventName, handler)
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: COMMON_SHORTCUTS.commandPalette.key,
      meta: true,
      action: () => setCmdOpen(!cmdOpen)
    },
    {
      key: COMMON_SHORTCUTS.navigateDashboard.key,
      meta: true,
      shift: true,
      action: () => setActiveTab('dashboard')
    },
    {
      key: COMMON_SHORTCUTS.navigateFinance.key,
      meta: true,
      shift: true,
      action: () => setActiveTab('finance')
    },
    {
      key: COMMON_SHORTCUTS.navigateTasks.key,
      meta: true,
      shift: true,
      action: () => setActiveTab('tasks')
    }
  ])

  // Auth removed - skip login screen
  /*
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-slate-950"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
        <LoginScreen />
      </Suspense>
    )
  }
  */

  return (
    <div
      className={themeClassName}
      style={themeStyle}
    >
      <Suspense fallback={<div className="h-10 w-full bg-transparent" />}>
        <TitleBar
          onCommandPaletteOpen={() => setCmdOpen(true)}
          onFocusModeToggle={toggleFocus}
          focusMode={focusMode}
          onSettingsOpen={() => setActiveTab('settings')}
        />
      </Suspense>

      <div className="flex flex-1 overflow-hidden">
        {!focusMode && (
          <Suspense fallback={null}>
            <PhotonNav activeTab={activeTab} setActiveTab={setActiveTab} setCmdOpen={setCmdOpen} />
          </Suspense>
        )}

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-[1600px] mx-auto h-full">
            <ModuleRouter activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </main>

        {!focusMode && contextSidebarOpen && (
          <Suspense fallback={null}>
            <ContextSidebar
              activeTab={activeTab}
              onNewTask={() => setQuickCaptureOpen(true)}
              onNewInvoice={() => { }}
              onNewExpense={() => setQuickCaptureOpen(true)}
              onViewCalendar={() => setActiveTab('calendar')}
              onClose={() => setContextSidebarOpen(false)}
            />
          </Suspense>
        )}
      </div>

      <Suspense fallback={null}>
        <Toaster position="bottom-right" theme={mode === 'dark' ? 'dark' : 'light'} />
        <CommandPalette
          onNavigate={setActiveTab}
          open={cmdOpen}
          setOpen={setCmdOpen}
          setQuickCaptureOpen={setQuickCaptureOpen}
        />
        <QuickCapture open={quickCaptureOpen} onOpenChange={setQuickCaptureOpen} />
        <NotificationCenter />
        <KeyboardShortcutsHelp open={shortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen} />
      </Suspense>
    </div>
  )
}

// Main App Component - Handles store initialization
export function App() {
  // Gate onboarding flow on first run; if onboarding not completed, render the onboarding experience
  const onboardingCompleted = useOnboardingStore((s) => s.completed)
  if (!onboardingCompleted) {
    return (
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-slate-950"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
        <OnboardingContainer />
      </Suspense>
    )
  }
  const { storesReady, storeError, storeState } = useStoreInitialization()

  // Loading state
  if (!storesReady) {
    if (storeError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
          <div className="text-center p-8">
            <div className="text-red-500 text-xl mb-4">Failed to initialize</div>
            <div className="text-slate-400 text-sm mb-4">{storeError.message}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  // Render inner app once stores are ready
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-slate-950"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
      <ErrorBoundary>
        <AppInner storeState={storeState} />
      </ErrorBoundary>
    </Suspense>
  )
}

export default App
