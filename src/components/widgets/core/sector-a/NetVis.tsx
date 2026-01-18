import React, { useState, useEffect, useRef } from 'react'
import { Activity, Wifi, ArrowUp, ArrowDown } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/services/utils'

export function NetVis() {
  const { mode } = useThemeStore()
  const [data, setData] = useState<number[]>(new Array(40).fill(10))
  const [stats, setStats] = useState({ ping: 24, down: 845, up: 42 })

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1), Math.random() * 100]
        return next
      })
      
      setStats(prev => ({
        ping: Math.max(12, prev.ping + (Math.random() - 0.5) * 10),
        down: Math.max(100, prev.down + (Math.random() - 0.5) * 50),
        up: Math.max(10, prev.up + (Math.random() - 0.5) * 5)
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-full flex flex-col justify-between p-1">
      <div className="flex items-center justify-between mb-2 px-1">
         <div className="flex items-center gap-2">
            <Activity className={cn("h-4 w-4", mode === 'glass' ? "text-green-400" : "text-green-600")} />
            <span className="text-xs font-bold uppercase tracking-widest">NetVis</span>
         </div>
         <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono opacity-50">ONLINE</span>
         </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-2">
         <div className={cn("p-2 rounded flex flex-col items-center", mode === 'glass' ? "bg-white/5" : "bg-gray-100")}>
            <span className="text-[10px] opacity-50 uppercase">Ping</span>
            <span className="text-sm font-mono font-bold">{stats.ping.toFixed(0)}ms</span>
         </div>
         <div className={cn("p-2 rounded flex flex-col items-center", mode === 'glass' ? "bg-white/5" : "bg-gray-100")}>
            <span className="text-[10px] opacity-50 uppercase flex items-center gap-1"><ArrowDown className="h-2 w-2" /> Down</span>
            <span className="text-sm font-mono font-bold">{stats.down.toFixed(0)}</span>
         </div>
         <div className={cn("p-2 rounded flex flex-col items-center", mode === 'glass' ? "bg-white/5" : "bg-gray-100")}>
            <span className="text-[10px] opacity-50 uppercase flex items-center gap-1"><ArrowUp className="h-2 w-2" /> Up</span>
            <span className="text-sm font-mono font-bold">{stats.up.toFixed(0)}</span>
         </div>
      </div>

      {/* Visualizer */}
      <div className="flex-1 flex items-end gap-0.5 h-16 opacity-80 overflow-hidden">
         {data.map((h, i) => (
            <div 
              key={i} 
              className={cn("flex-1 rounded-t-sm transition-all duration-300", mode === 'glass' ? "bg-green-500/50" : "bg-green-500")}
              style={{ height: `${h}%` }}
            />
         ))}
      </div>
    </div>
  )
}
