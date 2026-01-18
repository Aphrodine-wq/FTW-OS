import React, { useState, useEffect } from 'react'
import { Cpu, MemoryStick, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { AppWidget } from '../AppWidget'

export function SystemResourcesWidget({ id, onRemove }: { id?: string, onRemove?: () => void }) {
  const [cpuLoad, setCpuLoad] = useState(0)
  const [memLoad, setMemLoad] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // In a real scenario, this would check IPC status
    // For now, we simulate "Not Connected" state by default to follow Phase 3 requirements
    const checkConnection = async () => {
        // Mock check
        setIsConnected(false)
    }
    checkConnection()
  }, [])

  return (
    <AppWidget title="System" icon={Activity} id={id || 'sys'} onRemove={onRemove || (() => {})}>
        <div className="h-full flex flex-col justify-center space-y-4 p-2 relative">
            {!isConnected && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm p-4 text-center">
                    <Activity className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600 mb-1">System Monitor Inactive</p>
                    <p className="text-[10px] text-slate-400 mb-2">Install the desktop agent to view real-time CPU & RAM usage.</p>
                    <button className="text-[10px] px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                        Enable Agent
                    </button>
                </div>
            )}

            {/* CPU */}
            <div className="space-y-1 opacity-50 blur-[1px]">
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
            <div className="space-y-1 opacity-50 blur-[1px]">
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

            <div className="grid grid-cols-2 gap-2 mt-2 opacity-50 blur-[1px]">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-[9px] text-slate-400 font-bold">UPTIME</div>
                    <div className="text-xs font-mono">--:--:--</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-[9px] text-slate-400 font-bold">TEMP</div>
                    <div className="text-xs font-mono">--°C</div>
                </div>
            </div>
        </div>
    </AppWidget>
  )
}
