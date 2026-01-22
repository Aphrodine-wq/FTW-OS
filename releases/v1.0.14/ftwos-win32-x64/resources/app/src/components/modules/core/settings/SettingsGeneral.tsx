/**
 * Settings General Component
 * Handles general and tax settings
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BusinessProfile } from '@/types/invoice'
import { useSettingsStore } from '@/stores/settings-store'
import { Save } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function SettingsGeneral() {
  const { businessProfile, setBusinessProfile, saveSettings } = useSettingsStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<BusinessProfile>>({
    defaultCurrency: 'USD',
    defaultTaxRate: 0,
    taxId: '',
    paymentTerms: ''
  })

  useEffect(() => {
    if (businessProfile) {
      setFormData({
        defaultCurrency: businessProfile.defaultCurrency || 'USD',
        defaultTaxRate: businessProfile.defaultTaxRate || 0,
        taxId: businessProfile.taxId || '',
        paymentTerms: businessProfile.paymentTerms || ''
      })
    }
  }, [businessProfile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData) {
      setBusinessProfile({
        ...businessProfile,
        ...formData,
        id: businessProfile?.id || 'default',
        createdAt: businessProfile?.createdAt || new Date(),
        updatedAt: new Date(),
      } as BusinessProfile)
      saveSettings()
      toast({ title: "Settings Updated", description: "General and tax settings saved successfully" })
    }
  }

  return (
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
                value={formData.defaultCurrency || 'USD'}
                onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
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
              <Input
                type="number"
                value={formData.defaultTaxRate || 0}
                onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tax ID / VAT Number</label>
            <Input
              value={formData.taxId || ''}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              placeholder="e.g. VAT-12345678"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Terms</label>
            <Input
              value={formData.paymentTerms || ''}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
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
  )
}

