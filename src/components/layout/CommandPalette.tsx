import React, { useState, useEffect } from 'react'
import { Search, ArrowRight, Zap, FileText, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CommandPaletteProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSelect: (action: string) => void
}

export function CommandPalette({ open, setOpen, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  if (!open) return null

  const actions = [
    { id: 'new', label: 'Create New Invoice', icon: FileText, desc: 'Finance' },
    { id: 'dashboard', label: 'Go to Dashboard', icon: Zap, desc: 'System' },
    { id: 'clients', label: 'Manage Clients', icon: User, desc: 'CRM' },
    { id: 'tracker', label: 'Start Time Tracker', icon: Zap, desc: 'Productivity' },
    { id: 'settings', label: 'System Settings', icon: Zap, desc: 'System' },
    { id: 'documents', label: 'Create Document', icon: FileText, desc: 'Productivity' },
  ]

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center border-b px-4 py-3 bg-slate-50/50">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <input 
            className="flex-1 outline-none text-lg bg-transparent placeholder:text-muted-foreground" 
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <div className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-500 font-mono">ESC</div>
        </div>
        <div className="p-2 max-h-[400px] overflow-y-auto">
           {filtered.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground">No results found</div>
           ) : (
             filtered.map((item, i) => (
               <div 
                 key={i} 
                 className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 cursor-pointer text-sm group transition-colors" 
                 onClick={() => { onSelect(item.id); setOpen(false) }}
               >
                 <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-md bg-white border flex items-center justify-center text-slate-500 shadow-sm">
                     <item.icon className="h-4 w-4" />
                   </div>
                   <div>
                     <p className="font-medium text-slate-900">{item.label}</p>
                     <p className="text-xs text-muted-foreground">{item.desc}</p>
                   </div>
                 </div>
                 <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
               </div>
             ))
           )}
        </div>
        <div className="bg-slate-50 p-2 text-xs text-center text-muted-foreground border-t">
          Pro Tip: Use <kbd className="font-mono bg-white border px-1 rounded">↑</kbd> and <kbd className="font-mono bg-white border px-1 rounded">↓</kbd> to navigate
        </div>
      </motion.div>
    </div>
  )
}
