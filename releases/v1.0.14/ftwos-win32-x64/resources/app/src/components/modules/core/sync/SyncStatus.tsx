import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, CloudOff, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useSyncStore } from '@/stores/sync-store'
import { cn } from '@/services/utils'
import { syncService } from '@/services/sync-service'

export function SyncStatus() {
  const { syncStatus, lastSyncTime, pendingChanges, isSyncing } = useSyncStore()
  const [isHovered, setIsHovered] = React.useState(false)

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
      case 'offline':
        return <CloudOff className="w-4 h-4 text-slate-400" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'online':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      default:
        return <Cloud className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing': return 'Syncing...'
      case 'offline': return 'Offline'
      case 'error': return 'Sync Error'
      case 'online': return 'Synced'
      default: return 'Unknown'
    }
  }

  return (
    <div 
      className="relative z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        onClick={() => syncService.syncAll()}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300",
          "bg-white/10 hover:bg-white/20 border border-white/10",
          syncStatus === 'error' && "bg-red-500/10 border-red-500/20",
          syncStatus === 'offline' && "bg-slate-500/10 border-slate-500/20"
        )}
      >
        {getStatusIcon()}
        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 hidden sm:inline">
          {getStatusText()}
        </span>
        {pendingChanges > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
            {pendingChanges}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-64 p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Sync Status</h4>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  syncStatus === 'online' ? "bg-green-100 text-green-700" :
                  syncStatus === 'offline' ? "bg-slate-100 text-slate-700" :
                  syncStatus === 'syncing' ? "bg-blue-100 text-blue-700" :
                  "bg-red-100 text-red-700"
                )}>
                  {syncStatus.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Last Synced:</span>
                  <span>{lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Never'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Changes:</span>
                  <span>{pendingChanges}</span>
                </div>
              </div>

              {syncStatus === 'error' && (
                <div className="p-2 rounded bg-red-50/50 text-xs text-red-600 border border-red-100">
                  Failed to sync changes. Please check your connection.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
