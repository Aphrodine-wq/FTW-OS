import { FileText, Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

interface EmptyInvoiceStateProps {
  onCreateInvoice?: () => void
}

export function EmptyInvoiceState({ onCreateInvoice }: EmptyInvoiceStateProps) {
  return (
    <EmptyState
      icon={FileText}
      title="No invoices yet"
      description="Create your first invoice to start tracking payments and billing"
      actionLabel="Create Invoice"
      actionIcon={Plus}
      onAction={onCreateInvoice}
    />
  )
}
