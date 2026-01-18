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

export function TemplateStandard({ invoice, business, paymentLink }: TemplateProps) {
  return (
    <div className="p-12 max-w-4xl mx-auto bg-white min-h-[1000px] flex flex-col font-sans text-slate-900">
        {/* Header */}
        <div className="flex justify-between items-start mb-16">
          <div>
            {business?.logo ? (
                <img src={business.logo} alt="Logo" className="h-12 mb-4" />
            ) : (
                <h1 className="text-2xl font-bold mb-2">{business?.name || 'Company Name'}</h1>
            )}
            <div className="text-sm opacity-70">
                <p>{business?.email}</p>
                {business?.address && (
                    <>
                        <p>{business.address.street}</p>
                        <p>{business.address.city}, {business.address.state} {business.address.zip}</p>
                    </>
                )}
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-4xl font-light opacity-30">INVOICE</h2>
            <p className="font-mono mt-2 font-bold text-lg">#{invoice.invoiceNumber}</p>
            {invoice.poNumber && <p className="text-sm opacity-50 mt-1">PO: {invoice.poNumber}</p>}
            <div className="mt-4 text-sm">
                <p><span className="opacity-50">Issued:</span> {format(invoice.issueDate, 'MMM dd, yyyy')}</p>
                <p><span className="opacity-50">Due:</span> {format(invoice.dueDate, 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-2 gap-8 mb-16 border-t border-b py-8 border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase opacity-50 mb-2">Bill To</h3>
            <p className="font-bold text-xl">{invoice.clientId}</p>
            {invoice.clientAddress && (
                <div className="text-sm opacity-70 mt-1">
                    <p>{invoice.clientAddress.street}</p>
                    <p>{invoice.clientAddress.city}, {invoice.clientAddress.state} {invoice.clientAddress.zip}</p>
                    <p>{invoice.clientAddress.country}</p>
                </div>
            )}
          </div>
          
          <div>
             {invoice.shippingAddress && (
                <div className="text-right">
                    <h3 className="text-xs font-bold uppercase opacity-50 mb-2">Ship To</h3>
                    <p className="font-bold text-lg">{invoice.clientId}</p>
                    <div className="text-sm opacity-70 mt-1">
                        <p>{invoice.shippingAddress.street}</p>
                        <p>{invoice.shippingAddress.city}, {invoice.shippingAddress.state} {invoice.shippingAddress.zip}</p>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="flex-1">
            <table className="w-full mb-8">
                <thead>
                <tr className="text-left text-xs uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                    <th className="p-3 font-semibold">Description</th>
                    <th className="p-3 font-semibold text-right">Qty</th>
                    <th className="p-3 font-semibold text-right">Rate</th>
                    <th className="p-3 font-semibold text-right">Amount</th>
                </tr>
                </thead>
                <tbody className="text-sm">
                {invoice.lineItems.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 border-b border-slate-100">
                        <p className="font-medium">{item.description}</p>
                        {item.details && <p className="text-xs opacity-50 mt-1">{item.details}</p>}
                    </td>
                    <td className="p-3 border-b border-slate-100 text-right opacity-70">{item.quantity}</td>
                    <td className="p-3 border-b border-slate-100 text-right opacity-70">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(item.rate)}
                    </td>
                    <td className="p-3 border-b border-slate-100 text-right font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(item.amount)}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-12 mt-8">
            <div className="text-sm">
                 <h3 className="font-bold mb-2 opacity-70">Notes & Terms</h3>
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                    <p>{invoice.notes || 'Thank you for your business.'}</p>
                    {invoice.terms && <p className="text-xs opacity-60 border-t pt-2 mt-2">{invoice.terms}</p>}
                 </div>
            </div>

            <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="opacity-60">Subtotal</span>
                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.subtotal)}</span>
                 </div>
                 {invoice.tax && invoice.tax > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="opacity-60">Tax</span>
                        <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.tax)}</span>
                    </div>
                 )}
                 {invoice.shipping && invoice.shipping > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="opacity-60">Shipping</span>
                        <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.shipping)}</span>
                    </div>
                 )}
                 <div className="flex justify-between pt-4 border-t border-slate-200 text-xl font-bold">
                    <span>Total Due</span>
                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.total)}</span>
                 </div>
                 
                 {paymentLink && (
                    <div className="mt-6 flex justify-end">
                        <div className="text-center">
                            <QRCode value={paymentLink} size={80} />
                            <p className="text-[10px] uppercase font-bold mt-1 opacity-40">Scan to Pay</p>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    </div>
  )
}