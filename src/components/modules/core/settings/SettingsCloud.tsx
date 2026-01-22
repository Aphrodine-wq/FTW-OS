/**
 * Settings Cloud Component
 * Handles Supabase/cloud sync configuration
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BusinessProfile } from '@/types/invoice'
import { useSettingsStore } from '@/stores/settings-store'
import { Save } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function SettingsCloud() {
  const { businessProfile, setBusinessProfile, saveSettings } = useSettingsStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    url: '',
    key: ''
  })

  useEffect(() => {
    if (businessProfile?.supabaseConfig) {
      setFormData({
        url: businessProfile.supabaseConfig.url || '',
        key: businessProfile.supabaseConfig.key || ''
      })
    }
  }, [businessProfile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBusinessProfile({
      ...businessProfile,
      supabaseConfig: {
        url: formData.url,
        key: formData.key
      },
      id: businessProfile?.id || 'default',
      createdAt: businessProfile?.createdAt || new Date(),
      updatedAt: new Date(),
    } as BusinessProfile)
    saveSettings()
    toast({ title: "Cloud Settings Updated", description: "Supabase configuration saved successfully" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Integration</CardTitle>
        <CardDescription>Sync your data to the cloud</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-sm dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800">
            <p className="font-medium mb-1">FairTradeWorker Cloud</p>
            <p>Enter your Supabase credentials to enable real-time data sync and backup.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Supabase URL</label>
            <Input
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://xyz.supabase.co"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Supabase Anon Key</label>
            <Input
              type="password"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
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
  )
}

