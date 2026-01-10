import React, { useEffect, useState } from 'react'
import { Activity, Cpu, HardDrive, Clock, BarChart3, Wifi } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { AppWidget } from '../AppWidget'
import { cn } from '@/services/utils'

interface SystemHealthProps {
  id: string
  onRemove: () => void
}

export function SystemHealth({ id, onRemove }: SystemHealthProps) {
  const [stats, setStats] = useState<any>(null)
  const { mode } = useThemeStore()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (window.ipcRenderer) {
          const data = await window.ipcRenderer.invoke('system:get-stats')
          setStats(data)
        } else {
          setStats({
            cpu: 45,
            mem: { percent: 62, used: 8000000000, total: 16000000000 },
            uptime: 36000,
            hostname: 'LOCALHOST',
            platform: 'win32'
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
    
    fetchStats()
    const interval = setInterval(fetchStats, 2000)
    return () => clearInterval(interval)
  }, [])

  const ConfigContent = (
    <div className="text-center text-xs text-gray-500">
      System monitor is active. No configuration needed.
    </div>
  )

  if (!stats) return (
    <AppWidget title="System Status" icon={Activity} isConfigured={true} onRemove={onRemove} configContent={ConfigContent}>
       <div className="flex items-center justify-center h-full text-xs text-gray-400">Initializing sensors...</div>
    </AppWidget>
  )

  return (
    <AppWidget 
      title="System Status" 
      icon={Activity} 
      isConfigured={true} 
      onRemove={onRemove} 
      configContent={ConfigContent}
    >
      <div className="h-full flex flex-col justify-between">
        {/* CPU & Memory Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* CPU Card */}
          <div className={cn("p-3 rounded-lg flex flex-col justify-between relative overflow-hidden", mode === 'glass' ? "bg-white/5" : "bg-gray-50")}>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className={cn("h-3.5 w-3.5", mode === 'glass' ? "text-blue-400" : "text-blue-600")} />
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", mode === 'glass' ? "text-white/60" : "text-gray-500")}>CPU</span>
            </div>
            <div className={cn("text-2xl font-black tracking-tighter z-10", mode === 'glass' ? "text-white" : "text-gray-900")}>
              {stats.cpu.toFixed(0)}<span className="text-sm align-top opacity-50">%</span>
            </div>
            {/* Mini Graph Background */}
            <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20 flex items-end gap-0.5 px-2 pb-1">
               {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex-1 bg-current rounded-t-sm" style={{ height: `${Math.random() * 100}%` }} />
               ))}
            </div>
          </div>

          {/* Memory Card */}
          <div className={cn("p-3 rounded-lg flex flex-col justify-between", mode === 'glass' ? "bg-white/5" : "bg-gray-50")}>
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className={cn("h-3.5 w-3.5", mode === 'glass' ? "text-purple-400" : "text-purple-600")} />
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", mode === 'glass' ? "text-white/60" : "text-gray-500")}>RAM</span>
            </div>
            <div className={cn("text-2xl font-black tracking-tighter", mode === 'glass' ? "text-white" : "text-gray-900")}>
              {stats.mem.percent.toFixed(0)}<span className="text-sm align-top opacity-50">%</span>
            </div>
            <div className={cn("text-[10px] font-mono", mode === 'glass' ? "text-white/40" : "text-gray-400")}>
              {(stats.mem.used / 1024 / 1024 / 1024).toFixed(1)}GB / {(stats.mem.total / 1024 / 1024 / 1024).toFixed(1)}GB
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className={cn("mt-3 pt-3 border-t flex items-center justify-between", mode === 'glass' ? "border-white/10" : "border-gray-100")}>
          <div className="flex items-center gap-1.5">
            <Clock className={cn("h-3 w-3", mode === 'glass' ? "text-white/40" : "text-gray-400")} />
            <span className={cn("text-[10px] font-mono", mode === 'glass' ? "text-white/60" : "text-gray-500")}>
              UP: {(stats.uptime / 3600).toFixed(1)}h
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className={cn("h-3 w-3", mode === 'glass' ? "text-emerald-400" : "text-emerald-600")} />
            <span className={cn("text-[10px] font-bold uppercase", mode === 'glass' ? "text-white/40" : "text-gray-400")}>
              {stats.hostname}
            </span>
          </div>
        </div>
      </div>
    </AppWidget>
  )
}
