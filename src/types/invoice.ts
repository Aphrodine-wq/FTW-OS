export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: Address
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface BusinessProfile {
  name: string
  email: string
  phone?: string
  website?: string
  address?: Address
  taxId?: string
  logo?: string
  paymentLinks?: {
    stripe?: string
    paypal?: string
    custom?: string
  }
  smsConfig?: {
    accountSid: string
    authToken: string
    fromNumber: string
  }
  supabaseConfig?: {
    url: string
    key: string
  }
  defaultCurrency?: string
  defaultTaxRate?: number
  paymentTerms?: string
  bankTransfer?: string
  id?: string
  createdAt?: Date
}

export interface Product {
  id: string
  name: string
  description?: string
  unitPrice: number
  sku?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Task {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  priority?: 'low' | 'medium' | 'high'
  projectId?: string
  dueDate?: Date
  createdAt: Date
  updatedAt?: Date
  description?: string
  assignee?: string
  tags?: string[]
  subtasks?: Array<{ id: string; title: string; completed: boolean }>
  comments?: Array<{ id: string; author: string; content: string; timestamp: Date }>
  attachments?: Array<{ id: string; name: string; url: string }>
  estimatedHours?: number
  actualHours?: number
  dependencies?: string[]
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'none'
}

export interface LineItem {
  id: string
  description: string
  week?: string // For weekly billing
  quantity: number // Used as Hours
  rate: number
  amount: number
  details?: string
  category?: string
  taxRate?: number
  discountRate?: number
  unit?: string
  notes?: string
}

export interface CustomField {
  label: string
  value: string
}

export interface InvoiceSignature {
  data: string
  name: string
  timestamp: Date
}

export interface InvoiceWatermark {
  text: string
  opacity: number
  angle: number
  fontSize?: number
}

export interface InvoiceHeader {
  content: string
  height: number
  style?: Record<string, any>
}

export interface InvoiceFooter {
  content: string
  height: number
  showPageNumbers?: boolean
  showDate?: boolean
  style?: Record<string, any>
}

export interface InvoiceBackground {
  type: 'color' | 'image' | 'gradient'
  value: string | { from: string; to: string }
  opacity?: number
}

export interface InvoicePayment {
  method?: 'stripe' | 'paypal' | 'bank_transfer' | 'cash' | 'check'
  status?: 'unpaid' | 'partial' | 'paid' | 'overdue'
  transactionId?: string
  amountPaid?: number
  dueDate?: Date
}

export interface Tax {
  id: string
  name: string
  rate: number
  amount: number
}

export interface Discount {
  id: string
  description: string
  amount: number
  type: 'percentage' | 'fixed'
  value?: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  issueDate: Date
  dueDate: Date
  paidDate?: Date
  lineItems: LineItem[]
  subtotal: number
  tax: number
  taxes?: Tax[]
  discount?: number
  discounts?: Discount[]
  discountType?: 'percentage' | 'fixed'
  total: number
  notes: string
  terms?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  currency: string
  shipping?: number
  shippingLabel?: string
  customFields?: CustomField[]
  signature?: InvoiceSignature
  watermark?: InvoiceWatermark
  header?: InvoiceHeader
  footer?: InvoiceFooter
  background?: InvoiceBackground
  showNotes?: boolean
  showTerms?: boolean
  showTaxBreakdown?: boolean
  showShipping?: boolean
  paymentTerms?: string
  payment?: InvoicePayment
  bankDetails?: {
    accountName?: string
    accountNumber?: string
    routingNumber?: string
    bankName?: string
    swift?: string
    iban?: string
  }
  templateId?: string
  templateVersion?: number
  language?: string
  poNumber?: string
  shippingAddress?: Address
  clientAddress?: Address
  clientEmail?: string
  paymentLink?: string
  projectId?: string
  referenceNumber?: string
  attachments?: Array<{ name: string; url: string }>
  createdAt?: Date
  updatedAt?: Date
}

export interface ProjectUpdate {
  id: string
  title: string
  clientId: string
  content: string
  date: Date
  type: 'update' | 'proposal' | 'contract' | 'compensation' | 'policy'
  createdAt: Date
  updatedAt: Date
  tasksCompleted?: string[]
  nextSteps?: string[]
}

export interface CurrencyRates {
  [key: string]: number // e.g., 'EUR': 0.84, 'GBP': 0.73
}

export interface Subscription {
  id: string
  name: string
  price: number
  billingCycle: 'monthly' | 'yearly' | 'one-time'
  startDate: Date
  endDate?: Date
  active: boolean
  clientId: string
}

export interface Proposal {
  id: string
  title: string
  clientId: string
  content: string // Rich text
  budget: number
  timeline: string
  status: 'draft' | 'sent' | 'accepted' | 'declined'
  createdAt: Date
}

export interface Lead {
  id: string
  name: string
  email: string
  company?: string
  source: string
  status: 'prospect' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  value: number
  notes: string
  createdAt: Date
  lastContact?: Date
}

export interface Report {
  id: string
  type: 'financial' | 'time' | 'client' | 'product'
  title: string
  dateRange: { from: Date; to: Date }
  data: any
  generatedAt: Date
}

export interface Integration {
  id: string
  type: 'stripe' | 'paypal' | 'twilio' | 'gmail' | 'slack'
  config: { [key: string]: any }
  active: boolean
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: Date
  createdAt: Date
  updatedAt: Date
  clientId?: string
  projectId?: string
  vendor?: string
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'cash' | 'check'
  receipt?: { url: string; name: string }
  notes?: string
  status?: 'draft' | 'submitted' | 'approved' | 'reimbursed'
  tax?: number
  currency?: string
  tags?: string[]
  billable?: boolean
  approvedBy?: string
  approvedDate?: Date
}

export interface ActivityLog {
  type: 'manual' | 'add' | 'change' | 'unlink'
  filePath: string
  timestamp: Date
}

export interface TimeSession {
  id: string
  projectId: string // or clientId
  startTime: Date
  endTime?: Date
  duration: number
  logs: ActivityLog[]
  status: 'active' | 'completed'
}

export interface Template {
  id: string
  name: string
  description: string
  type: 'built-in' | 'custom'
  config: {
    colors: { primary: string; secondary: string; accent: string }
    fonts: { heading: string; body: string }
    layout: {
      headerPosition: 'top' | 'side' | 'center' // Adjusted to match store usage
      logoPosition: 'left' | 'right' | 'center'
      showLogo: boolean
      showBusinessInfo: boolean
      showClientInfo: boolean
    }
  }
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'hold' | 'archived'
  client?: string // Client ID or Name
  githubRepo?: string // Full URL
  progress: number // 0-100
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  localPath?: string
}
