import { format } from 'date-fns'
import { Invoice, BusinessProfile } from '@/types/invoice'

interface TemplateFTWProps {
  invoice: Invoice
  business?: BusinessProfile | null
  paymentLink?: string
}

export function TemplateFTW({ invoice, business, paymentLink }: TemplateFTWProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'sent': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  // Calculate amounts
  const subtotal = invoice.subtotal || invoice.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = invoice.tax || 0
  const shippingAmount = invoice.shipping || 0
  const discountAmount = invoice.discount || 0
  const depositPaid = invoice.payment?.amountPaid || 0
  const balanceDue = invoice.total - depositPaid

  return (
    <div className="p-12 min-h-full font-sans text-gray-800 bg-white">
      {/* Header */}
      <header className="flex justify-between items-start mb-12">
        {/* Company Branding */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-xl tracking-tight">FTW</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {business?.name || 'FTW'}
            </h1>
            {business?.website && (
              <p className="text-sm text-gray-500">{business.website}</p>
            )}
          </div>
        </div>

        {/* Invoice Title & Status */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-3 mb-2">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">INVOICE</h2>
            <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
          <p className="text-lg font-mono text-gray-600">#{invoice.invoiceNumber}</p>
        </div>
      </header>

      {/* Invoice Meta Grid */}
      <div className="grid grid-cols-3 gap-8 mb-10 pb-8 border-b border-gray-100">
        {/* From */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">From</h3>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-gray-900">{business?.name || 'FTW'}</p>
            {business?.address && (
              <>
                <p className="text-gray-600">{business.address.street}</p>
                <p className="text-gray-600">
                  {business.address.city}, {business.address.state} {business.address.zip}
                </p>
                {business.address.country && (
                  <p className="text-gray-600">{business.address.country}</p>
                )}
              </>
            )}
            {business?.email && <p className="text-gray-600">{business.email}</p>}
            {business?.phone && <p className="text-gray-600">{business.phone}</p>}
            {business?.taxId && <p className="text-gray-500 text-xs mt-2">Tax ID: {business.taxId}</p>}
          </div>
        </div>

        {/* Bill To */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Bill To</h3>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-gray-900">{invoice.clientId}</p>
            {invoice.clientEmail && <p className="text-gray-600">{invoice.clientEmail}</p>}
            {invoice.clientAddress && (
              <>
                <p className="text-gray-600">{invoice.clientAddress.street}</p>
                <p className="text-gray-600">
                  {invoice.clientAddress.city}, {invoice.clientAddress.state} {invoice.clientAddress.zip}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Issue Date</span>
              <span className="font-medium text-gray-900">{format(new Date(invoice.issueDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Due Date</span>
              <span className="font-medium text-gray-900">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</span>
            </div>
            {invoice.poNumber && (
              <div className="flex justify-between">
                <span className="text-gray-500">PO Number</span>
                <span className="font-medium text-gray-900">{invoice.poNumber}</span>
              </div>
            )}
            {invoice.projectId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Project</span>
                <span className="font-medium text-gray-900">{invoice.projectId}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ship To (if different) */}
      {invoice.shippingAddress && invoice.shippingAddress.street && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Ship To</h3>
          <div className="text-sm text-gray-600">
            <p>{invoice.shippingAddress.street}</p>
            <p>{invoice.shippingAddress.city}, {invoice.shippingAddress.state} {invoice.shippingAddress.zip}</p>
          </div>
        </div>
      )}

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Description</th>
              <th className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">Qty/Hrs</th>
              <th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-28">Rate</th>
              <th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.lineItems.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4">
                  <p className="font-medium text-gray-900">{item.description}</p>
                  {item.details && <p className="text-sm text-gray-500 mt-1">{item.details}</p>}
                  {item.category && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                      {item.category}
                    </span>
                  )}
                </td>
                <td className="py-4 text-center text-gray-600">
                  {item.quantity} {item.unit || ''}
                </td>
                <td className="py-4 text-right text-gray-600 font-mono">
                  {formatCurrency(item.rate)}
                </td>
                <td className="py-4 text-right font-semibold text-gray-900 font-mono">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-80">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-mono text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between py-2 text-emerald-600">
                <span>Discount</span>
                <span className="font-mono">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            
            {shippingAmount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-500">{invoice.shippingLabel || 'Shipping & Handling'}</span>
                <span className="font-mono text-gray-900">{formatCurrency(shippingAmount)}</span>
              </div>
            )}
            
            {taxAmount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Tax</span>
                <span className="font-mono text-gray-900">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-3 border-t-2 border-gray-900">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-lg font-mono text-gray-900">{formatCurrency(invoice.total)}</span>
            </div>

            {depositPaid > 0 && (
              <>
                <div className="flex justify-between py-2 text-emerald-600">
                  <span>Amount Paid</span>
                  <span className="font-mono">-{formatCurrency(depositPaid)}</span>
                </div>
                <div className="flex justify-between py-3 bg-gray-900 text-white rounded-lg px-4 -mx-4">
                  <span className="font-bold">Balance Due</span>
                  <span className="font-bold text-lg font-mono">{formatCurrency(balanceDue)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Payment Methods</h3>
        <div className="grid grid-cols-3 gap-6">
          {/* Bank Transfer */}
          {invoice.bankDetails?.accountNumber && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-700">Bank Transfer</p>
              <div className="text-xs text-gray-500 space-y-0.5">
                {invoice.bankDetails.bankName && <p>Bank: {invoice.bankDetails.bankName}</p>}
                {invoice.bankDetails.accountName && <p>Name: {invoice.bankDetails.accountName}</p>}
                <p>Account: {invoice.bankDetails.accountNumber}</p>
                {invoice.bankDetails.routingNumber && <p>Routing: {invoice.bankDetails.routingNumber}</p>}
                {invoice.bankDetails.swift && <p>SWIFT: {invoice.bankDetails.swift}</p>}
              </div>
            </div>
          )}

          {/* Digital Payments */}
          {paymentLink && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-700">Pay Online</p>
              <p className="text-xs text-gray-500 break-all">{paymentLink}</p>
            </div>
          )}

          {/* Check */}
          {business?.address && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-700">Check</p>
              <div className="text-xs text-gray-500">
                <p>Make payable to: {business.name || 'FTW'}</p>
                <p>Mail to: {business.address.street}</p>
                <p>{business.address.city}, {business.address.state} {business.address.zip}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <div className="grid grid-cols-2 gap-8 mb-8">
          {invoice.notes && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Terms & Conditions</h3>
              <p className="text-xs text-gray-500 whitespace-pre-wrap">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="pt-8 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">Thank you for your business</p>
        {business?.website && (
          <p className="text-xs text-gray-400 mt-1">{business.website}</p>
        )}
      </footer>
    </div>
  )
}
