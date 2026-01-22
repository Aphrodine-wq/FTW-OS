import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, FileText, FormInput, User, Plus, Trash2, Package, Upload, Mic, MicOff, Clock, CheckSquare, Receipt, PenTool, File } from 'lucide-react'
import { useInvoice } from '@/hooks/useInvoice'
import { Client, Product, Task, ProjectUpdate } from '@/types/invoice'
import { format } from 'date-fns'
import Papa from 'papaparse'
import { useToast } from '@/components/ui/use-toast'
import DOMPurify from 'dompurify'
import { InvoiceFormBuilder } from './InvoiceFormBuilder'

export function TextInputPanel() {
  const [docType, setDocType] = useState<'invoice' | 'document'>('invoice')
  const [inputText, setInputText] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showProductSuggestions, setShowProductSuggestions] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const { toast } = useToast()
  
  // Invoice State
  const { parseText, isParsing, parseError, currentInvoice, updateInvoice } = useInvoice()

  // Document State
  const [currentDocument, setCurrentDocument] = useState<Partial<ProjectUpdate>>({
    date: new Date(),
    type: 'compensation'
  })

  useEffect(() => {
    // Load data
    const loadData = async () => {
      const savedClients = await window.ipcRenderer.invoke('db:get-clients') || []
      const savedProducts = await window.ipcRenderer.invoke('db:get-products') || []
      setClients(savedClients)
      setProducts(savedProducts)
    }
    loadData()

    // Listen for product updates
    const handleFocus = () => {
      loadData()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // ... (existing handlers: handleClientSelect, handleProductSelect, handleLineItemChange, etc.)

  // NEW: Voice Input Handler
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice dictation is not supported in this environment.")
      return
    }

    if (isListening) {
      setIsListening(false)
      // Stop recognition (handled by browser usually)
    } else {
      setIsListening(true)
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        // console.log("Voice Input:", transcript)
        
        if (docType === 'document') {
           // Append to content
           const newContent = (currentDocument.content || '') + ' ' + transcript
           setCurrentDocument(prev => ({ ...prev, content: newContent }))
        } else {
          // Invoice Logic
          // Simple parser: "Item name [at/for] Price"
          // E.g. "Web Design for 500"
          const priceMatch = transcript.match(/(\d+)/)
          const price = priceMatch ? parseInt(priceMatch[0]) : 0
          const description = transcript.replace(/(\d+)|dollars|for|at/g, '').trim()

          if (currentInvoice) {
            const newItem = {
              id: Math.random().toString(36).substr(2, 9),
              description: description || transcript,
              quantity: 1,
              rate: price,
              amount: price
            }
            const newItems = [...currentInvoice.lineItems, newItem]
            const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0)
            updateInvoice({ lineItems: newItems, subtotal, total: subtotal })
          }
        }
        setIsListening(false)
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognition.start()
    }
  }

  // NEW: CSV Import Handler
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: (results: any) => {
        if (currentInvoice && results.data) {
          const newItems = results.data.map((row: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            description: row.Description || row.description || 'Unknown Item',
            quantity: Number(row.Quantity || row.quantity || 1),
            rate: Number(row.Rate || row.Price || row.rate || 0),
            amount: Number(row.Quantity || 1) * Number(row.Rate || 0)
          })).filter((item: any) => item.description !== 'Unknown Item')

          const combinedItems = [...currentInvoice.lineItems, ...newItems]
          const subtotal = combinedItems.reduce((sum, item) => sum + item.amount, 0)
          updateInvoice({ lineItems: combinedItems, subtotal, total: subtotal })
        }
      }
    })
  }

  const handleImportSession = async () => {
    // Mock import last session for now, or open a dialog
    // Ideally we list completed sessions for this client
    const targetClientId = docType === 'invoice' ? currentInvoice?.clientId : currentDocument.clientId

    if (!targetClientId) {
      alert("Please select a client first")
      return
    }

    const sessions = await window.ipcRenderer.invoke('tracker:get-sessions', targetClientId)
    if (!sessions || sessions.length === 0) {
      alert("No completed sessions found for this client")
      return
    }

    // For simplicity, grab the last one
    const lastSession = sessions[sessions.length - 1]
    const hours = (lastSession.duration / 3600).toFixed(2)
    const fileCount = lastSession.logs.length

    if (docType === 'document') {
       const summary = `
## Weekly Progress
- Completed ${fileCount} file changes in recent session.
- Focus Area: Development
- Time Spent: ${hours} hours

## Technical Details
- Modified core components
- Updated API handlers
       `
       setCurrentDocument(prev => ({ ...prev, content: (prev.content || '') + '\n' + summary }))
    } else {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        description: `Dev Work: ${format(new Date(lastSession.startTime), 'MMM dd')} (${fileCount} files changed)`,
        quantity: Number(hours),
        rate: 100, // Default rate
        amount: Number(hours) * 100
      }

      const newItems = [...(currentInvoice?.lineItems || []), newItem]
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0)
      updateInvoice({ lineItems: newItems, subtotal, total: subtotal })
    }
  }

  // ... (rest of the component)

  const [showTaskSelector, setShowTaskSelector] = useState(false)
  const [availableTasks, setAvailableTasks] = useState<Task[]>([])

  const handleImportTasks = async () => {
    const targetClientId = docType === 'invoice' ? currentInvoice?.clientId : currentDocument.clientId

    if (!targetClientId) {
      alert("Please select a client first")
      return
    }
    const tasks = await window.ipcRenderer.invoke('db:get-tasks') || []
    const clientTasks = tasks.filter((t: Task) => t.projectId === targetClientId || t.projectId === targetClientId)
    setAvailableTasks(clientTasks)
    setShowTaskSelector(true)
  }

  const addSelectedTasks = (selectedIds: string[]) => {
    const selected = availableTasks.filter(t => selectedIds.includes(t.id))
    
    if (docType === 'document') {
      const taskList = selected.map(t => `- [x] ${t.title} (${t.status})`).join('\n')
      setCurrentDocument(prev => ({ ...prev, content: (prev.content || '') + '\n\n## Completed Tasks\n' + taskList }))
    } else {
      const newItems = selected.map(t => ({
        id: Math.random().toString(36).substr(2, 9),
        description: `Task: ${t.title}`,
        quantity: 1,
        rate: 0,
        amount: 0
      }))
      
      if (currentInvoice) {
        const combined = [...currentInvoice.lineItems, ...newItems]
        updateInvoice({ lineItems: combined })
      }
    }
    setShowTaskSelector(false)
  }

  const handleParse = async () => {
    if (!inputText.trim()) return
    // Sanitize input before parsing
    const cleanText = DOMPurify.sanitize(inputText)
    await parseText(cleanText)
  }

  const handleClientSelect = (client: Client) => {
    if (docType === 'invoice') {
      if (currentInvoice) {
        updateInvoice({ 
          clientId: client.name,
          clientEmail: client.email,
          clientAddress: client.address
        })
      }
      const clientBlock = `Client: ${client.name}\nEmail: ${client.email || ''}\nBill To: ${client.address?.street || ''}, ${client.address?.city || ''}\n\n`
      if (!inputText.includes('Client:')) {
          setInputText(clientBlock + inputText)
      }
    } else {
      setCurrentDocument(prev => ({ ...prev, clientId: client.id }))
    }
    setClientSearch('')
    setShowSuggestions(false)
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const handleFormChange = (field: string, value: any) => {
    if (currentInvoice) {
      updateInvoice({ [field]: value })
    }
  }

  const handleProductSelect = (productId: string, itemId: string) => {
    const product = products.find(p => p.id === productId)
    if (product && currentInvoice) {
      const newItems = currentInvoice.lineItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            description: product.name, // Or combine name + desc
            rate: product.unitPrice,
            amount: Number(item.quantity) * product.unitPrice
          }
        }
        return item
      })
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0)
      updateInvoice({ lineItems: newItems, subtotal, total: subtotal })
    }
    setShowProductSuggestions(null)
  }

  const handleLineItemChange = (id: string, field: string, value: any) => {
    if (currentInvoice) {
      const newItems = currentInvoice.lineItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate)
          }
          return updatedItem
        }
        return item
      })
      
      // Recalculate totals
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0)
      const total = subtotal // Simplified for now (add tax later)
      
      updateInvoice({ lineItems: newItems, subtotal, total })
    }
  }

  const addLineItem = () => {
    if (currentInvoice) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        description: 'New Item',
        quantity: 1,
        rate: 0,
        amount: 0
      }
      updateInvoice({ 
        lineItems: [...currentInvoice.lineItems, newItem] 
      })
    }
  }

  const removeLineItem = (id: string) => {
    if (currentInvoice) {
      const newItems = currentInvoice.lineItems.filter(item => item.id !== id)
      updateInvoice({ lineItems: newItems })
    }
  }

  const handleSaveDocument = async () => {
    if (!currentDocument.title || !currentDocument.clientId) {
        toast({ title: "Error", description: "Title and Client are required", variant: "destructive" })
        return
    }

    const updates = await window.ipcRenderer.invoke('db:get-updates') || []
    
    const newUpdate = {
        ...currentDocument,
        id: currentDocument.id || Math.random().toString(36).substr(2, 9),
        date: currentDocument.date || new Date(),
        createdAt: currentDocument.createdAt || new Date(),
        updatedAt: new Date(),
        type: currentDocument.type || 'update',
        tasksCompleted: [],
        nextSteps: []
    }

    const updatedList = [...updates, newUpdate]
    await window.ipcRenderer.invoke('db:save-updates', updatedList)
    
    toast({
        title: "Document Saved",
        description: `${newUpdate.title} has been saved.`
    })
  }

  const exampleText = `Client: Acme Corporation
Email: billing@acme.com
Invoice: INV-2025-001
Date: 2025-01-08
Due: Net 30

Services:
Web Development | 40 hours | $50/hr
Design Services | 20 hours | $75/hr
Hosting | 1 month | $29

Notes: Thank you for your business!
Terms: Payment due within 30 days`

  return (
    <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4">
        <div className="flex items-center justify-between mb-4">
            <div className="flex bg-muted p-1 rounded-lg">
                <button 
                    onClick={() => setDocType('invoice')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${docType === 'invoice' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Invoice
                </button>
                <button 
                    onClick={() => setDocType('document')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${docType === 'document' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Document
                </button>
            </div>
        </div>

        {/* Client Autocomplete */}
        <div className="relative z-10">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full pl-9 p-2.5 text-sm bg-background border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="Search saved clients..."
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
            />
          </div>
          {showSuggestions && clientSearch && (
            <div className="absolute w-full mt-1 bg-popover border rounded-xl shadow-xl overflow-hidden z-20">
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  className="p-3 hover:bg-accent cursor-pointer text-sm border-b last:border-0"
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="font-medium">{client.name}</div>
                  <div className="text-xs text-muted-foreground">{client.email}</div>
                </div>
              ))}
              {filteredClients.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">No clients found</div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-0 flex-1 overflow-hidden flex flex-col">
        {docType === 'invoice' ? (
           <Tabs defaultValue="form" className="flex-1 flex flex-col">
             <div className="flex items-center justify-between mb-4">
               <TabsList>
                 <TabsTrigger value="form" className="gap-2"><FormInput className="h-4 w-4" /> Form</TabsTrigger>
                 <TabsTrigger value="text" className="gap-2"><FileText className="h-4 w-4" /> Text Parser</TabsTrigger>
               </TabsList>
               
               <div className="flex gap-2">
                 <Button variant="outline" size="sm" onClick={() => document.getElementById('csv-upload')?.click()}>
                     <Upload className="h-4 w-4" />
                 </Button>
                 <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={handleCSVImport} />
                 
                 <Button variant="outline" size="sm" onClick={handleImportSession} title="Import Time Log">
                     <Clock className="h-4 w-4" />
                 </Button>
                 <Button variant="outline" size="sm" onClick={handleImportTasks} title="Import Tasks">
                     <CheckSquare className="h-4 w-4" />
                 </Button>
                 <Button variant={isListening ? "destructive" : "outline"} size="sm" onClick={toggleListening} title="Dictate">
                     {isListening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                 </Button>
               </div>
             </div>

             <TabsContent value="form" className="flex-1 overflow-y-auto pr-2 mt-0">
               {!currentInvoice ? (
                 <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 border-2 border-dashed rounded-xl">
                   <Receipt className="h-12 w-12 mb-4 opacity-20" />
                   <p>Create a new invoice to get started</p>
                 </div>
               ) : (
                 <InvoiceFormBuilder currentInvoice={currentInvoice} products={products} />
               )}
             </TabsContent>

             <TabsContent value="text" className="flex-1 flex flex-col mt-0">
                <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter invoice details here... (e.g. 'Client: Acme Corp...')"
                    className="flex-1 font-mono text-sm resize-none mb-4"
                    disabled={isParsing}
                />
                <div className="flex gap-2">
                    <Button 
                        onClick={handleParse} 
                        disabled={!inputText.trim() || isParsing}
                        className="flex-1"
                    >
                        {isParsing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Parsing...</> : 'Parse Invoice'}
                    </Button>
                    <Button variant="outline" onClick={() => setInputText(exampleText)} disabled={isParsing}>
                        Example
                    </Button>
                </div>
             </TabsContent>
           </Tabs>
        ) : (
           <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Document Title</label>
                        <input 
                            className="w-full p-2.5 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" 
                            placeholder="e.g. Q1 Proposal"
                            value={currentDocument.title || ''}
                            onChange={(e) => setCurrentDocument(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <select 
                            className="w-full p-2.5 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                            value={currentDocument.type || 'compensation'}
                            onChange={(e) => setCurrentDocument(prev => ({ ...prev, type: e.target.value as any }))}
                        >
                            <option value="compensation">Compensation Update</option>
                            <option value="policy">Company Policy</option>
                            <option value="update">Status Update</option>
                            <option value="proposal">Proposal</option>
                            <option value="contract">Contract</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                    <label className="text-sm font-medium flex justify-between">
                        Content (Markdown)
                        <div className="flex gap-2">
                             <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleImportSession}><Clock className="h-3 w-3" /></Button>
                             <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleImportTasks}><CheckSquare className="h-3 w-3" /></Button>
                             <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={toggleListening}><Mic className="h-3 w-3" /></Button>
                        </div>
                    </label>
                    <Textarea 
                        className="flex-1 min-h-[400px] font-mono text-sm resize-none"
                        placeholder="# Executive Summary..."
                        value={currentDocument.content || ''}
                        onChange={(e) => {
                            const clean = DOMPurify.sanitize(e.target.value)
                            setCurrentDocument(prev => ({ ...prev, content: clean }))
                        }}
                    />
                </div>

                <Button className="w-full" onClick={handleSaveDocument}>
                    Save Document
                </Button>
           </div>
        )}

        {parseError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        {showTaskSelector && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
              <CardHeader>
                <CardTitle>Import Completed Tasks</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-2">
                {availableTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No tasks found for this client.</p>
                ) : (
                  availableTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 p-2 border rounded hover:bg-slate-50 cursor-pointer" onClick={() => addSelectedTasks([task.id])}>
                      <Plus className="h-4 w-4 text-green-600" />
                      <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>{task.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground capitalize">{task.status}</span>
                    </div>
                  ))
                )}
              </CardContent>
              <div className="p-4 border-t">
                <Button variant="outline" className="w-full" onClick={() => setShowTaskSelector(false)}>Close</Button>
              </div>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}