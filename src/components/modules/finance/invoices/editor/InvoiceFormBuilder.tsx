import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import { useInvoice } from '@/hooks/useInvoice'
import { Product, Invoice } from '@/types/invoice'
import { format } from 'date-fns'
import { AddressForm } from './AddressForm'
import { LineItemEditor } from './LineItemEditor'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

import { Switch } from '@/components/ui/switch'

interface InvoiceFormBuilderProps {
  currentInvoice: Invoice
  products: Product[]
}

export function InvoiceFormBuilder({ currentInvoice, products }: InvoiceFormBuilderProps) {
  const { updateInvoice } = useInvoice()

  const handleFormChange = (field: string, value: any) => {
    updateInvoice({ [field]: value })
  }

  return (
    <div className="space-y-6 p-1">
      <Accordion type="multiple" defaultValue={['details', 'items', 'financials']}>
        
        {/* Section 1: Core Details */}
        <AccordionItem value="details" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Invoice Details</h3>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Invoice Number</label>
                <Input 
                  value={currentInvoice.invoiceNumber}
                  onChange={(e) => handleFormChange('invoiceNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">PO Number</label>
                <Input 
                  value={currentInvoice.poNumber || ''}
                  onChange={(e) => handleFormChange('poNumber', e.target.value)}
                  placeholder="e.g. PO-9988"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Date</label>
                <Input 
                  type="date"
                  value={format(currentInvoice.issueDate, 'yyyy-MM-dd')}
                  onChange={(e) => handleFormChange('issueDate', new Date(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input 
                  type="date"
                  value={format(currentInvoice.dueDate, 'yyyy-MM-dd')}
                  onChange={(e) => handleFormChange('dueDate', new Date(e.target.value))}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-muted">
                <div className="space-y-0.5">
                    <label className="text-sm font-medium">Recurring Invoice</label>
                    <p className="text-xs text-muted-foreground">Automatically generate this invoice</p>
                </div>
                {/* 
                   In a real implementation, this would toggle a 'recurrence' field on the invoice
                   and maybe show a dropdown for frequency (Daily, Weekly, Monthly)
                */}
                <Switch 
                    checked={(currentInvoice as any).isRecurring || false}
                    onCheckedChange={(checked) => handleFormChange('isRecurring', checked)}
                />
            </div>

            <div className="mt-4 space-y-2">
                <label className="text-sm font-medium">Client Name</label>
                <Input 
                  value={currentInvoice.clientId}
                  onChange={(e) => handleFormChange('clientId', e.target.value)}
                />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 2: Line Items */}
        <AccordionItem value="items" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Line Items</h3>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
             <LineItemEditor 
                items={currentInvoice.lineItems}
                products={products}
                currency={currentInvoice.currency}
                onChange={(items) => {
                    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
                    const total = subtotal + (currentInvoice.shipping || 0) + (currentInvoice.tax || 0)
                    updateInvoice({ lineItems: items, subtotal, total })
                }}
             />
          </AccordionContent>
        </AccordionItem>

        {/* Section 3: Financials & Tax */}
        <AccordionItem value="financials" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Financials</h3>
          </AccordionTrigger>
          <AccordionContent className="pt-2 space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium">Shipping & Handling</label>
                   <Input 
                     type="number"
                     className="text-right"
                     value={currentInvoice.shipping || 0}
                     onChange={(e) => {
                       const shipping = Number(e.target.value)
                       const total = currentInvoice.subtotal + shipping + (currentInvoice.tax || 0)
                       updateInvoice({ shipping, total })
                     }}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Tax Amount</label>
                   <Input 
                     type="number"
                     className="text-right"
                     value={currentInvoice.tax || 0}
                     onChange={(e) => {
                       const tax = Number(e.target.value)
                       const total = currentInvoice.subtotal + (currentInvoice.shipping || 0) + tax
                       updateInvoice({ tax, total })
                     }}
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium">Payment Link Override</label>
                <Input 
                  placeholder="https://..."
                  value={currentInvoice.paymentLink || ''}
                  onChange={(e) => handleFormChange('paymentLink', e.target.value)}
                />
             </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 4: Addresses */}
        <AccordionItem value="addresses" className="border-b-0">
           <AccordionTrigger className="hover:no-underline py-2">
             <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Addresses</h3>
           </AccordionTrigger>
           <AccordionContent className="pt-2 space-y-6">
              <AddressForm 
                label="Billing Address"
                address={currentInvoice.clientAddress || { street: '', city: '', state: '', zip: '', country: '' }}
                onChange={(field, value) => updateInvoice({
                    clientAddress: { ...currentInvoice.clientAddress, [field]: value } as any
                })}
              />
              <AddressForm 
                label="Shipping Address"
                address={currentInvoice.shippingAddress || { street: '', city: '', state: '', zip: '', country: '' }}
                onChange={(field, value) => updateInvoice({
                    shippingAddress: { ...currentInvoice.shippingAddress, [field]: value } as any
                })}
              />
           </AccordionContent>
        </AccordionItem>

        {/* Section 5: Terms & Notes */}
        <AccordionItem value="terms" className="border-b-0">
           <AccordionTrigger className="hover:no-underline py-2">
             <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Terms & Notes</h3>
           </AccordionTrigger>
           <AccordionContent className="pt-2 space-y-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium">Notes</label>
                 <Textarea 
                   value={currentInvoice.notes}
                   onChange={(e) => handleFormChange('notes', e.target.value)}
                   className="h-20"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium">Terms & Conditions</label>
                 <Textarea 
                   value={currentInvoice.terms || ''}
                   onChange={(e) => handleFormChange('terms', e.target.value)}
                   className="h-24 font-mono text-xs"
                   placeholder="Payment due within 30 days..."
                 />
              </div>
           </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  )
}