import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Square, Pause, Clock, Tag, DollarSign, Calendar as CalendarIcon, Save, Trash2 } from 'lucide-react'
import { useTimeTrackerStore } from '@/stores/time-tracker-store'
import { useEmployeeStore } from '@/stores/employee-store'
import { cn } from '@/services/utils'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

export function TimeTracker() {
  const { 
    activeEntry, 
    entries, 
    startTimer, 
    stopTimer, 
    updateActiveEntry,
    deleteEntry 
  } = useTimeTrackerStore()
  
  const { employees } = useEmployeeStore()
  
  // Local state for UI
  const [elapsed, setElapsed] = useState(0)
  const [description, setDescription] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [isBillable, setIsBillable] = useState(true)
  const [view, setView] = useState<'timer' | 'timesheet'>('timer')

  // Timer tick
  useEffect(() => {
    let interval: any
    if (activeEntry) {
      // Calculate elapsed from start time to avoid drift
      const tick = () => {
        const now = new Date().getTime()
        const start = new Date(activeEntry.startTime).getTime()
        setElapsed(Math.floor((now - start) / 1000))
      }
      tick() // immediate update
      interval = setInterval(tick, 1000)
    } else {
      setElapsed(0)
      setDescription('')
    }
    return () => {
        if (interval) clearInterval(interval)
    }
  }, [activeEntry])

  const handleStart = () => {
    // For now, assign to first employee found or a mock ID if empty
    const empId = employees[0]?.id || 'mock-employee-id'
    startTimer(empId, selectedProject, undefined, description)
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Group entries by day for history
  const historyByDay = entries.reduce((acc, entry) => {
    const date = new Date(entry.startTime).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {} as Record<string, typeof entries>)

  return (
    <div className="h-full flex flex-col gap-6 p-1 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Time Tracker</h2>
          <p className="text-muted-foreground">Track billable hours and productivity</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setView('timer')}
                className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    view === 'timer' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                )}
            >
                Timer
            </button>
            <button 
                onClick={() => setView('timesheet')}
                className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    view === 'timesheet' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                )}
            >
                Timesheet
            </button>
        </div>
      </div>

      {view === 'timer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Active Timer Card */}
            <Card className="lg:col-span-2 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                
                <CardContent className="relative z-10 p-12 flex flex-col items-center justify-center space-y-8">
                    <div className="text-center space-y-2">
                        <div className="text-8xl font-mono font-bold tracking-tighter tabular-nums drop-shadow-2xl">
                            {formatTime(elapsed)}
                        </div>
                        <div className="text-slate-400 font-medium tracking-widest uppercase text-sm">
                            {activeEntry ? 'Running' : 'Ready to track'}
                        </div>
                    </div>

                    <div className="w-full max-w-md space-y-4">
                        <Input 
                            placeholder="What are you working on?" 
                            className="bg-white/10 border-white/10 text-white placeholder:text-white/50 h-12 text-lg text-center rounded-xl focus-visible:ring-blue-500"
                            value={activeEntry ? activeEntry.description : description}
                            onChange={(e) => activeEntry ? updateActiveEntry({ description: e.target.value }) : setDescription(e.target.value)}
                        />
                        
                        <div className="flex justify-center gap-4">
                            {!activeEntry ? (
                                <Button 
                                    size="lg" 
                                    className="h-16 w-16 rounded-full bg-blue-500 hover:bg-blue-400 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                                    onClick={handleStart}
                                >
                                    <Play className="h-8 w-8 fill-current ml-1" />
                                </Button>
                            ) : (
                                <Button 
                                    size="lg" 
                                    className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/30 transition-all hover:scale-105"
                                    onClick={stopTimer}
                                >
                                    <Square className="h-6 w-6 fill-current" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>

                {/* Status Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-md flex justify-between items-center text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span>{selectedProject || 'No Project'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{isBillable ? 'Billable' : 'Non-Billable'}</span>
                    </div>
                </div>
            </Card>

            {/* Quick Settings / Recent */}
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Session Details</h3>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Project</label>
                            <Input 
                                placeholder="Project Name" 
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                disabled={!!activeEntry}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Billable</span>
                            </div>
                            <Switch 
                                checked={isBillable}
                                onCheckedChange={setIsBillable}
                                disabled={!!activeEntry}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex-1">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-4">Recent Entries</h3>
                        <div className="space-y-3">
                            {entries.slice(0, 5).map(entry => (
                                <div key={entry.id} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded transition-colors group">
                                    <div className="truncate flex-1 pr-4">
                                        <p className="font-medium truncate">{entry.description || 'No description'}</p>
                                        <p className="text-xs text-slate-500">{entry.projectId || 'Unassigned'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono">{formatTime(entry.duration)}</p>
                                        <button 
                                            onClick={() => deleteEntry(entry.id)}
                                            className="text-xs text-red-500 opacity-0 group-hover:opacity-100 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {entries.length === 0 && (
                                <p className="text-xs text-slate-400 text-center py-4">No recent history</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}

      {view === 'timesheet' && (
        <Card className="flex-1 overflow-hidden flex flex-col">
            <CardContent className="p-0 flex-1 overflow-y-auto">
                {Object.entries(historyByDay).map(([date, dayEntries]) => (
                    <div key={date} className="border-b border-slate-100 last:border-0">
                        <div className="bg-slate-50/50 p-3 flex justify-between items-center sticky top-0 backdrop-blur-sm z-10">
                            <h4 className="font-bold text-sm text-slate-700">{date}</h4>
                            <span className="text-xs font-mono font-medium bg-slate-200 px-2 py-1 rounded">
                                {formatTime(dayEntries.reduce((sum, e) => sum + e.duration, 0))}
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {dayEntries.map(entry => (
                                <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-1 h-12 rounded-full",
                                            entry.billable ? "bg-green-500" : "bg-slate-300"
                                        )} />
                                        <div>
                                            <p className="font-medium text-sm">{entry.description || 'No description'}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                                                    {entry.projectId || 'No Project'}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(entry.startTime).toLocaleTimeString()} - {entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : '...'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono text-sm font-bold">{formatTime(entry.duration)}</span>
                                        <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)}>
                                            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {entries.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                        <p>No time entries found</p>
                    </div>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  )
}
