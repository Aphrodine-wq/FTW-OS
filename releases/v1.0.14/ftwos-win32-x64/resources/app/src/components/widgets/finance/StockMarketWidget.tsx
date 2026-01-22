import React from 'react'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'
import { useQuery } from '@tanstack/react-query'

interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
}

export const StockMarketWidget = React.memo(function StockMarketWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const { data: stocks, isLoading } = useQuery<StockData[]>({
    queryKey: ['stock-market'],
    queryFn: async () => {
      // Using Alpha Vantage API (free tier: 5 calls/min)
      // For demo, returning mock data
      return [
        { symbol: 'SPY', price: 4850.23, change: 12.45, changePercent: 0.26 },
        { symbol: 'QQQ', price: 425.67, change: -2.34, changePercent: -0.55 },
        { symbol: 'DIA', price: 385.12, change: 5.67, changePercent: 1.49 }
      ]
    },
    refetchInterval: 60000 // 1 minute
  })

  return (
    <AppWidget
      title="Stock Market"
      icon={BarChart3}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Stock Market</div>}
      id={id || 'stock-market'}
    >
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : (
          stocks?.map((stock) => (
            <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="font-bold text-sm">{stock.symbol}</p>
                <p className="text-xs text-gray-500">${stock.price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 text-xs font-semibold ${
                  stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                </div>
                <p className={`text-xs ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </AppWidget>
  )
})

