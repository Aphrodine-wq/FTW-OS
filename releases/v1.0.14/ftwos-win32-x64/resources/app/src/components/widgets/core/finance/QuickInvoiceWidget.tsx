import { AppWidget } from '@/components/widgets/core/AppWidget'
import { useInvoiceStore } from '@/stores/invoice-store'
import { Receipt, Plus } from 'lucide-react'
import { cn } from '@/services/utils'

export function QuickInvoiceWidget({ onRemove }: { id?: string, onRemove?: () => void }) {
  const { invoices } = useInvoiceStore()
  
  // Get last 3 invoices
  const recentInvoices = invoices.slice(0, 3)

  return (
    <AppWidget 
      title="Quick Invoice" 
      icon={Receipt} 
      isConfigured={true}
      configContent={null}
      onRemove={onRemove || (() => {})}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 space-y-2 overflow-hidden">
          {recentInvoices.length > 0 ? (
            recentInvoices.map(invoice => (
              <div 
                key={invoice.id} 
                className="p-3 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] group cursor-pointer hover:border-[var(--accent-primary)] transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition-colors">
                    {invoice.invoiceNumber}
                  </span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    invoice.status === 'paid' ? "bg-green-500/10 text-green-500" :
                    invoice.status === 'overdue' ? "bg-red-500/10 text-red-500" :
                    "bg-yellow-500/10 text-yellow-500"
                  )}>
                    {invoice.status?.toUpperCase() || 'DRAFT'}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[100px]">
                    {invoice.clientId || 'Unknown Client'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--text-main)]">
                    {invoice.currency || '$'}{invoice.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
              <Receipt className="h-8 w-8 mb-2" />
              <p className="text-xs">No invoices yet</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => {
            // Logic to switch to Finance tab and open new invoice would go here
            // For now, we can just log or dispatch event
            const event = new CustomEvent('navigate-to', { detail: 'finance' })
            window.dispatchEvent(event)
          }}
          className="mt-3 w-full py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="h-3 w-3" />
          CREATE NEW
        </button>
      </div>
    </AppWidget>
  )
}
