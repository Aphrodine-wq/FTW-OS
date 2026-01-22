import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Newspaper, ExternalLink, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface NewsArticle {
  title: string
  description: string
  url: string
  publishedAt: string
  source: {
    name: string
  }
}

export const NewsFeedWidget = React.memo(function NewsFeedWidget() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<'technology' | 'business' | 'general'>('technology')

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [category])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const apiKey = localStorage.getItem('newsapi_key') || 'demo'
      
      if (apiKey === 'demo') {
        // Demo data
        setArticles([
          {
            title: 'AI Breakthrough: New Model Achieves Human-Level Performance',
            description: 'Researchers announce major advancement in artificial intelligence capabilities.',
            url: '#',
            publishedAt: new Date().toISOString(),
            source: { name: 'Tech News' }
          },
          {
            title: 'Startup Raises $100M for Revolutionary Cloud Platform',
            description: 'New cloud infrastructure promises 10x performance improvements.',
            url: '#',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            source: { name: 'Business Wire' }
          },
          {
            title: 'Open Source Project Reaches 1 Million Stars on GitHub',
            description: 'Popular developer tool becomes most starred repository.',
            url: '#',
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            source: { name: 'Dev News' }
          }
        ])
        setLoading(false)
        return
      }

      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${category}&language=en&pageSize=5&apiKey=${apiKey}`
      )
      
      if (!response.ok) throw new Error('Failed to fetch news')
      
      const data = await response.json()
      setArticles(data.articles || [])
      setError(null)
    } catch (err) {
      setError('Unable to fetch news')
      console.error('News fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading && articles.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-blue-500" />
            News Feed
          </CardTitle>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="text-xs bg-transparent border rounded px-2 py-1 outline-none focus:border-blue-500"
          >
            <option value="technology">Tech</option>
            <option value="business">Business</option>
            <option value="general">General</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 overflow-y-auto flex-1 custom-scrollbar">
        {articles.map((article, index) => (
          <motion.a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="block p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-blue-500/20 group"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-medium line-clamp-2 group-hover:text-blue-500 transition-colors">
                {article.title}
              </h3>
              <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            {article.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {article.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{article.source.name}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(article.publishedAt)}</span>
              </div>
            </div>
          </motion.a>
        ))}

        {error && (
          <div className="text-xs text-muted-foreground text-center py-4">
            <p>{error}</p>
            <p className="mt-1">Add NewsAPI key in Settings</p>
          </div>
        )}

        {articles.length === 0 && !error && (
          <div className="text-xs text-muted-foreground text-center py-4">
            No articles available
          </div>
        )}
      </CardContent>
    </Card>
  )
})
