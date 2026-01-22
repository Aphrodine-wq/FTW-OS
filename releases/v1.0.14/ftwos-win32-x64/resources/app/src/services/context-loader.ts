/**
 * Context Data Loader
 * Loads contextual data for the sidebar based on current view
 */

import { useTaskStore } from '@/stores/task-store'
import { useInvoiceStore } from '@/stores/invoice-store'
import { useExpenseStore } from '@/stores/expense-store'

export interface TasksContext {
  dueToday: number
  overdue: number
  highPriority: number
}

export interface FinanceContext {
  unpaidInvoices: number
  monthlyRevenue: number
  pendingExpenses: number
}

export interface ProjectsContext {
  activeProjects: number
  blockedTasks: number
  teamWorkload: number
}

/**
 * Get tasks context data
 */
export function getTasksContext(): TasksContext {
  const tasks = useTaskStore.getState().tasks
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueToday = tasks.filter(task => {
    if (!task.dueDate) return false
    const due = new Date(task.dueDate)
    due.setHours(0, 0, 0, 0)
    return due.getTime() === today.getTime()
  }).length

  const overdue = tasks.filter(task => {
    if (!task.dueDate) return false
    const due = new Date(task.dueDate)
    due.setHours(0, 0, 0, 0)
    return due.getTime() < today.getTime() && task.status !== 'done'
  }).length

  const highPriority = tasks.filter(
    task => task.priority === 'high' && task.status !== 'done'
  ).length

  return {
    dueToday,
    overdue,
    highPriority
  }
}

/**
 * Get finance context data
 */
export function getFinanceContext(): FinanceContext {
  const invoices = useInvoiceStore.getState().invoices
  const expenses = useExpenseStore.getState().expenses

  const unpaidInvoices = invoices.filter(
    inv => inv.status === 'sent' || inv.status === 'overdue'
  ).length

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyRevenue = invoices
    .filter(inv => {
      if (inv.status !== 'paid' || !inv.paidDate) return false
      return new Date(inv.paidDate) >= startOfMonth
    })
    .reduce((sum, inv) => sum + inv.total, 0)

  const pendingExpenses = expenses.filter(
    exp => exp.status === 'draft' || exp.status === 'submitted'
  ).length

  return {
    unpaidInvoices,
    monthlyRevenue,
    pendingExpenses
  }
}

/**
 * Get projects context data
 */
export function getProjectsContext(): ProjectsContext {
  // This would integrate with a project store when available
  // For now, return mock data
  return {
    activeProjects: 0,
    blockedTasks: 0,
    teamWorkload: 0
  }
}

