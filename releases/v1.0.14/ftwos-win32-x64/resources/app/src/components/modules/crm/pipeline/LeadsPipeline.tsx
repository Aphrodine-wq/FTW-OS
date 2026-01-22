import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, CheckCircle, AlertCircle, ArrowRight, DollarSign, Mail, FileText } from 'lucide-react'
import { Lead } from '@/types/invoice'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/services/utils'

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

    // Enhanced color schemes for each status
    const statusColors: Record<Lead['status'], { bg: string; border: string; text: string; iconBg: string; iconText: string; badge: string }> = {
      prospect: { 
        bg: 'bg-slate-50', 
        border: 'border-slate-200', 
        text: 'text-slate-700', 
        iconBg: 'bg-slate-100', 
        iconText: 'text-slate-600',
        badge: 'bg-slate-200 text-slate-700'
      },
      contacted: { 
        bg: 'bg-blue-50', 
        border: 'border-blue-200', 
        text: 'text-blue-700', 
        iconBg: 'bg-blue-100', 
        iconText: 'text-blue-600',
        badge: 'bg-blue-200 text-blue-700'
      },
      proposal: { 
        bg: 'bg-purple-50', 
        border: 'border-purple-200', 
        text: 'text-purple-700', 
        iconBg: 'bg-purple-100', 
        iconText: 'text-purple-600',
        badge: 'bg-purple-200 text-purple-700'
      },
      won: { 
        bg: 'bg-green-50', 
        border: 'border-green-200', 
        text: 'text-green-700', 
        iconBg: 'bg-green-100', 
        iconText: 'text-green-600',
        badge: 'bg-green-200 text-green-700'
      },
      lost: { 
        bg: 'bg-red-50', 
        border: 'border-red-200', 
        text: 'text-red-700', 
        iconBg: 'bg-red-100', 
        iconText: 'text-red-600',
        badge: 'bg-red-200 text-red-700'
      }
    }

    const colors = statusColors[status] || statusColors.prospect

    return (
      <motion.div 
        className={cn("flex flex-col h-full rounded-xl border-2 p-4 min-w-[320px] transition-all duration-300", colors.bg, colors.border)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
            e.preventDefault()
            const leadId = e.dataTransfer.getData('leadId')
            if (leadId) handleMoveLead(leadId, status)
        }}
        whileHover={{ scale: 1.01 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <motion.div 
            className={cn("p-2.5 rounded-lg shadow-sm", colors.iconBg, colors.iconText)}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
          <div className="flex-1">
            <h3 className={cn("font-bold text-sm uppercase tracking-wide", colors.text)}>{title}</h3>
            <p className={cn("text-xs font-semibold mt-0.5", colors.text, "opacity-80")}>${totalValue.toLocaleString()}</p>
          </div>
          <motion.span 
            className={cn("text-xs font-bold px-3 py-1 rounded-full shadow-sm", colors.badge)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {columnLeads.length}
          </motion.span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {columnLeads.map((lead, index) => (
              <motion.div
                layoutId={lead.id}
                key={lead.id}
                draggable
                onDragStart={(e: any) => e.dataTransfer.setData('leadId', lead.id)}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                whileHover={{ scale: 1.02, y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                whileDrag={{ scale: 1.05, rotate: 2, zIndex: 50 }}
                transition={{ 
                  layout: { duration: 0.3, ease: "easeInOut" },
                  delay: index * 0.05
                }}
                className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 group relative cursor-grab active:cursor-grabbing"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{lead.name}</p>
                    {lead.company && <p className="text-xs text-gray-500 mt-0.5">{lead.company}</p>}
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50" 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteLead(lead.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </motion.div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <DollarSign className="h-3.5 w-3.5 text-green-600" />
                    <span className="font-semibold text-gray-900">${lead.value.toLocaleString()}</span>
                  </div>
                  
                  {status !== 'won' && status !== 'lost' && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-3 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                        onClick={() => {
                          const next = status === 'prospect' ? 'contacted' : status === 'contacted' ? 'proposal' : 'won'
                          handleMoveLead(lead.id, next)
                        }}
                      >
                        Next <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {status === 'prospect' && (
          <motion.div 
            className="mt-4 pt-4 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
             <div className="flex gap-2">
               <input 
                 className="flex-1 p-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                 placeholder="New prospect name..."
                 value={newLeadName}
                 onChange={(e) => setNewLeadName(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleAddLead()}
               />
               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                 <Button size="sm" onClick={handleAddLead} className="bg-blue-600 hover:bg-blue-700">
                   <Plus className="h-4 w-4" />
                 </Button>
               </motion.div>
             </div>
          </motion.div>
        )}
      </motion.div>
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

      <div className="flex gap-4 h-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <Column title="Prospects" status="prospect" icon={AlertCircle} color="bg-slate-100 text-slate-600" />
        <Column title="Contacted" status="contacted" icon={Mail} color="bg-blue-100 text-blue-600" />
        <Column title="Proposal Sent" status="proposal" icon={FileText} color="bg-purple-100 text-purple-600" />
        <Column title="Won" status="won" icon={CheckCircle} color="bg-green-100 text-green-600" />
      </div>
    </div>
  )
}
