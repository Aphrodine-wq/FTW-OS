import React, { useState, useEffect } from 'react'
import { Activity, Wifi, ArrowUp, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { AppWidget } from '../AppWidget'

export function NetVisWidget({ id, onRemove }: { id?: string, onRemove?: () => void }) {
  const [dataPoints, setDataPoints] = useState<number[]>(new Array(20).fill(10))

  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoints(prev => {
        const next = [...prev.slice(1), Math.floor(Math.random() * 50) + 10]
        return next
      })
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <AppWidget title="Network" icon={Wifi} id={id || 'net'} onRemove={onRemove || (() => {})}>
        <div className="h-full flex flex-col bg-black/40 rounded-lg overflow-hidden relative group">
        {/* Scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-[20%] w-full animate-scan pointer-events-none" />
        
        <div className="flex justify-between items-start p-2">
            <div className="flex items-center gap-2 text-emerald-500">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Live Feed</span>
            </div>
            <div className="flex gap-2 text-[9px] font-mono text-emerald-400/70">
                <span className="flex items-center gap-1"><ArrowUp className="h-2 w-2" /> 24.5</span>
                <span className="flex items-center gap-1"><ArrowDown className="h-2 w-2" /> 102.1</span>
            </div>
        </div>

        <div className="flex-1 flex items-end gap-1 px-2 pb-2">
            {dataPoints.map((val, i) => (
                <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    className="flex-1 bg-emerald-500/40 rounded-t-sm hover:bg-emerald-400 transition-colors"
                />
            ))}
        </div>
        
        <div className="h-6 border-t border-emerald-500/20 flex justify-between items-center px-2 text-[8px] text-emerald-600 font-mono bg-black/20">
            <span>PKT_LOSS: 0.0%</span>
            <span>PING: 14ms</span>
            <span>ETH_01: UP</span>
        </div>
        </div>
    </AppWidget>
  )
}
