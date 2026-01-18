import React from 'react'
import { BookOpen, Heart } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'
import { useQuery } from '@tanstack/react-query'

interface DevToArticle {
  id: number
  title: string
  url: string
  positive_reactions_count: number
  user: { name: string }
}

export function DevToWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const { data: articles, isLoading } = useQuery<DevToArticle[]>({
    queryKey: ['devto-trending'],
    queryFn: async () => {
      // Using Dev.to API (free, no auth required)
      const response = await fetch('https://dev.to/api/articles?top=1&per_page=5')
      return response.json()
    },
    refetchInterval: 3600000 // 1 hour
  })

  return (
    <AppWidget
      title="Dev.to Trending"
      icon={BookOpen}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Dev.to</div>}
      id={id || 'devto'}
    >
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : (
          articles?.slice(0, 5).map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Heart className="w-3 h-3" />
                  <span>{article.positive_reactions_count}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-blue-600">
                    {article.title}
                  </p>
                  <p className="text-xs text-gray-500">by {article.user.name}</p>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </AppWidget>
  )
}

