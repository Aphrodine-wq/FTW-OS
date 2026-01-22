import React, { useState, Suspense } from 'react'
import { Wifi, Battery, Server, Layout, GitCommit } from 'lucide-react'
import { cn } from '@/services/utils'

// Lazy load GithubTicker to avoid potential circular deps
const GithubTicker = React.lazy(() => import('../modules/core/dashboard/GithubTicker').then(m => ({ default: m.GithubTicker })))

export function StatusBar() {
  const [compactMode, setCompactMode] = useState(false)

  return (
    <div className="fixed bottom-0 inset-x-0 h-6 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-2 z-50 text-[10px] text-white/50 font-mono">
      {/* Left: System Indicators */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-500/80 font-bold">ONLINE</span>
        </div>
        <div className="h-3 w-[1px] bg-white/10" />
        <div className="flex items-center gap-1">
          <Server className="h-3 w-3" />
          <span>v1.2.0</span>
        </div>
        <div className="h-3 w-[1px] bg-white/10" />
        <button 
          onClick={() => setCompactMode(!compactMode)}
          className={cn(
            "flex items-center gap-1 hover:text-white transition-colors",
            compactMode ? "text-blue-400" : ""
          )}
          title="Toggle Compact Mode"
        >
          <Layout className="h-3 w-3" />
          <span>{compactMode ? 'COMPACT' : 'NORMAL'}</span>
        </button>
      </div>

      {/* Center: Github Ticker */}
      <div className="flex-1 max-w-2xl relative h-full overflow-hidden mx-4">
        <Suspense fallback={
          <div className="flex items-center gap-2 text-white/30">
            <GitCommit className="h-3 w-3" />
            <span>Loading commits...</span>
          </div>
        }>
          <GithubTicker />
        </Suspense>
      </div>

      {/* Right: Environment Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            <span>5ms</span>
        </div>
        <div className="h-3 w-[1px] bg-white/10" />
        <div className="flex items-center gap-1">
            <Battery className="h-3 w-3" />
            <span>PWR</span>
        </div>
      </div>
    </div>
  )
}
