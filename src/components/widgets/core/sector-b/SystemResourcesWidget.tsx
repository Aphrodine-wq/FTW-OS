import React, { useState, useEffect } from 'react'
import { Cpu, MemoryStick, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { AppWidget } from '../AppWidget'

export function SystemResourcesWidget({ id, onRemove }: { id?: string, onRemove?: () => void }) {
  const [cpuLoad, setCpuLoad] = useState(24)
  const [memLoad, setMemLoad] = useState(42)

  useEffect(() => {
    const interval = setInterval(() => {
        setCpuLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() * 10 - 5))))
        setMemLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() * 4 - 2))))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AppWidget title="System" icon={Activity} id={id || 'sys'} onRemove={onRemove || (() => {})}>
        <div className="h-full flex flex-col justify-center space-y-4 p-2">
            {/* CPU */}
            <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 uppercase">
                    <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> CPU_Core_01</span>
                    <span className={cpuLoad > 80 ? 'text-red-500' : 'text-slate-400'}>{cpuLoad.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-blue-500"
                        animate={{ width: `${cpuLoad}%` }}
                        transition={{ type: "spring", bounce: 0 }}
                    />
                </div>
            </div>

            {/* Memory */}
            <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 uppercase">
                    <span className="flex items-center gap-1"><MemoryStick className="h-3 w-3" /> RAM_Alloc</span>
                    <span className={memLoad > 80 ? 'text-yellow-500' : 'text-slate-400'}>{memLoad.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-purple-500"
                        animate={{ width: `${memLoad}%` }}
                        transition={{ type: "spring", bounce: 0 }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-[9px] text-slate-400 font-bold">UPTIME</div>
                    <div className="text-xs font-mono">14:20:01</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-[9px] text-slate-400 font-bold">TEMP</div>
                    <div className="text-xs font-mono">42°C</div>
                </div>
            </div>
        </div>
    </AppWidget>
  )
}
