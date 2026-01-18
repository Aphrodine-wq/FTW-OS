import React from 'react'
import { Fuel } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'
import { useQuery } from '@tanstack/react-query'

interface GasPrice {
  location: string
  price: number
  type: 'regular' | 'mid' | 'premium'
}

export function GasPricesWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const { data: prices, isLoading } = useQuery<GasPrice[]>({
    queryKey: ['gas-prices'],
    queryFn: async () => {
      // Using GasBuddy API or similar
      // For demo, returning mock data
      return [
        { location: 'Local Average', price: 3.45, type: 'regular' },
        { location: 'Nearby Station', price: 3.39, type: 'regular' },
        { location: 'Premium', price: 3.89, type: 'premium' }
      ]
    },
    refetchInterval: 3600000 // 1 hour
  })

  return (
    <AppWidget
      title="Gas Prices"
      icon={Fuel}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Gas Prices</div>}
      id={id || 'gas-prices'}
    >
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : (
          prices?.map((price, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
              <div>
                <p className="text-sm font-semibold">{price.location}</p>
                <p className="text-xs text-gray-500 capitalize">{price.type}</p>
              </div>
              <p className="text-lg font-bold">${price.price.toFixed(2)}</p>
            </div>
          ))
        )}
      </div>
    </AppWidget>
  )
}

