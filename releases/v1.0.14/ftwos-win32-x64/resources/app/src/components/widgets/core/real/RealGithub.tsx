import React, { useState, useEffect } from 'react'
import { Github, GitCommit, GitPullRequest, Star, Settings as SettingsIcon } from 'lucide-react'
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
  const { integrations, updateIntegrations, saveSettings } = useSettingsStore()
  const [token, setToken] = useState(integrations.githubToken || '')
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState(!!integrations.githubToken)
  const { mode } = useThemeStore()

  useEffect(() => {
    if (integrations.githubToken) {
      setToken(integrations.githubToken)
      fetchEvents(integrations.githubToken)
    }
  }, [integrations.githubToken])

  const fetchEvents = async (authToken: string) => {
    if (!authToken) {
      setError('GitHub token is required')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // First verify token by getting authenticated user
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

      if (userResponse.status === 401) {
        setError('Invalid or expired token. Please update your GitHub token in Settings.')
        setConfigured(false)
        return
      }

      if (userResponse.status === 403) {
        const remaining = userResponse.headers.get('X-RateLimit-Remaining')
        if (remaining !== null && parseInt(remaining, 10) === 0) {
          setError('Rate limit exceeded. Please wait before trying again.')
          setConfigured(false)
          return
        }
      }

      if (!userResponse.ok) {
        setError(`GitHub API error: ${userResponse.status}. Please try again later.`)
        setConfigured(false)
        return
      }

      const user = await userResponse.json()
      
      // Fetch user's public events
      const eventsResponse = await fetch(`https://api.github.com/users/${user.login}/events/public?per_page=5`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

      if (eventsResponse.ok) {
        const data = await eventsResponse.json()
        setEvents(data)
        setConfigured(true)
        setError(null)
      } else {
        if (eventsResponse.status === 403) {
          const remaining = eventsResponse.headers.get('X-RateLimit-Remaining')
          if (remaining !== null && parseInt(remaining, 10) === 0) {
            setError('Rate limit exceeded. Please wait before trying again.')
          } else {
            setError(`GitHub API error: ${eventsResponse.status}. Please try again later.`)
          }
        } else {
          setError(`Failed to fetch events: ${eventsResponse.status}. Please try again later.`)
        }
        setConfigured(false)
      }
    } catch (err: unknown) {
      console.error('GitHub API error:', err)
      const msg = err instanceof Error ? err.message : 'Failed to fetch GitHub activity'
      const friendly = msg.toLowerCase().includes('failed to fetch')
        ? 'Network error. Check your connection and try again.'
        : msg
      setError(friendly)
      setConfigured(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token && configured) {
      const interval = setInterval(() => fetchEvents(token), 60000)
      return () => clearInterval(interval)
    }
  }, [token, configured])

  const handleSave = () => {
    if (token) {
      updateIntegrations({ githubToken: token })
      saveSettings()
      fetchEvents(token)
    }
  }

  const ConfigContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className={cn("text-xs font-medium", mode === 'glass' ? "text-white/70" : "text-gray-500")}>GitHub Personal Access Token</label>
        <Input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_xxxxxxxxxxxx"
          className={cn(mode === 'glass' ? "bg-white/10 border-white/20 text-white" : "")}
        />
        <p className={cn("text-xs", mode === 'glass' ? "text-white/50" : "text-gray-400")}>
          Create a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">github.com/settings/tokens</a>
        </p>
      </div>
      {error && (
        <div className={cn("text-xs p-2 rounded", mode === 'glass' ? "bg-red-500/20 text-red-300" : "bg-red-50 text-red-600")}>
          {error}
        </div>
      )}
      <Button onClick={handleSave} className="w-full" disabled={loading || !token}>
        {loading ? 'Verifying...' : 'Save & Track Activity'}
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
        <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-4">
          <div className={cn("p-4 rounded-full", mode === 'glass' ? "bg-white/10" : "bg-gray-100")}>
            <Github className={cn("h-8 w-8", mode === 'glass' ? "text-white/50" : "text-gray-500")} />
          </div>
          <div>
            <p className={cn("text-sm font-medium mb-1", mode === 'glass' ? "text-white" : "text-gray-900")}>
              Track Your GitHub Activity
            </p>
            <p className={cn("text-xs", mode === 'glass' ? "text-white/50" : "text-gray-500")}>
              Enter your username to see recent activity
            </p>
          </div>
          <button
            onClick={() => window.location.hash = '#/settings'}
            className={cn(
              "text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer",
              mode === 'glass' ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-900 hover:bg-gray-800 text-white"
            )}
          >
            <SettingsIcon className="h-3 w-3" />
            Configure Now
          </button>
        </div>
      </AppWidget >
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
        {events.length === 0 && configured && !loading && (
          <div className={cn("text-center py-8 text-xs", mode === 'glass' ? "text-white/50" : "text-gray-500")}>
            No recent public activity found.
          </div>
        )}
        {error && configured && (
          <div className={cn("text-center py-4 text-xs p-2 rounded", mode === 'glass' ? "bg-red-500/20 text-red-300" : "bg-red-50 text-red-600")}>
            {error}
          </div>
        )}
      </div>
    </AppWidget>
  )
}
