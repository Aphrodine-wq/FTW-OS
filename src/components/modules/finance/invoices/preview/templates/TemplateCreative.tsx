import React from 'react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Invoice } from '@/types/invoice'
import { BusinessProfile } from '@/types/settings'
import QRCode from 'react-qr-code'

interface TemplateProps {
  invoice: Invoice
  business: BusinessProfile | null
  paymentLink?: string
}

export function TemplateCreative({ invoice, business, paymentLink }: TemplateProps) {
  return (
    <div className="p-0 max-w-4xl mx-auto bg-white min-h-[1000px] flex flex-col font-sans">
        {/* Header Section */}
        <div className="p-12 bg-indigo-50 flex justify-between items-end">
        <div>
            <h1 className="text-6xl font-bold leading-none mb-4 text-indigo-600">INVOICE</h1>
            <p className="text-lg font-medium opacity-80 text-indigo-900">#{invoice.invoiceNumber}</p>
            {invoice.poNumber && <p className="text-sm opacity-60 mt-1 font-bold text-indigo-800">PO: {invoice.poNumber}</p>}
        </div>
        <div className="text-right">
            <p className="font-bold text-xl text-indigo-900">{business?.name}</p>
            <p className="opacity-70 text-indigo-800">{business?.email}</p>
            {business?.address && (
                <div className="text-sm opacity-60 text-indigo-800">
                    <p>{business.address.city}, {business.address.state}</p>
                </div>
            )}
        </div>
        </div>

        {/* Client & Line Items Section */}
        <div className="p-12 flex-1">
            <div className="mb-12 p-6 rounded-2xl bg-indigo-600 text-white shadow-xl">
                <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Billed To</p>
                <p className="text-2xl font-bold">{invoice.clientId}</p>
                {invoice.clientAddress && (
                    <p className="opacity-70 mt-1 text-sm">
                        {invoice.clientAddress.street}, {invoice.clientAddress.city}
                    </p>
                )}
                {invoice.shippingAddress && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60">Ship To</p>
                        <p className="opacity-70 text-sm">
                            {invoice.shippingAddress.street}, {invoice.shippingAddress.city}
                        </p>
                    </div>
                )}
            </div>

            <table className="w-full mb-12">
                <thead>
                <tr className="text-left text-xs uppercase tracking-wider opacity-40">
                    <th className="pb-4">Description</th>
                    <th className="pb-4 text-right">Qty</th>
                    <th className="pb-4 text-right">Rate</th>
                    <th className="pb-4 text-right">Amount</th>
                </tr>
                </thead>
                <tbody className="text-sm">
                {invoice.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-indigo-100 last:border-0">
                    <td className="py-4 font-medium">
                        {item.description}
                        {item.details && <p className="text-xs opacity-50 mt-1 font-normal">{item.details}</p>}
                    </td>
                    <td className="py-4 text-right opacity-60">{item.quantity}</td>
                    <td className="py-4 text-right opacity-60">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(item.rate)}
                    </td>
                    <td className="py-4 text-right font-bold text-indigo-600">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(item.amount)}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

        {/* Footer / Totals Section */}
        <div className="bg-slate-900 text-white p-12 flex justify-between items-center">
            <div className="text-sm opacity-60 max-w-xs">
                <p className="font-bold mb-1">Due Date</p>
                <p className="mb-4">{format(invoice.dueDate, 'MMMM dd, yyyy')}</p>
                
                {invoice.notes && <p className="italic">"{invoice.notes}"</p>}
                {invoice.terms && <p className="mt-2 text-xs border-t border-white/20 pt-2">{invoice.terms}</p>}
            </div>
            
            <div className="text-right flex items-center gap-8">
                {paymentLink && (
                    <div className="bg-white p-2 rounded-lg">
                        <QRCode value={paymentLink} size={64} />
                    </div>
                )}
                <div>
                    <div className="space-y-1 text-sm opacity-80 mb-4">
                        <div className="flex justify-between gap-8">
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.subtotal)}</span>
                        </div>
                        {invoice.tax && invoice.tax > 0 && (
                             <div className="flex justify-between gap-8">
                                <span>Tax</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.tax)}</span>
                            </div>
                        )}
                         {invoice.shipping && invoice.shipping > 0 && (
                             <div className="flex justify-between gap-8">
                                <span>Shipping</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.shipping)}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-4xl font-bold tracking-tight">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.total)}
                    </p>
                </div>
            </div>
        </div>
    </div>
  )
}