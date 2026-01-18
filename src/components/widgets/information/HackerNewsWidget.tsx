import React from 'react'
import { Flame, ExternalLink } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'
import { useQuery } from '@tanstack/react-query'

interface HNStory {
  id: number
  title: string
  url: string
  score: number
  by: string
}

export function HackerNewsWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const { data: stories, isLoading } = useQuery<HNStory[]>({
    queryKey: ['hacker-news'],
    queryFn: async () => {
      // Using Hacker News Firebase API (unlimited, free)
      const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=5')
      const storyIds = await response.json()
      const storyPromises = storyIds.slice(0, 5).map((id: number) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
      )
      return Promise.all(storyPromises)
    },
    refetchInterval: 600000 // 10 minutes
  })

  return (
    <AppWidget
      title="Hacker News"
      icon={Flame}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Hacker News</div>}
      id={id || 'hacker-news'}
    >
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : (
          stories?.map((story) => (
            <a
              key={story.id}
              href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-start gap-2">
                <div className="text-xs text-gray-500 font-semibold min-w-[2rem]">
                  {story.score}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-blue-600">
                    {story.title}
                  </p>
                  <p className="text-xs text-gray-500">by {story.by}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))
        )}
      </div>
    </AppWidget>
  )
}

