import React from 'react'
import { Rocket, ArrowUp } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'
import { useQuery } from '@tanstack/react-query'

interface PHProduct {
  id: string
  name: string
  tagline: string
  votes: number
  url: string
}

export function ProductHuntWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const apiToken = localStorage.getItem('producthunt_token')
  
  const { data: products, isLoading, error } = useQuery<PHProduct[]>({
    queryKey: ['product-hunt'],
    queryFn: async () => {
      if (!apiToken) {
        throw new Error('API token required')
      }
      // Product Hunt API v2 requires OAuth - implement when configured
      const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{ posts(first: 5) { edges { node { id name tagline votesCount url } } } }`
        })
      })
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      return data.data?.posts?.edges?.map((e: any) => ({
        id: e.node.id,
        name: e.node.name,
        tagline: e.node.tagline,
        votes: e.node.votesCount,
        url: e.node.url
      })) || []
    },
    enabled: !!apiToken,
    refetchInterval: 3600000 // 1 hour
  })

  return (
    <AppWidget
      title="Product Hunt"
      icon={Rocket}
      isConfigured={!!apiToken}
      onRemove={onRemove || (() => {})}
      configContent={<div className="text-xs text-muted-foreground">Add your Product Hunt API token in Settings → Integrations</div>}
      id={id || 'product-hunt'}
    >
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-20 bg-gray-100 rounded animate-pulse" />
            <div className="h-20 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : (
          products?.slice(0, 3).map((product) => (
            <div key={product.id} className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <ArrowUp className="w-3 h-3" />
                  <span>{product.votes}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 truncate">{product.tagline}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppWidget>
  )
}

