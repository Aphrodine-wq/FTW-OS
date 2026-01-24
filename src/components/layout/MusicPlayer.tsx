import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Play, Pause, SkipForward, SkipBack, 
  Volume2, Maximize2, Music2, CloudRain, Coffee, Wind
} from 'lucide-react'
import { cn } from '@/services/utils'

export function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(30)
  const [isHovered, setIsHovered] = useState(false)
  const [mode, setMode] = useState<'music' | 'ambient'>('music')
  const [ambientSound, setAmbientSound] = useState<'rain' | 'cafe' | 'wind'>('rain')

  // Simulate progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (playing) {
        interval = setInterval(() => {
            setProgress(p => p >= 100 ? 0 : p + 0.5)
        }, 1000)
    }
    return () => clearInterval(interval)
  }, [playing])

  return (
    <Card 
        className={cn(
            "fixed bottom-6 left-6 w-80 backdrop-blur-md transition-all duration-300 z-40 overflow-hidden",
            isHovered ? "h-48 bg-black/80 border-white/10" : "h-14 bg-black/60 border-white/5",
            "text-white shadow-2xl rounded-2xl border"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
        {/* Minimized View */}
        <div className="absolute inset-0 flex items-center px-4 gap-4">
            <div className={cn("relative w-10 h-10 rounded-md overflow-hidden bg-zinc-800 transition-all duration-300", isHovered && "scale-0 opacity-0")}>
                 <div className={cn(
                     "absolute inset-0 animate-pulse", 
                     mode === 'music' ? "bg-gradient-to-tr from-purple-500 to-orange-500" : "bg-gradient-to-tr from-blue-500 to-cyan-500"
                 )} />
                 {mode === 'music' ? (
                     <Music2 className="absolute inset-0 m-auto h-5 w-5 text-white" />
                 ) : (
                     <CloudRain className="absolute inset-0 m-auto h-5 w-5 text-white" />
                 )}
            </div>
            
            <div className={cn("flex-1 transition-all duration-300", isHovered ? "opacity-0 translate-y-4" : "opacity-100")}>
                <div className="text-sm font-bold truncate">{mode === 'music' ? 'Midnight City' : 'Heavy Rain'}</div>
                <div className="text-xs text-zinc-400 truncate">{mode === 'music' ? 'M83 • Hurry Up, We\'re Dreaming' : 'Ambient • Focus Mode'}</div>
            </div>

            <div className={cn("flex gap-2 transition-all duration-300", isHovered ? "opacity-0 translate-y-4" : "opacity-100")}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-white hover:bg-white/10" onClick={() => setPlaying(!playing)}>
                    {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                </Button>
            </div>
        </div>

        {/* Expanded View */}
        <div className={cn("absolute inset-0 p-4 flex flex-col justify-between transition-all duration-300", isHovered ? "opacity-100 delay-75" : "opacity-0 pointer-events-none")}>
            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-zinc-800 shrink-0 relative overflow-hidden group">
                     <div className={cn(
                         "absolute inset-0", 
                         mode === 'music' ? "bg-gradient-to-tr from-purple-500 to-orange-500" : "bg-gradient-to-tr from-blue-500 to-cyan-500"
                     )} />
                     {mode === 'music' ? (
                        <Music2 className="absolute inset-0 m-auto h-6 w-6 text-white" />
                     ) : (
                        <CloudRain className="absolute inset-0 m-auto h-6 w-6 text-white" />
                     )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{mode === 'music' ? 'Midnight City' : 'Ambient Focus'}</div>
                    <div className="text-xs text-zinc-400 truncate">{mode === 'music' ? 'M83' : 'Nature Sounds'}</div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            {/* Ambient Controls */}
            <div className="flex justify-center gap-2 py-2">
                 <button 
                    onClick={() => { setMode('music') }}
                    className={cn("px-3 py-1 rounded-full text-xs transition-colors", mode === 'music' ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20")}
                 >
                    Music
                 </button>
                 <button 
                    onClick={() => { setMode('ambient') }}
                    className={cn("px-3 py-1 rounded-full text-xs transition-colors", mode === 'ambient' ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20")}
                 >
                    Ambient
                 </button>
            </div>

            {mode === 'ambient' && (
                <div className="flex justify-center gap-4 py-1">
                    <CloudRain className={cn("h-4 w-4 cursor-pointer hover:text-white", ambientSound === 'rain' ? "text-blue-400" : "text-zinc-500")} onClick={() => setAmbientSound('rain')} />
                    <Coffee className={cn("h-4 w-4 cursor-pointer hover:text-white", ambientSound === 'cafe' ? "text-orange-400" : "text-zinc-500")} onClick={() => setAmbientSound('cafe')} />
                    <Wind className={cn("h-4 w-4 cursor-pointer hover:text-white", ambientSound === 'wind' ? "text-cyan-400" : "text-zinc-500")} onClick={() => setAmbientSound('wind')} />
                </div>
            )}

            <div className="flex justify-between items-center px-2">
                 <div className="flex gap-3">
                    <SkipBack className="h-5 w-5 text-zinc-400 hover:text-white cursor-pointer" />
                    <div 
                        className="h-5 w-5 rounded-full flex items-center justify-center bg-white text-black cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => setPlaying(!playing)}
                    >
                        {playing ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current pl-0.5" />}
                    </div>
                    <SkipForward className="h-5 w-5 text-zinc-400 hover:text-white cursor-pointer" />
                 </div>
                 
                 <div className="flex gap-3">
                    <Volume2 className="h-4 w-4 text-zinc-400 hover:text-white cursor-pointer" />
                    <Maximize2 className="h-4 w-4 text-zinc-400 hover:text-white cursor-pointer" />
                 </div>
            </div>
        </div>
    </Card>
  )
}
