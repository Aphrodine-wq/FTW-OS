import React, { useState, useEffect } from 'react'
import { Github, GitCommit, GitPullRequest, Star } from 'lucide-react'
import { useSettingsStore } from '@/stores/settings-store'
import { useThemeStore } from '@/stores/theme-store'
import { AppWidget } from '../AppWidget'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/services/utils'

interface RealGithubWidgetProps {
  id: string
  onRemove: () => void
}

export function RealGithubWidget({ id, onRemove }: RealGithubWidgetProps) {
  const [username, setUsername] = useState('')
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [configured, setConfigured] = useState(false)
  const { mode } = useThemeStore()

  const fetchEvents = async (user: string) => {
    setLoading(true)
    try {
      const response = await fetch(`https://api.github.com/users/${user}/events/public?per_page=5`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
        setConfigured(true)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (username && configured) {
      const interval = setInterval(() => fetchEvents(username), 60000)
      return () => clearInterval(interval)
    }
  }, [username, configured])

  const handleSave = () => {
    if (username) fetchEvents(username)
  }

  const ConfigContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className={cn("text-xs font-medium", mode === 'glass' ? "text-white/70" : "text-gray-500")}>GitHub Username</label>
        <Input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="e.g. torvalds"
          className={cn(mode === 'glass' ? "bg-white/10 border-white/20 text-white" : "")}
        />
      </div>
      <Button onClick={handleSave} className="w-full" disabled={loading}>
        {loading ? 'Verifying...' : 'Track Activity'}
      </Button>
    </div>
  )

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PushEvent': return <GitCommit className="h-4 w-4 text-emerald-500" />
      case 'PullRequestEvent': return <GitPullRequest className="h-4 w-4 text-blue-500" />
      case 'WatchEvent': return <Star className="h-4 w-4 text-yellow-500" />
      default: return <Github className="h-4 w-4 text-gray-400" />
    }
  }

  const getEventText = (event: any) => {
    switch (event.type) {
      case 'PushEvent': return `Pushed to ${event.repo.name}`
      case 'PullRequestEvent': return `${event.payload.action} PR in ${event.repo.name}`
      case 'WatchEvent': return `Starred ${event.repo.name}`
      case 'CreateEvent': return `Created ${event.payload.ref_type} in ${event.repo.name}`
      default: return `Activity in ${event.repo.name}`
    }
  }

  if (!configured) {
    return (
      <AppWidget 
        title="GitHub Activity" 
        icon={Github} 
        isConfigured={false} 
        onRemove={onRemove}
        configContent={ConfigContent}
      >
        <div className="h-full flex flex-col relative group cursor-pointer overflow-hidden" onClick={() => document.getElementById('settings-trigger')?.click()}>
            {/* Connect Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                <span className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">Connect GitHub</span>
            </div>

            {/* Mock Data */}
            <div className="space-y-3 opacity-60 group-hover:opacity-30 transition-all duration-300 scale-100 group-hover:scale-95 origin-center pointer-events-none">
                {[
                    { type: 'PushEvent', text: 'Pushed to Project-Skynet', time: 'Just now', icon: GitCommit, color: 'text-emerald-500' },
                    { type: 'PullRequestEvent', text: 'Merged PR in half-life-3', time: '2h ago', icon: GitPullRequest, color: 'text-blue-500' },
                    { type: 'WatchEvent', text: 'Starred ftwos-core', time: '5h ago', icon: Star, color: 'text-yellow-500' },
                ].map((event, i) => (
                    <div key={i} className="flex gap-3 items-start">
                        <div className={cn("mt-0.5 p-1.5 rounded-md", mode === 'glass' ? "bg-white/5" : "bg-gray-100")}>
                            <event.icon className={cn("h-4 w-4", event.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-medium truncate", mode === 'glass' ? "text-white" : "text-gray-900")}>
                                {event.text}
                            </p>
                            <p className={cn("text-[10px]", mode === 'glass' ? "text-white/50" : "text-gray-500")}>
                                {event.time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </AppWidget>
    )
  }

  return (
    <AppWidget 
      title="GitHub Activity" 
      icon={Github} 
      isConfigured={configured} 
      onRemove={onRemove}
      configContent={ConfigContent}
    >
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="flex gap-3 items-start group">
            <div className={cn("mt-0.5 p-1.5 rounded-md", mode === 'glass' ? "bg-white/5" : "bg-gray-100")}>
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-xs font-medium truncate", mode === 'glass' ? "text-white" : "text-gray-900")}>
                {getEventText(event)}
              </p>
              <p className={cn("text-[10px]", mode === 'glass' ? "text-white/50" : "text-gray-500")}>
                {new Date(event.created_at).toLocaleDateString()} • {new Date(event.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {events.length === 0 && configured && (
          <div className="text-center py-8 text-xs text-gray-500">No recent public activity found.</div>
        )}
      </div>
    </AppWidget>
  )
}
