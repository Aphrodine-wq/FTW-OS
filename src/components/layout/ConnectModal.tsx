import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/settings-store'
import { Check, Gamepad2, Music, Zap } from 'lucide-react'

interface ConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectModal({ open, onOpenChange }: ConnectModalProps) {
  const { integrations, updateIntegrations, saveSettings } = useSettingsStore()

  // Local state for inputs
  const [steamKey, setSteamKey] = useState(integrations.steamApiKey || '')
  const [steamId, setSteamId] = useState(integrations.steamId || '')
  const [spotifyId, setSpotifyId] = useState(integrations.spotifyClientId || '')
  const [spotifySecret, setSpotifySecret] = useState(integrations.spotifyClientSecret || '')

  const handleSave = () => {
    updateIntegrations({
      steamApiKey: steamKey,
      steamId: steamId,
      spotifyClientId: spotifyId,
      spotifyClientSecret: spotifySecret
    })
    saveSettings()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Zap className="h-4 w-4" /></span>
            Flash Connect
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Steam Section */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Gamepad2 className="h-4 w-4" /> Steam
              </div>
              {integrations.steamApiKey ? <Check className="h-4 w-4 text-green-500" /> : <div className="h-2 w-2 bg-red-400 rounded-full" />}
            </div>
            <Input
              placeholder="Steam API Key"
              value={steamKey}
              onChange={(e) => setSteamKey(e.target.value)}
              type="password"
              className="bg-white"
            />
            <Input
              placeholder="Steam ID (64-bit)"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              className="bg-white"
            />
          </div>

          {/* Spotify Section */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Music className="h-4 w-4" /> Spotify
              </div>
              {integrations.spotifyClientId ? <Check className="h-4 w-4 text-green-500" /> : <div className="h-2 w-2 bg-red-400 rounded-full" />}
            </div>
            <Input
              placeholder="Client ID"
              value={spotifyId}
              onChange={(e) => setSpotifyId(e.target.value)}
              className="bg-white"
            />
            <Input
              placeholder="Client Secret"
              value={spotifySecret}
              onChange={(e) => setSpotifySecret(e.target.value)}
              type="password"
              className="bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-black text-white hover:bg-slate-800">Save Connections</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
