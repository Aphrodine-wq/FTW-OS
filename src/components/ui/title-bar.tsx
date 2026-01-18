import React from 'react'
import { Minus, Square, X, Search, Focus, Settings, Bell } from 'lucide-react'
import { SyncStatus } from '@/components/modules/core/sync/SyncStatus'
import { Button } from '@/components/ui/button'
import { useNotificationStore } from '@/stores/notification-store'

interface TitleBarProps {
  onCommandPaletteOpen?: () => void
  onFocusModeToggle?: () => void
  focusMode?: boolean
  onSettingsOpen?: () => void
}

export function TitleBar({ 
  onCommandPaletteOpen, 
  onFocusModeToggle, 
  focusMode = false,
  onSettingsOpen 
}: TitleBarProps = {}) {
  const handleMinimize = () => {
    window.ipcRenderer.invoke('window:minimize')
  }

  const handleMaximize = () => {
    window.ipcRenderer.invoke('window:maximize')
  }

  const handleClose = () => {
    window.ipcRenderer.invoke('window:close')
  }

  const notifications = useNotificationStore(state => state.notifications)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="h-10 bg-white border-b flex items-center justify-between select-none" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="px-4 text-xs font-semibold tracking-wider uppercase text-black/50">
        FairTradeWorker OS
      </div>
      
      {/* Feature Buttons - Center */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {onCommandPaletteOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCommandPaletteOpen}
            className="h-8 px-2 text-xs hover:bg-gray-100"
            title="Command Palette (⌘K)"
          >
            <Search className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">⌘K</span>
          </Button>
        )}
        
        {onFocusModeToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFocusModeToggle}
            className={`h-8 px-2 text-xs ${focusMode ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
            title="Focus Mode (⌘⇧F)"
          >
            <Focus className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">Focus</span>
          </Button>
        )}

        {onSettingsOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsOpen}
            className="h-8 px-2 text-xs hover:bg-gray-100"
            title="Settings (⌘,)"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        )}

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs hover:bg-gray-100"
            title="Notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </div>

        <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="ml-2 mr-4">
          <SyncStatus />
        </div>
      </div>

      {/* Window Controls - Right */}
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button 
          onClick={handleMinimize}
          className="h-full w-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Minus className="h-4 w-4 text-black/60" />
        </button>
        <button 
          onClick={handleMaximize}
          className="h-full w-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Square className="h-3 w-3 text-black/60" />
        </button>
        <button 
          onClick={handleClose}
          className="h-full w-12 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors group"
        >
          <X className="h-4 w-4 text-black/60 group-hover:text-white" />
        </button>
      </div>
    </div>
  )
}
