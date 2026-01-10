import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/services/utils'
import { 
  FileText, 
  Receipt, 
  Briefcase, 
  PenTool, 
  Download, 
  Send,
  Save,
  ChevronRight,
  Settings,
  History,
  LayoutTemplate
} from 'lucide-react'

// Define document types
export type DocumentType = 'invoice' | 'quote' | 'contract' | 'proposal'

export function DocumentBuilder() {
  const [docType, setDocType] = useState<DocumentType>('invoice')
  const [activeBlock, setActiveBlock] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const { mode } = useThemeStore()

  // Recent Documents (Mock)
  const recentDocs = [
    { id: '1', title: 'Invoice #1024 - Acme Corp', date: '2h ago', type: 'invoice' },
    { id: '2', title: 'Proposal - Stark Industries', date: '1d ago', type: 'proposal' },
    { id: '3', title: 'Contract - Wayne Ent', date: '3d ago', type: 'contract' },
  ]

  // Polymorphic Input Blocks based on docType
  const renderInputPanel = () => {
    switch(docType) {
        case 'invoice':
            return <div className="p-4 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider opacity-70">Invoice Details</h3>
                {/* Invoice specific inputs */}
                <div className="space-y-2">
                    <label className="text-xs font-medium">Client</label>
                    <input className="w-full p-2 rounded-md bg-secondary/50 border border-border" placeholder="Select Client..." />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium">Line Items</label>
                    <div className="p-4 border border-dashed rounded-lg text-center text-xs opacity-50">
                        Line Item Editor Component
                    </div>
                </div>
            </div>
        case 'contract':
            return <div className="p-4 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider opacity-70">Contract Terms</h3>
                {/* Contract specific inputs */}
                <textarea className="w-full h-64 p-3 rounded-md bg-secondary/50 border border-border resize-none" placeholder="Enter contract terms..." />
            </div>
        default:
            return <div className="p-4">Select a document type</div>
    }
  }

  return (
    <div className="h-full flex gap-4">
      {/* Recent Docs Sidebar */}
      <AnimatePresence mode="wait">
        {showSidebar && (
            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex-shrink-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
            >
                <div className="p-4 border-b border-border bg-secondary/20 font-medium text-xs uppercase tracking-wider flex justify-between items-center">
                    <span>Recent Docs</span>
                    <button onClick={() => setShowSidebar(false)} className="hover:bg-secondary p-1 rounded">
                        <ChevronRight className="h-3 w-3 rotate-180" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {recentDocs.map(doc => (
                        <button key={doc.id} className="w-full text-left p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
                            <div className="flex items-center gap-2 mb-1">
                                {doc.type === 'invoice' && <Receipt className="h-3 w-3 text-green-500" />}
                                {doc.type === 'proposal' && <Briefcase className="h-3 w-3 text-blue-500" />}
                                {doc.type === 'contract' && <FileText className="h-3 w-3 text-purple-500" />}
                                <span className="text-xs font-bold truncate">{doc.title}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground pl-5">{doc.date}</div>
                        </button>
                    ))}
                </div>
                <div className="p-2 border-t border-border">
                    <button className="w-full flex items-center justify-center gap-2 p-2 bg-secondary/30 hover:bg-secondary/50 rounded-lg text-xs font-medium transition-colors">
                        <LayoutTemplate className="h-3 w-3" /> Templates
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-1">
      {/* Toggle Sidebar Button (if hidden) */}
      {!showSidebar && (
        <button 
            onClick={() => setShowSidebar(true)}
            className="absolute left-4 top-24 z-10 p-2 bg-card border border-border rounded-r-lg shadow-md hover:bg-secondary transition-colors"
        >
            <History className="h-4 w-4" />
        </button>
      )}

      {/* LEFT: Builder Controls */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
        
        {/* Type Switcher */}
        <div className="flex p-1 bg-secondary/50 rounded-lg border border-border">
            {(['invoice', 'quote', 'contract', 'proposal'] as DocumentType[]).map(type => (
                <button
                    key={type}
                    onClick={() => setDocType(type)}
                    className={cn(
                        "flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-md transition-all",
                        docType === type 
                            ? "bg-background shadow-sm text-primary" 
                            : "text-muted-foreground hover:text-primary hover:bg-background/50"
                    )}
                >
                    {type}
                </button>
            ))}
        </div>

        {/* Input Panel */}
        <div className="flex-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/20">
                <div className="flex items-center gap-2">
                    <PenTool className="h-4 w-4 opacity-70" />
                    <span className="font-medium text-sm">Editor</span>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <Save className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <Settings className="h-4 w-4" />
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {renderInputPanel()}
            </div>
        </div>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
         {/* Toolbar */}
         <div className="flex justify-end gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium shadow-lg shadow-primary/20">
                 <Send className="h-4 w-4" /> Send
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium">
                 <Download className="h-4 w-4" /> Export
             </button>
         </div>

         {/* Canvas */}
         <div className="flex-1 bg-white rounded-xl shadow-2xl border border-border/50 overflow-hidden relative group">
             {/* A4 Paper Simulation */}
             <div className="absolute inset-0 overflow-y-auto p-8 bg-slate-100 flex justify-center">
                 <div className="w-[210mm] min-h-[297mm] bg-white shadow-sm p-[20mm] text-black transition-transform duration-300 origin-top scale-[0.8] lg:scale-100">
                    {/* Dynamic Preview Content */}
                    <div className="flex justify-between items-start mb-12">
                        <h1 className="text-4xl font-bold uppercase tracking-tight text-slate-900">{docType}</h1>
                        <div className="text-right text-slate-500">
                            <p>#DOC-{Math.floor(Math.random() * 1000)}</p>
                            <p>{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div className="prose max-w-none">
                        <p className="text-slate-400 italic">
                            This is a live preview of your {docType}. As you edit fields on the left, they will update here instantly (01ms latency).
                        </p>
                    </div>
                 </div>
             </div>
         </div>
      </div>
      </div>
    </div>
  )
}
