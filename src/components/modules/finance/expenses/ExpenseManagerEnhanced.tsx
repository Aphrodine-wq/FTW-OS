import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Expense } from '@/types/invoice'
import {
  Plus, Trash2, Edit2, DollarSign, TrendingUp, PieChart,
  Calendar, Filter, Search, FileText, Paperclip, CheckCircle,
  AlertCircle, Eye, MoreVertical, Download, Upload
} from 'lucide-react'
import { cn } from '@/services/utils'

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

export const ExpenseManagerEnhanced: React.FC<ExpenseManagerEnhancedProps> = ({
  expenses = [],
  onExpenseCreate,
  onExpenseUpdate,
  onExpenseDelete
}) => {
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null)
  const [showNewExpense, setShowNewExpense] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'timeline'>('list')

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
  }

  const ExpenseCard = ({ expense }: { expense: Expense }) => {
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
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors flex items-center gap-1 justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onExpenseUpdate?.({ ...expense, status: 'submitted' })}
                  className="flex-1 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors flex items-center gap-1 justify-center"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Submit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onExpenseDelete?.(expense.id)}
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

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total: ${stats.total.toFixed(2)} | Billable: ${stats.billable.toFixed(2)}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewExpense(!showNewExpense)}
            className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">{stats.submitted}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Submitted</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-xs text-green-700 dark:text-green-300 font-semibold">{stats.approved}</p>
            <p className="text-xs text-green-600 dark:text-green-400">Approved</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">{stats.reimbursed}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Reimbursed</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 font-semibold">{stats.draft}</p>
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
                <ExpenseCard key={expense.id} expense={expense} />
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
    </div>
  )
}
