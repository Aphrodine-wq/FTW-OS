import React from 'react'
import { Wind, AlertCircle } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'
import { useQuery } from '@tanstack/react-query'

interface AirQuality {
  aqi: number
  level: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous'
  pm25: number
  pm10: number
}

export function AirQualityWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const { data: aq, isLoading } = useQuery<AirQuality>({
    queryKey: ['air-quality'],
    queryFn: async () => {
      // Using OpenWeatherMap Air Pollution API or similar
      // For demo, returning mock data
      return {
        aqi: 45,
        level: 'Good' as const,
        pm25: 12,
        pm10: 18
      }
    },
    refetchInterval: 300000 // 5 minutes
  })

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-600 bg-green-50'
    if (aqi <= 100) return 'text-yellow-600 bg-yellow-50'
    if (aqi <= 150) return 'text-orange-600 bg-orange-50'
    if (aqi <= 200) return 'text-red-600 bg-red-50'
    return 'text-purple-600 bg-purple-50'
  }

  return (
    <AppWidget
      title="Air Quality"
      icon={Wind}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Air Quality</div>}
      id={id || 'air-quality'}
    >
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-20 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : aq ? (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${getAQIColor(aq.aqi)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">AQI</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-3xl font-bold">{aq.aqi}</p>
            <p className="text-sm mt-1">{aq.level}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-500">PM2.5</p>
              <p className="font-semibold">{aq.pm25} μg/m³</p>
            </div>
            <div>
              <p className="text-gray-500">PM10</p>
              <p className="font-semibold">{aq.pm10} μg/m³</p>
            </div>
          </div>
        </div>
      ) : null}
    </AppWidget>
  )
}

