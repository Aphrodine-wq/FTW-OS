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

export function TemplateMinimal({ invoice, business, paymentLink }: TemplateProps) {
  return (
    <div className="p-12 max-w-4xl mx-auto bg-white min-h-[1000px] text-slate-900 font-sans">
      <div className="text-center mb-16">
        <h1 className="text-2xl tracking-[0.3em] uppercase mb-4 font-light">Invoice</h1>
        <p className="opacity-60 font-mono">#{invoice.invoiceNumber}</p>
        {invoice.poNumber && <p className="text-sm opacity-40 mt-1">PO: {invoice.poNumber}</p>}
      </div>

      <div className="grid grid-cols-2 gap-12 mb-16 text-sm">
        <div>
          <h3 className="uppercase tracking-wider text-xs mb-4 opacity-50 font-bold">From</h3>
          <p className="font-bold text-lg">{business?.name}</p>
          <p className="opacity-70">{business?.email}</p>
          {business?.address && (
             <div className="opacity-70 mt-1">
               <p>{business.address.street}</p>
               <p>{business.address.city}, {business.address.state} {business.address.zip}</p>
             </div>
          )}
        </div>
        <div className="text-right">
          <h3 className="uppercase tracking-wider text-xs mb-4 opacity-50 font-bold">To</h3>
          <p className="font-bold text-lg">{invoice.clientId}</p>
          {invoice.clientAddress && (
             <div className="opacity-70 mt-1">
               <p>{invoice.clientAddress.street}</p>
               <p>{invoice.clientAddress.city}, {invoice.clientAddress.state} {invoice.clientAddress.zip}</p>
               <p>{invoice.clientAddress.country}</p>
             </div>
          )}
          {invoice.clientEmail && <p className="opacity-70 mt-1">{invoice.clientEmail}</p>}
          
          {invoice.shippingAddress && (
            <div className="mt-4">
              <h3 className="uppercase tracking-wider text-xs mb-2 opacity-50 font-bold">Ship To</h3>
              <div className="opacity-70 text-xs">
                <p>{invoice.shippingAddress.street}</p>
                <p>{invoice.shippingAddress.city}, {invoice.shippingAddress.state} {invoice.shippingAddress.zip}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-12">
        {invoice.lineItems.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-4 py-4 border-b border-dashed border-slate-200">
            <div className="col-span-6">
              <p className="font-medium">{item.description}</p>
              {item.details && <p className="text-xs opacity-60 mt-1">{item.details}</p>}
            </div>
            <div className="col-span-2 text-right opacity-60">{item.quantity}</div>
            <div className="col-span-2 text-right opacity-60">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(item.rate)}
            </div>
            <div className="col-span-2 text-right font-medium">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(item.amount)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-16">
        <div className="w-64 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="opacity-60">Subtotal</span>
            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.subtotal)}</span>
          </div>
          {invoice.shipping && invoice.shipping > 0 && (
             <div className="flex justify-between">
                <span className="opacity-60">Shipping</span>
                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.shipping)}</span>
             </div>
          )}
          {invoice.tax && invoice.tax > 0 && (
             <div className="flex justify-between">
                <span className="opacity-60">Tax</span>
                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.tax)}</span>
             </div>
          )}
          <div className="flex justify-between pt-4 border-t border-black text-lg font-bold">
            <span>Total</span>
            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t-2 border-slate-900">
        <div className="text-sm opacity-60">
          <p>Due {format(invoice.dueDate, 'MMM dd, yyyy')}</p>
          {invoice.terms && <p className="mt-2 text-xs max-w-xs">{invoice.terms}</p>}
          
          {paymentLink && (
              <div className="mt-4 p-2 bg-white inline-block">
                  <QRCode value={paymentLink} size={64} />
                  <p className="text-[10px] text-center mt-1 font-bold uppercase tracking-wider">Scan to Pay</p>
              </div>
          )}
        </div>
        <div className="text-3xl font-light">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.total)}
        </div>
      </div>
    </div>
  )
}