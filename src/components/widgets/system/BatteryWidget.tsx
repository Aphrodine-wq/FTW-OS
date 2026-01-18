import React, { useState, useEffect } from 'react'
import { Battery, BatteryCharging } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'

export function BatteryWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [isCharging, setIsCharging] = useState(false)

  useEffect(() => {
    // In Electron, use navigator.getBattery() or system APIs
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100))
        setIsCharging(battery.charging)
        
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging)
        })
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100))
        })
      })
    } else {
      // Fallback simulation
      const interval = setInterval(() => {
        setBatteryLevel(prev => Math.max(0, prev - 0.1))
      }, 60000)
      return () => clearInterval(interval)
    }
  }, [])

  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'text-green-600'
    if (batteryLevel > 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <AppWidget
      title="Battery"
      icon={isCharging ? BatteryCharging : Battery}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Battery</div>}
      id={id || 'battery'}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-24 h-12 border-2 border-gray-300 rounded-lg p-1">
          <div
            className={`h-full rounded transition-all ${getBatteryColor().replace('text-', 'bg-')}`}
            style={{ width: `${batteryLevel}%` }}
          />
          {isCharging && (
            <div className="absolute inset-0 flex items-center justify-center">
              <BatteryCharging className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        <div className="text-center">
          <p className={`text-3xl font-bold ${getBatteryColor()}`}>
            {batteryLevel}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isCharging ? 'Charging' : 'Not Charging'}
          </p>
        </div>
      </div>
    </AppWidget>
  )
}

