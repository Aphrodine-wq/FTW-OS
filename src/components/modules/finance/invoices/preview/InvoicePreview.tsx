import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { useInvoice } from '@/hooks/useInvoice'
import { useTemplateStore } from '@/stores/template-store'
import { useSettingsStore } from '@/stores/settings-store'
import { TEMPLATES } from '@/stores/template-registry'

export function InvoicePreview() {
  const { currentInvoice } = useInvoice()
  const { activeTemplateId } = useTemplateStore()
  const { businessProfile } = useSettingsStore()

  if (!currentInvoice) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Invoice Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Enter invoice details to see preview
          </div>
        </CardContent>
      </Card>
    )
  }

  const config = TEMPLATES.find(t => t.id === activeTemplateId) || TEMPLATES[0]
  
  const containerStyle = {
    fontFamily: config.fonts.body,
    backgroundColor: config.colors.background,
    color: config.colors.text,
    '--primary': config.colors.primary,
    '--secondary': config.colors.secondary,
  } as React.CSSProperties

  const headerFont = { fontFamily: config.fonts.header }

  const renderLayout = () => {
    // 1. Minimalist Layout
    if (config.style === 'minimalist') {
      return (
        <div className="p-12 min-h-[800px]" style={containerStyle}>
          <div className="text-center mb-16">
            <h1 className="text-2xl tracking-[0.3em] uppercase mb-4" style={headerFont}>Invoice</h1>
            <p className="opacity-60 font-mono">#{currentInvoice.invoiceNumber}</p>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-16 text-sm">
            <div>
              <h3 className="uppercase tracking-wider text-xs mb-4 opacity-50 font-bold">From</h3>
              <p className="font-bold text-lg">{businessProfile?.name}</p>
              <p className="opacity-70">{businessProfile?.email}</p>
            </div>
            <div className="text-right">
              <h3 className="uppercase tracking-wider text-xs mb-4 opacity-50 font-bold">To</h3>
              <p className="font-bold text-lg">{currentInvoice.clientId}</p>
            </div>
          </div>

          <div className="mb-12">
            {currentInvoice.lineItems.map((item) => (
              <div key={item.id} className="flex justify-between py-4 border-b border-dashed" style={{ borderColor: config.colors.secondary }}>
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-xs opacity-60 mt-1">{item.quantity} x {item.rate}</p>
                </div>
                <div className="font-mono">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency }).format(item.amount)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-6 border-t-2" style={{ borderColor: config.colors.text }}>
            <div className="text-sm opacity-60">Due {format(currentInvoice.dueDate, 'MMM dd')}</div>
            <div className="text-3xl" style={headerFont}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency }).format(currentInvoice.total)}
            </div>
          </div>
        </div>
      )
    }

    // 2. Creative Layout
    if (config.style === 'creative') {
      return (
        <div className="p-0 min-h-[800px] flex flex-col" style={containerStyle}>
          <div className="p-12 bg-opacity-10 flex justify-between items-end" style={{ backgroundColor: config.colors.secondary }}>
            <div>
              <h1 className="text-6xl font-bold leading-none mb-4" style={{ ...headerFont, color: config.colors.primary }}>INVOICE</h1>
              <p className="text-lg font-medium opacity-80">#{currentInvoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl">{businessProfile?.name}</p>
              <p className="opacity-70">{businessProfile?.email}</p>
            </div>
          </div>

          <div className="p-12 flex-1">
            <div className="mb-12 p-6 rounded-2xl bg-opacity-5" style={{ backgroundColor: config.colors.primary }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Billed To</p>
              <p className="text-2xl font-bold">{currentInvoice.clientId}</p>
            </div>

            <table className="w-full mb-12">
              <thead>
                <tr>
                  <th className="text-left py-4 text-sm font-bold opacity-50">Item</th>
                  <th className="text-right py-4 text-sm font-bold opacity-50">Total</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoice.lineItems.map((item) => (
                  <tr key={item.id} className="border-b" style={{ borderColor: config.colors.secondary }}>
                    <td className="py-4">
                      <p className="font-bold text-lg">{item.description}</p>
                      <p className="text-sm opacity-60">{item.quantity} @ {item.rate}</p>
                    </td>
                    <td className="py-4 text-right font-bold text-lg">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency }).format(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right">
              <p className="text-sm opacity-60 mb-2">Total Amount</p>
              <p className="text-5xl font-bold" style={{ ...headerFont, color: config.colors.primary }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency }).format(currentInvoice.total)}
              </p>
            </div>
          </div>
        </div>
      )
    }

    // 3. Corporate / Classic / Tech Layout (Standard)
    return (
      <div className="p-12 min-h-[800px]" style={containerStyle}>
        <div className="flex justify-between items-start mb-12 pb-8 border-b-2" style={{ borderColor: config.colors.secondary }}>
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ ...headerFont, color: config.colors.primary }}>{businessProfile?.name || 'Company Name'}</h1>
            <div className="text-sm opacity-70">
              <p>{businessProfile?.address?.street}</p>
              <p>{businessProfile?.address?.city} {businessProfile?.address?.state}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-light opacity-30">INVOICE</h2>
            <p className="font-mono mt-2 font-bold">#{currentInvoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-16">
          <div>
            <h3 className="text-xs font-bold uppercase opacity-50 mb-2">Bill To</h3>
            <p className="font-bold text-xl">{currentInvoice.clientId}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase opacity-50 mb-1">Date</h3>
              <p>{format(currentInvoice.issueDate, 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase opacity-50 mb-1">Due Date</h3>
              <p>{format(currentInvoice.dueDate, 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <table className="w-full">
            <thead style={{ backgroundColor: config.colors.secondary }}>
              <tr>
                <th className="py-3 px-4 text-left font-bold text-sm">Description</th>
                <th className="py-3 px-4 text-center font-bold text-sm">Qty</th>
                <th className="py-3 px-4 text-right font-bold text-sm">Rate</th>
                <th className="py-3 px-4 text-right font-bold text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoice.lineItems.map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? 'bg-opacity-10' : ''} style={i % 2 === 0 ? { backgroundColor: config.colors.secondary } : {}}>
                  <td className="py-3 px-4 font-medium">{item.description}</td>
                  <td className="py-3 px-4 text-center opacity-70">{item.quantity}</td>
                  <td className="py-3 px-4 text-right opacity-70">{item.rate}</td>
                  <td className="py-3 px-4 text-right font-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency }).format(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-1/3 p-6 rounded-lg" style={{ backgroundColor: config.colors.secondary }}>
            <div className="flex justify-between mb-2">
              <span className="opacity-70">Subtotal</span>
              <span className="font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency }).format(currentInvoice.subtotal)}</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-black/10 mt-4">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-xl" style={{ color: config.colors.primary }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency }).format(currentInvoice.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full overflow-hidden flex flex-col border-none shadow-none">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex justify-between items-center">
          <CardTitle>Preview: {config.name}</CardTitle>
          <div className="flex gap-2">
             <Badge variant="outline">{config.category}</Badge>
             <Badge variant={currentInvoice.status === 'paid' ? 'success' : 'default'}>
               {currentInvoice.status}
             </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-auto bg-slate-100/50 flex-1 flex items-start justify-center py-8">
        <div id="invoice-preview" className="w-full max-w-[210mm] shadow-2xl transition-all duration-500 ease-in-out">
          {renderLayout()}
        </div>
      </CardContent>
    </Card>
  )
}
