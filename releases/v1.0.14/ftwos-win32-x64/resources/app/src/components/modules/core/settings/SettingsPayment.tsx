/**
 * Settings Payment Component
 * Handles payment gateway settings
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BusinessProfile } from '@/types/invoice'
import { useSettingsStore } from '@/stores/settings-store'
import { Save } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function SettingsPayment() {
  const { businessProfile, setBusinessProfile, saveSettings } = useSettingsStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    stripe: '',
    paypal: '',
    custom: '',
    bankTransfer: ''
  })

  useEffect(() => {
    if (businessProfile?.paymentLinks) {
      setFormData({
        stripe: businessProfile.paymentLinks.stripe || '',
        paypal: businessProfile.paymentLinks.paypal || '',
        custom: businessProfile.paymentLinks.custom || '',
        bankTransfer: businessProfile.bankTransfer || ''
      })
    }
  }, [businessProfile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBusinessProfile({
      ...businessProfile,
      paymentLinks: {
        stripe: formData.stripe,
        paypal: formData.paypal,
        custom: formData.custom
      },
      bankTransfer: formData.bankTransfer,
      id: businessProfile?.id || 'default',
      createdAt: businessProfile?.createdAt || new Date(),
      updatedAt: new Date(),
    } as BusinessProfile)
    saveSettings()
    toast({ title: "Payment Settings Updated", description: "Payment links saved successfully" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Gateways</CardTitle>
        <CardDescription>Add payment links to your invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Stripe Payment Link</label>
            <Input
              value={formData.stripe}
              onChange={(e) => setFormData({ ...formData, stripe: e.target.value })}
              placeholder="https://buy.stripe.com/..."
            />
            <p className="text-xs text-muted-foreground">Paste your Stripe payment link here.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">PayPal.Me Link</label>
            <Input
              value={formData.paypal}
              onChange={(e) => setFormData({ ...formData, paypal: e.target.value })}
              placeholder="https://paypal.me/yourname"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Payment Link (for QR Code)</label>
            <Input
              value={formData.custom}
              onChange={(e) => setFormData({ ...formData, custom: e.target.value })}
              placeholder="https://your-crypto-payment-link.com or Wallet Address"
            />
            <p className="text-xs text-muted-foreground">This link will be used to generate the QR code if no specific invoice link is set.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bank Transfer Instructions</label>
            <textarea
              value={formData.bankTransfer}
              onChange={(e) => setFormData({ ...formData, bankTransfer: e.target.value })}
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
  )
}

