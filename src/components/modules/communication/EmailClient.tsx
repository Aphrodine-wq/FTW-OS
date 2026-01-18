import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Inbox, Send, Archive, Trash2, PenSquare, Paperclip, Star, MoreHorizontal, Reply, Search, ChevronLeft, ChevronRight, Settings, Loader2 } from 'lucide-react'
import { cn } from '@/services/utils'

interface Email {
  id: string
  from: string
  subject: string
  preview: string
  date: string
  read: boolean
  starred: boolean
  label?: string
}

export function EmailClient() {
  const [activeFolder, setActiveFolder] = useState('inbox')
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [emails, setEmails] = useState<Email[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Mail Config State
  const [config, setConfig] = useState({
    host: 'imap.gmail.com',
    port: 993,
    user: '',
    pass: '',
    secure: true
  })

  useEffect(() => {
    // Load config from vault on mount
    const loadConfig = async () => {
        const saved = await window.ipcRenderer.invoke('vault:get', 'mail_config')
        if (saved) setConfig(saved)
    }
    loadConfig()
  }, [])

  const handleSaveConfig = async () => {
    await window.ipcRenderer.invoke('vault:set', { key: 'mail_config', value: config })
    setShowSettings(false)
    fetchEmails()
  }

  const fetchEmails = async () => {
    if (!config.user || !config.pass) return
    setIsLoading(true)
    try {
        const res = await window.ipcRenderer.invoke('mail:fetch', { config })
        if (res.success) {
            setEmails(res.emails)
        }
    } catch (e) {
        console.error(e)
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex gap-0 rounded-2xl overflow-hidden border border-slate-200 bg-white relative">
      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4">
                <h3 className="text-lg font-bold">Mail Settings</h3>
                <div className="space-y-2">
                    <label className="text-xs font-medium">IMAP Host</label>
                    <Input value={config.host} onChange={e => setConfig({...config, host: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium">Email</label>
                    <Input value={config.user} onChange={e => setConfig({...config, user: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium">Password (App Password)</label>
                    <Input type="password" value={config.pass} onChange={e => setConfig({...config, pass: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" onClick={() => setShowSettings(false)}>Cancel</Button>
                    <Button onClick={handleSaveConfig}>Save & Connect</Button>
                </div>
            </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-4 flex gap-2">
            <Button className="flex-1 justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <PenSquare className="h-4 w-4" /> Compose
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4" />
            </Button>
        </div>

        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
            <button 
                onClick={() => { setActiveFolder('inbox'); fetchEmails() }}
                className={cn("w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg", activeFolder === 'inbox' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-100")}
            >
                <div className="flex items-center gap-3">
                    <Inbox className="h-4 w-4" /> Inbox
                </div>
                <span className="text-xs font-bold">{emails.filter(e => !e.read).length}</span>
            </button>
            {/* ... other folder buttons ... */}
        </nav>
      </div>

      {/* Email List */}
      <div className={cn("flex-1 flex flex-col min-w-0 bg-white", selectedEmail ? "hidden lg:flex lg:w-1/3 lg:flex-none lg:border-r border-slate-200" : "")}>
        <div className="p-3 border-b border-slate-200 flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Search mail" 
                    className="pl-9 bg-slate-50 border-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button variant="ghost" size="icon" onClick={fetchEmails} disabled={isLoading}>
                <Loader2 className={cn("h-4 w-4", isLoading ? "animate-spin" : "")} />
            </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
            {emails.length === 0 && !isLoading && (
                <div className="p-8 text-center text-slate-400 text-sm">
                    No emails found. Check settings.
                </div>
            )}
            {emails.map(email => (
                <div 
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={cn(
                        "p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group relative",
                        selectedEmail?.id === email.id ? "bg-blue-50/50" : "",
                        !email.read ? "bg-white" : "bg-slate-50/30"
                    )}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={cn("text-sm font-medium truncate pr-2", !email.read ? "text-slate-900 font-bold" : "text-slate-700")}>
                            {email.from}
                        </span>
                        <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(email.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-slate-900 mb-1 truncate">
                        {email.subject}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-2">
                        {email.preview}
                    </div>
                </div>
            ))}
        </div>
      </div>


      {/* Reading Pane */}
      {selectedEmail ? (
        <div className="flex-1 flex flex-col bg-white min-w-0 h-full absolute inset-0 z-10 lg:static">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedEmail(null)}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Archive"><Archive className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Mark as unread"><Mail className="h-4 w-4" /></Button>
                    </div>
                </div>
                <div className="flex gap-1 text-slate-400">
                    <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
                <div className="flex justify-between items-start mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">{selectedEmail.subject}</h2>
                    <div className="flex gap-2">
                        {selectedEmail.label && (
                            <span className="px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-600 uppercase tracking-wider">
                                {selectedEmail.label}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {selectedEmail.from[0]}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">{selectedEmail.from}</div>
                            <div className="text-xs text-slate-500">to me</div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500">{selectedEmail.date}</div>
                </div>

                <div className="prose max-w-none text-slate-800">
                    <p>Hi Walt,</p>
                    <p>{selectedEmail.preview}</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    <p>Best regards,<br/>{selectedEmail.from}</p>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 flex gap-4">
                    <Button variant="outline" className="gap-2">
                        <Reply className="h-4 w-4" /> Reply
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <MoreHorizontal className="h-4 w-4" /> Forward
                    </Button>
                </div>
            </div>
        </div>
      ) : (
        <div className="flex-1 hidden lg:flex flex-col items-center justify-center bg-slate-50 text-slate-400">
            <Mail className="h-16 w-16 mb-4 opacity-20" />
            <p>Select an email to read</p>
        </div>
      )}
    </div>
  )
}
