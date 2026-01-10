import { create } from 'zustand'
import { Invoice, BusinessProfile, Client } from '@/types/invoice'

interface InvoiceStore {
  invoices: Invoice[]
  currentInvoice: Invoice | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setCurrentInvoice: (invoice: Invoice | null) => void
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, updates: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  generateInvoiceNumber: () => string
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  error: null,

  setCurrentInvoice: (invoice) => set({ currentInvoice: invoice }),
  
  addInvoice: (invoice) => set((state) => ({
    invoices: [...state.invoices, invoice],
    currentInvoice: invoice,
  })),
  
  updateInvoice: (id, updates) => set((state) => ({
    invoices: state.invoices.map(inv => 
      inv.id === id ? { ...inv, ...updates, updatedAt: new Date() } : inv
    ),
    currentInvoice: state.currentInvoice?.id === id 
      ? { ...state.currentInvoice, ...updates, updatedAt: new Date() }
      : state.currentInvoice,
  })),
  
  deleteInvoice: (id) => set((state) => ({
    invoices: state.invoices.filter(inv => inv.id !== id),
    currentInvoice: state.currentInvoice?.id === id ? null : state.currentInvoice,
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  generateInvoiceNumber: () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const count = get().invoices.length + 1
    return `INV-${year}-${month}-${String(count).padStart(4, '0')}`
  },
}))
