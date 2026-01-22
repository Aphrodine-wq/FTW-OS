/**
 * Settings SMS Component
 * Handles SMS/Twilio configuration
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BusinessProfile } from '@/types/invoice'
import { useSettingsStore } from '@/stores/settings-store'
import { Save } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function SettingsSMS() {
  const { businessProfile, setBusinessProfile, saveSettings } = useSettingsStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    accountSid: '',
    authToken: '',
    fromNumber: ''
  })

  useEffect(() => {
    if (businessProfile?.smsConfig) {
      setFormData({
        accountSid: businessProfile.smsConfig.accountSid || '',
        authToken: businessProfile.smsConfig.authToken || '',
        fromNumber: businessProfile.smsConfig.fromNumber || ''
      })
    }
  }, [businessProfile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBusinessProfile({
      ...businessProfile,
      smsConfig: {
        accountSid: formData.accountSid,
        authToken: formData.authToken,
        fromNumber: formData.fromNumber
      },
      id: businessProfile?.id || 'default',
      createdAt: businessProfile?.createdAt || new Date(),
      updatedAt: new Date(),
    } as BusinessProfile)
    saveSettings()
    toast({ title: "SMS Settings Updated", description: "Twilio configuration saved successfully" })
  }

  return (
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
            <Input
              type="password"
              value={formData.accountSid}
              onChange={(e) => setFormData({ ...formData, accountSid: e.target.value })}
              placeholder="AC..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Auth Token</label>
            <Input
              type="password"
              value={formData.authToken}
              onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
              placeholder="Auth Token"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">From Phone Number</label>
            <Input
              value={formData.fromNumber}
              onChange={(e) => setFormData({ ...formData, fromNumber: e.target.value })}
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
  )
}

