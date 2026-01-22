/**
 * Context Data Loader
 * Loads contextual data for the sidebar based on current view
 */

import { useTaskStore } from '@/stores/task-store'
import { useInvoiceStore } from '@/stores/invoice-store'
import { useExpenseStore } from '@/stores/expense-store'
import { useProjectStore } from '@/stores/project-store'
import { logger } from '@/lib/logger'

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
  try {
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
  } catch (error) {
    logger.error('Failed to get tasks context', error)
    return { dueToday: 0, overdue: 0, highPriority: 0 }
  }
}

/**
 * Get finance context data
 */
export function getFinanceContext(): FinanceContext {
  try {
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
  } catch (error) {
    logger.error('Failed to get finance context', error)
    return { unpaidInvoices: 0, monthlyRevenue: 0, pendingExpenses: 0 }
  }
}

/**
 * Get projects context data
 */
export function getProjectsContext(): ProjectsContext {
  try {
    const projects = useProjectStore.getState().projects
    const tasks = useTaskStore.getState().tasks

    const activeProjects = projects.filter(p => p.status === 'active').length
    
    // Calculate blocked tasks (tasks with dependencies that are not done)
    // This is a simplified check
    const blockedTasks = tasks.filter(t => 
      t.status !== 'done' && 
      (t.dependencies?.length || 0) > 0
    ).length

    const teamWorkload = projects.reduce((acc, p) => acc + (p.progress || 0), 0) / (projects.length || 1)

    return {
      activeProjects,
      blockedTasks,
      teamWorkload
    }
  } catch (error) {
    logger.error('Failed to get projects context', error)
    return { activeProjects: 0, blockedTasks: 0, teamWorkload: 0 }
  }
}

