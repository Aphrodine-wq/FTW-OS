import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WidgetConfig {
  id: string
  type: string
  title: string
  layout: { x: number; y: number; w: number; h: number }
  visible: boolean
}

interface WidgetState {
  widgets: WidgetConfig[]
  availableWidgets: WidgetConfig[] // All possible widgets
  addWidget: (typeOrConfig: string | { type: string; x?: number; y?: number; w?: number; h?: number }) => void
  removeWidget: (id: string) => void
  updateLayout: (layout: any[]) => void
  resetLayout: (dayIndex?: number) => void
}

const getDailyLayout = (dayIndex?: number): WidgetConfig[] => {
  // Default Dashboard Layout - 3 Column Grid (12 cols total, 4 cols each)
  // Row heights: 4 units per row
  return [
    // Row 1 (y=0): Local AI | TaskList | SoundCloud
    { id: 'ollama-1', type: 'ollama', title: 'Local AI', layout: { x: 0, y: 0, w: 4, h: 4 }, visible: true },
    { id: 'tasks-1', type: 'project-status', title: 'Task List', layout: { x: 4, y: 0, w: 4, h: 8 }, visible: true }, // Spans 2 rows
    { id: 'soundcloud-1', type: 'soundcloud', title: 'SoundCloud', layout: { x: 8, y: 0, w: 4, h: 4 }, visible: true },
    
    // Row 2 (y=4): Caffeine | (TaskList continues) | GitHub
    { id: 'caffeine-1', type: 'caffeine', title: 'Caffeine Tracker', layout: { x: 0, y: 4, w: 4, h: 4 }, visible: true },
    // TaskList continues from row 1 (x: 4, y: 0, h: 8)
    { id: 'github-1', type: 'github', title: 'GitHub Activity', layout: { x: 8, y: 4, w: 4, h: 8 }, visible: true }, // Spans 2 rows
    
    // Row 3 (y=8): Network (spans 2 cols) | (GitHub continues)
    { id: 'net-vis-1', type: 'net-vis', title: 'Network Monitor', layout: { x: 0, y: 8, w: 8, h: 4 }, visible: true }, // Spans 2 columns
    // GitHub continues from row 2 (x: 8, y: 4, h: 8)
  ]
}

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      widgets: getDailyLayout(),
      availableWidgets: [], // Populated by registry later
      addWidget: (typeOrConfig) => set((state) => {
        const config = typeof typeOrConfig === 'string' ? { type: typeOrConfig } : typeOrConfig
        return {
            widgets: [...state.widgets, { 
                id: Math.random().toString(36).substr(2, 9), 
                type: config.type, 
                title: config.type, 
                layout: { 
                    x: config.x ?? 0, 
                    y: config.y ?? Infinity, 
                    w: config.w ?? 3, 
                    h: config.h ?? 3 
                }, 
                visible: true 
            }]
        }
      }),
      removeWidget: (id) => set((state) => {
        // Optimistic update: immediately return new state
        return {
          widgets: state.widgets.filter(w => w.id !== id)
        }
      }),
      updateLayout: (newLayout) => set((state) => {
        // Optimistic update: fast map
        return {
          widgets: state.widgets.map(w => {
            const layoutItem = newLayout.find(l => l.i === w.id)
            return layoutItem ? { ...w, layout: { x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h } } : w
          })
        }
      }),
      resetLayout: (dayIndex?: number) => set({ widgets: getDailyLayout(dayIndex) })
    }),
    { name: 'fairtrade-widgets-v6' } // Version bump to force new 3-column layout
  )
)
