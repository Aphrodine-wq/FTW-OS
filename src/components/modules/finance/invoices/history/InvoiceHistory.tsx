import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Trash2, Search, Calendar, DollarSign, Edit, DownloadCloud } from 'lucide-react'
import { Invoice } from '@/types/invoice'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { useInvoice } from '@/hooks/useInvoice'
import Papa from 'papaparse'
import { EmptyInvoiceState } from '@/components/empty-states'

interface InvoiceHistoryProps {
  setActiveTab?: (tab: string) => void
}

export function InvoiceHistory({ setActiveTab }: InvoiceHistoryProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const { updateInvoice } = useInvoice()

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      const savedInvoices = await window.ipcRenderer.invoke('db:get-invoices')
      // Convert date strings back to Date objects
      const processedInvoices = (savedInvoices || []).map((inv: any) => ({
        ...inv,
        issueDate: new Date(inv.issueDate),
        dueDate: new Date(inv.dueDate),
        createdAt: new Date(inv.createdAt),
        updatedAt: new Date(inv.updatedAt),
      }))
      setInvoices(processedInvoices)
    } catch (error) {
      console.error('Failed to load invoices:', error)
    }
  }

  const handleEdit = (invoice: Invoice) => {
    updateInvoice(invoice)
    if (setActiveTab) {
      setActiveTab('new')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      const newInvoices = invoices.filter(inv => inv.id !== id)
      await window.ipcRenderer.invoke('db:save-invoices', newInvoices)
      setInvoices(newInvoices)
    }
  }

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.clientId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'success'
      case 'sent': return 'default'
      case 'overdue': return 'destructive'
      default: return 'secondary'
    }
  }

  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredInvoices.map(inv => ({
      Number: inv.invoiceNumber,
      Client: inv.clientId,
      Date: format(inv.issueDate, 'yyyy-MM-dd'),
      Total: inv.total,
      Status: inv.status
    })))
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `invoices_export_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Invoice History</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search invoices..."
            className="pl-8 w-full p-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <DownloadCloud className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="space-y-4">
        {filteredInvoices.map(invoice => (
          <Card key={invoice.id} className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{invoice.invoiceNumber}</span>
                    <Badge variant={getStatusVariant(invoice.status)} className="uppercase text-[10px]">
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {invoice.clientId}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {format(invoice.issueDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.total)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Amount</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(invoice)} title="Edit Invoice">
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(invoice.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredInvoices.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12">
              <EmptyInvoiceState
                onCreateInvoice={() => setActiveTab?.('finance')}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function User(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

