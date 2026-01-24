import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react'
import { cn } from '@/services/utils'

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<'work' | 'break'>('work')

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      // Play sound here
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  const toggleTimer = () => setIsActive(!isActive)

  const switchMode = () => {
    const newMode = mode === 'work' ? 'break' : 'work'
    setMode(newMode)
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60)
    setIsActive(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-white/90 dark:bg-black/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border">
        <div 
            className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-colors",
                mode === 'work' ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            )}
            onClick={switchMode}
            title={mode === 'work' ? "Switch to Break" : "Back to Work"}
        >
            {mode === 'work' ? <RotateCcw className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
        </div>
        
        <div className="font-mono font-bold w-12 text-center text-sm tabular-nums">
            {formatTime(timeLeft)}
        </div>

        <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={toggleTimer}
        >
            {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </Button>
    </div>
  )
}
