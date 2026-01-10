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
  addWidget: (type: string) => void
  removeWidget: (id: string) => void
  updateLayout: (layout: any[]) => void
  resetLayout: () => void
}

const DEFAULT_LAYOUT: WidgetConfig[] = [
  // Top Row
  { id: 'w1', type: 'system-health', title: 'System Status', layout: { x: 0, y: 0, w: 3, h: 4 }, visible: true },
  { id: 'w2', type: 'steam', title: 'Steam', layout: { x: 3, y: 0, w: 5, h: 4 }, visible: true },
  { id: 'w3', type: 'spotify', title: 'Spotify', layout: { x: 8, y: 0, w: 4, h: 4 }, visible: true },

  // Middle Row
  { id: 'w4', type: 'net-vis', title: 'Network', layout: { x: 0, y: 4, w: 4, h: 4 }, visible: true },
  { id: 'w5', type: 'crypto-matrix', title: 'Crypto', layout: { x: 4, y: 4, w: 4, h: 4 }, visible: true },
  { id: 'w6', type: 'pomodoro', title: 'Focus', layout: { x: 8, y: 4, w: 4, h: 4 }, visible: true },

  // Bottom Row
  { id: 'w7', type: 'quick-roi', title: 'ROI Calc', layout: { x: 0, y: 8, w: 3, h: 4 }, visible: true },
  { id: 'w8', type: 'day-stream', title: 'Agenda', layout: { x: 3, y: 8, w: 3, h: 4 }, visible: true },
  { id: 'w9', type: 'system-resources', title: 'System', layout: { x: 6, y: 8, w: 3, h: 4 }, visible: true },
  { id: 'w10', type: 'github', title: 'Github', layout: { x: 9, y: 8, w: 3, h: 4 }, visible: true },
]

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_LAYOUT,
      availableWidgets: [], // Populated by registry later
      addWidget: (type) => set((state) => ({
        widgets: [...state.widgets, { 
          id: Math.random().toString(36).substr(2, 9), 
          type, 
          title: type, 
          layout: { x: 0, y: Infinity, w: 3, h: 3 }, // Auto-place at bottom
          visible: true 
        }]
      })),
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
      resetLayout: () => set({ widgets: DEFAULT_LAYOUT })
    }),
    { name: 'fairtrade-widgets-v4' } // Version bump to force layout 2.0
  )
)
