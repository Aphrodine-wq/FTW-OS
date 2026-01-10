import React, { useState, useEffect } from 'react'
import { Play, Pause, RefreshCw, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/theme-store'
import { AppWidget } from '../AppWidget'
import { Input } from '@/components/ui/input'
import { cn } from '@/services/utils'

interface PomodoroMaxProps {
  id: string
  onRemove: () => void
}

export function PomodoroMax({ id, onRemove }: PomodoroMaxProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('25')
  const { mode } = useThemeStore()

  useEffect(() => {
    let interval: any = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCustomSet = () => {
    const mins = parseInt(customMinutes)
    if (!isNaN(mins)) {
      setTimeLeft(mins * 60)
      setIsActive(false)
    }
  }

  const ConfigContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className={cn("text-xs font-medium", mode === 'glass' ? "text-white/70" : "text-gray-500")}>Default Duration (Minutes)</label>
        <div className="flex gap-2">
          <Input 
            value={customMinutes} 
            onChange={(e) => setCustomMinutes(e.target.value)} 
            type="number"
            className={cn(mode === 'glass' ? "bg-white/10 border-white/20 text-white" : "")}
          />
          <Button onClick={handleCustomSet}>Set</Button>
        </div>
      </div>
    </div>
  )

  return (
    <AppWidget 
      title="Focus Timer" 
      icon={Timer} 
      isConfigured={true} 
      onRemove={onRemove} 
      configContent={ConfigContent}
    >
      <div className="h-full flex flex-col items-center justify-center relative">
        {/* Progress Ring Background (Visual Only) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
           <div className={cn("w-32 h-32 rounded-full border-4", mode === 'glass' ? "border-white" : "border-black")}></div>
        </div>

        <div className={cn("text-5xl font-black font-mono mb-4 tracking-tighter z-10", mode === 'glass' ? "text-white" : "text-slate-900")}>
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex gap-2 w-full px-4 z-10">
          <Button 
            className={cn("flex-1 font-bold h-9 transition-all active:scale-95", mode === 'glass' ? "bg-white text-black hover:bg-white/90" : "bg-slate-900 hover:bg-slate-800 text-white")}
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button 
            variant="outline"
            size="icon"
            className={cn("h-9 w-9", mode === 'glass' ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "")}
            onClick={() => { setIsActive(false); setTimeLeft(parseInt(customMinutes) * 60) }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className={cn("mt-4 flex gap-3 text-[10px] font-bold uppercase", mode === 'glass' ? "text-white/40" : "text-slate-400")}>
          <span className="cursor-pointer hover:text-current hover:underline transition-all" onClick={() => { setIsActive(false); setTimeLeft(25 * 60) }}>Focus</span>
          <span>•</span>
          <span className="cursor-pointer hover:text-current hover:underline transition-all" onClick={() => { setIsActive(false); setTimeLeft(5 * 60) }}>Short</span>
          <span>•</span>
          <span className="cursor-pointer hover:text-current hover:underline transition-all" onClick={() => { setIsActive(false); setTimeLeft(15 * 60) }}>Long</span>
        </div>
      </div>
    </AppWidget>
  )
}
