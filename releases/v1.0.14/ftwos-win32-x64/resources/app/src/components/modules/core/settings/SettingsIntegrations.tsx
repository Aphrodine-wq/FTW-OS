/**
 * Settings Integrations Component
 * Handles API key fallback settings (non-OAuth providers)
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSettingsStore } from '@/stores/settings-store'
import { useSecureSettings } from '@/stores/secure-settings-store'
import { Save, CheckCircle2, Cpu, Gamepad2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { OAuthConnections } from './OAuthConnections'

export function SettingsIntegrations() {
  const { integrations, updateIntegrations, saveSettings } = useSettingsStore()
  const { setSecureKey } = useSecureSettings()
  const { toast } = useToast()
  const [integrationData, setIntegrationData] = useState({
    steamApiKey: '',
    steamId: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    ollamaEndpoint: 'http://localhost:11434'
  })

  useEffect(() => {
    if (integrations) {
      setIntegrationData(prev => ({
        ...prev,
        ...integrations
      }))
    }
  }, [integrations])

  const handleIntegrationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateIntegrations(integrationData)
    saveSettings()

    // Save sensitive keys to vault
    const sensitiveKeys = ['openaiApiKey', 'anthropicApiKey', 'steamApiKey']
    try {
      for (const key of sensitiveKeys) {
        if (integrationData[key as keyof typeof integrationData]) {
          await setSecureKey(key, integrationData[key as keyof typeof integrationData] as string)
        }
      }
      toast({ title: "Integrations Saved", description: "API keys saved successfully" })
    } catch (err) {
      console.error("Vault save failed:", err)
      toast({ title: "Warning", description: "Settings saved but secure storage failed", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <OAuthConnections />

      {/* API Key Fallback */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys (Fallback)</CardTitle>
          <CardDescription>For services that don't support OAuth, use API keys</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIntegrationsSubmit} className="space-y-6">
            {/* Steam */}
            <div className="p-6 rounded-xl border bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              <h3 className="font-medium text-lg border-b pb-2 flex items-center gap-2 mb-4">
                <span className="p-1 rounded bg-blue-500/10 text-blue-600"><Gamepad2 className="h-5 w-5" /></span>
                Steam
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium flex justify-between">
                    Steam API Key
                    {integrationData.steamApiKey && <span className="text-xs text-green-500 font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Configured</span>}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={integrationData.steamApiKey || ''}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, steamApiKey: e.target.value }))}
                      className="flex-1 font-mono text-sm"
                      type="password"
                      placeholder="XXXXXXXXXXXXXXXXXXXX"
                    />
                    <Button variant="outline" size="sm" onClick={() => window.open('https://steamcommunity.com/dev/apikey', '_blank')}>
                      Get Key
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Steam ID (64-bit)</label>
                  <Input
                    value={integrationData.steamId || ''}
                    onChange={(e) => setIntegrationData(prev => ({ ...prev, steamId: e.target.value }))}
                    className="w-full font-mono text-sm"
                    placeholder="76561198..."
                  />
                </div>
              </div>
            </div>

            {/* OpenAI */}
            <div className="p-6 rounded-xl border bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              <h3 className="font-medium text-lg border-b pb-2 flex items-center gap-2 mb-4">
                <span className="p-1 rounded bg-green-500/10 text-green-600"><Cpu className="h-5 w-5" /></span>
                OpenAI / ChatGPT
              </h3>
              <div className="grid gap-2">
                <label className="text-sm font-medium flex justify-between">
                  API Key
                  {integrationData.openaiApiKey && <span className="text-xs text-green-500 font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Configured</span>}
                </label>
                <Input
                  value={integrationData.openaiApiKey || ''}
                  onChange={(e) => setIntegrationData(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                  className="w-full font-mono text-sm"
                  type="password"
                  placeholder="sk-..."
                />
              </div>
            </div>

            {/* Anthropic */}
            <div className="p-6 rounded-xl border bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              <h3 className="font-medium text-lg border-b pb-2 flex items-center gap-2 mb-4">
                <span className="p-1 rounded bg-purple-500/10 text-purple-600"><Cpu className="h-5 w-5" /></span>
                Anthropic / Claude
              </h3>
              <div className="grid gap-2">
                <label className="text-sm font-medium flex justify-between">
                  API Key
                  {integrationData.anthropicApiKey && <span className="text-xs text-green-500 font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Configured</span>}
                </label>
                <Input
                  value={integrationData.anthropicApiKey || ''}
                  onChange={(e) => setIntegrationData(prev => ({ ...prev, anthropicApiKey: e.target.value }))}
                  className="w-full font-mono text-sm"
                  type="password"
                  placeholder="sk-ant-..."
                />
              </div>
            </div>

            {/* Ollama */}
            <div className="p-6 rounded-xl border bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              <h3 className="font-medium text-lg border-b pb-2 flex items-center gap-2 mb-4">
                <span className="p-1 rounded bg-yellow-500/10 text-yellow-600"><Cpu className="h-5 w-5" /></span>
                Ollama (Local AI)
              </h3>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Endpoint URL</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={async () => {
                      try {
                        const url = integrationData.ollamaEndpoint || 'http://localhost:11434'
                        const res = await fetch(`${url}/api/tags`)
                        if (res.ok) toast({ title: "Connected", description: "Successfully connected to Ollama!" })
                        else toast({ title: "Connection Failed", description: "Could not connect to Ollama", variant: "destructive" })
                      } catch (e) {
                        toast({ title: "Connection Failed", description: "Check if Ollama is running", variant: "destructive" })
                      }
                    }}
                  >
                    Test Connection
                  </Button>
                </div>
                <Input
                  value={integrationData.ollamaEndpoint || 'http://localhost:11434'}
                  onChange={(e) => setIntegrationData(prev => ({ ...prev, ollamaEndpoint: e.target.value }))}
                  className="w-full font-mono text-sm"
                  placeholder="http://localhost:11434"
                />
                <p className="text-xs text-muted-foreground">Default is http://localhost:11434</p>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" /> Save API Keys
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

