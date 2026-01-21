import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, Clock, Calendar as CalendarIcon, Hash, FolderGit2, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTimeTrackerStore } from '@/stores/time-tracker-store'
import { useProjectStore } from '@/stores/project-store'
import { cn } from '@/services/utils'
import { motion, AnimatePresence } from 'framer-motion'

// Utility to format duration
const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function TimeTracker() {
    const { activeEntry, entries, startTimer, stopTimer, updateActiveEntry } = useTimeTrackerStore()
    const { projects } = useProjectStore()
    const [elapsed, setElapsed] = useState(0)
    const [description, setDescription] = useState('')
    const [selectedProjectId, setSelectedProjectId] = useState<string>('')
    const [view, setView] = useState<'timer' | 'timesheet'>('timer')

    // Timer tick effect
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (activeEntry) {
            const startTime = new Date(activeEntry.startTime).getTime()
            setElapsed(Math.floor((Date.now() - startTime) / 1000))
            interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000))
            }, 1000)
        } else {
            setElapsed(0)
            setDescription('')
            setSelectedProjectId('')
        }
        return () => clearInterval(interval)
    }, [activeEntry])

    const handleStart = () => {
        if (!description.trim()) return
        startTimer({
            description,
            projectId: selectedProjectId,
            tags: []
        })
    }

    const handleStop = () => {
        stopTimer()
    }

    const getProjectName = (id?: string) => {
        return projects.find(p => p.id === id)?.name || 'No Project'
    }

    const recentEntries = entries.slice(0, 5)

    return (
        <div className="h-full flex flex-col gap-6 p-1">
            {/* Header */}
            <div className="flex justify-between items-center px-1">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Time Tracker</h2>
                    <p className="text-slate-500 text-sm">Manage your focus time</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setView('timer')}
                        className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", view === 'timer' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
                    >
                        Timer
                    </button>
                    <button
                        onClick={() => setView('timesheet')}
                        className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", view === 'timesheet' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
                    >
                        Timesheet
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {view === 'timer' ? (
                    <motion.div
                        key="timer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col gap-6"
                    >
                        {/* Active Timer Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center gap-8 relative overflow-hidden">
                            {/* Background Pulse if active */}
                            {activeEntry && (
                                <div className="absolute inset-0 bg-blue-50/50 animate-pulse pointer-events-none" />
                            )}

                            <div className="relative z-10 w-full max-w-md flex flex-col gap-4">
                                <div className="text-7xl font-mono font-bold text-slate-900 text-center tracking-tighter tabular-nums">
                                    {formatDuration(elapsed)}
                                </div>

                                {!activeEntry ? (
                                    <div className="flex flex-col gap-4">
                                        <Input
                                            placeholder="What are you working on?"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="text-center text-lg h-12 bg-slate-50 border-slate-200"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Project" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {projects.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                size="lg"
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-500/20"
                                                onClick={handleStart}
                                                disabled={!description}
                                            >
                                                <Play className="h-4 w-4 fill-current" /> Start Focus
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="text-center">
                                            <h3 className="text-xl font-medium text-slate-900">{activeEntry.description}</h3>
                                            <p className="text-slate-500 flex items-center justify-center gap-2 mt-1">
                                                <FolderGit2 className="h-4 w-4" />
                                                {getProjectName(activeEntry.projectId)}
                                            </p>
                                        </div>
                                        <Button
                                            size="lg"
                                            variant="destructive"
                                            className="w-full max-w-xs gap-2 shadow-lg shadow-red-500/20"
                                            onClick={handleStop}
                                        >
                                            <Square className="h-4 w-4 fill-current" /> Stop Timer
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Local Repo Tracking / Recent Activity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                            <Card className="p-4 flex flex-col gap-4 border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <FolderGit2 className="h-4 w-4" /> Local Repo Activity
                                </h3>
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg p-6">
                                    {activeEntry?.projectId ? (
                                        <div className="text-center space-y-2">
                                            <p>Monitoring changes in {getProjectName(activeEntry.projectId)}...</p>
                                            <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        </div>
                                    ) : (
                                        <p>Select a project with a local path to track changes.</p>
                                    )}
                                </div>
                            </Card>

                            <Card className="p-4 flex flex-col gap-4 border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <History className="h-4 w-4" /> Recent Sessions
                                </h3>
                                <div className="space-y-2 overflow-y-auto max-h-[200px] pr-2">
                                    {recentEntries.map(entry => (
                                        <div key={entry.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
                                            <div className="grid gap-0.5">
                                                <span className="font-medium text-slate-900">{entry.description}</span>
                                                <span className="text-xs text-slate-500">{getProjectName(entry.projectId)}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-mono font-medium text-slate-700">
                                                    {formatDuration((new Date(entry.endTime!).getTime() - new Date(entry.startTime).getTime()) / 1000)}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(entry.startTime).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="timesheet"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden"
                    >
                        <div className="h-full flex flex-col gap-4">
                            <div className="flex justify-between items-center pb-4 border-b">
                                <h3 className="font-bold text-lg">History</h3>
                                <Button variant="outline" size="sm">Export CSV</Button>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Date</th>
                                            <th className="px-4 py-3">Description</th>
                                            <th className="px-4 py-3">Project</th>
                                            <th className="px-4 py-3 text-right rounded-r-lg">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {entries.map(entry => (
                                            <tr key={entry.id} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-medium text-slate-900">
                                                    {new Date(entry.startTime).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">{entry.description}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                        {getProjectName(entry.projectId)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600">
                                                    {formatDuration((new Date(entry.endTime!).getTime() - new Date(entry.startTime).getTime()) / 1000)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
