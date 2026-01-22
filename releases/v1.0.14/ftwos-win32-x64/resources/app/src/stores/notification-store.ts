import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppNotification {
  id: string
  type: 'github' | 'task' | 'system' | 'finance'
  title: string
  content: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high'
  link?: string
}

interface NotificationState {
  notifications: AppNotification[]
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      
      addNotification: (n) => set((state) => ({
        notifications: [
          {
            ...n,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            read: false
          },
          ...state.notifications
        ].slice(0, 100) // Keep last 100
      })),

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),

      clearAll: () => set({ notifications: [] })
    }),
    {
      name: 'ftw-notifications-storage',
    }
  )
)