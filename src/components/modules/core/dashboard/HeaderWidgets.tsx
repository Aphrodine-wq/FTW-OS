import React from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/services/utils'

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
          "text-6xl md:text-8xl font-thin tracking-tighter leading-none transition-colors duration-500",
          mode === 'glass' ? "text-white drop-shadow-2xl" : "text-slate-900"
        )}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </h1>
        <p className={cn(
          "text-lg font-medium tracking-wide uppercase ml-2 opacity-60",
          mode === 'glass' ? "text-white" : "text-slate-500"
        )}>
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Quote / Status */}
      <div className="hidden md:block max-w-md text-right relative z-10">
        <blockquote className={cn(
          "text-sm italic mb-2 transition-colors duration-500",
          mode === 'glass' ? "text-white/80" : "text-slate-600"
        )}>
          "Efficiency is doing things right; effectiveness is doing the right things."
        </blockquote>
        <div className={cn(
          "h-1 w-12 ml-auto rounded-full",
          mode === 'glass' ? "bg-white/30" : "bg-slate-300"
        )} />
      </div>
    </div>
  )
}
