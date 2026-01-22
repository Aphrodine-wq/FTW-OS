import { supabase } from './supabase'
import { useSyncStore, Conflict } from '@/stores/sync-store'

export interface SyncOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  data: any
  timestamp: number
}

export class SyncService {
  private syncQueue: SyncOperation[] = []
  private isOnline: boolean = navigator.onLine
  private static instance: SyncService

  private constructor() {
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
    this.startPeriodicSync()
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
    }
    return SyncService.instance
  }

  private handleOnline() {
    this.isOnline = true
    useSyncStore.getState().setSyncStatus('online')
    this.processQueue()
  }

  private handleOffline() {
    this.isOnline = false
    useSyncStore.getState().setSyncStatus('offline')
  }

  private startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline) {
        this.syncAll()
      }
    }, 60000) // Sync every minute
  }

  async syncAll(): Promise<void> {
    if (!this.isOnline) return

    useSyncStore.getState().setIsSyncing(true)
    useSyncStore.getState().setSyncStatus('syncing')

    try {
      await this.processQueue()
      // Here you would add logic to fetch changes from the server
      // e.g. await this.pullChanges()
      
      useSyncStore.getState().setLastSyncTime(new Date())
      useSyncStore.getState().setSyncStatus('online')
    } catch (error) {
      console.error('Sync failed:', error)
      useSyncStore.getState().setSyncStatus('error')
    } finally {
      useSyncStore.getState().setIsSyncing(false)
    }
  }

  async queueOperation(operation: Omit<SyncOperation, 'id' | 'timestamp'>): Promise<void> {
    const fullOp: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }

    this.syncQueue.push(fullOp)
    useSyncStore.getState().setPendingChanges(this.syncQueue.length)
    
    if (this.isOnline) {
      await this.processQueue()
    }
  }

  private async processQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return

    const queue = [...this.syncQueue]
    this.syncQueue = []
    useSyncStore.getState().setPendingChanges(0)

    for (const op of queue) {
      try {
        await this.performOperation(op)
      } catch (error) {
        console.error(`Failed to process operation ${op.id}:`, error)
        // Re-queue if it's a network error, otherwise log and maybe discard or create conflict
        this.syncQueue.push(op) 
        useSyncStore.getState().setPendingChanges(this.syncQueue.length)
      }
    }
  }

  private async performOperation(op: SyncOperation): Promise<void> {
    const { type, entity, data } = op
    
    // Check for Supabase configuration
    const { error } = await supabase.from(entity).select('id').limit(1)
    if (error && error.message.includes('not configured')) {
        console.warn('Supabase not configured, skipping sync operation')
        return
    }

    let result
    switch (type) {
      case 'create':
        result = await supabase.from(entity).insert(data)
        break
      case 'update':
        result = await supabase.from(entity).update(data).eq('id', data.id)
        break
      case 'delete':
        result = await supabase.from(entity).delete().eq('id', data.id)
        break
    }

    if (result?.error) {
      throw result.error
    }
  }

  subscribeToChanges(table: string, callback: (payload: any) => void) {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe()
  }
}

export const syncService = SyncService.getInstance()
