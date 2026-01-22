import { create } from 'zustand'

export interface Conflict {
  id: string
  entityType: string
  entityId: string
  serverVersion: any
  localVersion: any
  timestamp: Date
}

interface SyncState {
  isSyncing: boolean
  lastSyncTime: Date | null
  pendingChanges: number
  conflicts: Conflict[]
  syncStatus: 'online' | 'offline' | 'syncing' | 'error'

  setSyncStatus: (status: 'online' | 'offline' | 'syncing' | 'error') => void
  setPendingChanges: (count: number) => void
  addConflict: (conflict: Conflict) => void
  resolveConflict: (id: string) => void
  setLastSyncTime: (date: Date) => void
  setIsSyncing: (isSyncing: boolean) => void
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSyncTime: null,
  pendingChanges: 0,
  conflicts: [],
  syncStatus: navigator.onLine ? 'online' : 'offline',

  setSyncStatus: (status) => set({ syncStatus: status }),
  setPendingChanges: (count) => set({ pendingChanges: count }),
  addConflict: (conflict) => set((state) => ({ conflicts: [...state.conflicts, conflict] })),
  resolveConflict: (id) => set((state) => ({ conflicts: state.conflicts.filter(c => c.id !== id) })),
  setLastSyncTime: (date) => set({ lastSyncTime: date }),
  setIsSyncing: (isSyncing) => set({ isSyncing })
}))
