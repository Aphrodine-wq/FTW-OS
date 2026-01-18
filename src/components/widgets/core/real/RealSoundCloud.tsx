import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack, Cloud, Shuffle, Repeat, Settings as SettingsIcon } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { useSettingsStore } from '@/stores/settings-store'
import { AppWidget } from '../AppWidget'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/services/utils'

interface RealSoundCloudWidgetProps {
  id: string
  onRemove: () => void
}

export function RealSoundCloudWidget({ id, onRemove }: RealSoundCloudWidgetProps) {
  const { mode } = useThemeStore()
  const { integrations, updateIntegrations, saveSettings } = useSettingsStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [clientId, setClientId] = useState(integrations.soundcloudClientId || '')
  const [clientSecret, setClientSecret] = useState(integrations.soundcloudClientSecret || '')
  const [username, setUsername] = useState(integrations.soundcloudUsername || '')

  const handleSaveConfig = () => {
    updateIntegrations({
      soundcloudClientId: clientId,
      soundcloudClientSecret: clientSecret,
      soundcloudUsername: username
    })
    saveSettings()
  }

  const isConfigured = !!integrations.soundcloudClientId

  const ConfigContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className={cn("text-xs font-medium", mode === 'glass' ? "text-white/70" : "text-gray-500")}>Client ID</label>
        <Input
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="Your SoundCloud Client ID"
          className={cn(mode === 'glass' ? "bg-white/10 border-white/20 text-white" : "")}
        />
      </div>
      <div className="space-y-2">
        <label className={cn("text-xs font-medium", mode === 'glass' ? "text-white/70" : "text-gray-500")}>Client Secret</label>
        <Input
          value={clientSecret}
          type="password"
          onChange={(e) => setClientSecret(e.target.value)}
          placeholder="Your SoundCloud Client Secret"
          className={cn(mode === 'glass' ? "bg-white/10 border-white/20 text-white" : "")}
        />
      </div>
      <div className="space-y-2">
        <label className={cn("text-xs font-medium", mode === 'glass' ? "text-white/70" : "text-gray-500")}>Username</label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your SoundCloud username"
          className={cn(mode === 'glass' ? "bg-white/10 border-white/20 text-white" : "")}
        />
      </div>
      <Button onClick={handleSaveConfig} className="w-full">Connect SoundCloud</Button>
      <p className={cn("text-[10px] mt-2", mode === 'glass' ? "text-white/40" : "text-gray-400")}>
        Get your API credentials from the <a href="https://soundcloud.com/you/apps" target="_blank" rel="noopener noreferrer" className="underline">SoundCloud Developer Portal</a>
      </p>
    </div>
  )

  // Empty state when not configured
  if (!isConfigured) {
    return (
      <AppWidget
        title="SoundCloud"
        icon={Cloud}
        isConfigured={false}
        onRemove={onRemove}
        configContent={ConfigContent}
      >
        <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-4">
          <div className={cn("p-4 rounded-full", mode === 'glass' ? "bg-white/10" : "bg-orange-100")}>
            <Cloud className={cn("h-8 w-8", mode === 'glass' ? "text-white/50" : "text-orange-500")} />
          </div>
          <div>
            <p className={cn("text-sm font-medium mb-1", mode === 'glass' ? "text-white" : "text-gray-900")}>
              Connect Your SoundCloud
            </p>
            <p className={cn("text-xs", mode === 'glass' ? "text-white/50" : "text-gray-500")}>
              Configure your API credentials to stream music
            </p>
          </div>
          <button
            className={cn(
              "text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors",
              mode === 'glass' ? "bg-white/10 hover:bg-white/20 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
            )}
          >
            <SettingsIcon className="h-3 w-3" />
            Configure Now
          </button>
        </div>
      </AppWidget>
    )
  }

  return (
    <AppWidget
      title="SoundCloud"
      icon={Cloud}
      isConfigured={isConfigured}
      onRemove={onRemove}
      configContent={ConfigContent}
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
