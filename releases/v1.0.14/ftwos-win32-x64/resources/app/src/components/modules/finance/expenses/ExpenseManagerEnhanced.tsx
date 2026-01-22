import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Expense } from '@/types/invoice'
import {
  Plus, Trash2, Edit2, DollarSign, TrendingUp, PieChart,
  Calendar, Filter, Search, FileText, Paperclip, CheckCircle,
  AlertCircle, Eye, MoreVertical, Download, Upload, FileSpreadsheet,
  Receipt, Tag, BarChart3, X
} from 'lucide-react'
import { cn } from '@/services/utils'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useExpenseStore } from '@/stores/expense-store'
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import { format } from 'date-fns'

interface ExpenseManagerEnhancedProps {
  expenses?: Expense[]
  onExpenseCreate?: (expense: Expense) => void
  onExpenseUpdate?: (expense: Expense) => void
  onExpenseDelete?: (expenseId: string) => void
}

const categoryColors = {
  'Travel': 'from-blue-500 to-blue-600',
  'Supplies': 'from-green-500 to-green-600',
  'Equipment': 'from-purple-500 to-purple-600',
  'Utilities': 'from-yellow-500 to-yellow-600',
  'Meals': 'from-orange-500 to-orange-600',
  'Software': 'from-pink-500 to-pink-600',
  'Other': 'from-gray-500 to-gray-600',
}

const statusBadges = {
  draft: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  submitted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  reimbursed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
}

// Tax categories for categorization
const TAX_CATEGORIES = {
  'Deductible': ['Travel', 'Meals', 'Supplies', 'Software', 'Equipment'],
  'Non-Deductible': ['Personal', 'Entertainment'],
  'Partial': ['Utilities', 'Home Office']
}

export const ExpenseManagerEnhanced: React.FC<ExpenseManagerEnhancedProps> = ({
  expenses: propsExpenses,
  onExpenseCreate,
  onExpenseUpdate,
  onExpenseDelete
}) => {
  // Use store if props not provided
  const expenseStore = useExpenseStore()
  const storeExpenses = expenseStore.expenses
  const storeLoading = expenseStore.isLoading
  const storeError = expenseStore.error
  
  // Use props if provided, otherwise use store
  const expenses = propsExpenses || storeExpenses
  
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null)
  const [showNewExpense, setShowNewExpense] = useState(false)
  const [showExpenseDialog, setShowExpenseDialog] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [currentExpense, setCurrentExpense] = useState<Partial<Expense>>({})
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'timeline'>('list')
  const { toast } = useToast()
  const { handleAsync } = useErrorHandler()
  const hasToastedLoadError = useRef(false)

  // Load expenses from store on mount if using store
  useEffect(() => {
    if (!propsExpenses && expenseStore.loadExpenses) {
      expenseStore.loadExpenses()
    }
  }, [])

  // Toast on load error (once per error)
  useEffect(() => {
    if (storeError && expenses.length === 0 && !hasToastedLoadError.current) {
      hasToastedLoadError.current = true
      toast({
        title: 'Failed to load expenses',
        description: storeError,
        variant: 'destructive',
      })
    }
    if (!storeError) hasToastedLoadError.current = false
  }, [storeError, expenses.length, toast])

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesCategory = !filterCategory || expense.category === filterCategory
      const matchesStatus = !filterStatus || expense.status === filterStatus
      const matchesSearch = !searchQuery ||
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
      const expenseDate = new Date(expense.date)
      const fromDate = dateRange.from ? new Date(dateRange.from) : null
      const toDate = dateRange.to ? new Date(dateRange.to) : null
      const matchesDateRange = !fromDate || !toDate || (expenseDate >= fromDate && expenseDate <= toDate)
      return matchesCategory && matchesStatus && matchesSearch && matchesDateRange
    })
  }, [expenses, filterCategory, filterStatus, searchQuery, dateRange])

  const stats = {
    total: useMemo(() =>
      filteredExpenses.reduce((sum, e) => sum + e.amount, 0), [filteredExpenses]),
    byCategory: useMemo(() => {
      const cats: Record<string, number> = {}
      filteredExpenses.forEach(e => {
        cats[e.category] = (cats[e.category] || 0) + e.amount
      })
      return cats
    }, [filteredExpenses]),
    byStatus: useMemo(() => {
      return {
        draft: filteredExpenses.filter(e => e.status === 'draft').length,
        submitted: filteredExpenses.filter(e => e.status === 'submitted').length,
        approved: filteredExpenses.filter(e => e.status === 'approved').length,
        reimbursed: filteredExpenses.filter(e => e.status === 'reimbursed').length,
      }
    }, [filteredExpenses]),
    billable: useMemo(() =>
      filteredExpenses.filter(e => e.billable).reduce((sum, e) => sum + e.amount, 0), [filteredExpenses]),
    taxDeductible: useMemo(() => {
      return filteredExpenses
        .filter(e => {
          const category = TAX_CATEGORIES.Deductible.find(c => c === e.category)
          return category !== undefined
        })
        .reduce((sum, e) => sum + e.amount, 0)
    }, [filteredExpenses]),
  }

  const handleReceiptUpload = useCallback(async (file: File) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const receiptData = {
          name: file.name,
          url: e.target?.result as string,
          uploadedAt: new Date()
        }
        setCurrentExpense(prev => ({ ...prev, receipt: receiptData }))
        toast({ title: 'Receipt uploaded', description: 'Receipt attached to expense' })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({ title: 'Upload failed', description: 'Failed to upload receipt', variant: 'destructive' })
    }
  }, [toast])

  const handleSaveExpense = useCallback(async () => {
    if (!currentExpense.description || !currentExpense.amount) {
      toast({ title: 'Validation Error', description: 'Description and amount are required', variant: 'destructive' })
      return
    }
    const expense: Expense = {
      id: currentExpense.id || Math.random().toString(36).substr(2, 9),
      description: currentExpense.description!,
      amount: currentExpense.amount!,
      category: currentExpense.category || 'Other',
      date: currentExpense.date || new Date(),
      status: currentExpense.status || 'draft',
      billable: currentExpense.billable || false,
      receipt: currentExpense.receipt,
      notes: currentExpense.notes,
      tags: currentExpense.tags || [],
      vendor: currentExpense.vendor,
      taxCategory: currentExpense.taxCategory || 'Deductible',
      createdAt: currentExpense.createdAt || new Date(),
      updatedAt: new Date()
    }
    const result = await handleAsync(async () => {
      if (currentExpense.id) {
        if (onExpenseUpdate) onExpenseUpdate(expense)
        else if (expenseStore.updateExpense) await expenseStore.updateExpense(expense.id, expense)
      } else {
        if (onExpenseCreate) onExpenseCreate(expense)
        else if (expenseStore.addExpense) await expenseStore.addExpense(expense)
      }
      setShowExpenseDialog(false)
      setCurrentExpense({})
      setReceiptFile(null)
      return expense
    }, {
      message: 'Failed to save expense.',
      success: currentExpense.id ? 'Expense updated.' : 'Expense logged.'
    })
  }, [currentExpense, onExpenseCreate, onExpenseUpdate, expenseStore, handleAsync, toast])

  const handleSubmitExpense = useCallback(async (exp: Expense) => {
    await handleAsync(async () => {
      const updated = { ...exp, status: 'submitted' as const }
      if (onExpenseUpdate) onExpenseUpdate(updated)
      else if (expenseStore.updateExpense) await expenseStore.updateExpense(exp.id, updated)
    }, { message: 'Failed to submit expense.', success: 'Expense submitted for approval.' })
  }, [onExpenseUpdate, expenseStore, handleAsync])

  const handleDeleteExpense = useCallback(async (exp: Expense) => {
    if (!confirm('Are you sure you want to delete this expense?')) return
    await handleAsync(async () => {
      if (onExpenseDelete) onExpenseDelete(exp.id)
      else if (expenseStore.deleteExpense) await expenseStore.deleteExpense(exp.id)
    }, { message: 'Failed to delete expense.', success: 'Expense deleted.' })
  }, [onExpenseDelete, expenseStore, handleAsync])

  const handleEditExpense = useCallback((exp: Expense) => {
    setCurrentExpense(exp)
    setShowExpenseDialog(true)
  }, [])

  const handleExportReport = async (exportFormat: 'csv' | 'excel' | 'pdf') => {
    try {
      if (exportFormat === 'csv') {
        const csv = Papa.unparse(filteredExpenses.map(e => ({
          Date: format(e.date, 'yyyy-MM-dd'),
          Description: e.description,
          Category: e.category,
          Amount: e.amount,
          Status: e.status,
          TaxCategory: e.taxCategory || 'N/A',
          Billable: e.billable ? 'Yes' : 'No',
          Vendor: e.vendor || ''
        })))
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', `expenses_report_${format(new Date(), 'yyyy-MM-dd')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else if (exportFormat === 'excel') {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Expenses')
        worksheet.columns = [
          { header: 'Date', key: 'date', width: 12 },
          { header: 'Description', key: 'description', width: 30 },
          { header: 'Category', key: 'category', width: 15 },
          { header: 'Amount', key: 'amount', width: 12 },
          { header: 'Status', key: 'status', width: 12 },
          { header: 'Tax Category', key: 'taxCategory', width: 15 },
          { header: 'Billable', key: 'billable', width: 10 },
          { header: 'Vendor', key: 'vendor', width: 20 }
        ]
        filteredExpenses.forEach(e => {
          worksheet.addRow({
            date: format(e.date, 'yyyy-MM-dd'),
            description: e.description,
            category: e.category,
            amount: e.amount,
            status: e.status,
            taxCategory: e.taxCategory || 'N/A',
            billable: e.billable ? 'Yes' : 'No',
            vendor: e.vendor || ''
          })
        })
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', `expenses_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else if (exportFormat === 'pdf') {
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text('Expense Report', 14, 20)
        doc.setFontSize(10)
        let y = 30
        filteredExpenses.forEach((e, idx) => {
          if (y > 280) {
            doc.addPage()
            y = 20
          }
          doc.text(`${format(e.date, 'MMM dd, yyyy')} - ${e.description} - $${e.amount} - ${e.category}`, 14, y)
          y += 10
        })
        doc.save(`expenses_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      }
      toast({ title: "Report Exported", description: `Expense report exported as ${exportFormat.toUpperCase()}` })
    } catch (error) {
      toast({ title: "Export Failed", description: "Failed to export report", variant: "destructive" })
    }
  }

  const ExpenseCard = ({
    expense,
    onEdit,
    onSubmit,
    onDelete,
  }: {
    expense: Expense
    onEdit: (e: Expense) => void
    onSubmit: (e: Expense) => void
    onDelete: (e: Expense) => void
  }) => {
    const isExpanded = expandedExpense === expense.id
    const categoryKey = expense.category as keyof typeof categoryColors
    const gradient = categoryColors[categoryKey] || categoryColors['Other']
    const status = (expense.status || 'draft') as keyof typeof statusBadges

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
      >
        {/* Expense Header */}
        <div
          onClick={() => setExpandedExpense(isExpanded ? null : expense.id)}
          className="p-4 bg-white dark:bg-gray-800 cursor-pointer space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white flex-shrink-0",
              `${gradient}`
            )}>
              <DollarSign className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {expense.description}
                </h4>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0",
                  statusBadges[status]
                )}>
                  {status}
                </span>
              </div>
              {expense.vendor && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{expense.vendor}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(expense.date).toLocaleDateString()}
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {expense.currency || '$'}{expense.amount.toFixed(2)}
              </p>
              {expense.billable && (
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Billable</span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {expense.category}
            </span>
            {expense.paymentMethod && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                {expense.paymentMethod.replace('_', ' ')}
              </span>
            )}
            {expense.receipt && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                Receipt
              </span>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-4 space-y-4"
            >
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {expense.clientId && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Client</p>
                    <p className="text-sm">{expense.clientId}</p>
                  </div>
                )}
                {expense.projectId && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Project</p>
                    <p className="text-sm">{expense.projectId}</p>
                  </div>
                )}
                {expense.tax && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tax</p>
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      +{(expense.tax).toFixed(2)}
                    </p>
                  </div>
                )}
                {expense.approvedBy && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Approved By</p>
                    <p className="text-sm">{expense.approvedBy}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {expense.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Notes</p>
                  <p className="text-sm leading-relaxed">{expense.notes}</p>
                </div>
              )}

              {/* Tags */}
              {expense.tags && expense.tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Tags</p>
                  <div className="flex gap-2 flex-wrap">
                    {expense.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Receipt Preview */}
              {expense.receipt && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Receipt
                  </p>
                  <a href={expense.receipt.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {expense.receipt.name}
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEdit(expense)}
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors flex items-center gap-1 justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSubmit(expense)}
                  className="flex-1 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors flex items-center gap-1 justify-center"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Submit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(expense)}
                  className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-600 dark:text-red-400 text-xs font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // Show loading state
  if (storeLoading && expenses.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading expenses...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (storeError && expenses.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Expenses</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{storeError}</p>
          <Button onClick={() => expenseStore.loadExpenses?.()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total: ${stats.total.toFixed(2)} | Billable: ${stats.billable.toFixed(2)} | Tax Deductible: ${stats.taxDeductible.toFixed(2)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowReports(true)}>
              <BarChart3 className="w-4 h-4 mr-2" /> Reports
            </Button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentExpense({})
                setShowExpenseDialog(true)
              }}
              className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">{stats.byStatus.submitted}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Submitted</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-xs text-green-700 dark:text-green-300 font-semibold">{stats.byStatus.approved}</p>
            <p className="text-xs text-green-600 dark:text-green-400">Approved</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">{stats.byStatus.reimbursed}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Reimbursed</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 font-semibold">{stats.byStatus.draft}</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Draft</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={filterCategory || ''}
            onChange={(e) => setFilterCategory(e.target.value || null)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
          >
            <option value="">All Categories</option>
            {Object.keys(categoryColors).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value || null)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="reimbursed">Reimbursed</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          {(['list', 'grid', 'timeline'] as const).map(mode => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                viewMode === mode
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {mode === 'list' ? '📋' : mode === 'grid' ? '🔲' : '📈'} {mode}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-3">
          <AnimatePresence>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={handleEditExpense}
                  onSubmit={handleSubmitExpense}
                  onDelete={handleDeleteExpense}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <DollarSign className="w-12 h-12 mb-2 opacity-50" />
                <p>No expenses found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentExpense.id ? 'Edit Expense' : 'New Expense'}</DialogTitle>
            <DialogDescription>Add or edit expense details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description *</Label>
              <Input
                value={currentExpense.description || ''}
                onChange={(e) => setCurrentExpense({ ...currentExpense, description: e.target.value })}
                placeholder="Expense description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={currentExpense.amount || ''}
                  onChange={(e) => setCurrentExpense({ ...currentExpense, amount: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={currentExpense.date ? format(new Date(currentExpense.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setCurrentExpense({ ...currentExpense, date: new Date(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={currentExpense.category || 'Other'}
                  onValueChange={(v) => setCurrentExpense({ ...currentExpense, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(categoryColors).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tax Category</Label>
                <Select
                  value={currentExpense.taxCategory || 'Deductible'}
                  onValueChange={(v) => setCurrentExpense({ ...currentExpense, taxCategory: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(TAX_CATEGORIES).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Vendor</Label>
              <Input
                value={currentExpense.vendor || ''}
                onChange={(e) => setCurrentExpense({ ...currentExpense, vendor: e.target.value })}
                placeholder="Vendor name"
              />
            </div>
            <div>
              <Label>Receipt</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setReceiptFile(file)
                      handleReceiptUpload(file)
                    }
                  }}
                  className="flex-1"
                />
                {currentExpense.receipt && (
                  <Button variant="outline" size="icon" onClick={() => setCurrentExpense({ ...currentExpense, receipt: undefined })}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {currentExpense.receipt && (
                <div className="mt-2 p-2 bg-muted rounded text-sm flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  <span>{currentExpense.receipt.name}</span>
                </div>
              )}
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={currentExpense.notes || ''}
                onChange={(e) => setCurrentExpense({ ...currentExpense, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentExpense.billable || false}
                  onChange={(e) => setCurrentExpense({ ...currentExpense, billable: e.target.checked })}
                  className="rounded"
                />
                <Label>Billable to client</Label>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={currentExpense.status || 'draft'}
                  onValueChange={(v: any) => setCurrentExpense({ ...currentExpense, status: v })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="reimbursed">Reimbursed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveExpense}>
                {currentExpense.id ? 'Update' : 'Create'} Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={showReports} onOpenChange={setShowReports}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Reports</DialogTitle>
            <DialogDescription>Generate and export expense reports</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 cursor-pointer hover:border-primary" onClick={() => handleExportReport('csv')}>
                <FileText className="h-8 w-8 mb-2 text-blue-500" />
                <h3 className="font-semibold">CSV Export</h3>
                <p className="text-xs text-muted-foreground">Comma-separated values</p>
              </Card>
              <Card className="p-4 cursor-pointer hover:border-primary" onClick={() => handleExportReport('excel')}>
                <FileSpreadsheet className="h-8 w-8 mb-2 text-green-500" />
                <h3 className="font-semibold">Excel Export</h3>
                <p className="text-xs text-muted-foreground">Spreadsheet format</p>
              </Card>
              <Card className="p-4 cursor-pointer hover:border-primary" onClick={() => handleExportReport('pdf')}>
                <FileText className="h-8 w-8 mb-2 text-red-500" />
                <h3 className="font-semibold">PDF Export</h3>
                <p className="text-xs text-muted-foreground">Document format</p>
              </Card>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Report Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total Expenses: <strong>${stats.total.toFixed(2)}</strong></div>
                <div>Tax Deductible: <strong>${stats.taxDeductible.toFixed(2)}</strong></div>
                <div>Billable: <strong>${stats.billable.toFixed(2)}</strong></div>
                <div>Count: <strong>{filteredExpenses.length}</strong></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
