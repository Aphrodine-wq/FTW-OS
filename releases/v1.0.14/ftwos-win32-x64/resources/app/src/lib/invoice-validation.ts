import type { Invoice } from '@/types/invoice'

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateInvoiceForm(inv: Invoice): ValidationResult {
  const errors: Record<string, string> = {}

  if (!inv.invoiceNumber?.trim()) {
    errors.invoiceNumber = 'Invoice number is required'
  }
  if (!inv.clientId?.trim()) {
    errors.clientId = 'Client name is required'
  }
  const issue = inv.issueDate ? new Date(inv.issueDate) : null
  const due = inv.dueDate ? new Date(inv.dueDate) : null
  if (issue && due && due < issue) {
    errors.dueDate = 'Due date must be on or after issue date'
  }
  if (!inv.lineItems?.length) {
    errors.lineItems = 'At least one line item is required'
  } else if ((inv.subtotal ?? 0) <= 0) {
    const subtotal = inv.lineItems.reduce((s, i) => s + i.amount, 0)
    if (subtotal <= 0) errors.lineItems = 'Subtotal must be greater than zero'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

