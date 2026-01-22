import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock window before imports
const mockIpcRenderer = {
  invoke: vi.fn()
}
vi.stubGlobal('window', { 
    ipcRenderer: mockIpcRenderer,
    location: { origin: 'http://localhost:3000' }
})

// Mock dependencies
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}))

vi.mock('@/services/google-oauth', () => ({
  googleOAuthService: {}
}))

import { useInvoiceStore } from './invoice-store'
import { useAuthStore } from './auth-store'

vi.mock('@/services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockResolvedValue({ error: null }),
      eq: vi.fn().mockReturnThis()
    }))
  }
}))

describe('InvoiceStore', () => {
  beforeEach(() => {
    // Reset store
    useInvoiceStore.setState({ 
        invoices: [], 
        currentInvoice: null, 
        isLoading: false, 
        error: null 
    })
    
    // Mock Admin User
    useAuthStore.setState({
        user: {
            id: 'admin-id',
            email: 'admin@example.com',
            role: 'admin',
            name: 'Admin User'
        },
        isAuthenticated: true,
        isLoading: false
    })

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should add an invoice if user has permission', async () => {
    const invoice = {
      id: 'inv-1',
      invoiceNumber: 'INV-001',
      clientId: 'client-1',
      issueDate: new Date(),
      dueDate: new Date(),
      status: 'draft' as const,
      currency: 'USD',
      lineItems: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      notes: ''
    }

    await useInvoiceStore.getState().addInvoice(invoice)

    const invoices = useInvoiceStore.getState().invoices
    expect(invoices).toHaveLength(1)
    expect(invoices[0].id).toBe('inv-1')
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('db:save-invoices', expect.any(Array))
  })

  it('should not add invoice if user is viewer', async () => {
    useAuthStore.setState({
        user: {
            id: 'viewer-id',
            email: 'viewer@example.com',
            role: 'viewer',
            name: 'Viewer User'
        }
    })

    const invoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        clientId: 'client-1',
        issueDate: new Date(),
        dueDate: new Date(),
        status: 'draft' as const,
        currency: 'USD',
        lineItems: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        notes: ''
    }
  
    await useInvoiceStore.getState().addInvoice(invoice)
  
    const invoices = useInvoiceStore.getState().invoices
    expect(invoices).toHaveLength(0)
    expect(mockIpcRenderer.invoke).not.toHaveBeenCalled()
  })

  it('should update an invoice', async () => {
    const invoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        clientId: 'client-1',
        issueDate: new Date(),
        dueDate: new Date(),
        status: 'draft' as const,
        currency: 'USD',
        lineItems: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        notes: ''
    }
    
    // Setup initial state
    useInvoiceStore.setState({
        invoices: [invoice],
        currentInvoice: invoice
    })

    await useInvoiceStore.getState().updateInvoice({ status: 'sent' })

    const updated = useInvoiceStore.getState().invoices[0]
    expect(updated.status).toBe('sent')
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('db:save-invoices', expect.any(Array))
  })

  it('should delete an invoice', async () => {
    const invoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        clientId: 'client-1',
        issueDate: new Date(),
        dueDate: new Date(),
        status: 'draft' as const,
        currency: 'USD',
        lineItems: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        notes: ''
    }

    useInvoiceStore.setState({ invoices: [invoice] })

    await useInvoiceStore.getState().deleteInvoice('inv-1')

    const invoices = useInvoiceStore.getState().invoices
    expect(invoices).toHaveLength(0)
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('db:save-invoices', [])
  })

  it('should generate invoice number correctly', () => {
    const number = useInvoiceStore.getState().generateInvoiceNumber()
    expect(number).toMatch(/INV-\d{4}-\d{2}-0001/)
  })
})
