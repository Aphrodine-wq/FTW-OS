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
  const apiKey = localStorage.getItem('alpha_vantage_api_key')

  const { data: stocks, isLoading } = useQuery<StockData[]>({
    queryKey: ['stock-market', apiKey],
    queryFn: async () => {
      if (!apiKey) return []
      
      // In a real implementation, we would fetch from Alpha Vantage
      // For now, we simulate an API call if key is present
      // const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${apiKey}`)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return [
        { symbol: 'SPY', price: 4850.23, change: 12.45, changePercent: 0.26 },
        { symbol: 'QQQ', price: 425.67, change: -2.34, changePercent: -0.55 },
        { symbol: 'DIA', price: 385.12, change: 5.67, changePercent: 1.49 }
      ]
    },
    enabled: !!apiKey,
    refetchInterval: 60000 // 1 minute
  })

  if (!apiKey) {
    return (
      <AppWidget
        title="Stock Market"
        icon={BarChart3}
        isConfigured={false}
        onRemove={onRemove || (() => {})}
        configContent={
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm text-gray-500 mb-2">Alpha Vantage API Key Required</p>
            <input 
              className="w-full p-2 text-xs border rounded mb-2" 
              placeholder="Enter API Key"
              onChange={(e) => {
                localStorage.setItem('alpha_vantage_api_key', e.target.value)
                // Trigger re-render or query invalidation
                // window.location.reload() // Simple brute force for now
              }}
            />
            <p className="text-xs text-gray-400">Settings will apply on reload</p>
          </div>
        }
        id={id || 'stock-market'}
      >
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <BarChart3 className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">Configure API Key</p>
        </div>
      </AppWidget>
    )
  }

  return (
    <AppWidget
      title="Stock Market"
      icon={BarChart3}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={
        <div className="p-4">
           <p className="text-sm font-medium mb-2">Configuration</p>
           <button 
             className="text-xs text-red-500 hover:underline"
             onClick={() => {
               localStorage.removeItem('alpha_vantage_api_key')
               window.location.reload()
             }}
           >
             Clear API Key
           </button>
        </div>
      }
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

