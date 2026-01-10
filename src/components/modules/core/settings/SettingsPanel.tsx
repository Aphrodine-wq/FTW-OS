import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BusinessProfile } from '@/types/invoice'
import { useSettingsStore } from '@/stores/settings-store'
import { useThemeStore } from '@/stores/theme-store'
import { Save, Upload, Image as ImageIcon, CreditCard, Globe, Database, Download, MessageSquare, Cloud, Palette, Gamepad2, Monitor, Sun, Moon } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export function SettingsPanel() {
  const { businessProfile, setBusinessProfile, loadSettings, saveSettings, integrations, updateIntegrations } = useSettingsStore()
  const themeStore = useThemeStore()
  const [activeSection, setActiveSection] = useState<'profile' | 'general' | 'appearance' | 'integrations' | 'data' | 'payment' | 'sms' | 'cloud'>('profile')
  const [formData, setFormData] = useState<Partial<BusinessProfile>>({})
  const [integrationData, setIntegrationData] = useState({
    spotifyClientId: '',
    spotifyToken: '',
    steamApiKey: '',
    steamId: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (businessProfile) {
      setFormData(businessProfile)
    }
    if (integrations) {
        setIntegrationData(integrations)
    }
  }, [businessProfile, integrations])

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

  const handleIntegrationsSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      updateIntegrations(integrationData)
      saveSettings()
      alert('Integrations saved! Restart may be required for some changes.')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                    <div 
                      onClick={() => themeStore.setTheme({ mode: 'monochrome', activeTheme: 'monochrome' })}
                      className={cn(
                        "cursor-pointer p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all",
                        themeStore.mode === 'monochrome' ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <Monitor className="h-6 w-6" />
                      <span className="font-bold">Monochrome</span>
                      <span className="text-xs text-gray-500 text-center">Clean, high-contrast, professional.</span>
                    </div>
                 </div>
               </div>

               {themeStore.mode === 'glass' && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
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
                       <label className="text-sm font-medium block">Background Style</label>
                       <div className="grid grid-cols-2 gap-4">
                           {(['mesh', 'aurora', 'deep', 'cyber'] as const).map((bg) => (
                               <div 
                                key={bg}
                                onClick={() => themeStore.setTheme({ background: bg })}
                                className={cn(
                                    "cursor-pointer h-24 rounded-lg border-2 flex items-center justify-center capitalize transition-all",
                                    themeStore.background === bg ? "border-cyan-500 bg-cyan-500/10" : "border-gray-200 hover:border-gray-300"
                                )}
                               >
                                   {bg}
                               </div>
                           ))}
                       </div>
                   </div>
                 </div>
               )}
               
               <div className="space-y-4">
                 <div className="flex justify-between">
                    <label className="text-sm font-medium">Border Radius ({themeStore.radius}px)</label>
                 </div>
                 <Slider 
                    value={[themeStore.radius]} 
                    min={0} 
                    max={32} 
                    step={1} 
                    onValueChange={([v]) => themeStore.setTheme({ radius: v })} 
                 />
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
                  <h3 className="font-medium text-lg border-b pb-2">Spotify</h3>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Client ID</label>
                    <input 
                      value={integrationData.spotifyClientId || ''}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, spotifyClientId: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      placeholder="Spotify Client ID"
                    />
                  </div>
                   <div className="grid gap-2">
                    <label className="text-sm font-medium">Client Token (Implicit/PKCE)</label>
                    <input 
                      value={integrationData.spotifyToken || ''}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, spotifyToken: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      type="password"
                      placeholder="Access Token"
                    />
                    <p className="text-xs text-muted-foreground">Required for "Now Playing" data.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg border-b pb-2">Steam</h3>
                   <div className="grid gap-2">
                    <label className="text-sm font-medium">Steam API Key</label>
                    <input 
                      value={integrationData.steamApiKey || ''}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, steamApiKey: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      type="password"
                      placeholder="XXXXXXXXXXXXXXXXXXXX"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Steam ID (64-bit)</label>
                    <input 
                      value={integrationData.steamId || ''}
                      onChange={(e) => setIntegrationData(prev => ({ ...prev, steamId: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      placeholder="76561198..."
                    />
                    <p className="text-xs text-muted-foreground">Your unique 17-digit Steam ID.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Save Integrations
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
                    onChange={(e) => setFormData({
                      ...formData, 
                      smsConfig: { ...formData.smsConfig, accountSid: e.target.value }
                    })}
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
                    onChange={(e) => setFormData({
                      ...formData, 
                      smsConfig: { ...formData.smsConfig, authToken: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md" 
                    placeholder="Auth Token"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">From Phone Number</label>
                  <input 
                    name="smsConfig.fromNumber" 
                    value={formData.smsConfig?.fromNumber || ''} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      smsConfig: { ...formData.smsConfig, fromNumber: e.target.value }
                    })}
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
                  <label className="text-sm font-medium">Bank Transfer Instructions</label>
                  <textarea 
                    name="paymentLinks.bankTransfer" 
                    value={formData.paymentLinks?.bankTransfer || ''} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      paymentLinks: { ...formData.paymentLinks, bankTransfer: e.target.value }
                    })}
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
                    <input 
                      name="address.zipCode" 
                      value={formData.address?.zipCode || ''} 
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md" 
                      placeholder="ZIP Code"
                    />
                    <input 
                      name="address.country" 
                      value={formData.address?.country || ''} 
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md" 
                      placeholder="Country"
                    />
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
                    name="supabaseConfig.supabaseUrl" 
                    value={formData.supabaseConfig?.supabaseUrl || ''} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      supabaseConfig: { ...formData.supabaseConfig, supabaseUrl: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md" 
                    placeholder="https://xyz.supabase.co"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Supabase Anon Key</label>
                  <input 
                    name="supabaseConfig.supabaseKey" 
                    type="password"
                    value={formData.supabaseConfig?.supabaseKey || ''} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      supabaseConfig: { ...formData.supabaseConfig, supabaseKey: e.target.value }
                    })}
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

        {activeSection === 'data' && (
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your application data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
