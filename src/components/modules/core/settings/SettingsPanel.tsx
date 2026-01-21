import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BusinessProfile } from '@/types/invoice'
import { useSettingsStore } from '@/stores/settings-store'
import { useThemeStore } from '@/stores/theme-store'
import { useLayoutStore } from '@/stores/layout-store'
import { useSecureSettings } from '@/stores/secure-settings-store'
import { THEME_PRESETS, applyThemePreset } from '@/lib/theme-presets'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { settingsSync } from '@/services/settings-sync'
import { useToast } from '@/components/ui/use-toast'
import { Save, Upload, Image as ImageIcon, CreditCard, Globe, Database, Download, MessageSquare, Cloud, Palette, Gamepad2, Shield, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

import { ActiveSessions } from './ActiveSessions'

export function SettingsPanel() {
  const { businessProfile, setBusinessProfile, loadSettings, saveSettings, integrations, updateIntegrations } = useSettingsStore()
  const { setSecureKey, loadAllKeys, cachedKeys } = useSecureSettings()
  const themeStore = useThemeStore()
  const layoutStore = useLayoutStore()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState<'profile' | 'general' | 'appearance' | 'integrations' | 'data' | 'payment' | 'sms' | 'cloud' | 'sessions'>('profile')
  const [formData, setFormData] = useState<Partial<BusinessProfile>>({
    name: '',
    email: '',
    phone: '',
    website: '',
    taxId: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    smsConfig: {
      accountSid: '',
      authToken: '',
      fromNumber: ''
    },
    supabaseConfig: {
      url: '',
      key: ''
    },
    paymentLinks: {
      stripe: '',
      paypal: '',
      custom: ''
    }
  })
  const [integrationData, setIntegrationData] = useState({
    steamApiKey: '',
    steamId: '',
    githubToken: '',
    soundcloudClientId: '',
    soundcloudClientSecret: '',
    soundcloudUsername: '',
    spotifyClientId: '',
    spotifyClientSecret: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    googleClientId: '',
    googleClientSecret: '',
    ollamaEndpoint: 'http://localhost:11434'
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSettings()
    loadAllKeys()
  }, [])

  // Sync state with store on mount
  useEffect(() => {
    if (businessProfile) {
      setFormData(businessProfile)
    }
    if (integrations || cachedKeys) {
      setIntegrationData(prev => ({
        ...prev,
        ...integrations,
        // Override with secure keys if they exist
        ...cachedKeys
      }))
    }
  }, [businessProfile, integrations, cachedKeys])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData) {
      setBusinessProfile({
        ...formData,
        id: formData.id || 'default',
        createdAt: formData.createdAt || new Date(),
        updatedAt: new Date(),
      } as BusinessProfile)
      saveSettings()
      alert('Settings saved successfully!')
    }
  }

  const handleIntegrationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Save Non-Sensitive Data to Main Store FIRST
    // This ensures the features verify immediately even if the Vault IPC fails
    updateIntegrations(integrationData)
    saveSettings()

    // 2. Identify and Save Sensitive Keys to Vault (Best Effort)
    const sensitiveKeys = ['openaiApiKey', 'anthropicApiKey', 'githubToken', 'steamApiKey', 'soundcloudClientSecret', 'spotifyClientSecret', 'googleClientId', 'googleClientSecret']

    try {
      for (const key of sensitiveKeys) {
        // Only update if value is present
        if (integrationData[key as keyof typeof integrationData] !== undefined) {
          await setSecureKey(key, integrationData[key as keyof typeof integrationData] as string)
        }
      }
      alert('Integrations saved successfully!')
    } catch (err) {
      console.error("Vault save failed, but local settings saved:", err)
      alert('Settings saved (Vault unavailable).')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }))
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, logo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleExport = async () => {
    try {
      const data = await window.ipcRenderer.invoke('db:export-data')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoiceforge-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      alert('Backup exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        await window.ipcRenderer.invoke('db:import-data', data)
        alert('Data imported successfully! Please restart the application.')
        window.location.reload()
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import data')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto flex gap-8">
      {/* Settings Sidebar */}
      <div className="w-64 space-y-2">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Settings</h2>
        <Button
          variant={activeSection === 'profile' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveSection('profile')}
        >
          <ImageIcon className="mr-2 h-4 w-4" /> Business Profile
        </Button>
        <Button
          variant={activeSection === 'appearance' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveSection('appearance')}
        >
          <Palette className="mr-2 h-4 w-4" /> Appearance
        </Button>
        <Button
          variant={activeSection === 'integrations' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveSection('integrations')}
        >
          <Gamepad2 className="mr-2 h-4 w-4" /> Integrations
        </Button>
        <Button
          variant={activeSection === 'general' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveSection('general')}
        >
          <Globe className="mr-2 h-4 w-4" /> General & Tax
        </Button>
        <Button
          variant={activeSection === 'payment' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveSection('payment')}
        >
          <CreditCard className="mr-2 h-4 w-4" /> Payment Links
        </Button>
        <Button
          variant={activeSection === 'sms' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveSection('sms')}
        >
          <MessageSquare className="mr-2 h-4 w-4" /> SMS Config
        </Button>
        <Button
          variant={activeSection === 'cloud' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveSection('cloud')}
        >
          <Cloud className="mr-2 h-4 w-4" /> Cloud Sync
        </Button>
        <Button
          variant={activeSection === 'sessions' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveSection('sessions')}
        >
          <Shield className="mr-2 h-4 w-4" /> Active Sessions
        </Button>
        <Button
          variant={activeSection === 'data' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveSection('data')}
        >
          <Database className="mr-2 h-4 w-4" /> Data Management
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeSection === 'appearance' && (
          <Card>
            <CardHeader>
              <CardTitle>Appearance & Theme</CardTitle>
              <CardDescription>Customize the visual style of your FairTradeWorker OS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

              <div className="space-y-4">
                <label className="text-sm font-medium block">Theme Mode</label>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'monochrome', name: 'Monochrome', desc: 'Clean, professional', color: 'bg-gray-100 border-gray-300' },
                    { id: 'glass', name: 'Glass OS', desc: 'Translucent, modern', color: 'bg-blue-500/20 border-blue-500/50 backdrop-blur-md' },
                    { id: 'midnight', name: 'Midnight', desc: 'Deep OLED dark', color: 'bg-[#050510] border-purple-900/50 text-purple-100' },
                    { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon high contrast', color: 'bg-black border-yellow-400 border-2 text-yellow-400' },
                    { id: 'retro', name: 'Retro Term', desc: 'Green phosphor', color: 'bg-black border-green-500/50 font-mono text-green-500' }
                  ].map(theme => (
                    <div
                      key={theme.id}
                      onClick={() => themeStore.setTheme({ mode: theme.id as any })}
                      className={cn(
                        "cursor-pointer rounded-xl border p-4 transition-all hover:scale-[1.02]",
                        themeStore.mode === theme.id ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
                        theme.color
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm">{theme.name}</span>
                        {themeStore.mode === theme.id && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                      </div>
                      <p className="text-xs opacity-70 mt-1">{theme.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Global Theme Controls</h4>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Blur Strength ({themeStore.blur}px)</label>
                  </div>
                  <Slider
                    value={[themeStore.blur]}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={([v]) => themeStore.setTheme({ blur: v })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Opacity ({Math.round(themeStore.opacity * 100)}%)</label>
                  </div>
                  <Slider
                    value={[themeStore.opacity]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([v]) => themeStore.setTheme({ opacity: v })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Corner Radius ({themeStore.radius}px)</label>
                  </div>
                  <Slider
                    value={[themeStore.radius]}
                    min={0}
                    max={32}
                    step={1}
                    onValueChange={([v]) => themeStore.setTheme({ radius: v })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Depth / Shadow ({Math.round((themeStore.shadow || 0.5) * 100)}%)</label>
                  </div>
                  <Slider
                    value={[themeStore.shadow || 0.5]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={([v]) => themeStore.setTheme({ shadow: v })}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium block">Background Style</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['mesh', 'aurora', 'deep', 'cyber', 'custom'] as const).map((bg) => (
                      <div
                        key={bg}
                        onClick={() => themeStore.setTheme({ background: bg })}
                        className={cn(
                          "cursor-pointer h-16 rounded-lg border-2 flex items-center justify-center capitalize transition-all text-xs font-medium",
                          themeStore.background === bg ? "border-blue-500 bg-blue-500/10 text-blue-600" : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {bg}
                      </div>
                    ))}
                  </div>

                  {themeStore.background === 'custom' && (
                    <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Custom Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={themeStore.customColor || '#000000'}
                          onChange={(e) => themeStore.setTheme({ customColor: e.target.value })}
                          className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                        />
                        <Input
                          value={themeStore.customColor || '#000000'}
                          onChange={(e) => themeStore.setTheme({ customColor: e.target.value })}
                          className="flex-1 font-mono"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Theme Presets */}
              <div className="space-y-4 pt-4 border-t">
                <Label>Theme Presets</Label>
                <Select
                  onValueChange={(presetName) => {
                    const preset = applyThemePreset(presetName)
                    if (preset) {
                      themeStore.setTheme({
                        mode: preset.mode,
                        background: preset.background,
                        customColor: preset.accent,
                        radius: preset.radius,
                        fontFamily: preset.font || 'default'
                      })
                      toast({ title: `Applied ${presetName} theme` })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a preset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(THEME_PRESETS).map(presetName => (
                      <SelectItem key={presetName} value={presetName}>
                        {presetName.charAt(0).toUpperCase() + presetName.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Quick theme presets for instant customization
                </p>
              </div>

              {/* Font Customization */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Font Customization</h4>

                <div className="space-y-4">
                  <div>
                    <Label>Font Family</Label>
                    <Select
                      value={themeStore.fontFamily || 'default'}
                      onValueChange={(value) => themeStore.setTheme({ fontFamily: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default (Inter)</SelectItem>
                        <SelectItem value="mono">Monospace (JetBrains Mono)</SelectItem>
                        <SelectItem value="serif">Serif (Merriweather)</SelectItem>
                        <SelectItem value="display">Display (Montserrat)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Font Size</Label>
                      <span className="text-sm text-muted-foreground">{themeStore.fontSize || 'base'}</span>
                    </div>
                    <Select
                      value={themeStore.fontSize || 'base'}
                      onValueChange={(value) => themeStore.setTheme({ fontSize: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xs">Extra Small</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Line Height</Label>
                      <span className="text-sm text-muted-foreground">{themeStore.lineHeight || 'normal'}</span>
                    </div>
                    <Select
                      value={themeStore.lineHeight || 'normal'}
                      onValueChange={(value) => themeStore.setTheme({ lineHeight: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tight">Tight</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="relaxed">Relaxed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Layout Customization */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Layout Customization</h4>

                <div className="space-y-4">
                  <div>
                    <Label>Sidebar Position</Label>
                    <Select
                      value={layoutStore.sidebarPosition || 'left'}
                      onValueChange={(value) => layoutStore.setSidebarPosition(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="top">Top</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Sidebar Width</Label>
                      <span className="text-sm text-muted-foreground">{layoutStore.sidebarWidth}px</span>
                    </div>
                    <Slider
                      value={[layoutStore.sidebarWidth || 256]}
                      min={200}
                      max={400}
                      step={8}
                      onValueChange={([v]) => layoutStore.setSidebarWidth(v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compact Mode</Label>
                      <p className="text-xs text-muted-foreground">Reduce spacing and padding</p>
                    </div>
                    <Switch
                      checked={layoutStore.compactMode || false}
                      onCheckedChange={(checked) => layoutStore.toggleCompact()}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Status Bar</Label>
                      <p className="text-xs text-muted-foreground">Display system status bar</p>
                    </div>
                    <Switch
                      checked={layoutStore.showStatusBar !== false}
                      onCheckedChange={(checked) => layoutStore.setShowStatusBar(checked)}
                    />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        {activeSection === 'integrations' && (
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>Connect external services to your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIntegrationsSubmit} className="space-y-6">

                <div className="space-y-4">
                  <h3 className="font-medium text-lg border-b pb-2 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-gray-500" />
                    GitHub
                  </h3>
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">Connect your GitHub account to enable Dev HQ repository access.</p>
                    {integrationData.githubToken ? (
                      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-full">
                            <Lock className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-sm font-bold">Secure Connection Active</span>
                            <span className="text-xs opacity-80">Token stored in FTW-OS Vault</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-red-500 hover:bg-red-500/10 hover:text-red-600"
                          onClick={() => {
                            setIntegrationData(prev => ({ ...prev, githubToken: '' }))
                            setSecureKey('githubToken', '') // Clear from vault
                          }}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-6 border rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors dark:bg-slate-900 dark:hover:bg-slate-800">
                        <div className="h-12 w-12 rounded-full bg-black text-white flex items-center justify-center">
                          <Globe className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">Connect GitHub Account</h4>
                          <p className="text-xs text-muted-foreground">Access private repos and issues</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            className="gap-2 bg-[#24292e] text-white hover:bg-[#2f363d] hover:text-white border-none shadow-lg"
                            onClick={() => {
                              window.open('https://github.com/settings/tokens/new?scopes=repo,user,read:org&description=FTWOS', '_blank')
                            }}
                          >
                            <Globe className="h-4 w-4" /> Generate Token
                          </Button>
                          <input
                            value={integrationData.githubToken || ''}
                            onChange={(e) => setIntegrationData(prev => ({ ...prev, githubToken: e.target.value }))}
                            className="p-2 text-xs border rounded-md bg-background"
                            type="password"
                            placeholder="Or paste token here..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg border-b pb-2 flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-blue-500" />
                    Steam
                  </h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Steam API Key</label>
                      <div className="flex gap-2">
                        <input
                          value={integrationData.steamApiKey || ''}
                          onChange={(e) => setIntegrationData(prev => ({ ...prev, steamApiKey: e.target.value }))}
                          className="flex-1 p-2 border rounded-md"
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
                      <input
                        value={integrationData.steamId || ''}
                        onChange={(e) => setIntegrationData(prev => ({ ...prev, steamId: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        placeholder="76561198..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg border-b pb-2">OpenAI / ChatGPT</h3>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">API Key</label>
                    <input
                      value={integrationData.openaiApiKey || ''}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      type="password"
                      placeholder="sk-..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg border-b pb-2">Anthropic / Claude</h3>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">API Key</label>
                    <input
                      value={integrationData.anthropicApiKey || ''}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, anthropicApiKey: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      type="password"
                      placeholder="sk-ant-..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg border-b pb-2">Ollama (Local AI)</h3>
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
                            if (res.ok) alert('✅ Connected to Ollama!')
                            else alert('❌ Connection failed.')
                          } catch (e) {
                            alert('❌ Connection failed. Check if Ollama is running.')
                          }
                        }}
                      >
                        Test Connection
                      </Button>
                    </div>
                    <input
                      value={integrationData.ollamaEndpoint || 'http://localhost:11434'}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, ollamaEndpoint: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      placeholder="http://localhost:11434"
                    />
                    <p className="text-xs text-muted-foreground">Default is http://localhost:11434</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg border-b pb-2 flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-orange-500" />
                    SoundCloud
                  </h3>
                  <div className="p-4 bg-muted/20 border rounded-lg text-sm">
                    <p className="font-medium mb-1">How to get API credentials?</p>
                    <p className="text-muted-foreground">
                      Register your app at{' '}
                      <a href="https://soundcloud.com/you/apps" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                        soundcloud.com/you/apps
                      </a>
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Client ID</label>
                    <input
                      value={integrationData.soundcloudClientId || ''}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, soundcloudClientId: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      placeholder="Your SoundCloud Client ID"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Client Secret</label>
                    <input
                      value={integrationData.soundcloudClientSecret || ''}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, soundcloudClientSecret: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      type="password"
                      placeholder="Your SoundCloud Client Secret"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Username</label>
                    <input
                      value={integrationData.soundcloudUsername || ''}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, soundcloudUsername: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      placeholder="Your SoundCloud username"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg border-b pb-2 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Google OAuth
                  </h3>
                  <div className="p-4 bg-muted/20 border rounded-lg text-sm">
                    <p className="font-medium mb-1">How to get Google OAuth credentials?</p>
                    <p className="text-muted-foreground">
                      Create a project in{' '}
                      <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Google Cloud Console
                      </a>
                      {' '}and create OAuth 2.0 Client ID credentials
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Client ID
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </label>
                    <input
                      value={integrationData.googleClientId || ''}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, googleClientId: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      placeholder="xxxxx.apps.googleusercontent.com"
                    />
                    <p className="text-xs text-muted-foreground">Your Google OAuth Client ID</p>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Client Secret
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </label>
                    <input
                      value={integrationData.googleClientSecret || ''}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, googleClientSecret: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      type="password"
                      placeholder="GOCSPX-xxxxxxxxxxxx"
                    />
                    <p className="text-xs text-muted-foreground">Stored securely in encrypted vault 🔒</p>
                  </div>
                  {integrationData.googleClientId && integrationData.googleClientSecret && (
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-full">
                          <Lock className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="block text-sm font-bold">Google OAuth Configured</span>
                          <span className="text-xs opacity-80">Credentials secured in FTW-OS Vault</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" /> Save All Integrations
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeSection === 'sms' && (
          <Card>
            <CardHeader>
              <CardTitle>SMS Configuration</CardTitle>
              <CardDescription>Configure Twilio for SMS invoicing</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 bg-muted/20 border rounded-lg text-sm">
                  <p className="font-medium mb-1">How to get these keys?</p>
                  <p className="text-muted-foreground">Sign up for a Twilio account and copy your Account SID and Auth Token from the dashboard.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Account SID</label>
                  <input
                    name="smsConfig.accountSid"
                    type="password"
                    value={formData.smsConfig?.accountSid || ''}
                    onChange={(e) => {
                      const current = formData.smsConfig || { accountSid: '', authToken: '', fromNumber: '' };
                      setFormData({
                        ...formData,
                        smsConfig: { ...current, accountSid: e.target.value }
                      });
                    }}
                    className="w-full p-2 border rounded-md"
                    placeholder="AC..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Auth Token</label>
                  <input
                    name="smsConfig.authToken"
                    type="password"
                    value={formData.smsConfig?.authToken || ''}
                    onChange={(e) => {
                      const current = formData.smsConfig || { accountSid: '', authToken: '', fromNumber: '' };
                      setFormData({
                        ...formData,
                        smsConfig: { ...current, authToken: e.target.value }
                      });
                    }}
                    className="w-full p-2 border rounded-md"
                    placeholder="Auth Token"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">From Phone Number</label>
                  <input
                    name="smsConfig.fromNumber"
                    value={formData.smsConfig?.fromNumber || ''}
                    onChange={(e) => {
                      const current = formData.smsConfig || { accountSid: '', authToken: '', fromNumber: '' };
                      setFormData({
                        ...formData,
                        smsConfig: { ...current, fromNumber: e.target.value }
                      });
                    }}
                    className="w-full p-2 border rounded-md"
                    placeholder="+1234567890"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Save SMS Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeSection === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>Add payment links to your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stripe Payment Link</label>
                  <input
                    name="paymentLinks.stripe"
                    value={formData.paymentLinks?.stripe || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentLinks: { ...formData.paymentLinks, stripe: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                    placeholder="https://buy.stripe.com/..."
                  />
                  <p className="text-xs text-muted-foreground">Paste your Stripe payment link here.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">PayPal.Me Link</label>
                  <input
                    name="paymentLinks.paypal"
                    value={formData.paymentLinks?.paypal || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentLinks: { ...formData.paymentLinks, paypal: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                    placeholder="https://paypal.me/yourname"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Payment Link (for QR Code)</label>
                  <input
                    name="paymentLinks.custom"
                    value={formData.paymentLinks?.custom || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentLinks: { ...formData.paymentLinks, custom: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                    placeholder="https://your-crypto-payment-link.com or Wallet Address"
                  />
                  <p className="text-xs text-muted-foreground">This link will be used to generate the QR code if no specific invoice link is set.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bank Transfer Instructions</label>
                  <textarea
                    name="bankTransfer"
                    value={formData.bankTransfer || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md h-24"
                    placeholder="Bank Name: Chase&#10;Account: 123456789&#10;Routing: 987654321"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Save Payment Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeSection === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>This information will appear on your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo Upload Section */}
                <div className="flex items-center gap-6 p-4 border rounded-lg bg-muted/20">
                  <div
                    className="h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-background overflow-hidden relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.logo ? (
                      <img src={formData.logo} alt="Business Logo" className="h-full w-full object-contain" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">Company Logo</h4>
                    <p className="text-sm text-muted-foreground">Upload your business logo to display on invoices.</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Upload Image
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name</label>
                  <input
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <input
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <input
                    name="address.street"
                    value={formData.address?.street || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md mb-2"
                    placeholder="Street Address"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="address.city"
                      value={formData.address?.city || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="City"
                    />
                    <input
                      name="address.state"
                      value={formData.address?.state || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="State"
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Zip Code</label>
                      <Input
                        value={formData.address?.zip || ''}
                        onChange={e => setFormData({ ...formData, address: { ...formData.address!, zip: e.target.value } })}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <input
                    name="website"
                    value={formData.website || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Save Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeSection === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle>General & Tax Settings</CardTitle>
              <CardDescription>Configure currency and tax defaults</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Currency</label>
                    <select
                      name="defaultCurrency"
                      value={formData.defaultCurrency || 'USD'}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Tax Rate (%)</label>
                    <input
                      type="number"
                      name="defaultTaxRate"
                      value={formData.defaultTaxRate || 0}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax ID / VAT Number</label>
                  <input
                    name="taxId"
                    value={formData.taxId || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g. VAT-12345678"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Terms</label>
                  <input
                    name="paymentTerms"
                    value={formData.paymentTerms || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g. Net 30"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Save Preferences
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeSection === 'cloud' && (
          <Card>
            <CardHeader>
              <CardTitle>Supabase Integration</CardTitle>
              <CardDescription>Sync your data to the cloud</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-sm">
                  <p className="font-medium mb-1">FairTradeWorker Cloud</p>
                  <p>Enter your Supabase credentials to enable real-time data sync and backup.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Supabase URL</label>
                  <input
                    name="supabaseConfig.url"
                    value={formData.supabaseConfig?.url || ''}
                    onChange={(e) => {
                      const current = formData.supabaseConfig || { url: '', key: '' };
                      setFormData({
                        ...formData,
                        supabaseConfig: { ...current, url: e.target.value }
                      });
                    }}
                    className="w-full p-2 border rounded-md"
                    placeholder="https://xyz.supabase.co"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Supabase Anon Key</label>
                  <input
                    name="supabaseConfig.key"
                    type="password"
                    value={formData.supabaseConfig?.key || ''}
                    onChange={(e) => {
                      const current = formData.supabaseConfig || { url: '', key: '' };
                      setFormData({
                        ...formData,
                        supabaseConfig: { ...current, key: e.target.value }
                      });
                    }}
                    className="w-full p-2 border rounded-md"
                    placeholder="public-anon-key"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Save Cloud Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeSection === 'sessions' && (
          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>View and manage your active devices</CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveSessions />
            </CardContent>
          </Card>
        )}

        {activeSection === 'data' && (
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your application data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/20">
                <h4 className="font-medium mb-2">Export/Import Settings</h4>
                <p className="text-sm text-muted-foreground mb-4">Export or import your application settings, themes, and preferences.</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    settingsSync.export()
                    toast({ title: 'Settings exported successfully' })
                  }}>
                    <Download className="mr-2 h-4 w-4" /> Export Settings
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          try {
                            await settingsSync.import(file)
                            toast({ title: 'Settings imported successfully' })
                          } catch (error) {
                            toast({ title: 'Failed to import settings', variant: 'destructive' })
                          }
                        }
                      }}
                    />
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" /> Import Settings
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-muted/20">
                <h4 className="font-medium mb-2">Backup Data</h4>
                <p className="text-sm text-muted-foreground mb-4">Download a copy of all your invoices, clients, products, and settings.</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export Backup
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImport}
                    />
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" /> Import Backup
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-destructive/10">
                <h4 className="font-medium text-destructive mb-2">Reset Application</h4>
                <p className="text-sm text-muted-foreground mb-4">Warning: This will delete all your data permanently.</p>
                <Button variant="destructive">
                  Reset All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
