import React, { useState, useEffect } from 'react'
import { Gamepad2, LayoutGrid, List, Monitor } from 'lucide-react'
import { useSettingsStore } from '@/stores/settings-store'
import { useThemeStore } from '@/stores/theme-store'
import { AppWidget } from '../AppWidget'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/services/utils'

interface RealSteamWidgetProps {
  id: string
  onRemove: () => void
}

type ViewMode = 'hero' | 'grid' | 'list'

export function RealSteamWidget({ id, onRemove }: RealSteamWidgetProps) {
  const { integrations, updateIntegrations, saveSettings } = useSettingsStore()
  const { mode } = useThemeStore()
  const [games, setGames] = useState<any[]>([])
  const [apiKey, setApiKey] = useState(integrations.steamApiKey || '')
  const [steamId, setSteamId] = useState(integrations.steamId || '')
  const [viewMode, setViewMode] = useState<ViewMode>('hero')

  useEffect(() => {
    if (!integrations.steamApiKey || !integrations.steamId) return

    const fetchGames = async () => {
      try {
        const data = await window.ipcRenderer.invoke('steam:recent-games', { 
            apiKey: integrations.steamApiKey, 
            steamId: integrations.steamId 
        })
        setGames(data || [])
      } catch (e) {
        console.error(e)
      }
    }

    fetchGames()
  }, [integrations.steamApiKey, integrations.steamId])

  const handleSaveConfig = () => {
    updateIntegrations({ steamApiKey: apiKey, steamId: steamId })
    saveSettings()
  }

  const ConfigContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className={cn("text-xs font-medium", mode === 'glass' ? "text-white/70" : "text-gray-500")}>Steam API Key</label>
        <Input 
          value={apiKey} 
          type="password"
          onChange={(e) => setApiKey(e.target.value)} 
          className={cn(mode === 'glass' ? "bg-white/10 border-white/20 text-white" : "")}
        />
      </div>
      <div className="space-y-2">
        <label className={cn("text-xs font-medium", mode === 'glass' ? "text-white/70" : "text-gray-500")}>Steam ID (64-bit)</label>
        <Input 
          value={steamId} 
          onChange={(e) => setSteamId(e.target.value)} 
          className={cn(mode === 'glass' ? "bg-white/10 border-white/20 text-white" : "")}
        />
      </div>
      <Button onClick={handleSaveConfig} className="w-full">Connect Steam</Button>
    </div>
  )

  const renderHero = () => {
    if (games.length === 0) return null
    const game = games[0]
    return (
        <div className="relative h-full w-full rounded-xl overflow-hidden group">
            {/* Background Image (blurred) */}
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-110 transition-transform duration-700 group-hover:scale-125"
                style={{ backgroundImage: `url(http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg)` }}
            />
            
            <div className="relative z-10 flex flex-col h-full justify-between p-4">
                <div className="flex justify-between items-start">
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        Recently Played
                    </span>
                </div>
                
                <div className="flex items-end gap-4">
                    <img 
                        src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`} 
                        alt={game.name}
                        className="h-16 w-16 rounded-lg shadow-2xl border-2 border-white/10"
                    />
                    <div>
                        <h3 className={cn("text-lg font-black leading-none mb-1", mode === 'glass' ? "text-white" : "text-gray-900")}>
                            {game.name}
                        </h3>
                        <p className={cn("text-xs", mode === 'glass' ? "text-white/60" : "text-gray-500")}>
                            {(game.playtime_2weeks / 60).toFixed(1)} hrs past 2 weeks
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
  }

  const renderGrid = () => (
    <div className="grid grid-cols-3 gap-2 h-full content-start">
        {games.slice(0, 9).map((game: any) => (
            <div key={game.appid} className="aspect-square relative group rounded-lg overflow-hidden bg-black/20">
                <img 
                    src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`} 
                    alt={game.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                    <span className="text-[10px] text-white font-bold text-center leading-tight">{game.name}</span>
                </div>
            </div>
        ))}
    </div>
  )

  const renderList = () => (
    <div className="h-full space-y-2 overflow-auto custom-scrollbar">
        {games.map((game: any) => (
        <div key={game.appid} className={cn("flex items-center gap-3 p-2 rounded-lg transition-colors group", mode === 'glass' ? "hover:bg-white/10" : "hover:bg-gray-50")}>
            <img 
            src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`} 
            alt={game.name}
            className="h-8 w-8 rounded shadow-sm"
            />
            <div className="flex-1 overflow-hidden">
            <p className={cn("text-xs font-bold truncate", mode === 'glass' ? "text-white" : "text-gray-900")}>{game.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded", mode === 'glass' ? "bg-white/10 text-white/70" : "bg-gray-100 text-gray-600")}>
                    {(game.playtime_2weeks / 60).toFixed(1)}h
                </span>
            </div>
            </div>
        </div>
        ))}
    </div>
  )

  return (
    <AppWidget 
      title="Steam" 
      icon={Gamepad2} 
      isConfigured={!!integrations.steamApiKey} 
      onRemove={onRemove}
      configContent={ConfigContent}
    >
        <div className="flex flex-col h-full gap-2">
            {/* View Toggle */}
            <div className="flex justify-end gap-1 px-1">
                <button onClick={() => setViewMode('hero')} className={cn("p-1 rounded hover:bg-white/10 transition-colors", viewMode === 'hero' ? "text-blue-400" : "text-gray-500")}>
                    <Monitor className="h-3 w-3" />
                </button>
                <button onClick={() => setViewMode('grid')} className={cn("p-1 rounded hover:bg-white/10 transition-colors", viewMode === 'grid' ? "text-blue-400" : "text-gray-500")}>
                    <LayoutGrid className="h-3 w-3" />
                </button>
                <button onClick={() => setViewMode('list')} className={cn("p-1 rounded hover:bg-white/10 transition-colors", viewMode === 'list' ? "text-blue-400" : "text-gray-500")}>
                    <List className="h-3 w-3" />
                </button>
            </div>

            <div className="flex-1 overflow-hidden">
                {games.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                        <div className={cn("p-3 rounded-full", mode === 'glass' ? "bg-white/10" : "bg-gray-100")}>
                            <Gamepad2 className={cn("h-6 w-6", mode === 'glass' ? "text-white/50" : "text-gray-400")} />
                        </div>
                        <p className={cn("text-xs", mode === 'glass' ? "text-white/50" : "text-gray-400")}>No recent activity</p>
                    </div>
                ) : (
                    viewMode === 'hero' ? renderHero() :
                    viewMode === 'grid' ? renderGrid() :
                    renderList()
                )}
            </div>
        </div>
    </AppWidget>
  )
}
