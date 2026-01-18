import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Invoice } from '@/types/invoice'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth-store'

interface InvoiceState {
  invoices: Invoice[]
  currentInvoice: Invoice | null
  isLoading: boolean
  error: string | null
  
  // Actions
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (invoice: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  setCurrentInvoice: (invoice: Invoice | null) => void
  generateInvoiceNumber: () => string
  fetchInvoices: () => Promise<void>
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: [],
      currentInvoice: null,
      isLoading: false,
      error: null,

      fetchInvoices: async () => {
        set({ isLoading: true, error: null })
        try {
            // 1. Try Local Storage (Electron File System)
            const saved = await window.ipcRenderer.invoke('db:get-invoices') || []
            const parsed = saved.map((inv: any) => ({
                ...inv,
                issueDate: new Date(inv.issueDate),
                dueDate: new Date(inv.dueDate),
                createdAt: new Date(inv.createdAt || inv.created_at)
            }))
            set({ invoices: parsed })

            // 2. Try Supabase Sync if configured
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .order('created_at', { ascending: false })
            
            if (data && !error) {
                const cloudParsed = data.map(inv => ({
                    ...inv,
                    issueDate: new Date(inv.issueDate),
                    dueDate: new Date(inv.dueDate),
                    createdAt: new Date(inv.created_at)
                }))
                // Simple merge: cloud takes precedence for now
                set({ invoices: cloudParsed })
                // Save back to local for offline use
                await window.ipcRenderer.invoke('db:save-invoices', cloudParsed)
            }
        } catch (e: any) {
            console.warn('Sync failed, using local data:', e)
        } finally {
            set({ isLoading: false })
        }
      },

      addInvoice: async (invoice) => {
        const { user } = useAuthStore.getState()
        if (!user || user.role === 'viewer') {
            console.error('Permission denied: Viewers cannot create invoices')
            return
        }

        const newInvoices = [invoice, ...get().invoices]
        set({ 
            invoices: newInvoices,
            currentInvoice: invoice
        })
        
        // 1. Save Local
        await window.ipcRenderer.invoke('db:save-invoices', newInvoices)

        // 2. Sync Cloud
        try {
            await supabase.from('invoices').insert({
                ...invoice,
                created_at: new Date().toISOString()
            })
        } catch (e) {
            console.error('Cloud sync failed', e)
        }
      },

      updateInvoice: async (updatedFields) => {
        const { user } = useAuthStore.getState()
        if (!user || user.role === 'viewer') {
            console.error('Permission denied: Viewers cannot update invoices')
            return
        }

        const { currentInvoice, invoices } = get()
        if (!currentInvoice) return

        const updatedInvoice = { ...currentInvoice, ...updatedFields }
        const updatedList = invoices.map(inv => 
            inv.id === currentInvoice.id ? updatedInvoice : inv
        )
        
        set({
          currentInvoice: updatedInvoice,
          invoices: updatedList
        })

        // 1. Save Local
        await window.ipcRenderer.invoke('db:save-invoices', updatedList)

        // 2. Sync Cloud
        try {
            await supabase
                .from('invoices')
                .update(updatedFields)
                .eq('id', currentInvoice.id)
        } catch (e) {
            console.error('Failed to update invoice in cloud', e)
        }
      },

      deleteInvoice: async (id) => {
        const { user } = useAuthStore.getState()
        if (user?.role !== 'admin') {
            console.error('Permission denied: Only admins can delete invoices')
            return
        }

        const updatedList = get().invoices.filter(inv => inv.id !== id)

        set((state) => ({
          invoices: updatedList,
          currentInvoice: state.currentInvoice?.id === id ? null : state.currentInvoice
        }))

        // 1. Save Local
        await window.ipcRenderer.invoke('db:save-invoices', updatedList)

        // 2. Sync Cloud
        try {
            await supabase.from('invoices').delete().eq('id', id)
        } catch (e) {
            console.error('Failed to delete invoice from cloud', e)
        }
      },

      setCurrentInvoice: (invoice) => set({ currentInvoice: invoice }),

      generateInvoiceNumber: () => {
        const { invoices } = get()
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        
        // Find count of invoices for this month
        const count = invoices.filter(inv => 
          inv.invoiceNumber.startsWith(`INV-${year}-${month}`)
        ).length + 1
        
        return `INV-${year}-${month}-${String(count).padStart(4, '0')}`
      }
    }),
    {
      name: 'invoice-storage',
      partialize: (state) => ({ invoices: state.invoices }), // Persist invoices locally too
    }
  )
)
