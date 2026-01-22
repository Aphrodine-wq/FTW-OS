import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNotificationStore } from '@/stores/notification-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useTaskStore } from '@/stores/task-store'
import { 
  Activity, Bell, Check, Github, AlertTriangle, Clock, Calendar
} from 'lucide-react'
import { cn } from '@/services/utils'
import { formatDistanceToNow } from 'date-fns'

export function PulseDashboard() {
  const { notifications, addNotification, markAsRead, clearAll } = useNotificationStore()
  const { integrations } = useSettingsStore()
  const { tasks } = useTaskStore()

  // Fetch GitHub Notifications
  useEffect(() => {
    const fetchGitHub = async () => {
        if (!integrations.githubToken) return
        try {
            const notes = await window.ipcRenderer.invoke('github:notifications', integrations.githubToken)
            notes.forEach((n: any) => {
                // Deduplicate logic would go here in a real app
                addNotification({
                    type: 'github',
                    title: n.subject.title,
                    content: n.repository.full_name,
                    priority: 'medium',
                    link: n.subject.url // This is API url, ideally convert to html_url
                })
            })
        } catch (e) {
            console.error('Failed to fetch GH notifications', e)
        }
    }
    fetchGitHub()
    // Poll every 5 mins
    const interval = setInterval(fetchGitHub, 300000)
    return () => clearInterval(interval)
  }, [integrations.githubToken])

  // Check for Overdue Tasks
  useEffect(() => {
      const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done')
      overdue.forEach(t => {
          // Simple check to avoid spamming store
          if (!notifications.some(n => n.title === `Overdue: ${t.title}`)) {
              addNotification({
                  type: 'task',
                  title: `Overdue: ${t.title}`,
                  content: 'This task is past its due date.',
                  priority: 'high'
              })
          }
      })
  }, [tasks])

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pulse</h2>
          <p className="text-muted-foreground">Unified Notification Center</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearAll}>Clear All</Button>
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
            {notifications.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Bell className="h-12 w-12 mb-4 opacity-20" />
                        <p>All caught up! No new notifications.</p>
                    </CardContent>
                </Card>
            ) : (
                notifications.map(note => (
                    <Card key={note.id} className={cn(
                        "transition-all hover:shadow-md",
                        note.read ? "opacity-60" : "border-l-4 border-l-blue-500"
                    )}>
                        <CardContent className="p-4 flex gap-4">
                            <div className={cn(
                                "p-3 rounded-full h-fit",
                                note.type === 'github' ? "bg-slate-900 text-white" :
                                note.type === 'task' ? "bg-yellow-100 text-yellow-600" :
                                "bg-blue-100 text-blue-600"
                            )}>
                                {note.type === 'github' && <Github className="h-5 w-5" />}
                                {note.type === 'task' && <AlertTriangle className="h-5 w-5" />}
                                {note.type === 'system' && <Activity className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-sm">{note.title}</h4>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{note.content}</p>
                                <div className="flex gap-2 mt-3">
                                    {!note.read && (
                                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => markAsRead(note.id)}>
                                            <Check className="h-3 w-3 mr-1" /> Mark Read
                                        </Button>
                                    )}
                                    {note.link && (
                                        <Button variant="link" size="sm" className="h-6 text-xs px-0" onClick={() => window.open(note.link, '_blank')}>
                                            View External
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-500" /> API Gateway
                        </span>
                        <span className="text-xs font-bold text-green-600">OPERATIONAL</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" /> Cron Jobs
                        </span>
                        <span className="text-xs font-bold text-green-600">RUNNING</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
