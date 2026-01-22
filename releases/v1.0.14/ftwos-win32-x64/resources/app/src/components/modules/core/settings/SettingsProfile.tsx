/**
 * Settings Profile Component
 * Handles business profile settings
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BusinessProfile } from '@/types/invoice'
import { useSettingsStore } from '@/stores/settings-store'
import { Save, Upload, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function SettingsProfile() {
  const { businessProfile, setBusinessProfile, loadSettings, saveSettings } = useSettingsStore()
  const { toast } = useToast()
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
    }
  })

  useEffect(() => {
    if (businessProfile) {
      setFormData(businessProfile)
    }
  }, [businessProfile])

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
      toast({ title: "Profile Updated", description: "Business profile saved successfully" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>Your business information for invoices and documents</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Name</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your Business Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="business@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <Input
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tax ID</label>
              <Input
                value={formData.taxId || ''}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="EIN or Tax ID"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Street</label>
                <Input
                  value={formData.address?.street || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value } as any
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input
                  value={formData.address?.city || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value } as any
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input
                  value={formData.address?.state || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value } as any
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ZIP Code</label>
                <Input
                  value={formData.address?.zip || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, zip: e.target.value } as any
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={formData.address?.country || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, country: e.target.value } as any
                  })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" /> Save Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

