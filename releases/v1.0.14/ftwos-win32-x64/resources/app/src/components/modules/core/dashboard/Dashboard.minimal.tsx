import React from 'react'
import { useWidgetStore } from '@/stores/widget-store'
import { useWidgetRegistry } from '@/stores/widget-registry'
import { useThemeStore } from '@/stores/theme-store'
import { Plus, LayoutGrid, X } from 'lucide-react'
import { cn } from '@/services/utils'
import { Button } from '@/components/ui/button'

interface DashboardProps {
  setActiveTab?: (tab: string) => void
}

export function Dashboard({ setActiveTab }: DashboardProps) {
  const { widgets, removeWidget } = useWidgetStore()
  const { definitions } = useWidgetRegistry()
  const { mode, layoutMode, setTheme } = useThemeStore()
  
  const setLayoutMode = (newMode: 'edit' | 'locked') => {
    setTheme({ layoutMode: newMode })
  }

  const renderWidget = (widget: any) => {
    const definition = definitions.find(d => d.type === widget.type)
    const WidgetComponent = definition?.component
    
    if (!WidgetComponent) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="font-medium">Widget not found</p>
            <p className="text-sm">{widget.type}</p>
          </div>
        </div>
      )
    }
    
    return <WidgetComponent />
  }

  return (
    <div className={cn("h-full p-6", mode)}>
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

      {/* Widgets Grid - Simple CSS Grid */}
      {widgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets.map(widget => (
            <div
              key={widget.id}
              className={cn(
                "relative rounded-lg border bg-card overflow-hidden transition-all",
                "min-h-[300px]",
                layoutMode === 'edit' && "ring-2 ring-primary/30 shadow-lg"
              )}
              style={{
                gridColumn: `span ${Math.min(widget.layout.w / 4, 3)}`,
                gridRow: `span ${Math.max(1, Math.floor(widget.layout.h / 2))}`
              }}
            >
              {/* Edit Mode Controls */}
              {layoutMode === 'edit' && (
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeWidget(widget.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {/* Widget Content */}
              <div className="h-full p-4 overflow-auto">
                {renderWidget(widget)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
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
