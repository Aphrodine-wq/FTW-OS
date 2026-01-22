import React from 'react'
import { Input } from '@/components/ui/input'

interface AddressFormProps {
  label: string
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  onChange: (field: string, value: string) => void
}

export function AddressForm({ label, address, onChange }: AddressFormProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <Input 
          className="col-span-2"
          placeholder="Street Address"
          value={address.street || ''}
          onChange={(e) => onChange('street', e.target.value)}
        />
        <Input 
          placeholder="City"
          value={address.city || ''}
          onChange={(e) => onChange('city', e.target.value)}
        />
        <Input 
          placeholder="State"
          value={address.state || ''}
          onChange={(e) => onChange('state', e.target.value)}
        />
        <Input 
          placeholder="ZIP"
          value={address.zip || ''}
          onChange={(e) => onChange('zip', e.target.value)}
        />
        <Input 
          placeholder="Country"
          value={address.country || ''}
          onChange={(e) => onChange('country', e.target.value)}
        />
      </div>
    </div>
  )
}