import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Gamepad2, Music, Key, Check, X } from 'lucide-react'
import { useSettingsStore } from '@/stores/settings-store'
import { cn } from '@/services/utils'

interface ConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectModal({ open, onOpenChange }: ConnectModalProps) {
  const { integrations, updateIntegrations, saveSettings } = useSettingsStore()
  
  const [keys, setKeys] = React.useState({
    steamApiKey: integrations.steamApiKey || '',
    steamId: integrations.steamId || '',
    spotifyClientId: integrations.spotifyClientId || '',
    spotifyToken: integrations.spotifyToken || ''
  })

  const handleChange = (key: string, value: string) => {
    setKeys(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    updateIntegrations(keys)
    saveSettings()
    onOpenChange(false)
  }

  const StatusDot = ({ active }: { active: boolean }) => (
    <div className={cn("h-2 w-2 rounded-full", active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500/50")} />
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Key className="h-5 w-5 text-amber-400" />
            <span>Connection Center</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Manage your API keys and integrations in one place.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Steam Section */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
             <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                   <Gamepad2 className="h-5 w-5 text-blue-400" />
                   <span className="font-bold">Steam</span>
                </div>
                <StatusDot active={!!keys.steamApiKey} />
             </div>
             
             <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase font-bold">API Key</label>
                <Input 
                   value={keys.steamApiKey}
                   onChange={e => handleChange('steamApiKey', e.target.value)}
                   type="password"
                   className="bg-slate-900 border-slate-700 text-xs font-mono"
                   placeholder="XXXXXXXXXXXXXXXX"
                />
             </div>
             <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase font-bold">Steam ID</label>
                <Input 
                   value={keys.steamId}
                   onChange={e => handleChange('steamId', e.target.value)}
                   className="bg-slate-900 border-slate-700 text-xs font-mono"
                   placeholder="7656..."
                />
             </div>
          </div>

          {/* Spotify Section */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
             <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                   <Music className="h-5 w-5 text-green-400" />
                   <span className="font-bold">Spotify</span>
                </div>
                <StatusDot active={!!keys.spotifyToken} />
             </div>
             
             <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase font-bold">Client ID</label>
                <Input 
                   value={keys.spotifyClientId}
                   onChange={e => handleChange('spotifyClientId', e.target.value)}
                   className="bg-slate-900 border-slate-700 text-xs font-mono"
                   placeholder="Spotify Client ID"
                />
             </div>
             <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase font-bold">Access Token</label>
                <Input 
                   value={keys.spotifyToken}
                   onChange={e => handleChange('spotifyToken', e.target.value)}
                   type="password"
                   className="bg-slate-900 border-slate-700 text-xs font-mono"
                   placeholder="OAuth Token"
                />
             </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
           <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-slate-800 text-slate-400">Cancel</Button>
           <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white">
              <Check className="h-4 w-4 mr-2" /> Save Connections
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
