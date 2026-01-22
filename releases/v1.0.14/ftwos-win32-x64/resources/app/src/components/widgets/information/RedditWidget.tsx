import React from 'react'
import { MessageSquare, ArrowUp } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'
import { useQuery } from '@tanstack/react-query'

interface RedditPost {
  id: string
  title: string
  subreddit: string
  upvotes: number
  url: string
}

export function RedditWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const { data: posts, isLoading } = useQuery<RedditPost[]>({
    queryKey: ['reddit-trending'],
    queryFn: async () => {
      // Using Reddit API (60 requests/minute)
      // For demo, returning mock data
      return [
        { id: '1', title: 'New React 19 Features', subreddit: 'r/webdev', upvotes: 1234, url: '#' },
        { id: '2', title: 'TypeScript 5.5 Released', subreddit: 'r/typescript', upvotes: 892, url: '#' },
        { id: '3', title: 'AI Coding Assistants Comparison', subreddit: 'r/programming', upvotes: 567, url: '#' }
      ]
    },
    refetchInterval: 300000 // 5 minutes
  })

  return (
    <AppWidget
      title="Reddit Trending"
      icon={MessageSquare}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Reddit</div>}
      id={id || 'reddit'}
    >
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : (
          posts?.slice(0, 5).map((post) => (
            <div key={post.id} className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <ArrowUp className="w-3 h-3" />
                  <span>{post.upvotes}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.title}</p>
                  <p className="text-xs text-gray-500">{post.subreddit}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppWidget>
  )
}

