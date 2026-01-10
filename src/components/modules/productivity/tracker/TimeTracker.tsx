import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Square, Folder, Terminal, Clock, FileCode, History, RotateCcw, Save } from 'lucide-react'
import { Client, Project, TimeSession, ActivityLog } from '@/types/invoice'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/services/utils'

export function TimeTracker() {
  const [clients, setClients] = useState<Client[]>([])
  const [currentSession, setCurrentSession] = useState<TimeSession | null>(null)
  const [selectedClient, setSelectedClient] = useState('')
  const [projectPath, setProjectPath] = useState('')
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [view, setView] = useState<'timer' | 'history'>('timer')
  const [history, setHistory] = useState<TimeSession[]>([])
  
  // Theme
  const { blur, opacity } = useThemeStore()
  
  // Dynamic glass style using CSS variables for theme support
  const glassStyle = {
    backdropFilter: `blur(${blur}px)`,
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }

  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
    
    // Check for active session
    window.ipcRenderer.invoke('tracker:get-current').then(session => {
      if (session) {
        setCurrentSession(session)
        setLogs(session.logs)
        const start = new Date(session.startTime).getTime()
        const now = new Date().getTime()
        setElapsed(Math.floor((now - start) / 1000))
      }
    })

    const handleActivity = (_: any, log: ActivityLog) => {
      setLogs(prev => [...prev, log])
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }
    
    window.ipcRenderer.on('tracker:activity', handleActivity)
    return () => {
      window.ipcRenderer.removeAllListeners('tracker:activity')
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentSession) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentSession])

  const loadData = async () => {
    const savedClients = await window.ipcRenderer.invoke('db:get-clients') || []
    setClients(savedClients)
  }

  const loadHistory = async () => {
    if (selectedClient) {
        const sessions = await window.ipcRenderer.invoke('tracker:get-sessions', selectedClient)
        setHistory(sessions || [])
    }
  }

  useEffect(() => {
    if (view === 'history') loadHistory()
  }, [view, selectedClient])

  const handleSelectFolder = async () => {
    const path = await window.ipcRenderer.invoke('dialog:open-directory')
    if (path) setProjectPath(path)
  }

  const toggleSession = async () => {
    if (currentSession) {
      const completed = await window.ipcRenderer.invoke('tracker:stop-session')
      setCurrentSession(null)
      setElapsed(0)
      setLogs([])
      toast({ title: "Session Ended", description: `Logged ${Math.floor(completed.duration / 60)} minutes.` })
    } else {
      if (!selectedClient || !projectPath) {
        toast({ title: "Error", description: "Select a client and folder first", variant: "destructive" })
        return
      }
      
      const session = await window.ipcRenderer.invoke('tracker:start-session', {
        projectId: selectedClient,
        path: projectPath
      })
      setCurrentSession(session)
      setLogs([])
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Circular Progress Calculation
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const progress = currentSession ? (elapsed % 60) / 60 : 0
  const dashoffset = circumference - progress * circumference

  return (
    <div className="h-full flex flex-col gap-6 text-[var(--text-main)] transition-colors duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Time Logger</h2>
          <p className="text-[var(--text-muted)]">Track development velocity</p>
        </div>
        <div className="flex gap-2 bg-[var(--bg-surface-hover)] p-1 rounded-lg backdrop-blur-md">
            <button 
                onClick={() => setView('timer')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-bold transition-all",
                  view === 'timer' 
                    ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-lg' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                )}
            >
                Timer
            </button>
            <button 
                onClick={() => setView('history')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-bold transition-all",
                  view === 'history' 
                    ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-lg' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                )}
            >
                History
            </button>
        </div>
      </div>

      {view === 'timer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Control Panel */}
            <div className="rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden" style={glassStyle}>
                <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Client Context</label>
                        <select 
                            className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                            disabled={!!currentSession}
                        >
                            <option value="">Select Client...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Project Root</label>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 p-3 bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono text-[var(--text-main)] outline-none"
                                value={projectPath}
                                readOnly
                                placeholder="Select directory..."
                            />
                            <button 
                                onClick={handleSelectFolder} 
                                disabled={!!currentSession}
                                className="p-3 bg-[var(--bg-surface-hover)] hover:bg-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] transition-colors text-[var(--text-main)]"
                            >
                                <Folder className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center py-8 relative z-10">
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        {/* Glass Ring */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle cx="128" cy="128" r="120" stroke="var(--border-subtle)" strokeWidth="8" fill="transparent" className="opacity-30" />
                            <circle 
                                cx="128" cy="128" r="120" 
                                stroke="var(--accent-primary)" 
                                strokeWidth="8" 
                                fill="transparent" 
                                strokeDasharray={circumference} 
                                strokeDashoffset={dashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-linear drop-shadow-md"
                            />
                        </svg>
                        <div className="text-center">
                            <div className="text-5xl font-mono font-black text-[var(--text-main)] tracking-tighter drop-shadow-lg">
                                {formatTime(elapsed)}
                            </div>
                            {currentSession && <div className="text-xs font-bold uppercase text-[var(--success)] mt-2 animate-pulse">Recording</div>}
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <button 
                        onClick={toggleSession}
                        className={cn(
                          "w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3",
                          currentSession 
                            ? "bg-[var(--danger)] text-white hover:brightness-110" 
                            : "bg-[var(--accent-primary)] text-[var(--bg-app)] hover:brightness-110"
                        )}
                    >
                        {currentSession ? <Square className="fill-current" /> : <Play className="fill-current" />}
                        {currentSession ? 'Stop Recording' : 'Start Session'}
                    </button>
                </div>
            </div>

            {/* Live Terminal */}
            <div className="lg:col-span-2 rounded-3xl overflow-hidden flex flex-col bg-[var(--bg-app)] border border-[var(--border-subtle)] shadow-2xl">
                <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[var(--success)]">
                        <Terminal className="h-4 w-4" />
                        <span className="font-mono text-xs font-bold">LIVE_FEED</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[var(--danger)]/20 border border-[var(--danger)]/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-[var(--success)]/20 border border-[var(--success)]/50" />
                    </div>
                </div>
                <div className="flex-1 p-6 font-mono text-sm overflow-auto custom-scrollbar" ref={scrollRef}>
                    {logs.length === 0 && (
                        <div className="text-[var(--text-muted)] italic text-center mt-20">Waiting for filesystem events...</div>
                    )}
                    <div className="space-y-2">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                <span className="text-[var(--text-muted)] opacity-75 font-mono">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className={cn(
                                  "font-bold",
                                  log.type === 'add' ? 'text-[var(--success)]' : 
                                  log.type === 'change' ? 'text-[var(--accent-primary)]' : 
                                  'text-[var(--danger)]'
                                )}>
                                    {log.type.toUpperCase()}
                                </span>
                                <span className="text-[var(--text-main)] opacity-90 truncate">{log.filePath}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="rounded-3xl p-8 h-full overflow-auto" style={glassStyle}>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-[var(--text-muted)] border-b border-[var(--border-subtle)] text-xs uppercase tracking-wider">
                        <th className="p-4">Date</th>
                        <th className="p-4">Duration</th>
                        <th className="p-4">Files</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody className="text-[var(--text-main)]">
                    {history.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-[var(--text-muted)]">No history found for selected client.</td></tr>
                    ) : (
                        history.map((session, i) => (
                            <tr key={i} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] transition-colors">
                                <td className="p-4">{new Date(session.startTime).toLocaleDateString()}</td>
                                <td className="p-4 font-mono">{formatTime(session.duration)}</td>
                                <td className="p-4">{session.logs.length} changes</td>
                                <td className="p-4"><span className="px-2 py-1 bg-[var(--success)]/20 text-[var(--success)] rounded text-xs">Completed</span></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      )}
    </div>
  )
}
