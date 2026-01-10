import React from 'react'
import { Minus, Square, X } from 'lucide-react'

export function TitleBar() {
  const handleMinimize = () => {
    window.ipcRenderer.invoke('window:minimize')
  }

  const handleMaximize = () => {
    window.ipcRenderer.invoke('window:maximize')
  }

  const handleClose = () => {
    window.ipcRenderer.invoke('window:close')
  }

  return (
    <div className="h-10 bg-white border-b flex items-center justify-between select-none" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="px-4 text-xs font-semibold tracking-wider uppercase text-black/50">
        FairTradeWorker OS
      </div>
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
