import { useState, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react'
import { useSettingsStore } from '@/stores/settings-store'
import { useThemeStore } from '@/stores/theme-store'
import { AppWidget } from '../AppWidget'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/services/utils'

interface RealSpotifyWidgetProps {
  id: string
  onRemove: () => void
}

export function RealSpotifyWidget({ id, onRemove }: RealSpotifyWidgetProps) {
  const { integrations, updateIntegrations, saveSettings } = useSettingsStore()
  const { mode } = useThemeStore()
  const [track, setTrack] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [clientId, setClientId] = useState(integrations.spotifyClientId || '')
  const [token, setToken] = useState(integrations.spotifyToken || '')

  useEffect(() => {
    // if (!integrations.spotifyToken) {
    //   setUserProfile(null)
    //   return
    // }

    const fetchProfile = async () => {
      if (!integrations.spotifyToken) {
        setUserProfile(null)
        return
      }
      try {
        const profile = await window.ipcRenderer.invoke('spotify:get-profile', { token: integrations.spotifyToken })
        setUserProfile(profile)
      } catch (e) {
        console.error("Failed to fetch profile", e)
        setUserProfile(null)
      }
    }

    fetchProfile()

    const fetchTrack = async () => {
      try {
        let data = null
        // Try API first if token exists
        if (integrations.spotifyToken) {
          data = await window.ipcRenderer.invoke('spotify:now-playing', { token: integrations.spotifyToken })
        }
        
        // Fallback to local process check if API failed or no token
        if (!data) {
          data = await window.ipcRenderer.invoke('spotify:local-now-playing')
        }

        setTrack(data)
      } catch (e) {
        console.error(e)
      }
    }

    fetchTrack()
    const interval = setInterval(fetchTrack, 5000)
    return () => clearInterval(interval)
  }, [integrations.spotifyToken])

  const handleSaveConfig = () => {
    updateIntegrations({ spotifyClientId: clientId, spotifyToken: token })
    saveSettings()
  }

  const control = async (cmd: string) => {
    if (!integrations.spotifyToken) return
    await window.ipcRenderer.invoke('spotify:control', { token: integrations.spotifyToken, command: cmd })
  }

  const ConfigContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className={cn("text-xs font-medium", mode === 'glass' ? "text-white/70" : "text-gray-500")}>Client Token</label>
        <Input 
          value={token} 
          onChange={(e) => setToken(e.target.value)} 
          placeholder="Paste Spotify Access Token"
          className={cn(mode === 'glass' ? "bg-white/10 border-white/20 text-white placeholder:text-white/30" : "")}
        />
        {userProfile && (
          <div className={cn("text-xs flex items-center gap-2", mode === 'glass' ? "text-green-400" : "text-green-600")}>
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            Connected as {userProfile.display_name}
          </div>
        )}
        <p className={cn("text-[10px]", mode === 'glass' ? "text-white/40" : "text-gray-400")}>
          Get a token from the Spotify Developer Dashboard.
        </p>
      </div>
      <Button onClick={handleSaveConfig} className="w-full">Save Connection</Button>
    </div>
  )

  return (
    <AppWidget 
      title="Spotify" 
      icon={Music} 
      isConfigured={!!integrations.spotifyToken} 
      onRemove={onRemove}
      configContent={ConfigContent}
    >
      {!track ? (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
          <div className={cn("p-3 rounded-full", mode === 'glass' ? "bg-white/10" : "bg-gray-100")}>
            <Music className={cn("h-6 w-6", mode === 'glass' ? "text-white/50" : "text-gray-400")} />
          </div>
          <p className={cn("text-sm font-medium", mode === 'glass' ? "text-white/70" : "text-gray-500")}>
            Not Playing
          </p>
        </div>
      ) : (
        <div className="h-full flex flex-col justify-between">
          <div className="flex gap-4 items-center">
            {track.image ? (
              <img src={track.image} alt="Album Art" className="h-16 w-16 rounded-md shadow-lg object-cover" />
            ) : (
              <div className={cn("h-16 w-16 rounded-md flex items-center justify-center", mode === 'glass' ? "bg-white/10" : "bg-gray-100")}>
                <Music className="h-6 w-6 opacity-30" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className={cn("font-bold text-sm truncate", mode === 'glass' ? "text-white" : "text-gray-900")}>{track.name}</h4>
              <p className={cn("text-xs truncate", mode === 'glass' ? "text-white/60" : "text-gray-500")}>{track.artist}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Progress */}
            <div className={cn("w-full h-1 rounded-full overflow-hidden", mode === 'glass' ? "bg-white/10" : "bg-gray-100")}>
              <div 
                className={cn("h-full transition-all duration-1000", mode === 'glass' ? "bg-white" : "bg-black")} 
                style={{ width: `${(track.progress / track.duration) * 100}%` }} 
              />
            </div>

            {/* Controls */}
            {track.isLocal ? (
              <div className="flex justify-center items-center gap-2 mt-4">
                 <div className={cn("text-[10px] px-2 py-1 rounded-full", mode === 'glass' ? "bg-white/10 text-white/50" : "bg-gray-200 text-gray-500")}>
                   Local Player Detected
                 </div>
              </div>
            ) : (
            <div className="flex justify-center items-center gap-6">
              <button onClick={() => control('previous')} className={cn("transition-colors", mode === 'glass' ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-black")}>
                <SkipBack className="h-5 w-5" />
              </button>
              <button 
                onClick={() => control(track.isPlaying ? 'pause' : 'play')} 
                className={cn(
                  "p-3 rounded-full shadow-lg hover:scale-105 transition-all", 
                  mode === 'glass' ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-gray-900"
                )}
              >
                {track.isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current pl-0.5" />}
              </button>
              <button onClick={() => control('next')} className={cn("transition-colors", mode === 'glass' ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-black")}>
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
            )}
          </div>
        </div>
      )}
    </AppWidget>
  )
}
