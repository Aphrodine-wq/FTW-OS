import React from 'react'
import { useWidgetStore } from '@/stores/widget-store'
import { useWidgetRegistry } from '@/stores/widget-registry'
import { useThemeStore } from '@/stores/theme-store'
import { Plus, LayoutGrid } from 'lucide-react'
import { cn } from '@/services/utils'
import { Button } from '@/components/ui/button'
import { Responsive } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

interface DashboardProps {
  setActiveTab?: (tab: string) => void
}

export function Dashboard({ setActiveTab }: DashboardProps) {
  const ResponsiveAny = Responsive as any
  const { widgets, removeWidget, updateLayout } = useWidgetStore()
  const { definitions } = useWidgetRegistry()
  const { mode, background, layoutMode, setTheme } = useThemeStore()
  
  const setLayoutMode = (newMode: 'edit' | 'locked') => {
    setTheme({ layoutMode: newMode })
  }

  const handleLayoutChange = (layout: readonly any[]) => {
    updateLayout([...layout])
  }

  const renderWidget = (widget: any) => {
    const definition = definitions.find(d => d.type === widget.type)
    const WidgetComponent = definition?.component
    if (!WidgetComponent) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Widget not found: {widget.type}
        </div>
      )
    }
    return <WidgetComponent />
  }

  return (
    <div className={cn("h-full", mode)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your personalized workspace</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={layoutMode === 'edit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayoutMode(layoutMode === 'edit' ? 'locked' : 'edit')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            {layoutMode === 'edit' ? 'Lock Layout' : 'Edit Layout'}
          </Button>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="relative">
        <ResponsiveAny
          className="layout"
          layouts={{
            lg: widgets.map(w => ({
              i: w.id,
              x: w.layout.x,
              y: w.layout.y,
              w: w.layout.w,
              h: w.layout.h
            }))
          }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          isDraggable={layoutMode === 'edit'}
          isResizable={layoutMode === 'edit'}
          onLayoutChange={handleLayoutChange}
          compactType="vertical"
          preventCollision={false}
        >
          {widgets.map(widget => (
            <div
              key={widget.id}
              className={cn(
                "relative rounded-lg border bg-card overflow-hidden",
                layoutMode === 'edit' && "ring-2 ring-primary/20"
              )}
            >
              {layoutMode === 'edit' && (
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeWidget(widget.id)}
                  >
                    ×
                  </Button>
                </div>
              )}
              <div className="h-full p-4">
                {renderWidget(widget)}
              </div>
            </div>
          ))}
        </ResponsiveAny>
      </div>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Plus className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No widgets yet</h3>
          <p className="text-muted-foreground mb-4">
            Add widgets to customize your dashboard
          </p>
          <Button onClick={() => setLayoutMode('edit')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Widgets
          </Button>
        </div>
      )}
    </div>
  )
}
