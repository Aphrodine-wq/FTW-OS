import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, FileText, CheckCircle, File, PenTool } from 'lucide-react'
import { Client, ProjectUpdate, Task } from '@/types/invoice'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Textarea } from '@/components/ui/textarea'

export function CompUpdateManager() {
  const [clients, setClients] = useState<Client[]>([])
  const [updates, setUpdates] = useState<ProjectUpdate[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [view, setView] = useState<'list' | 'edit'>('list')
  const [currentUpdate, setCurrentUpdate] = useState<Partial<ProjectUpdate>>({})
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const savedClients = await window.ipcRenderer.invoke('db:get-clients') || []
    const savedUpdates = await window.ipcRenderer.invoke('db:get-updates') || []
    const savedTasks = await window.ipcRenderer.invoke('db:get-tasks') || []
    setClients(savedClients)
    setUpdates(savedUpdates)
    setTasks(savedTasks)
  }

  const handleSave = async () => {
    if (!currentUpdate.title || !currentUpdate.clientId) {
      toast({ title: "Error", description: "Title and Client are required", variant: "destructive" })
      return
    }

    const newUpdate = {
      ...currentUpdate,
      id: currentUpdate.id || Math.random().toString(36).substr(2, 9),
      date: currentUpdate.date || new Date(),
      createdAt: currentUpdate.createdAt || new Date(),
      updatedAt: new Date(),
      type: currentUpdate.type || 'update',
      tasksCompleted: currentUpdate.tasksCompleted || [],
      nextSteps: currentUpdate.nextSteps || []
    } as ProjectUpdate

    let updatedList
    if (currentUpdate.id) {
      updatedList = updates.map(u => u.id === currentUpdate.id ? newUpdate : u)
    } else {
      updatedList = [...updates, newUpdate]
    }

    await window.ipcRenderer.invoke('db:save-updates', updatedList)
    setUpdates(updatedList)
    setView('list')
    setCurrentUpdate({})
    
    toast({
      title: newUpdate.type === 'compensation' || newUpdate.type === 'policy' ? "Update Released" : "Document Saved",
      description: `${newUpdate.title} has been ${newUpdate.type === 'compensation' || newUpdate.type === 'policy' ? 'released' : 'saved'}.`
    })
  }

  const handleGenerateFromActivity = async () => {
    if (!currentUpdate.clientId) return
    
    // Get recent sessions
    const sessions = await window.ipcRenderer.invoke('tracker:get-sessions', currentUpdate.clientId)
    if (!sessions || sessions.length === 0) {
      toast({ title: "No Activity", description: "No time logs found for this client.", variant: "destructive" })
      return
    }

    // Mock summarization
    const lastSession = sessions[sessions.length - 1]
    const summary = `
## Weekly Progress
- Completed ${lastSession.logs.length} file changes in recent session.
- Focus Area: Frontend Development
- Time Spent: ${(lastSession.duration / 3600).toFixed(1)} hours

## Technical Details
- Modified core components in \`src/components\`
- Updated API handlers
    `
    setCurrentUpdate(prev => ({ ...prev, content: summary }))
  }

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredUpdates = React.useMemo(() => {
    return updates.filter(u => {
        const matchesSearch = u.title.toLowerCase().includes(search.toLowerCase()) || 
                              clients.find(c => c.id === u.clientId)?.name.toLowerCase().includes(search.toLowerCase())
        const matchesType = filterType === 'all' ? true : u.type === filterType
        return matchesSearch && matchesType
    })
  }, [updates, search, filterType, clients])

  return (
    <div className="h-full flex flex-col gap-6">
      {view === 'list' && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
              <p className="text-muted-foreground">Manage Compensation Updates, Contracts, and Reports</p>
            </div>
            <div className="flex gap-2">
                 <Button onClick={() => { setCurrentUpdate({ date: new Date(), type: 'compensation' }); setView('edit') }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                  <Plus className="mr-2 h-4 w-4" /> New Document
                </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
             <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-sm dark:bg-black/40">
               <CardHeader className="pb-4 border-b border-gray-100 dark:border-white/5">
                 <div className="flex items-center justify-between">
                    <CardTitle>Recent Documents</CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                className="pl-9 pr-4 py-2 text-sm rounded-lg border bg-white/50 focus:ring-2 ring-blue-500/20 outline-none transition-all w-64"
                                placeholder="Search documents..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select 
                            className="p-2 text-sm rounded-lg border bg-white/50 outline-none"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="contract">Contracts</option>
                            <option value="compensation">Compensation</option>
                            <option value="proposal">Proposals</option>
                        </select>
                    </div>
                 </div>
               </CardHeader>
               <CardContent className="p-0">
                 <div className="divide-y divide-gray-100 dark:divide-white/5">
                   <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-white/5">
                        <div className="col-span-5">Document Name</div>
                        <div className="col-span-3">Client</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2 text-right">Actions</div>
                   </div>
                   {filteredUpdates.map(update => (
                     <div key={update.id} className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => { setCurrentUpdate(update); setView('edit') }}>
                       <div className="col-span-5 flex items-center gap-4">
                         <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${
                            update.type === 'contract' ? 'bg-purple-100 text-purple-600' : 
                            update.type === 'compensation' ? 'bg-emerald-100 text-emerald-600' : 
                            update.type === 'proposal' ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                         }`}>
                           {update.type === 'contract' ? <PenTool className="h-5 w-5" /> : update.type === 'compensation' ? <File className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                         </div>
                         <div>
                           <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors">{update.title}</h4>
                           <span className="text-xs text-muted-foreground capitalize inline-flex items-center gap-1">
                                {update.type}
                           </span>
                         </div>
                       </div>
                       <div className="col-span-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                            {clients.find(c => c.id === update.clientId)?.name}
                       </div>
                       <div className="col-span-2 text-sm text-gray-500">
                            {format(new Date(update.date), 'MMM dd, yyyy')}
                       </div>
                       <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600">
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); /* Delete Logic */ }}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   ))}
                   {filteredUpdates.length === 0 && (
                     <div className="text-center py-16 text-muted-foreground bg-gray-50/30 dark:bg-white/5">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No documents found matching your filters</p>
                     </div>
                   )}
                 </div>
               </CardContent>
             </Card>
          </div>
        </>
      )}

      {view === 'edit' && (
        <div className="h-full flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setView('list')}>Cancel</Button>
            <h2 className="text-xl font-bold">{currentUpdate.id ? 'Edit Document' : 'New Document'}</h2>
            <Button onClick={handleSave}>
              {currentUpdate.type === 'compensation' || currentUpdate.type === 'policy' ? 'Release Update' : 'Save Document'}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 h-full">
            <Card className="col-span-2 flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document Title</label>
                  <input 
                    className="w-full p-2 border rounded-md text-lg font-semibold"
                    placeholder="e.g. Q1 Compensation Adjustment"
                    value={currentUpdate.title || ''}
                    onChange={(e) => setCurrentUpdate({ ...currentUpdate, title: e.target.value })}
                  />
                </div>
                
                <div className="flex-1">
                   <div className="flex justify-between items-center mb-2">
                     <label className="text-sm font-medium">Content (Markdown)</label>
                     <Button variant="outline" size="sm" onClick={handleGenerateFromActivity} disabled={!currentUpdate.clientId}>
                       <File className="mr-2 h-3 w-3" /> Auto-Generate from Activity
                     </Button>
                   </div>
                   <Textarea 
                    className="h-[calc(100%-2rem)] font-mono text-sm resize-none" 
                    placeholder="# Executive Summary..."
                    value={currentUpdate.content || ''}
                    onChange={(e) => setCurrentUpdate({ ...currentUpdate, content: e.target.value })}
                   />
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client / Recipient</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={currentUpdate.clientId || ''}
                    onChange={(e) => setCurrentUpdate({ ...currentUpdate, clientId: e.target.value })}
                  >
                    <option value="">Select Recipient</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={currentUpdate.type || 'compensation'}
                    onChange={(e) => setCurrentUpdate({ ...currentUpdate, type: e.target.value as any })}
                  >
                    <option value="compensation">Compensation Update</option>
                    <option value="policy">Company Policy</option>
                    <option value="update">Status Update</option>
                    <option value="proposal">Proposal</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <input 
                    type="date"
                    className="w-full p-2 border rounded-md"
                    value={currentUpdate.date ? format(new Date(currentUpdate.date), 'yyyy-MM-dd') : ''}
                    onChange={(e) => setCurrentUpdate({ ...currentUpdate, date: new Date(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
