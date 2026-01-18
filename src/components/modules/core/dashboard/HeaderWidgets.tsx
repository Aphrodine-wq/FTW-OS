import React from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/services/utils'
import { SyncStatus } from '../sync/SyncStatus'

export function HeaderWidgets() {
  const [time, setTime] = React.useState(new Date())
  const { mode } = useThemeStore()

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col md:flex-row items-end justify-between gap-6 relative">
      {/* Clock */}
      <div className="flex flex-col relative z-10">
        <h1 className={cn(
          "text-7xl md:text-9xl font-light tracking-tighter leading-none transition-colors duration-500",
          mode === 'glass' ? "text-white drop-shadow-2xl" : "text-slate-900"
        )}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </h1>
        <p className={cn(
          "text-2xl font-light tracking-widest uppercase ml-2 opacity-80",
          mode === 'glass' ? "text-white" : "text-slate-500"
        )}>
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Quote / Status */}
      <div className="hidden md:block max-w-2xl text-right relative z-10">
        <div className="flex justify-end mb-4">
            <SyncStatus />
        </div>
        <blockquote className={cn(
          "text-2xl md:text-3xl font-light italic mb-4 transition-colors duration-500 leading-relaxed",
          mode === 'glass' ? "text-white/90 drop-shadow-md" : "text-slate-700"
        )}>
          "Efficiency is doing things right; effectiveness is doing the right things."
        </blockquote>
        <div className={cn(
          "h-1.5 w-24 ml-auto rounded-full",
          mode === 'glass' ? "bg-white/40 shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "bg-slate-400"
        )} />
      </div>
    </div>
  )
}
