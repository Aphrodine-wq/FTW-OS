import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Trash2, Search, Calendar, Edit, DownloadCloud, FileDown, FileSpreadsheet, MoreVertical, CheckCircle, Clock, AlertCircle, DollarSign, ListFilter, CheckSquare2, X, Mail, TrendingUp, BarChart3, List } from 'lucide-react'
import { Invoice } from '@/types/invoice'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { useInvoice } from '@/hooks/useInvoice'
import Papa from 'papaparse'
import { EmptyInvoiceState } from '@/components/empty-states'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useBulkOperations } from '@/hooks/useBulkOperations'
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import { Loader2, User } from 'lucide-react'
import { logger } from '@/lib/logger'
import { InvoiceAnalytics } from '../analytics/InvoiceAnalytics'

/** DB shape: dates as string | Date */
interface SavedInvoice extends Omit<Invoice, 'issueDate' | 'dueDate' | 'paidDate' | 'createdAt' | 'updatedAt'> {
  issueDate: string | Date
  dueDate: string | Date
  paidDate?: string | Date
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface InvoiceHistoryProps {
  setActiveTab?: (tab: string) => void
}

export function InvoiceHistory({ setActiveTab }: InvoiceHistoryProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedValue(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status']>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'this_year'>('all')
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list')
  const { updateInvoice } = useInvoice()
  const { toast } = useToast()

  const loadInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const savedInvoices = await window.ipcRenderer.invoke('db:get-invoices')
      const processedInvoices = (savedInvoices || []).map((inv: SavedInvoice): Invoice => ({
        ...inv,
        issueDate: new Date(inv.issueDate),
        dueDate: new Date(inv.dueDate),
        createdAt: inv.createdAt ? new Date(inv.createdAt) : undefined,
        updatedAt: inv.updatedAt ? new Date(inv.updatedAt) : undefined,
        paidDate: inv.paidDate ? new Date(inv.paidDate) : undefined,
      }))
      setInvoices(processedInvoices)
    } catch (error) {
      logger.error('Failed to load invoices', error)
      toast({
        title: 'Failed to load invoices',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  const handleEdit = useCallback((invoice: Invoice) => {
    updateInvoice(invoice)
    if (setActiveTab) setActiveTab('new')
  }, [updateInvoice, setActiveTab])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    const newInvoices = invoices.filter(inv => inv.id !== id)
    try {
      await window.ipcRenderer.invoke('db:save-invoices', newInvoices)
      setInvoices(newInvoices)
      toast({ title: 'Deleted', description: 'Invoice deleted' })
    } catch (error) {
      toast({
        title: 'Failed to delete invoice',
        description: 'Please try again',
        variant: 'destructive',
      })
    }
  }, [invoices, toast])

  // Calculate stats
  const stats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
    const overdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0)
    const pending = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0)
    const avgDaysToPayment = invoices
      .filter(inv => inv.status === 'paid' && inv.paidDate)
      .reduce((acc, inv) => {
        const days = Math.floor((new Date(inv.paidDate!).getTime() - new Date(inv.issueDate).getTime()) / (1000 * 60 * 60 * 24))
        return acc + days
      }, 0) / (invoices.filter(inv => inv.status === 'paid' && inv.paidDate).length || 1)
    return { total, paid, overdue, pending, avgDaysToPayment: Math.round(avgDaysToPayment) }
  }, [invoices])

  // Calculate days until/since due
  const getDaysUntilDue = (dueDate: Date): { days: number; label: string; isOverdue: boolean } => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { days: Math.abs(diffDays), label: `${Math.abs(diffDays)}d overdue`, isOverdue: true }
    } else if (diffDays === 0) {
      return { days: 0, label: 'Due today', isOverdue: false }
    } else if (diffDays <= 7) {
      return { days: diffDays, label: `${diffDays}d left`, isOverdue: false }
    } else {
      return { days: diffDays, label: `${diffDays}d`, isOverdue: false }
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = inv.invoiceNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        inv.clientId.toLowerCase().includes(debouncedSearch.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
      
      const matchesDate = (() => {
        if (dateFilter === 'all') return true
        const now = new Date()
        const invDate = new Date(inv.issueDate)
        if (dateFilter === 'this_month') {
          return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear()
        }
        if (dateFilter === 'this_year') {
          return invDate.getFullYear() === now.getFullYear()
        }
        return true
      })()
      
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [invoices, debouncedSearch, statusFilter, dateFilter])

  const onBulkUpdate = useCallback(async (ids: string[], updates: Partial<Invoice>) => {
    const updatedInvoices = invoices.map(inv =>
      ids.includes(inv.id) ? { ...inv, ...updates } as Invoice : inv
    )
    await window.ipcRenderer.invoke('db:save-invoices', updatedInvoices)
    setInvoices(updatedInvoices)
  }, [invoices])

  const {
    isSelectMode,
    setIsSelectMode,
    toggleSelect,
    selectAll,
    clearSelection,
    bulkUpdate,
    selected,
    selectedCount,
  } = useBulkOperations<Invoice>(filteredInvoices, onBulkUpdate)

  const getStatusVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'success'
      case 'sent': return 'default'
      case 'overdue': return 'destructive'
      default: return 'secondary'
    }
  }

  const handleExportCSV = () => {
    try {
      const csv = Papa.unparse(filteredInvoices.map(inv => ({
        'Invoice Number': inv.invoiceNumber,
        Client: inv.clientId,
        'Issue Date': format(inv.issueDate, 'yyyy-MM-dd'),
        'Due Date': format(inv.dueDate, 'yyyy-MM-dd'),
        'Paid Date': inv.paidDate ? format(inv.paidDate, 'yyyy-MM-dd') : '',
        Subtotal: inv.subtotal,
        Tax: inv.tax || 0,
        Shipping: inv.shipping || 0,
        Total: inv.total,
        Status: inv.status,
        Currency: inv.currency
      })))
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', `invoices_export_${format(new Date(), 'yyyy-MM-dd')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: "Exported", description: "Invoice data exported to CSV" })
    } catch (error) {
      toast({ title: "Export Failed", description: "Failed to export CSV", variant: "destructive" })
    }
  }

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Invoices')
      
      worksheet.columns = [
        { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
        { header: 'Client', key: 'clientId', width: 25 },
        { header: 'Issue Date', key: 'issueDate', width: 12 },
        { header: 'Due Date', key: 'dueDate', width: 12 },
        { header: 'Paid Date', key: 'paidDate', width: 12 },
        { header: 'Subtotal', key: 'subtotal', width: 12 },
        { header: 'Tax', key: 'tax', width: 10 },
        { header: 'Shipping', key: 'shipping', width: 12 },
        { header: 'Total', key: 'total', width: 12 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Currency', key: 'currency', width: 10 }
      ]
      
      filteredInvoices.forEach(inv => {
        worksheet.addRow({
          invoiceNumber: inv.invoiceNumber,
          clientId: inv.clientId,
          issueDate: format(inv.issueDate, 'yyyy-MM-dd'),
          dueDate: format(inv.dueDate, 'yyyy-MM-dd'),
          paidDate: inv.paidDate ? format(inv.paidDate, 'yyyy-MM-dd') : '',
          subtotal: inv.subtotal,
          tax: inv.tax || 0,
          shipping: inv.shipping || 0,
          total: inv.total,
          status: inv.status,
          currency: inv.currency
        })
      })
      
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', `invoices_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: "Exported", description: "Invoice data exported to Excel" })
    } catch (error) {
      toast({ title: "Export Failed", description: "Failed to export Excel", variant: "destructive" })
    }
  }

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('Invoice Report', 14, 20)
      doc.setFontSize(10)
      
      let y = 30
      filteredInvoices.forEach((inv, idx) => {
        if (y > 280) {
          doc.addPage()
          y = 20
        }
        doc.text(`${inv.invoiceNumber} - ${inv.clientId} - ${format(inv.issueDate, 'MMM dd, yyyy')} - ${inv.status} - $${inv.total}`, 14, y)
        y += 10
      })
      
      doc.save(`invoices_export_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      toast({ title: "Exported", description: "Invoice data exported to PDF" })
    } catch (error) {
      toast({ title: "Export Failed", description: "Failed to export PDF", variant: "destructive" })
    }
  }

  const handleMarkAsPaid = useCallback(async (invoice: Invoice) => {
    const updated = { ...invoice, status: 'paid' as const, paidDate: new Date() }
    const updatedInvoices = invoices.map(inv => (inv.id === invoice.id ? updated : inv))
    const prev = [...invoices]
    setInvoices(updatedInvoices)
    updateInvoice(updated)
    try {
      await window.ipcRenderer.invoke('db:save-invoices', updatedInvoices)
      toast({ title: 'Updated', description: 'Invoice marked as paid' })
    } catch (error) {
      setInvoices(prev)
      toast({
        title: 'Failed to update invoice',
        description: 'Please try again',
        variant: 'destructive',
      })
    }
  }, [invoices, updateInvoice, toast])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Invoice History</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage and track all your invoices</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
            >
              <List className="h-4 w-4 mr-1.5" /> List
            </Button>
            <Button
              variant={viewMode === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('analytics')}
              className={viewMode === 'analytics' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
            >
              <BarChart3 className="h-4 w-4 mr-1.5" /> Analytics
            </Button>
          </div>
          {isSelectMode ? (
            <>
              <Button variant="outline" size="sm" onClick={clearSelection} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button variant="outline" size="sm" onClick={selectAll} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <CheckSquare2 className="mr-2 h-4 w-4" /> Select all
              </Button>
              {selectedCount > 0 && (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-2">{selectedCount} selected</span>
                  <Button
                    size="sm"
                    onClick={() => bulkUpdate({ status: 'paid', paidDate: new Date() } as Partial<Invoice>)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark selected as paid
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsSelectMode(true)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <ListFilter className="mr-2 h-4 w-4" /> Select
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <DownloadCloud className="mr-2 h-4 w-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem onClick={handleExportCSV} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FileText className="mr-2 h-4 w-4" /> Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FileDown className="mr-2 h-4 w-4" /> Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.total)}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Paid</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.paid)}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.pending)}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Overdue</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.overdue)}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Avg. Days to Pay</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.avgDaysToPayment} days</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search invoices by number or client..."
            className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | Invoice['status'])}>
          <SelectTrigger className="w-[160px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as 'all' | 'this_month' | 'this_year')}>
          <SelectTrigger className="w-[160px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {viewMode === 'analytics' ? (
        <InvoiceAnalytics invoices={invoices} />
      ) : (
      <div className="space-y-3">
        {loading && invoices.length === 0 ? (
          <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading invoices...</p>
            </CardContent>
          </Card>
        ) : (
          <>
        {filteredInvoices.map(invoice => {
          const dueInfo = invoice.status !== 'paid' ? getDaysUntilDue(invoice.dueDate) : null
          const amountPaid = invoice.payment?.amountPaid || 0
          const balanceDue = invoice.total - amountPaid

          return (
          <Card key={invoice.id} className={`border bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all ${dueInfo?.isOverdue ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center flex-1">
                  {isSelectMode && (
                    <input
                      type="checkbox"
                      checked={selected.has(invoice.id)}
                      onChange={() => toggleSelect(invoice.id)}
                      className="rounded border-gray-300 dark:border-gray-600 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      aria-label={`Select invoice ${invoice.invoiceNumber}`}
                    />
                  )}
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30' : dueInfo?.isOverdue ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                    <FileText className={`h-6 w-6 ${invoice.status === 'paid' ? 'text-green-600 dark:text-green-400' : dueInfo?.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white text-base">{invoice.invoiceNumber}</span>
                      <Badge 
                        variant={getStatusVariant(invoice.status)} 
                        className="uppercase text-[10px] font-semibold px-2 py-0.5"
                      >
                        {invoice.status}
                      </Badge>
                      {dueInfo && invoice.status !== 'paid' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${dueInfo.isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : dueInfo.days <= 7 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {dueInfo.label}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                        <User className="h-3.5 w-3.5" /> {invoice.clientId}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> {format(invoice.issueDate, 'MMM dd')}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-500">
                        Due: {format(invoice.dueDate, 'MMM dd, yyyy')}
                      </span>
                      {invoice.projectId && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                          {invoice.projectId}
                        </span>
                      )}
                      {invoice.poNumber && (
                        <span className="text-xs text-gray-500">
                          PO: {invoice.poNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.total)}
                    </div>
                    {amountPaid > 0 && invoice.status !== 'paid' ? (
                      <div className="text-xs">
                        <span className="text-green-600 dark:text-green-400">Paid: {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(amountPaid)}</span>
                        <span className="text-gray-400 mx-1">|</span>
                        <span className="text-orange-600 dark:text-orange-400">Due: {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(balanceDue)}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {invoice.status === 'paid' ? 'Paid in full' : 'Total Amount'}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!isSelectMode && invoice.status !== 'paid' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleMarkAsPaid(invoice)}
                        className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Mark Paid
                      </Button>
                    )}
                    {!isSelectMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <DropdownMenuItem onClick={() => handleEdit(invoice)} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          // Send reminder email
                          toast({ title: "Reminder", description: "Email reminder feature coming soon" })
                        }} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Mail className="mr-2 h-4 w-4" /> Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(invoice.id)} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )
        })}

        {filteredInvoices.length === 0 && !loading && (
          <Card className="border border-gray-200 dark:border-gray-700 border-dashed bg-gray-50 dark:bg-gray-800/50">
            <CardContent className="py-16">
              <EmptyInvoiceState
                onCreateInvoice={() => setActiveTab?.('finance')}
              />
            </CardContent>
          </Card>
        )}
          </>
        )}
      </div>
      )}
    </div>
  )
}
