import React from 'react'
import { DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'
import { useQuery } from '@tanstack/react-query'

interface CurrencyRate {
  from: string
  to: string
  rate: number
  change: number
}

export function CurrencyWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const { data: rates, isLoading } = useQuery<CurrencyRate[]>({
    queryKey: ['currency-rates'],
    queryFn: async () => {
      // Using exchangerate-api.com (free, no auth)
      // For demo, returning mock data
      return [
        { from: 'USD', to: 'EUR', rate: 0.92, change: 0.001 },
        { from: 'USD', to: 'GBP', rate: 0.79, change: -0.002 },
        { from: 'USD', to: 'JPY', rate: 149.50, change: 0.5 }
      ]
    },
    refetchInterval: 300000 // 5 minutes
  })

  return (
    <AppWidget
      title="Currency Exchange"
      icon={DollarSign}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Currency</div>}
      id={id || 'currency'}
    >
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : (
          rates?.map((rate) => (
            <div key={`${rate.from}-${rate.to}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
              <div>
                <p className="text-sm font-semibold">{rate.from}/{rate.to}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{rate.rate.toFixed(4)}</p>
                <div className={`flex items-center gap-1 text-xs ${
                  rate.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {rate.change >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  <span>{rate.change >= 0 ? '+' : ''}{rate.change.toFixed(4)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppWidget>
  )
}

