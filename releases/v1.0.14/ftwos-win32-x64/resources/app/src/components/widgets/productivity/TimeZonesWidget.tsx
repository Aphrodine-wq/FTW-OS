import React from 'react'
import { Globe } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'

interface TimeZone {
  name: string
  city: string
  offset: number
}

const TIMEZONES: TimeZone[] = [
  { name: 'PST', city: 'San Francisco', offset: -8 },
  { name: 'EST', city: 'New York', offset: -5 },
  { name: 'GMT', city: 'London', offset: 0 },
  { name: 'JST', city: 'Tokyo', offset: 9 }
]

export function TimeZonesWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const getTime = (offset: number) => {
    const now = new Date()
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    const localTime = new Date(utc + (3600000 * offset))
    return localTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  return (
    <AppWidget
      title="World Clock"
      icon={Globe}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Time Zones</div>}
      id={id || 'timezones'}
    >
      <div className="space-y-2">
        {TIMEZONES.map((tz) => (
          <div key={tz.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
            <div>
              <p className="text-sm font-semibold">{tz.city}</p>
              <p className="text-xs text-gray-500">{tz.name}</p>
            </div>
            <p className="text-lg font-bold font-mono">{getTime(tz.offset)}</p>
          </div>
        ))}
      </div>
    </AppWidget>
  )
}

