import React, { useState, useEffect } from 'react'
import { Activity, Wifi, ArrowUp, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { AppWidget } from '../AppWidget'

export function NetVisWidget({ id, onRemove }: { id?: string, onRemove?: () => void }) {
  const [upData, setUpData] = useState<number[]>(new Array(20).fill(10))
  const [downData, setDownData] = useState<number[]>(new Array(20).fill(10))

  useEffect(() => {
    const interval = setInterval(() => {
      setUpData(prev => [...prev.slice(1), Math.floor(Math.random() * 40) + 5])
      setDownData(prev => [...prev.slice(1), Math.floor(Math.random() * 60) + 20])
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <AppWidget title="Network" icon={Wifi} id={id || 'net'} onRemove={onRemove || (() => {})}>
        <div className="h-full flex flex-col bg-black/90 rounded-lg overflow-hidden relative group border border-emerald-900/30">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        {/* Scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-[20%] w-full animate-scan pointer-events-none" />
        
        <div className="flex justify-between items-start p-3 z-10">
            <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500">Live Feed</span>
                <span className="text-[9px] text-emerald-400/50 font-mono">ETH0 • 192.168.1.42</span>
            </div>
            <div className="flex flex-col items-end gap-1 text-[9px] font-mono">
                <span className="flex items-center gap-1 text-emerald-400"><ArrowDown className="h-2 w-2" /> 102.4 MB/s</span>
                <span className="flex items-center gap-1 text-blue-400"><ArrowUp className="h-2 w-2" /> 24.1 MB/s</span>
            </div>
        </div>

        <div className="flex-1 flex items-end gap-0.5 px-2 pb-2 z-10">
            {downData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5">
                    {/* Upload Bar (Top, inverted sort of visually) */}
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${upData[i]}%` }}
                        className="w-full bg-blue-500/40 rounded-sm"
                    />
                    {/* Download Bar (Bottom) */}
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        className="w-full bg-emerald-500/40 rounded-sm"
                    />
                </div>
            ))}
        </div>
        
        <div className="h-7 border-t border-emerald-500/20 flex justify-between items-center px-3 text-[9px] text-emerald-600 font-mono bg-black/40 z-10">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> ONLINE</span>
            <span>PING: 14ms</span>
            <span>PKT_LOSS: 0.0%</span>
        </div>
        </div>
    </AppWidget>
  )
}
