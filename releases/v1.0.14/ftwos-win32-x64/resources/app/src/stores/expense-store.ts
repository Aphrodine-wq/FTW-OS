import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Expense } from '@/types/invoice'

interface ExpenseState {
  expenses: Expense[]
  isLoading: boolean
  error: string | null
  
  // Actions
  loadExpenses: () => Promise<void>
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      isLoading: false,
      error: null,

      loadExpenses: async () => {
        set({ isLoading: true, error: null })
        try {
            const saved = await window.ipcRenderer.invoke('db:get-expenses') || []
            // Parse date strings
            const parsed = saved.map((e: any) => ({
                ...e,
                date: new Date(e.date),
                createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
                updatedAt: e.updatedAt ? new Date(e.updatedAt) : new Date()
            }))
            set({ expenses: parsed })
        } catch (e) {
            console.error('Failed to load expenses:', e)
            set({ error: 'Failed to load expenses' })
        } finally {
            set({ isLoading: false })
        }
      },

      addExpense: async (expense) => {
        const newExpense = {
            ...expense,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date()
        } as Expense

        const { expenses } = get()
        const updatedExpenses = [newExpense, ...expenses]
        
        set({ expenses: updatedExpenses })
        await window.ipcRenderer.invoke('db:save-expenses', updatedExpenses)
      },

      updateExpense: async (id, updates) => {
        const { expenses } = get()
        const updatedExpenses = expenses.map(e => 
            e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
        )
        
        set({ expenses: updatedExpenses })
        await window.ipcRenderer.invoke('db:save-expenses', updatedExpenses)
      },

      deleteExpense: async (id) => {
        const { expenses } = get()
        const updatedExpenses = expenses.filter(e => e.id !== id)
        
        set({ expenses: updatedExpenses })
        await window.ipcRenderer.invoke('db:save-expenses', updatedExpenses)
      }
    }),
    {
      name: 'expense-storage',
      partialize: (state) => ({ expenses: state.expenses }),
    }
  )
)