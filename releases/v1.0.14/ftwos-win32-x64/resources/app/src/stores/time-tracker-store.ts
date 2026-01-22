import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TimeEntry } from '@/types/employee'

interface TimeTrackerState {
  activeEntry: TimeEntry | null
  entries: TimeEntry[]
  isTracking: boolean

  // Actions
  startTimer: (options: { employeeId?: string, projectId?: string, taskId?: string, description?: string, path?: string, tags?: string[] }) => void
  stopTimer: () => void
  updateActiveEntry: (updates: Partial<TimeEntry>) => void
  addManualEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  deleteEntry: (id: string) => void
  getEntriesByDateRange: (start: Date, end: Date) => TimeEntry[]
}

export const useTimeTrackerStore = create<TimeTrackerState>()(
  persist(
    (set, get) => ({
      activeEntry: null,
      entries: [],
      isTracking: false,

      startTimer: async (options: { employeeId?: string, projectId?: string, taskId?: string, description?: string, path?: string, tags?: string[] }) => {
        const now = new Date()
        const newEntry: TimeEntry = {
          id: crypto.randomUUID(),
          employeeId: options.employeeId || 'currentUser',
          projectId: options.projectId,
          taskId: options.taskId,
          description: options.description || '',
          startTime: now,
          duration: 0,
          billable: true,
          status: 'pending',
          createdAt: now,
          updatedAt: now
        }

        set({ activeEntry: newEntry, isTracking: true })

        // Start Backend Session if path is provided
        if (options.projectId && options.path) {
          try {
            await window.ipcRenderer.invoke('tracker:start-session', {
              projectId: options.projectId,
              path: options.path
            })
          } catch (e) {
            console.error("Failed to start backend tracker:", e)
          }
        }
      },

      stopTimer: async () => {
        const { activeEntry, entries } = get()
        if (!activeEntry) return

        // Stop Backend Session
        try {
          await window.ipcRenderer.invoke('tracker:stop-session')
        } catch (e) {
          console.error("Failed to stop backend tracker:", e)
        }

        const endTime = new Date()
        const duration = Math.floor((endTime.getTime() - activeEntry.startTime.getTime()) / 1000)

        const completedEntry: TimeEntry = {
          ...activeEntry,
          endTime,
          duration,
          updatedAt: endTime
        }

        set({
          entries: [completedEntry, ...entries],
          activeEntry: null,
          isTracking: false
        })
      },

      updateActiveEntry: (updates) => set((state) => ({
        activeEntry: state.activeEntry ? { ...state.activeEntry, ...updates } : null
      })),

      addManualEntry: (entry) => set((state) => ({
        entries: [
          {
            ...entry,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
          },
          ...state.entries
        ]
      })),

      deleteEntry: (id) => set((state) => ({
        entries: state.entries.filter(e => e.id !== id)
      })),

      getEntriesByDateRange: (start, end) => {
        return get().entries.filter(e =>
          e.startTime >= start && e.startTime <= end
        )
      }
    }),
    {
      name: 'ftw-time-tracker-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          return JSON.parse(str, (key, value) => {
            if (key.endsWith('Date') || key === 'startTime' || key === 'endTime' || key === 'createdAt' || key === 'updatedAt') {
              return new Date(value)
            }
            return value
          })
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => localStorage.removeItem(name),
      }
    }
  )
)
