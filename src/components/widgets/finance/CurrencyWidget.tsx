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

export const CurrencyWidget = React.memo(function CurrencyWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const { data: rates, isLoading, error } = useQuery<CurrencyRate[]>({
    queryKey: ['currency-rates'],
    queryFn: async () => {
      // Using free exchangerate.host API (no auth required)
      const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=EUR,GBP,JPY,CAD')
      if (!response.ok) throw new Error('Failed to fetch rates')
      const data = await response.json()
      
      if (!data.rates) throw new Error('Invalid response')
      
      return [
        { from: 'USD', to: 'EUR', rate: data.rates.EUR || 0.92, change: 0 },
        { from: 'USD', to: 'GBP', rate: data.rates.GBP || 0.79, change: 0 },
        { from: 'USD', to: 'JPY', rate: data.rates.JPY || 149.5, change: 0 },
        { from: 'USD', to: 'CAD', rate: data.rates.CAD || 1.36, change: 0 }
      ]
    },
    refetchInterval: 300000, // 5 minutes
    retry: 2
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
})

