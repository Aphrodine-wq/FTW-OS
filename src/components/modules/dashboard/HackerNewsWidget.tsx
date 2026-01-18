import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Terminal, ExternalLink, RefreshCw, ChevronUp
} from 'lucide-react'
import { cn } from '@/services/utils'

interface HNStory {
  id: string
  title: string
  points: number
  user: string
  time_ago: string
  comments_count: number
  url: string
  domain: string
}

export function HackerNewsWidget() {
  const [stories, setStories] = useState<HNStory[]>([])
  const [loading, setLoading] = useState(false)

  const fetchStories = async () => {
    setLoading(true)
    try {
        const response = await fetch('https://api.hnpwa.com/v0/news/1.json')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setStories(data.slice(0, 15)) // Top 15 stories
    } catch (e) {
        console.error("Failed to load HN stories", e)
        setStories([]) // Zero state on error
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  return (
    <Card className="h-full flex flex-col border-orange-500/20">
        <CardHeader className="flex flex-row items-center justify-between py-4 bg-orange-50/50">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500 rounded text-white font-bold font-mono text-xs">
                    Y
                </div>
                <div>
                    <CardTitle className="text-base">Hacker News</CardTitle>
                    <p className="text-xs text-muted-foreground">Top Stories</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchStories} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0 font-mono">
            <div className="divide-y">
                {stories.length === 0 && !loading && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                        No stories loaded.
                    </div>
                )}
                {stories.map((story, i) => (
                    <div key={story.id} className="p-3 hover:bg-orange-50/30 transition-colors group flex gap-3">
                        <span className="text-slate-400 text-sm w-4 text-right">{i + 1}.</span>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                                <a href={story.url} target="_blank" className="text-sm font-medium hover:underline text-slate-800 leading-tight">
                                    {story.title}
                                </a>
                                <span className="text-[10px] text-slate-400 shrink-0">({story.domain})</span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                <span>{story.points} points by {story.user}</span>
                                <span>|</span>
                                <span>{story.time_ago}</span>
                                <span>|</span>
                                <span className="hover:underline cursor-pointer">{story.comments_count} comments</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
  )
}
