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
  const { data: products, isLoading } = useQuery<PHProduct[]>({
    queryKey: ['product-hunt'],
    queryFn: async () => {
      // Using Product Hunt API (requires auth)
      // For demo, returning mock data
      return [
        { id: '1', name: 'AI Code Reviewer', tagline: 'Automated code review with AI', votes: 234, url: '#' },
        { id: '2', name: 'Design System Builder', tagline: 'Build design systems faster', votes: 189, url: '#' },
        { id: '3', name: 'API Testing Tool', tagline: 'Test APIs visually', votes: 156, url: '#' }
      ]
    },
    refetchInterval: 3600000 // 1 hour
  })

  return (
    <AppWidget
      title="Product Hunt"
      icon={Rocket}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Product Hunt</div>}
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

