import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { cn } from '@/services/utils'

interface CoinData {
  id: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
}

const COIN_IDS = ['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple', 'polkadot']

export function CryptoMatrix() {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchCryptoData = async () => {
    try {
      setLoading(true)
      setError(false)

      // Using CoinGecko public API (no key required for basic usage)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COIN_IDS.join(',')}&order=market_cap_desc&sparkline=false`
      )

      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setCoins(data)
      setLastUpdate(new Date())
      setError(false)
    } catch (err) {
      console.error('Crypto fetch error:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCryptoData()

    // Refresh every 2 minutes (respect rate limits)
    const interval = setInterval(fetchCryptoData, 120000)
    return () => clearInterval(interval)
  }, [])

  if (loading && coins.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          <p className="text-xs text-slate-500">Loading prices...</p>
        </div>
      </div>
    )
  }

  if (error && coins.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
        <p className="text-xs text-red-500 font-medium">Failed to load crypto data</p>
        <button
          onClick={fetchCryptoData}
          className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-2 gap-2 flex-1">
        {coins.map((coin) => (
          <div
            key={coin.id}
            className={cn(
              "flex justify-between items-center p-1.5 rounded transition-all",
              "bg-slate-50 border border-slate-100 hover:border-slate-300 hover:shadow-sm"
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="font-black text-xs text-slate-900 uppercase truncate">
                {coin.symbol}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                ${coin.current_price.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: coin.current_price < 1 ? 4 : 2
                })}
              </div>
            </div>
            <div
              className={cn(
                "text-[10px] font-bold flex items-center gap-0.5 ml-1",
                coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {coin.price_change_percentage_24h >= 0 ? (
                <TrendingUp className="h-2 w-2" />
              ) : (
                <TrendingDown className="h-2 w-2" />
              )}
              {Math.abs(coin.price_change_percentage_24h).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {lastUpdate && (
        <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400">
          <span>Last: {lastUpdate.toLocaleTimeString()}</span>
          {loading && <RefreshCw className="h-2 w-2 animate-spin" />}
        </div>
      )}
    </div>
  )
}
