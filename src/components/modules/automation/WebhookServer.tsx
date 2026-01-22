import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Globe, Copy, RefreshCw, Activity, CheckCircle, AlertTriangle,
  Play, Plus, Trash2, Edit, Send, Code, Eye, X
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/services/utils'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Webhook {
  id: string
  name: string
  url: string
  status: 'active' | 'error' | 'disabled'
  lastPing?: string
  totalRequests: number
  failedRequests: number
}

interface WebhookLog {
  id: string
  webhookId: string
  timestamp: Date
  method: string
  status: number
  responseTime: number
  payload: any
}

export function WebhookServer() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    { id: '1', name: 'Stripe Events', url: 'https://ftw-os.com/hooks/stripe_v1', status: 'active', lastPing: '2m ago', totalRequests: 1247, failedRequests: 3 },
    { id: '2', name: 'GitHub Actions', url: 'https://ftw-os.com/hooks/gh_deploy', status: 'active', lastPing: '1h ago', totalRequests: 856, failedRequests: 0 },
    { id: '3', name: 'Typeform', url: 'https://ftw-os.com/hooks/tf_leads', status: 'error', lastPing: '4h ago', totalRequests: 234, failedRequests: 12 },
  ])
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showLogsDialog, setShowLogsDialog] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '' })
  const [testPayload, setTestPayload] = useState('{}')
  const { toast } = useToast()

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({ title: 'Error', description: 'Name and URL required', variant: 'destructive' })
      return
    }
    const webhook: Webhook = {
      id: Math.random().toString(36).substr(2, 9),
      name: newWebhook.name,
      url: newWebhook.url,
      status: 'active',
      totalRequests: 0,
      failedRequests: 0
    }
    setWebhooks([...webhooks, webhook])
    setNewWebhook({ name: '', url: '' })
    setShowAddDialog(false)
    toast({ title: 'Webhook Added', description: `${webhook.name} is now active` })
  }

  const handleDeleteWebhook = (id: string) => {
    if (confirm('Delete this webhook?')) {
      setWebhooks(webhooks.filter(w => w.id !== id))
      toast({ title: 'Deleted', description: 'Webhook removed' })
    }
  }

  const handleTestWebhook = async (webhook: Webhook) => {
    try {
      JSON.parse(testPayload)
      toast({ title: 'Test Sent', description: `Request sent to ${webhook.name}` })
      const log: WebhookLog = {
        id: Math.random().toString(36).substr(2, 9),
        webhookId: webhook.id,
        timestamp: new Date(),
        method: 'POST',
        status: 200,
        responseTime: Math.random() * 200,
        payload: JSON.parse(testPayload)
      }
      setLogs([log, ...logs])
      setShowTestDialog(false)
      setTestPayload('{}')
    } catch (e) {
      toast({ title: 'Invalid JSON', description: 'Check your payload', variant: 'destructive' })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied', description: 'URL copied to clipboard' })
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Webhook Server</h2>
          <p className="text-muted-foreground">Manage incoming event streams and integrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowLogsDialog(true)}>
            <Activity className="h-4 w-4 mr-2" /> View Logs
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Add Webhook
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Webhooks</p>
                <p className="text-2xl font-bold">{webhooks.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{webhooks.filter(w => w.status === 'active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{webhooks.filter(w => w.status === 'error').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        <AnimatePresence>
          {webhooks.map(hook => (
            <motion.div
              key={hook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "p-3 rounded-full",
                        hook.status === 'active' ? "bg-green-100 dark:bg-green-900/30 text-green-600" :
                          hook.status === 'error' ? "bg-red-100 dark:bg-red-900/30 text-red-600" :
                            "bg-gray-100 dark:bg-gray-800 text-gray-600"
                      )}>
                        <Globe className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{hook.name}</h3>
                          <Badge variant={hook.status === 'active' ? 'default' : 'destructive'}>
                            {hook.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono text-slate-600 dark:text-slate-300">
                            {hook.url}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(hook.url)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{hook.totalRequests} total requests</span>
                          <span className={hook.failedRequests > 0 ? 'text-red-600' : ''}>
                            {hook.failedRequests} failed
                          </span>
                          {hook.lastPing && <span>Last ping: {hook.lastPing}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWebhook(hook)
                          setShowTestDialog(true)
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" /> Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWebhook(hook)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-100 hover:text-red-600"
                        onClick={() => handleDeleteWebhook(hook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Webhook Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                placeholder="My Integration"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Webhook URL</label>
              <Input
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://api.example.com/webhook"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleAddWebhook} className="flex-1">Add Webhook</Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Webhook Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Webhook: {selectedWebhook?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Test Payload (JSON)</label>
              <textarea
                className="w-full h-40 p-3 border rounded-md font-mono text-sm"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                placeholder='{"event": "test", "data": {}}'
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => selectedWebhook && handleTestWebhook(selectedWebhook)}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" /> Send Test Request
              </Button>
              <Button variant="outline" onClick={() => setShowTestDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Webhook Logs</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No logs yet. Test a webhook to see logs here.</p>
              </div>
            ) : (
              logs.map(log => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={log.status === 200 ? 'default' : 'destructive'}>
                            {log.method} {log.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.timestamp.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {log.responseTime.toFixed(0)}ms
                          </span>
                        </div>
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">
                          {JSON.stringify(log.payload, null, 2)}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
