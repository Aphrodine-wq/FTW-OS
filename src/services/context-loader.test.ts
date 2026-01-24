import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getTasksContext, getFinanceContext, getProjectsContext } from './context-loader'

// Mock the stores
vi.mock('@/stores/task-store', () => ({
  useTaskStore: {
    getState: vi.fn(() => ({
      tasks: []
    }))
  }
}))

vi.mock('@/stores/invoice-store', () => ({
  useInvoiceStore: {
    getState: vi.fn(() => ({
      invoices: []
    }))
  }
}))

vi.mock('@/stores/expense-store', () => ({
  useExpenseStore: {
    getState: vi.fn(() => ({
      expenses: []
    }))
  }
}))

vi.mock('@/stores/project-store', () => ({
  useProjectStore: {
    getState: vi.fn(() => ({
      projects: []
    }))
  }
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

import { useTaskStore } from '@/stores/task-store'
import { useInvoiceStore } from '@/stores/invoice-store'
import { useExpenseStore } from '@/stores/expense-store'
import { useProjectStore } from '@/stores/project-store'

describe('ContextLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTasksContext', () => {
    it('should return zeros when no tasks exist', () => {
      const result = getTasksContext()
      expect(result).toEqual({
        dueToday: 0,
        overdue: 0,
        highPriority: 0
      })
    })

    it('should count high priority tasks', () => {
      vi.mocked(useTaskStore.getState).mockReturnValue({
        tasks: [
          { id: '1', title: 'Task 1', priority: 'high', status: 'todo' },
          { id: '2', title: 'Task 2', priority: 'high', status: 'done' },
          { id: '3', title: 'Task 3', priority: 'low', status: 'todo' }
        ]
      } as any)

      const result = getTasksContext()
      expect(result.highPriority).toBe(1) // Only incomplete high priority
    })

    it('should count overdue tasks', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      vi.mocked(useTaskStore.getState).mockReturnValue({
        tasks: [
          { id: '1', title: 'Task 1', dueDate: yesterday.toISOString(), status: 'todo', priority: 'medium' },
          { id: '2', title: 'Task 2', dueDate: yesterday.toISOString(), status: 'done', priority: 'medium' }
        ]
      } as any)

      const result = getTasksContext()
      expect(result.overdue).toBe(1) // Only incomplete overdue
    })
  })

  describe('getFinanceContext', () => {
    it('should return zeros when no data exists', () => {
      const result = getFinanceContext()
      expect(result).toEqual({
        unpaidInvoices: 0,
        monthlyRevenue: 0,
        pendingExpenses: 0
      })
    })

    it('should count unpaid invoices', () => {
      vi.mocked(useInvoiceStore.getState).mockReturnValue({
        invoices: [
          { id: '1', status: 'sent', total: 100 },
          { id: '2', status: 'overdue', total: 200 },
          { id: '3', status: 'paid', total: 300 }
        ]
      } as any)

      const result = getFinanceContext()
      expect(result.unpaidInvoices).toBe(2)
    })

    it('should count pending expenses', () => {
      vi.mocked(useExpenseStore.getState).mockReturnValue({
        expenses: [
          { id: '1', status: 'draft' },
          { id: '2', status: 'submitted' },
          { id: '3', status: 'approved' }
        ]
      } as any)

      const result = getFinanceContext()
      expect(result.pendingExpenses).toBe(2)
    })
  })

  describe('getProjectsContext', () => {
    it('should return zeros when no projects exist', () => {
      const result = getProjectsContext()
      expect(result).toEqual({
        activeProjects: 0,
        blockedTasks: 0,
        teamWorkload: 0
      })
    })

    it('should count active projects', () => {
      vi.mocked(useProjectStore.getState).mockReturnValue({
        projects: [
          { id: '1', status: 'active', progress: 50 },
          { id: '2', status: 'completed', progress: 100 },
          { id: '3', status: 'active', progress: 25 }
        ]
      } as any)

      const result = getProjectsContext()
      expect(result.activeProjects).toBe(2)
    })
  })
})
