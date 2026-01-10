import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack, Cloud, Shuffle, Repeat } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { AppWidget } from '../AppWidget'
import { cn } from '@/services/utils'

interface RealSoundCloudWidgetProps {
  id: string
  onRemove: () => void
}

export function RealSoundCloudWidget({ id, onRemove }: RealSoundCloudWidgetProps) {
  const { mode } = useThemeStore()
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <AppWidget 
      title="SoundCloud" 
      icon={Cloud} 
      isConfigured={true} 
      onRemove={onRemove}
    >
        <div className="h-full flex flex-col justify-between">
           {/* Header / Track Info */}
           <div className="flex gap-4 items-center">
              <div className="h-16 w-16 rounded-md bg-gradient-to-br from-[#ff5500] to-[#ff8800] shadow-lg flex items-center justify-center shrink-0 relative overflow-hidden group">
                  <Cloud className="h-8 w-8 text-white relative z-10" />
                  {/* Visualizer effect */}
                  {isPlaying && (
                    <div className="absolute inset-0 flex items-end justify-center gap-[2px] pb-2 opacity-50">
                        {[...Array(5)].map((_, i) => (
                            <motion.div 
                                key={i}
                                className="w-1 bg-white"
                                animate={{ height: ["20%", "80%", "30%"] }}
                                transition={{ 
                                    duration: 0.6, 
                                    repeat: Infinity, 
                                    repeatType: "reverse",
                                    delay: i * 0.1 
                                }}
                            />
                        ))}
                    </div>
                  )}
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h3 className={cn("font-bold truncate text-sm", mode === 'glass' ? "text-white" : "text-gray-900")}>
                    Unknown Artist
                </h3>
                <p className={cn("text-xs opacity-70 truncate", mode === 'glass' ? "text-white" : "text-gray-500")}>
                    SoundCloud Stream
                </p>
                
                <div className="mt-2 w-full bg-white/10 h-1 rounded-full overflow-hidden relative">
                    {isPlaying && (
                        <motion.div 
                            className="h-full bg-[#ff5500]"
                            animate={{ width: ["0%", "100%"] }}
                            transition={{ duration: 180, ease: "linear", repeat: Infinity }}
                        />
                    )}
                    <div className={cn("absolute top-0 left-0 h-full w-[30%] bg-[#ff5500]", !isPlaying && "opacity-50")} />
                </div>
              </div>
           </div>
          
            {/* Controls */}
            <div className="flex justify-between items-center px-2 mt-auto">
                <Shuffle className={cn("h-3 w-3", mode === 'glass' ? "text-white/40" : "text-gray-400")} />
                <div className="flex gap-4 items-center">
                    <button className={cn("transition-colors", mode === 'glass' ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-black")}>
                        <SkipBack className="h-4 w-4 fill-current" />
                    </button>
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={cn(
                        "p-2 rounded-full shadow-lg hover:scale-105 transition-all", 
                        mode === 'glass' ? "bg-white text-[#ff5500] hover:bg-white/90" : "bg-[#ff5500] text-white hover:bg-[#ff6600]"
                        )}
                    >
                        {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current pl-0.5" />}
                    </button>
                    <button className={cn("transition-colors", mode === 'glass' ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-black")}>
                        <SkipForward className="h-4 w-4 fill-current" />
                    </button>
                </div>
                <Repeat className={cn("h-3 w-3", mode === 'glass' ? "text-white/40" : "text-gray-400")} />
            </div>
        </div>
    </AppWidget>
  )
}
