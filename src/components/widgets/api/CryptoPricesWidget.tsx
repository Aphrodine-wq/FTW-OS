import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, Bitcoin, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  image: string
}

export const CryptoPricesWidget = React.memo(function CryptoPricesWidget() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCryptoPrices()
    const interval = setInterval(fetchCryptoPrices, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchCryptoPrices = async () => {
    try {
      setLoading(true)
      // Using CoinGecko API (no key required for basic usage)
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=false'
      )
      
      if (!response.ok) throw new Error('Failed to fetch crypto prices')
      
      const data = await response.json()
      setCryptos(data)
      setError(null)
    } catch (err) {
      setError('Unable to fetch crypto data')
      console.error('Crypto fetch error:', err)
      // Set demo data on error
      setCryptos([
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 45000,
          price_change_percentage_24h: 2.5,
          market_cap: 850000000000,
          image: ''
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 2500,
          price_change_percentage_24h: -1.2,
          market_cap: 300000000000,
          image: ''
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${(price / 1000).toFixed(2)}K`
    if (price >= 1) return `$${price.toFixed(2)}`
    return `$${price.toFixed(4)}`
  }

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
    return `$${cap.toFixed(0)}`
  }

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-500" />
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-500" />
    return <Minus className="h-3 w-3 text-gray-500" />
  }

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500'
    if (change < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  if (loading && cryptos.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bitcoin className="h-4 w-4 text-orange-500" />
          Crypto Prices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 overflow-y-auto max-h-[calc(100%-4rem)] custom-scrollbar">
        {cryptos.map((crypto, index) => (
          <motion.div
            key={crypto.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {crypto.image ? (
                <img src={crypto.image} alt={crypto.name} className="h-6 w-6 rounded-full" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{crypto.name}</p>
                <p className="text-xs text-muted-foreground uppercase">{crypto.symbol}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-bold">{formatPrice(crypto.current_price)}</p>
              <div className={`flex items-center gap-1 justify-end text-xs ${getPriceChangeColor(crypto.price_change_percentage_24h)}`}>
                {getPriceChangeIcon(crypto.price_change_percentage_24h)}
                <span>{Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%</span>
              </div>
            </div>
          </motion.div>
        ))}

        {error && (
          <div className="text-xs text-muted-foreground text-center py-2">
            {error}
          </div>
        )}

        <div className="pt-2 border-t text-xs text-muted-foreground text-center">
          Powered by CoinGecko
        </div>
      </CardContent>
    </Card>
  )
})
