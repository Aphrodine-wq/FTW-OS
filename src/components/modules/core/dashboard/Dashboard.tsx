import React, { useMemo, Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { Responsive } from 'react-grid-layout'
import { Plus, LayoutGrid, Trash2, FileText, Receipt, Loader2, X, Search, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Lazy load stores to avoid circular dependencies
let useWidgetStore: any = null
let useThemeStore: any = null
let useWidgetRegistry: any = null

const loadStores = async () => {
  if (!useWidgetStore) {
    const widgetStoreModule = await import('@/stores/widget-store')
    useWidgetStore = widgetStoreModule.useWidgetStore
  }
  if (!useThemeStore) {
    const themeStoreModule = await import('@/stores/theme-store')
    useThemeStore = themeStoreModule.useThemeStore
  }
  if (!useWidgetRegistry) {
    const registryModule = await import('@/stores/widget-registry')
    useWidgetRegistry = registryModule.useWidgetRegistry
  }
}

// Dynamic widget loader - loads widgets on-demand
import { getWidgetComponent, preloadWidgets } from '@/lib/widget-loader'

// Lazy load other components
const StatusBar = React.lazy(() => import('@/components/layout/StatusBar').then(m => ({ default: m.StatusBar })))
const HeaderWidgets = React.lazy(() => import('./HeaderWidgets').then(m => ({ default: m.HeaderWidgets })))
const MondayBriefingModal = React.lazy(() => import('./MondayBriefingModal').then(m => ({ default: m.MondayBriefingModal })))

// Loading Skeleton for Widgets
const WidgetSkeleton = () => (
  <div className="w-full h-full bg-slate-100/10 animate-pulse rounded-xl flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin opacity-20" />
  </div>
)

// Debounce utility to reduce resize recalculations
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Widget type aliases for backward compatibility
const WIDGET_ALIASES: Record<string, string> = {
  'crypto': 'crypto-matrix',
  'roi': 'quick-roi',
  'stream': 'day-stream',
  'resources': 'system-resources',
}

interface WidgetConfig {
  id: string
  type: string
  layout?: { x: number; y: number; w: number; h: number }
}

interface DashboardProps {
  setActiveTab: (tab: string) => void
}

interface StoreState {
  widgetStore: {
    widgets: WidgetConfig[]
    addWidget: (config: any) => void
    removeWidget: (id: string) => void
    resetLayout: (dayIndex?: number) => void
    updateLayout: (layout: any) => void
  }
  themeStore: {
    mode: string
    background: string
    layoutMode: 'edit' | 'locked'
    setTheme: (theme: any) => void
  }
  registry: {
    definitions: any[]
  }
}

// Inner Dashboard component - only rendered after stores are loaded
function DashboardInner({ setActiveTab, stores }: DashboardProps & { stores: StoreState }) {
  const ResponsiveAny = Responsive as any
  const { widgets, addWidget, removeWidget, resetLayout, updateLayout } = stores.widgetStore
  const { definitions } = stores.registry
  const { mode, background, layoutMode, setTheme } = stores.themeStore
  
  const setLayoutMode = (newMode: 'edit' | 'locked') => {
    setTheme({ layoutMode: newMode })
  }
  
  // UI State Management
  // Note: All state variables must be declared before use to prevent runtime errors
  const [showArmory, setShowArmory] = useState(false) // Controls widget library modal visibility
  const [showFabMenu, setShowFabMenu] = useState(false) // Controls floating action button menu
  const [searchQuery, setSearchQuery] = useState('') // Search query for widget filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('all') // Selected widget category filter

  const [width, setWidth] = useState(1200)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced width setter - only update after 150ms of no resize
  const debouncedSetWidth = useCallback(
    debounce((newWidth: number) => {
      setWidth(newWidth)
    }, 150),
    []
  )
  
  const [showMondayBriefing, setShowMondayBriefing] = useState(false)
  const [currentDayTab, setCurrentDayTab] = useState(() => {
     const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
     return days[new Date().getDay()]
  })

  useEffect(() => {
    const isMonday = new Date().getDay() === 1
    const hasSeenBriefing = localStorage.getItem('lastMondayBriefing') === new Date().toDateString()
    
    if (isMonday && !hasSeenBriefing) {
        setShowMondayBriefing(true)
    }
  }, [])

  useEffect(() => {
    if (widgets.length === 0) {
      addWidget({ type: 'quote', x: 0, y: 0, w: 12, h: 2 })
    }
  }, [widgets.length, addWidget])

  useEffect(() => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const dayIndex = days.indexOf(currentDayTab)
    if (dayIndex !== -1) {
        resetLayout(dayIndex)
    }
  }, [currentDayTab, resetLayout])

  const handleBriefingSave = (tasks: string[]) => {
    console.log("Weekly priorities set:", tasks)
    localStorage.setItem('lastMondayBriefing', new Date().toDateString())
  }

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        debouncedSetWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [debouncedSetWidth])

  const layouts = useMemo(() => ({
    lg: widgets.map((w) => ({ 
      i: w.id, 
      x: w.layout?.x || 0, 
      y: w.layout?.y || 0, 
      w: w.layout?.w || 3, 
      h: w.layout?.h || 3,
      minW: 2, minH: 2
    }))
  }), [widgets])

  const onLayoutChange = (layout: any) => {
    updateLayout(layout)
  }

  // Preload visible widgets when they become visible
  useEffect(() => {
    const visibleTypes = widgets.map(w => {
      const actualType = WIDGET_ALIASES[w.type] || w.type
      return actualType
    })
    preloadWidgets(visibleTypes)
  }, [widgets])

  const renderWidgetContent = (type: string, id: string) => {
    // Resolve aliases
    const actualType = WIDGET_ALIASES[type] || type
    const LazyComponent = getWidgetComponent(actualType)
    
    if (type === 'ollama') {
        return (
          <div className="h-full overflow-hidden">
            <LazyComponent id={id} />
          </div>
        )
    }
    
    if (type === 'weather' || type === 'crypto-prices' || type === 'news-feed') {
        return (
          <div className="h-full overflow-hidden">
            <LazyComponent />
          </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <LazyComponent id={id} />
        </div>
    )
  }

  const bgStyles: Record<string, string> = {
    mesh: "bg-[radial-gradient(at_0%_0%,_hsla(253,16%,7%,1)_0,transparent_50%),_radial-gradient(at_50%_0%,_hsla(225,39%,30%,1)_0,transparent_50%),_radial-gradient(at_100%_0%,_hsla(339,49%,30%,1)_0,transparent_50%)] bg-slate-900",
    aurora: "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800",
    deep: "bg-slate-950",
    cyber: "bg-black",
    solid: "bg-white",
    custom: ""
  }
  const bgStyle = mode === 'glass' ? (bgStyles[background] || "bg-white") : ""

  return (
    <div className={cn("min-h-full pb-20 transition-colors duration-700 relative", bgStyle)}>
      {layoutMode === 'edit' && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 z-0" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} 
        />
      )}

      <div className="px-8 pt-8 pb-4 relative z-10">
        <Suspense fallback={<div className="h-20" />}>
          <HeaderWidgets />
        </Suspense>
      </div>

      <div className={cn("px-6 transition-all duration-300 relative z-10")} ref={containerRef}>
        <div className="flex justify-between items-center mb-6 pl-2">
            <div className="flex flex-col">
                <h1 className="text-3xl font-black tracking-tighter text-white">Dashboard</h1>
                <p className="text-sm text-slate-400">Welcome back to FTW-OS</p>
            </div>
            
            <Button 
                variant={layoutMode === 'edit' ? "destructive" : "outline"} 
                size="sm" 
                onClick={() => setLayoutMode(layoutMode === 'edit' ? 'locked' : 'edit')}
                className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-xs"
            >
                <LayoutGrid className="h-3 w-3" />
                {layoutMode === 'edit' ? 'Done' : 'Edit'}
            </Button>
        </div>

        <div className={cn("transition-all duration-300", layoutMode === 'edit' && "ring-2 ring-dashed ring-amber-500/30 rounded-xl bg-amber-500/5 py-4")}>
            <ResponsiveAny
            className="layout"
            layouts={layouts}
            width={width}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            isDraggable={layoutMode === 'edit'}
            isResizable={layoutMode === 'edit'}
            resizeHandles={['se', 'sw', 'ne', 'nw', 's', 'e', 'n', 'w']}
            onLayoutChange={onLayoutChange}
            margin={[16, 16]}
            compactType="vertical"
            preventCollision={false}
            useCSSTransforms={true}
            >
            {widgets.map((w) => (
                <div 
                  key={w.id} 
                  className={cn(
                    "relative group transition-opacity",
                    layoutMode === 'edit' ? "opacity-100" : "hover:z-10"
                  )}
                  style={{
                    willChange: 'transform',
                    transform: 'translate3d(0, 0, 0)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    perspective: 1000,
                    WebkitPerspective: 1000
                  }}
                >
                
                <div className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm">
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => removeWidget(w.id)}>
                                <Trash2 className="mr-2 h-3 w-3" /> Remove Widget
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {layoutMode === 'edit' && (
                    <div className="drag-handle absolute inset-x-0 top-0 h-6 bg-amber-500/20 z-40 cursor-move rounded-t-lg flex items-center justify-center group">
                        <div className="w-8 h-1 bg-amber-500/50 rounded-full group-hover:bg-amber-500 transition-colors" />
                    </div>
                )}
                
                <Suspense fallback={<WidgetSkeleton />}>
                  {renderWidgetContent(w.type, w.id)}
                </Suspense>
                </div>
            ))}
            </ResponsiveAny>
        </div>

        {/* Add Widget Button - 2x3 at bottom */}
        <div className="mt-6 flex justify-center">
            <button
                onClick={() => setShowArmory(true)}
                className="w-full max-w-md h-[180px] border-2 border-dashed border-white/20 hover:border-blue-500/50 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:bg-blue-500/5 group"
            >
                <div className="p-4 rounded-full bg-white/5 group-hover:bg-blue-500/20 transition-colors">
                    <Plus className="h-8 w-8 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-semibold text-slate-300 group-hover:text-white transition-colors">Add Widget</p>
                    <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">Customize your workspace</p>
                </div>
            </button>
        </div>
      </div>

      <Suspense fallback={null}>
        <MondayBriefingModal 
          isOpen={showMondayBriefing} 
          onClose={() => setShowMondayBriefing(false)} 
          onSave={handleBriefingSave}
        />
      </Suspense>

      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        {showFabMenu && (
          <div className="flex flex-col items-end gap-3 mb-2">
            <button 
              onClick={() => { setActiveTab('finance'); setShowFabMenu(false); }} 
              className="flex items-center gap-3 pr-2 group"
            >
              <span className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">New Invoice</span>
              <div className="h-10 w-10 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                <Receipt className="h-5 w-5" />
              </div>
            </button>
            
            <button 
              onClick={() => { setActiveTab('finance'); setShowFabMenu(false); }}
              className="flex items-center gap-3 pr-2 group"
            >
              <span className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">New Document</span>
              <div className="h-10 w-10 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
            </button>

            <button 
              onClick={() => { setShowArmory(true); setShowFabMenu(false); }}
              className="flex items-center gap-3 pr-2 group"
            >
              <span className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">Add Widget</span>
              <div className="h-10 w-10 rounded-full bg-purple-500 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                <LayoutGrid className="h-5 w-5" />
              </div>
            </button>
          </div>
        )}

        <button 
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all duration-300",
            showFabMenu ? "bg-red-500 rotate-45" : "bg-blue-600"
          )}
        >
          <Plus className="h-6 w-6 text-white" />
        </button>
      </div>

      {showArmory && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-md" onClick={() => setShowArmory(false)}>
          <div 
            className="w-full max-w-7xl h-[85vh] rounded-t-3xl shadow-2xl bg-[#0f172a]/90 border-t border-white/10 flex flex-col relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-8 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg text-white">
                    <LayoutGrid className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Widget Library</h2>
                    <p className="text-sm text-slate-400">Add modules to customize your workspace</p>
                </div>
              </div>
              <button 
                onClick={() => setShowArmory(false)}
                className="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="px-8 py-6 border-b border-white/5 flex gap-6 items-center relative z-10 bg-black/20">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search modules..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'productivity', 'finance', 'dev', 'system', 'fun'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-xs font-bold uppercase",
                                selectedCategory === cat 
                                    ? "bg-white text-black" 
                                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {definitions
                    .filter((w: any) => selectedCategory === 'all' || w.category === selectedCategory)
                    .filter((w: any) => w.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((w: any) => (
                    <button
                        key={w.type}
                        onClick={() => { addWidget(w.type); setShowArmory(false) }}
                        className="flex flex-col text-left p-5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-white/5 text-slate-400 group-hover:text-blue-400">
                                <w.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <span className="block text-lg font-bold text-white mb-2 group-hover:text-blue-400">
                            {w.title}
                        </span>
                        <span className="block text-sm text-slate-400">
                            {w.description}
                        </span>
                    </button>
                ))}
                </div>
            </div>
            
            <div className="p-6 border-t border-white/10 flex justify-between items-center bg-black/40">
               <p className="text-xs text-slate-500">
                 {widgets.length} active modules
               </p>
               <button onClick={() => resetLayout()} className="text-xs text-red-400 hover:text-red-300">
                 <Trash2 className="h-4 w-4 inline mr-2" /> Reset Layout
               </button>
            </div>
          </div>
        </div>
      )}

      {layoutMode === 'edit' && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 border border-white/10">
          <span className="font-bold text-sm">EDIT MODE</span>
          <button onClick={() => resetLayout()} className="text-xs hover:text-red-400">Reset</button>
          <button onClick={() => setLayoutMode('locked')} className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold">Done</button>
        </div>
      )}

      <Suspense fallback={null}>
        <StatusBar />
      </Suspense>
    </div>
  )
}

// Main Dashboard component - handles store loading
export function Dashboard({ setActiveTab }: DashboardProps) {
  const [storesLoaded, setStoresLoaded] = useState(false)
  const [storeError, setStoreError] = useState<Error | null>(null)
  const [stores, setStores] = useState<StoreState | null>(null)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        await loadStores()
        
        if (!mounted) return

        const widgetStore = useWidgetStore.getState()
        const themeStore = useThemeStore.getState()
        const registry = useWidgetRegistry.getState()

        setStores({ widgetStore, themeStore, registry })

        useWidgetStore.subscribe((state: any) => {
          if (mounted) {
            setStores((prev) => prev ? { ...prev, widgetStore: state } : null)
          }
        })

        useThemeStore.subscribe((state: any) => {
          if (mounted) {
            setStores((prev) => prev ? { ...prev, themeStore: state } : null)
          }
        })

        setStoresLoaded(true)
      } catch (error: any) {
        console.error('[Dashboard] Failed to load stores:', error)
        if (mounted) setStoreError(error)
      }
    }

    init()
    return () => { mounted = false }
  }, [])

  if (storeError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 text-xl mb-4">Failed to load dashboard</div>
          <div className="text-slate-400 text-sm mb-4">{storeError.message}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!storesLoaded || !stores) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return <DashboardInner setActiveTab={setActiveTab} stores={stores} />
}

export default Dashboard
