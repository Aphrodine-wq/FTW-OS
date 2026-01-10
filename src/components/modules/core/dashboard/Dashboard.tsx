import React, { useMemo } from 'react'
import { Responsive } from 'react-grid-layout'
import { useWidgetStore } from '@/stores/widget-store'
import { useThemeStore } from '@/stores/theme-store'
import { Button } from '@/components/ui/button'
import { Plus, LayoutGrid, Trash2, FileText, Receipt } from 'lucide-react'
import { cn } from '@/services/utils'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { AnimatePresence, motion } from 'framer-motion'

// Widgets
import { SystemHealth } from '@/components/widgets/core/sector-b/SystemHealth'
import { CryptoMatrix } from '@/components/widgets/core/sector-c/CryptoMatrix'
import { PomodoroMax } from '@/components/widgets/core/sector-d/PomodoroMax'
import { RealSoundCloudWidget } from '@/components/widgets/core/real/RealSoundCloud'
import { OllamaChat } from '@/components/widgets/core/real/OllamaChat'
import { NetVisWidget } from '@/components/widgets/core/sector-a/NetVisWidget'
import { QuickROIWidget } from '@/components/widgets/core/sector-a/QuickROIWidget'
import { DayStreamWidget } from '@/components/widgets/core/sector-a/DayStreamWidget'
import { SystemResourcesWidget } from '@/components/widgets/core/sector-b/SystemResourcesWidget'
import { RealSteamWidget } from '@/components/widgets/core/real/RealSteam'
import { RealGithubWidget } from '@/components/widgets/core/real/RealGithub'
import { WeatherWidget, CaffeineWidget } from '@/components/widgets/core/Widgets'
import { HeaderWidgets } from './HeaderWidgets'

// Widget Map for dynamic rendering
const WIDGET_MAP: Record<string, React.ComponentType<any>> = {
  'system-health': SystemHealth,
  'net-vis': NetVisWidget,
  'github': RealGithubWidget,
  'soundcloud': RealSoundCloudWidget,
  'roast': WidgetRoast,
  'nasa': WidgetNasa,
  'excuse': WidgetExcuse,
  'crypto': CryptoMatrix,
  'pomodoro': PomodoroMax,
  'roi': QuickROIWidget,
  'stream': DayStreamWidget,
  'resources': SystemResourcesWidget,
  'steam': RealSteamWidget,
  'weather': WeatherWidget,
  'caffeine': CaffeineWidget,
  'ollama': OllamaChat, // Added Ollama
}
import { StatusBar } from '@/components/layout/StatusBar'
import { WidgetRoast } from '@/components/widgets/fun/WidgetRoast'
import { WidgetNasa } from '@/components/widgets/fun/WidgetNasa'
import { WidgetExcuse } from '@/components/widgets/fun/WidgetExcuse'

interface DashboardProps {
  setActiveTab: (tab: string) => void
}

export function Dashboard({ setActiveTab }: DashboardProps) {
  const { widgets, addWidget, removeWidget, resetLayout, updateLayout } = useWidgetStore()
  const { mode, background, layoutMode, setLayoutMode } = useThemeStore() // Added layoutMode
  const [showArmory, setShowArmory] = React.useState(false) 
  const [showFabMenu, setShowFabMenu] = React.useState(false)
  const [width, setWidth] = React.useState(1200)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Memoize layout to prevent re-renders
  const layouts = useMemo(() => ({
    lg: widgets.map(w => ({ 
      i: w.id, 
      x: w.layout?.x || 0, 
      y: w.layout?.y || 0, 
      w: w.layout?.w || 3, 
      h: w.layout?.h || 3,
      minW: 2, minH: 2
    }))
  }), [widgets])

  // Memoized Render Widget Function
  const MemoizedWidget = React.memo(({ type, id }: { type: string, id: string }) => {
    return <>{renderWidgetContent(type, id)}</>
  })

  const onLayoutChange = (layout: any) => {
    updateLayout(layout)
  }

  const renderWidgetContent = (type: string, id: string) => {
    switch (type) {
      case 'soundcloud': return <RealSoundCloudWidget id={id} onRemove={() => removeWidget(id)} />
      case 'steam': return <RealSteamWidget id={id} onRemove={() => removeWidget(id)} />
      case 'net-vis': return <div className="h-full overflow-hidden"><NetVisWidget /></div>
      case 'quick-roi': return <div className="h-full overflow-hidden"><QuickROIWidget /></div>
      case 'day-stream': return <div className="h-full overflow-hidden"><DayStreamWidget /></div>
      case 'system-resources': return <div className="h-full overflow-hidden"><SystemResourcesWidget /></div>
      case 'github': return <RealGithubWidget id={id} onRemove={() => removeWidget(id)} />
      case 'system-health': return <SystemHealth id={id} onRemove={() => removeWidget(id)} />
      case 'pomodoro': return <PomodoroMax id={id} onRemove={() => removeWidget(id)} />
      case 'crypto-matrix': return <div className="p-4 h-full overflow-hidden"><CryptoMatrix /></div>
      case 'weather': return <div className="p-4 h-full overflow-hidden"><WeatherWidget /></div>
      case 'caffeine': return <div className="p-4 h-full overflow-hidden"><CaffeineWidget /></div>
      case 'roast': return <WidgetRoast id={id} onRemove={() => removeWidget(id)} />
      case 'nasa': return <WidgetNasa id={id} onRemove={() => removeWidget(id)} />
      case 'excuse': return <WidgetExcuse id={id} onRemove={() => removeWidget(id)} />
      default: return <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)] p-4">Widget not found: {type}</div>
    }
  }

  const availableWidgets = [
    { type: 'soundcloud', title: 'SoundCloud' },
    { type: 'steam', title: 'Steam' },
    { type: 'net-vis', title: 'NetVis Monitor' },
    { type: 'quick-roi', title: 'Quick ROI' },
    { type: 'day-stream', title: 'Day Stream' },
    { type: 'system-resources', title: 'System Resources' },
    { type: 'github', title: 'GitHub' },
    { type: 'system-health', title: 'System Status' },
    { type: 'pomodoro', title: 'Focus Timer' },
    { type: 'crypto-matrix', title: 'Crypto Matrix' },
    { type: 'weather', title: 'Weather' },
    { type: 'caffeine', title: 'Caffeine' },
  ]

  // Legacy bg support for 'glass' mode + new CSS variables
  const bgStyle = mode === 'glass' ? ({
    mesh: "bg-[radial-gradient(at_0%_0%,_hsla(253,16%,7%,1)_0,transparent_50%),_radial-gradient(at_50%_0%,_hsla(225,39%,30%,1)_0,transparent_50%),_radial-gradient(at_100%_0%,_hsla(339,49%,30%,1)_0,transparent_50%)] bg-slate-900",
    aurora: "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800",
    deep: "bg-slate-950",
    cyber: "bg-black",
    solid: "bg-white"
  }[background] || "bg-white") : ""

  return (
    <div className={cn("min-h-full pb-20 transition-colors duration-700 relative", bgStyle)}>
      {/* Blueprint Grid - Visible only in Edit Mode */}
      {layoutMode === 'edit' && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 z-0" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} 
        />
      )}

      {/* Header */}
      <div className="px-8 pt-8 pb-4 relative z-10">
        <HeaderWidgets />
      </div>

      {/* Grid Layout */}
      <div className={cn("px-6 transition-all duration-300 relative z-10", layoutMode === 'edit' && "ring-2 ring-dashed ring-amber-500/30 rounded-xl bg-amber-500/5 py-4")} ref={containerRef}>
        <Responsive
          className="layout"
          layouts={layouts}
          width={width}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          draggableHandle=".drag-handle"
          isDraggable={layoutMode === 'edit'} // Controlled by Nav
          isResizable={layoutMode === 'edit'} // Controlled by Nav
          resizeHandles={['se', 'sw', 'ne', 'nw', 's', 'e', 'n', 'w']}
          onLayoutChange={onLayoutChange}
          margin={[16, 16]}
        >
          {widgets.map(w => (
            <div key={w.id} className={cn("relative transition-opacity", layoutMode === 'edit' ? "opacity-100" : "hover:z-10")}>
              {/* Drag Handle Overlay - Only visible in Edit Mode */}
              {layoutMode === 'edit' && (
                <div className="drag-handle absolute inset-x-0 top-0 h-6 bg-amber-500/20 z-50 cursor-move rounded-t-lg flex items-center justify-center group">
                    <div className="w-8 h-1 bg-amber-500/50 rounded-full group-hover:bg-amber-500 transition-colors" />
                    {/* Close Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); removeWidget(w.id); }}
                        className="absolute right-1 top-1 p-0.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
              )}
              <MemoizedWidget type={w.type} id={w.id} />
            </div>
          ))}
        </Responsive>
      </div>

      {/* Add Widget Button (Floating Speed Dial) */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        <AnimatePresence>
          {showFabMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="flex flex-col items-end gap-3 mb-2"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all duration-300",
            showFabMenu ? "bg-red-500 rotate-45" : "bg-[var(--accent-primary)]"
          )}
        >
          <Plus className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Widget Armory (Drawer) - Only show content if explicitly requested via "Add Widget" button above, 
          but current logic toggles showArmory for both. 
          Let's separate the "Speed Dial" state from "Widget Drawer" state. 
      */}
      {/* 
         Actually, I'll refactor slightly: 
         - 'showFabMenu' controls the speed dial.
         - 'showWidgetDrawer' controls the drawer.
      */}

      {/* Widget Armory (Drawer) */}
      {showArmory && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowArmory(false)}>
          <div 
            className="w-full max-w-7xl rounded-t-2xl shadow-2xl p-8 animate-in slide-in-from-bottom-10 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8 border-b border-[var(--border-subtle)] pb-4">
              <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2 text-[var(--text-main)]">
                <LayoutGrid className="h-5 w-5" /> Widget Library
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowArmory(false)}>Close</Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {availableWidgets.map(w => (
                <button
                  key={w.type}
                  onClick={() => { addWidget(w.type); setShowArmory(false) }}
                  className="p-4 border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] bg-[var(--bg-surface-hover)]/50 text-left transition-all rounded-lg group"
                >
                  <span className="block text-xs font-bold uppercase tracking-wider mb-1 text-[var(--text-main)] group-hover:text-[var(--accent-primary)]">{w.title}</span>
                  <span className="block text-[10px] text-[var(--text-muted)]">Add to Grid</span>
                </button>
              ))}
            </div>
            
            <div className="mt-8 pt-4 border-t border-[var(--border-subtle)] flex justify-end">
               <Button variant="destructive" size="sm" onClick={resetLayout} className="gap-2">
                 <Trash2 className="h-4 w-4" /> Reset Layout
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode Controls */}
      <AnimatePresence>
        {layoutMode === 'edit' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 border border-white/10"
          >
            <span className="font-bold text-sm tracking-wider">EDIT MODE</span>
            <div className="h-4 w-px bg-white/20" />
            <button 
                onClick={resetLayout}
                className="text-xs hover:text-red-400 transition-colors"
            >
                Reset Layout
            </button>
            <button 
                onClick={() => setLayoutMode('view')}
                className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors"
            >
                Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Status Bar */}
      <StatusBar />
    </div>
  )
}
