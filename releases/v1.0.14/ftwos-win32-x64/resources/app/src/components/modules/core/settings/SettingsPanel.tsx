import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useSettingsStore } from '@/stores/settings-store'
import { useSecureSettings } from '@/stores/secure-settings-store'
import { Image as ImageIcon, CreditCard, Globe, Database, MessageSquare, Cloud, Gamepad2, Shield } from 'lucide-react'

import { ActiveSessions } from './ActiveSessions'
import { SettingsProfile } from './SettingsProfile'
import { SettingsIntegrations } from './SettingsIntegrations'
import { SettingsGeneral } from './SettingsGeneral'
import { SettingsPayment } from './SettingsPayment'
import { SettingsSMS } from './SettingsSMS'
import { SettingsCloud } from './SettingsCloud'
import { SettingsData } from './SettingsData'

export function SettingsPanel() {
  const { loadSettings } = useSettingsStore()
  const { loadAllKeys } = useSecureSettings()
  const [activeSection, setActiveSection] = useState<'profile' | 'general' | 'integrations' | 'data' | 'payment' | 'sms' | 'cloud' | 'sessions'>('profile')

  useEffect(() => {
    loadSettings()
    loadAllKeys()
  }, [loadSettings, loadAllKeys])

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
        {activeSection === 'profile' && <SettingsProfile />}
        {activeSection === 'integrations' && <SettingsIntegrations />}
        {activeSection === 'general' && <SettingsGeneral />}
        {activeSection === 'payment' && <SettingsPayment />}
        {activeSection === 'sms' && <SettingsSMS />}
        {activeSection === 'cloud' && <SettingsCloud />}
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
        {activeSection === 'data' && <SettingsData />}
      </div>
    </div>
  )
}
