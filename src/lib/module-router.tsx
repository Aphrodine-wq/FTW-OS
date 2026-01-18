/**
 * Module Router Component
 * Handles routing and rendering of application modules with preloading
 */

import React, { Suspense, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { getModuleName } from './module-config'
import { preloadModule, prefetchModule, getModuleImport } from './module-preloader'
// Use dynamic imports instead of static import to avoid warnings
// LazyModules will be loaded dynamically via module-preloader

// Loading Component
const PageLoader = ({ module }: { module?: string }) => (
  <div className="h-full w-full flex flex-col items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
    <p className="text-sm text-muted-foreground">
      {module ? `Loading ${module}...` : 'Loading...'}
    </p>
  </div>
)

interface ModuleRouterProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

/**
 * Module Router Component
 * Renders the appropriate module based on activeTab
 */
export const ModuleRouter: React.FC<ModuleRouterProps> = ({ activeTab, setActiveTab }) => {
  const moduleName = getModuleName(activeTab)

  // Preload the active module immediately
  useEffect(() => {
    preloadModule(activeTab)
  }, [activeTab])

  // Dynamically load module components to avoid static import of lazy-modules
  const [ModuleComponent, setModuleComponent] = React.useState<React.LazyExoticComponent<any> | null>(null)
  
  useEffect(() => {
    const loadModule = async () => {
      const moduleImport = getModuleImport(activeTab)
      if (!moduleImport) {
        // Fallback to dashboard
        const dashboardImport = getModuleImport('dashboard')
        if (dashboardImport) {
          const module = await dashboardImport()
          setModuleComponent(() => module) // module is already a React.lazy component
          return
        }
        setModuleComponent(null)
        return
      }
      // Import the module - it returns a React.lazy component directly
      const module = await moduleImport()
      setModuleComponent(() => module) // module is already a React.lazy component
    }
    loadModule()
  }, [activeTab])
  
  if (!ModuleComponent) {
    return <PageLoader module={moduleName} />
  }
  
  return (
    <Suspense fallback={<PageLoader module={moduleName} />}>
      <ModuleComponent setActiveTab={setActiveTab} />
    </Suspense>
  )
}

