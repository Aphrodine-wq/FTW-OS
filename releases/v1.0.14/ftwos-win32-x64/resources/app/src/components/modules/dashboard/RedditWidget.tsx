import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, ArrowUp, ExternalLink, RefreshCw, 
  Flame, Clock, TrendingUp, AlertTriangle
} from 'lucide-react'
import { cn } from '@/services/utils'

interface RedditPost {
  id: string
  title: string
  subreddit: string
  author: string
  upvotes: number
  comments: number
  url: string
  created: string
}

export function RedditWidget() {
  const [posts, setPosts] = useState<RedditPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subreddit, setSubreddit] = useState('technology+programming+startups+webdev')

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    
    try {
        const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`)
        
        if (!response.ok) {
            throw new Error(`Reddit API Error: ${response.status}`)
        }

        const data = await response.json()
        
        const mappedPosts: RedditPost[] = data.data.children.map((child: any) => ({
            id: child.data.id,
            title: child.data.title,
            subreddit: `r/${child.data.subreddit}`,
            author: child.data.author,
            upvotes: child.data.score,
            comments: child.data.num_comments,
            url: child.data.url,
            created: formatTimeAgo(child.data.created_utc)
        }))

        setPosts(mappedPosts)
    } catch (err) {
        console.error('Failed to fetch reddit posts:', err)
        setError('Failed to load feed. Reddit may be rate limiting.')
    } finally {
        setLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((new Date().getTime() / 1000) - timestamp)
    
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + "y ago"
    
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + "mo ago"
    
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + "d ago"
    
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + "h ago"
    
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + "m ago"
    
    return Math.floor(seconds) + "s ago"
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <Card className="h-full flex flex-col bg-white/50 backdrop-blur-sm border-slate-200/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
                    <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                    <CardTitle className="text-sm font-semibold text-slate-800">Tech Feed</CardTitle>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Live from Reddit</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-orange-500" onClick={fetchPosts} disabled={loading}>
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {error ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                    <AlertTriangle className="h-8 w-8 text-amber-400" />
                    <p className="text-sm font-medium text-slate-600">{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchPosts} className="mt-2">Try Again</Button>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {posts.map(post => (
                        <a 
                            key={post.id} 
                            href={post.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block p-4 hover:bg-slate-50 transition-all duration-200 group relative"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex flex-col items-center gap-0.5 min-w-[32px] pt-1">
                                    <ArrowUp className="h-4 w-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-orange-600">{post.upvotes > 1000 ? (post.upvotes/1000).toFixed(1) + 'k' : post.upvotes}</span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-slate-700 leading-snug group-hover:text-blue-600 line-clamp-2 mb-1.5">
                                        {post.title}
                                    </h4>
                                    
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-400 font-medium">
                                        <span className="text-orange-600/80 bg-orange-50 px-1.5 py-0.5 rounded-md">{post.subreddit}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span>u/{post.author}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span>{post.created}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className="flex items-center gap-1 group-hover:text-slate-600 transition-colors">
                                            <MessageSquare className="h-2.5 w-2.5" /> {post.comments}
                                        </span>
                                    </div>
                                </div>
                                
                                <ExternalLink className="h-3.5 w-3.5 text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </CardContent>
    </Card>
  )
}
