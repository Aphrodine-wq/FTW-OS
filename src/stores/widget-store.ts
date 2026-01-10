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
  // Top Row: Clock & Quote (HeaderWidgets handles this mostly, but we can put widgets here)
  // Actually, user wants "Clock, Quote, NetVis, Spotify(SoundCloud), Caffeine" on boot.
  // Assuming HeaderWidgets is separate, we'll configure the main grid.
  
  // Row 1
  { id: 'net-vis-1', type: 'net-vis', title: 'Network', layout: { x: 0, y: 0, w: 6, h: 4 }, visible: true },
  { id: 'soundcloud-1', type: 'soundcloud', title: 'SoundCloud', layout: { x: 6, y: 0, w: 6, h: 4 }, visible: true },
  
  // Row 2
  { id: 'caffeine-1', type: 'caffeine', title: 'Caffeine', layout: { x: 0, y: 4, w: 3, h: 3 }, visible: true },
  { id: 'ollama-1', type: 'ollama', title: 'Ollama', layout: { x: 3, y: 4, w: 5, h: 6 }, visible: true }, // Chatbot
  { id: 'github-1', type: 'github', title: 'Github', layout: { x: 8, y: 4, w: 4, h: 3 }, visible: true },
  
  // Row 3
  { id: 'system-health-1', type: 'system-health', title: 'System Status', layout: { x: 0, y: 7, w: 3, h: 3 }, visible: true },
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
