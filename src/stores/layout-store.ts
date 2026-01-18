/**
 * Layout Store
 * Manages layout customization settings
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LayoutState {
  sidebarPosition: 'left' | 'right' | 'top'
  sidebarWidth: number
  compactMode: boolean
  showStatusBar: boolean
  dashboardLayout: 'grid' | 'list' | 'kanban'
  
  toggleCompact: () => void
  setSidebarPosition: (pos: 'left' | 'right' | 'top') => void
  setSidebarWidth: (width: number) => void
  setShowStatusBar: (show: boolean) => void
  setDashboardLayout: (layout: 'grid' | 'list' | 'kanban') => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarPosition: 'left',
      sidebarWidth: 256,
      compactMode: false,
      showStatusBar: true,
      dashboardLayout: 'grid',
      
      toggleCompact: () => set((state) => ({ 
        compactMode: !state.compactMode 
      })),
      
      setSidebarPosition: (pos) => set({ sidebarPosition: pos }),
      
      setSidebarWidth: (width) => set({ sidebarWidth: Math.max(200, Math.min(400, width)) }),
      
      setShowStatusBar: (show) => set({ showStatusBar: show }),
      
      setDashboardLayout: (layout) => set({ dashboardLayout: layout })
    }),
    { name: 'layout-settings' }
  )
)

