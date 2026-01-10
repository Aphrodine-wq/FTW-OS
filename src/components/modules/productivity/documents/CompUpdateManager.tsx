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

  return (
    <div className="h-full flex flex-col gap-6">
      {view === 'list' && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Document Generator</h2>
              <p className="text-muted-foreground">Manage Compensation Updates, Contracts, and Reports</p>
            </div>
            <Button onClick={() => { setCurrentUpdate({ date: new Date(), type: 'compensation' }); setView('edit') }}>
              <Plus className="mr-2 h-4 w-4" /> New Document
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="md:col-span-3">
               <CardHeader>
                 <CardTitle>Recent Documents</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {updates.map(update => (
                     <div key={update.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => { setCurrentUpdate(update); setView('edit') }}>
                       <div className="flex items-center gap-4">
                         <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${update.type === 'contract' ? 'bg-purple-100 text-purple-600' : update.type === 'compensation' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                           {update.type === 'contract' ? <PenTool className="h-5 w-5" /> : update.type === 'compensation' ? <File className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                         </div>
                         <div>
                           <h4 className="font-semibold">{update.title}</h4>
                           <p className="text-sm text-muted-foreground">
                             {clients.find(c => c.id === update.clientId)?.name} • {format(new Date(update.date), 'MMM dd, yyyy')} • <span className="capitalize">{update.type}</span>
                           </p>
                         </div>
                       </div>
                       <Button variant="ghost" size="icon">
                         <Edit className="h-4 w-4" />
                       </Button>
                     </div>
                   ))}
                   {updates.length === 0 && (
                     <div className="text-center py-12 text-muted-foreground">No updates found</div>
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
