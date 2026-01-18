import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, CheckCircle, AlertCircle, ArrowRight, DollarSign, Mail, FileText } from 'lucide-react'
import { Lead } from '@/types/invoice'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

export function LeadsPipeline() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [newLeadName, setNewLeadName] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const savedLeads = await window.ipcRenderer.invoke('db:get-leads') || []
    setLeads(savedLeads)
  }

  const handleAddLead = async () => {
    if (!newLeadName.trim()) return

    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLeadName,
      email: '',
      status: 'prospect',
      value: 0,
      source: 'manual',
      notes: '',
      createdAt: new Date()
    }

    const updatedLeads = [...leads, newLead]
    await window.ipcRenderer.invoke('db:save-leads', updatedLeads)
    setLeads(updatedLeads)
    setNewLeadName('')
    
    toast({ title: "Lead Added", description: "New prospect created successfully." })
  }

  const handleMoveLead = async (leadId: string, newStatus: Lead['status']) => {
    const updatedLeads = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l)
    await window.ipcRenderer.invoke('db:save-leads', updatedLeads)
    setLeads(updatedLeads)
  }

  const handleDeleteLead = async (leadId: string) => {
    const updatedLeads = leads.filter(l => l.id !== leadId)
    await window.ipcRenderer.invoke('db:save-leads', updatedLeads)
    setLeads(updatedLeads)
  }

  const Column = ({ title, status, icon: Icon, color }: { title: string, status: Lead['status'], icon: any, color: string }) => {
    const columnLeads = leads.filter(l => l.status === status)
    const totalValue = columnLeads.reduce((sum, l) => sum + (Number(l.value) || 0), 0)

    return (
      <div 
        className="flex flex-col h-full bg-slate-50/50 rounded-xl border p-4 min-w-[300px] transition-colors hover:bg-slate-100/50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
            e.preventDefault()
            const leadId = e.dataTransfer.getData('leadId')
            if (leadId) handleMoveLead(leadId, status)
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
            <p className="text-xs text-muted-foreground">${totalValue.toLocaleString()}</p>
          </div>
          <span className="ml-auto text-xs font-bold bg-slate-200 px-2 py-1 rounded-full">{columnLeads.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
          <AnimatePresence>
            {columnLeads.map(lead => (
              <motion.div
                layoutId={lead.id}
                key={lead.id}
                draggable
                onDragStart={(e: any) => e.dataTransfer.setData('leadId', lead.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileDrag={{ scale: 1.05, rotate: 2 }}
                className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow group relative cursor-grab active:cursor-grabbing"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{lead.name}</p>
                    {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteLead(lead.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
                
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3" />
                    <span>{lead.value.toLocaleString()}</span>
                  </div>
                  
                  {status !== 'won' && status !== 'lost' && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 px-2 text-xs bg-slate-100 hover:bg-slate-200"
                      onClick={() => {
                        const next = status === 'prospect' ? 'contacted' : status === 'contacted' ? 'proposal' : 'won'
                        handleMoveLead(lead.id, next)
                      }}
                    >
                      Next <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {status === 'prospect' && (
          <div className="mt-4 pt-4 border-t">
             <div className="flex gap-2">
               <input 
                 className="flex-1 p-2 text-sm border rounded-md"
                 placeholder="New prospect name..."
                 value={newLeadName}
                 onChange={(e) => setNewLeadName(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleAddLead()}
               />
               <Button size="sm" onClick={handleAddLead}>
                 <Plus className="h-4 w-4" />
               </Button>
             </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales Pipeline</h2>
          <p className="text-muted-foreground">Manage leads and opportunities</p>
        </div>
      </div>

      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        <Column title="Prospects" status="prospect" icon={AlertCircle} color="bg-slate-100 text-slate-600" />
        <Column title="Contacted" status="contacted" icon={Mail} color="bg-blue-100 text-blue-600" />
        <Column title="Proposal Sent" status="proposal" icon={FileText} color="bg-purple-100 text-purple-600" />
        <Column title="Won" status="won" icon={CheckCircle} color="bg-green-100 text-green-600" />
      </div>
    </div>
  )
}
