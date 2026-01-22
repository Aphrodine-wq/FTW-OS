import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import {
  Terminal, Server, Plus, Power, Activity, Cpu, HardDrive,
  MemoryStick, Wifi, WifiOff, Edit, Trash2, RefreshCw, Clock,
  CheckCircle, XCircle, AlertTriangle, Link as LinkIcon
} from 'lucide-react'
import { cn } from '@/services/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface ServerData {
  id: string
  name: string
  host: string
  port: number
  username?: string
  status: 'online' | 'offline' | 'checking'
  cpu?: string
  mem?: string
  disk?: string
  uptime?: string
  lastChecked?: Date
  sshEnabled: boolean
}

export function ServerManager() {
  const [servers, setServers] = useState<ServerData[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingServer, setEditingServer] = useState<ServerData | null>(null)
  const [checking, setChecking] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 22,
    username: '',
    sshEnabled: true
  })

  useEffect(() => {
    loadServers()
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshAllServers()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadServers = async () => {
    try {
      const saved = await window.ipcRenderer.invoke('db:get-servers')
      setServers(saved || [])
    } catch (error) {
      console.error('Failed to load servers:', error)
    }
  }

  const saveServers = async (newServers: ServerData[]) => {
    try {
      await window.ipcRenderer.invoke('db:save-servers', newServers)
      setServers(newServers)
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: 'Could not save server configuration',
        variant: 'destructive'
      })
    }
  }

  const handleAdd = () => {
    if (!formData.name || !formData.host) {
      toast({
        title: 'Validation Error',
        description: 'Name and host are required',
        variant: 'destructive'
      })
      return
    }

    const newServer: ServerData = {
      id: editingServer?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name,
      host: formData.host,
      port: formData.port,
      username: formData.username,
      status: 'checking',
      sshEnabled: formData.sshEnabled,
      lastChecked: new Date()
    }

    const updated = editingServer
      ? servers.map(s => s.id === editingServer.id ? newServer : s)
      : [...servers, newServer]

    saveServers(updated)
    setShowDialog(false)
    setEditingServer(null)
    setFormData({ name: '', host: '', port: 22, username: '', sshEnabled: true })

    // Check status immediately
    setTimeout(() => checkServerStatus(newServer.id), 100)
  }

  const handleEdit = (server: ServerData) => {
    setEditingServer(server)
    setFormData({
      name: server.name,
      host: server.host,
      port: server.port,
      username: server.username || '',
      sshEnabled: server.sshEnabled
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to remove this server?')) return
    const updated = servers.filter(s => s.id !== id)
    saveServers(updated)
    toast({ title: 'Server Removed', description: 'Server has been deleted' })
  }

  const checkServerStatus = async (id: string) => {
    setChecking(prev => new Set([...prev, id]))

    try {
      // Simulate server check (in production, this would ping the server)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

      const isOnline = Math.random() > 0.3 // 70% online rate for demo

      const updated = servers.map(s =>
        s.id === id ? {
          ...s,
          status: isOnline ? 'online' as const : 'offline' as const,
          cpu: isOnline ? `${Math.floor(Math.random() * 80 + 5)}%` : undefined,
          mem: isOnline ? `${Math.floor(Math.random() * 70 + 10)}%` : undefined,
          disk: isOnline ? `${Math.floor(Math.random() * 60 + 20)}%` : undefined,
          uptime: isOnline ? `${Math.floor(Math.random() * 30 + 1)}d ${Math.floor(Math.random() * 24)}h` : undefined,
          lastChecked: new Date()
        } : s
      )

      saveServers(updated)
    } catch (error) {
      console.error('Failed to check server:', error)
    } finally {
      setChecking(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const refreshAllServers = () => {
    servers.forEach(s => checkServerStatus(s.id))
  }

  const connectSSH = async (server: ServerData) => {
    if (!server.sshEnabled) {
      toast({
        title: 'SSH Disabled',
        description: 'SSH is not enabled for this server',
        variant: 'destructive'
      })
      return
    }

    try {
      // In production, this would open an SSH terminal
      const termId = `ssh-${server.id}`
      await window.ipcRenderer.invoke('terminal:create', termId)
      toast({
        title: 'Connected',
        description: `SSH session opened for ${server.name}`
      })
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Could not establish SSH connection',
        variant: 'destructive'
      })
    }
  }

  const getStatusIcon = (status: ServerData['status']) => {
    if (status === 'checking') return <Clock className="h-5 w-5 animate-spin" />
    if (status === 'online') return <CheckCircle className="h-5 w-5" />
    return <XCircle className="h-5 w-5" />
  }

  const getStatusColor = (status: ServerData['status']) => {
    if (status === 'checking') return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    if (status === 'online') return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Server Manager</h2>
          <p className="text-muted-foreground">Monitor and manage your infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshAllServers}
            disabled={checking.size > 0}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", checking.size > 0 && "animate-spin")} />
            Refresh All
          </Button>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowDialog(true)}
          >
            <Plus className="h-4 w-4" /> Add Server
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Servers</p>
                <p className="text-2xl font-bold">{servers.length}</p>
              </div>
              <Server className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">{servers.filter(s => s.status === 'online').length}</p>
              </div>
              <Wifi className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-red-600">{servers.filter(s => s.status === 'offline').length}</p>
              </div>
              <WifiOff className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checking</p>
                <p className="text-2xl font-bold text-blue-600">{checking.size}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Grid */}
      {servers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <Server className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">No Servers Added</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Add your first server to start monitoring infrastructure health and performance
            </p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Server
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {servers.map(server => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-3 rounded-lg", getStatusColor(server.status))}>
                          {getStatusIcon(server.status)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{server.name}</h3>
                          <div className="text-xs font-mono text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded w-fit flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            {server.host}:{server.port}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(server)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                          onClick={() => handleDelete(server.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {server.status === 'online' ? (
                      <>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <Cpu className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                            <span className="text-xs font-bold">{server.cpu || '-'}</span>
                            <p className="text-[10px] text-muted-foreground">CPU</p>
                          </div>
                          <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <MemoryStick className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                            <span className="text-xs font-bold">{server.mem || '-'}</span>
                            <p className="text-[10px] text-muted-foreground">Memory</p>
                          </div>
                          <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <HardDrive className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                            <span className="text-xs font-bold">{server.disk || '-'}</span>
                            <p className="text-[10px] text-muted-foreground">Disk</p>
                          </div>
                        </div>

                        {server.uptime && (
                          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Uptime: {server.uptime}
                          </p>
                        )}
                      </>
                    ) : server.status === 'offline' ? (
                      <div className="py-4 text-center">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                        <p className="text-sm text-muted-foreground">Server is offline</p>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <Activity className="h-8 w-8 mx-auto mb-2 text-blue-400 animate-pulse" />
                        <p className="text-sm text-muted-foreground">Checking status...</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2"
                        size="sm"
                        disabled={server.status !== 'online' || !server.sshEnabled}
                        onClick={() => connectSSH(server)}
                      >
                        <Terminal className="h-4 w-4" /> Connect SSH
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => checkServerStatus(server.id)}
                        disabled={checking.has(server.id)}
                      >
                        <RefreshCw className={cn("h-4 w-4", checking.has(server.id) && "animate-spin")} />
                      </Button>
                    </div>

                    {server.lastChecked && (
                      <p className="text-[10px] text-muted-foreground text-center mt-2">
                        Last checked: {new Intl.DateTimeFormat('en-US', {
                          hour: 'numeric',
                          minute: 'numeric'
                        }).format(server.lastChecked)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingServer ? 'Edit Server' : 'Add New Server'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Server Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Production Server"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Host/IP</label>
                <Input
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  placeholder="192.168.1.10"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Port</label>
                <Input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  placeholder="22"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Username (Optional)</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="root"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ssh-enabled"
                checked={formData.sshEnabled}
                onChange={(e) => setFormData({ ...formData, sshEnabled: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="ssh-enabled" className="text-sm font-medium">Enable SSH Connection</label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleAdd}>
                {editingServer ? 'Save Changes' : 'Add Server'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowDialog(false)
                setEditingServer(null)
                setFormData({ name: '', host: '', port: 22, username: '', sshEnabled: true })
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
