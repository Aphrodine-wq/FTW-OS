import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Building2, CreditCard } from 'lucide-react'
import { useInvoice } from '@/hooks/useInvoice'
import { Product, Invoice } from '@/types/invoice'
import { format } from 'date-fns'
import { AddressForm } from './AddressForm'
import { LineItemEditor } from './LineItemEditor'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Switch } from '@/components/ui/switch'
import { validateInvoiceForm } from '@/lib/invoice-validation'
import { useClientStore } from '@/stores/client-store'

interface InvoiceFormBuilderProps {
  currentInvoice: Invoice
  products: Product[]
}

export function InvoiceFormBuilder({ currentInvoice, products }: InvoiceFormBuilderProps) {
  const { updateInvoice } = useInvoice()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const clients = useClientStore(state => state.clients)

  const validateInvoice = useCallback((): boolean => {
    const { valid, errors: err } = validateInvoiceForm(currentInvoice)
    setErrors(err)
    return valid
  }, [currentInvoice])

  const handleFormChange = (field: string, value: unknown) => {
    updateInvoice({ [field]: value })
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      updateInvoice({
        clientId: client.name,
        clientEmail: client.email,
        clientAddress: client.address
      })
    }
  }

  const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'MXN']
  const PAYMENT_TERMS = [
    { value: 'due_on_receipt', label: 'Due on Receipt' },
    { value: 'net_7', label: 'Net 7 Days' },
    { value: 'net_15', label: 'Net 15 Days' },
    { value: 'net_30', label: 'Net 30 Days' },
    { value: 'net_45', label: 'Net 45 Days' },
    { value: 'net_60', label: 'Net 60 Days' },
    { value: 'custom', label: 'Custom' }
  ]

  return (
    <div className="space-y-6 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create Invoice</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Fill in the details below to generate your invoice</p>
      </div>

      <Accordion type="multiple" defaultValue={['details', 'items', 'financials']} className="space-y-4">
        
        {/* Section 1: Core Details */}
        <AccordionItem value="details" className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 bg-white dark:bg-gray-800 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Invoice Details</h3>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="invoice-number" className="text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Number *</label>
                <Input 
                  id="invoice-number"
                  value={currentInvoice.invoiceNumber}
                  onChange={(e) => handleFormChange('invoiceNumber', e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  placeholder="INV-001"
                  aria-required="true"
                  aria-invalid={!!errors.invoiceNumber}
                />
                {errors.invoiceNumber && <p className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">{errors.invoiceNumber}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="invoice-po" className="text-sm font-medium text-gray-700 dark:text-gray-300">PO Number</label>
                <Input 
                  id="invoice-po"
                  value={currentInvoice.poNumber || ''}
                  onChange={(e) => handleFormChange('poNumber', e.target.value)}
                  placeholder="e.g. PO-9988"
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="invoice-issue-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Issue Date *</label>
                <Input 
                  id="invoice-issue-date"
                  type="date"
                  value={format(currentInvoice.issueDate, 'yyyy-MM-dd')}
                  onChange={(e) => handleFormChange('issueDate', new Date(e.target.value))}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="invoice-due-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date *</label>
                <Input 
                  id="invoice-due-date"
                  type="date"
                  value={format(currentInvoice.dueDate, 'yyyy-MM-dd')}
                  onChange={(e) => handleFormChange('dueDate', new Date(e.target.value))}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  aria-required="true"
                  aria-invalid={!!errors.dueDate}
                />
                {errors.dueDate && <p className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">{errors.dueDate}</p>}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="space-y-0.5">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">Recurring Invoice</label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Automatically generate this invoice on a schedule</p>
                </div>
                <Switch 
                    checked={(currentInvoice as any).isRecurring || false}
                    onCheckedChange={(checked) => handleFormChange('isRecurring', checked)}
                />
            </div>

            <div className="mt-4 space-y-4">
                {/* Client Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Client *
                  </label>
                  {clients.length > 0 ? (
                    <Select onValueChange={handleClientSelect}>
                      <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select a client or type below" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} {client.email && `(${client.email})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  <Input 
                    id="invoice-client"
                    value={currentInvoice.clientId}
                    onChange={(e) => handleFormChange('clientId', e.target.value)}
                    placeholder="Or enter client name manually"
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    aria-required="true"
                    aria-invalid={!!errors.clientId}
                  />
                  {errors.clientId && <p className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">{errors.clientId}</p>}
                </div>

                {/* Client Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Email</label>
                  <Input 
                    type="email"
                    value={currentInvoice.clientEmail || ''}
                    onChange={(e) => handleFormChange('clientEmail', e.target.value)}
                    placeholder="client@example.com"
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* Currency & Payment Terms Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                    <Select value={currentInvoice.currency || 'USD'} onValueChange={(val) => handleFormChange('currency', val)}>
                      <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(curr => (
                          <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Terms</label>
                    <Select value={currentInvoice.paymentTerms || 'net_30'} onValueChange={(val) => handleFormChange('paymentTerms', val)}>
                      <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TERMS.map(term => (
                          <SelectItem key={term.value} value={term.value}>{term.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Project Reference */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Reference</label>
                  <Input 
                    value={currentInvoice.projectId || ''}
                    onChange={(e) => handleFormChange('projectId', e.target.value)}
                    placeholder="e.g. Website Redesign, Consulting Q4"
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  />
                </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 2: Line Items */}
        <AccordionItem value="items" className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 bg-white dark:bg-gray-800 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Line Items</h3>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
             <LineItemEditor 
                items={currentInvoice.lineItems}
                products={products}
                currency={currentInvoice.currency}
                onChange={(items) => {
                    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
                    const total = subtotal + (currentInvoice.shipping || 0) + (currentInvoice.tax || 0)
                    updateInvoice({ lineItems: items, subtotal, total })
                    setErrors(prev => { const n = { ...prev }; delete n.lineItems; return n })
                }}
             />
             {errors.lineItems && <p className="text-xs text-red-600 dark:text-red-400 mt-2" role="alert">{errors.lineItems}</p>}
          </AccordionContent>
        </AccordionItem>

        {/* Section 3: Financials & Tax */}
        <AccordionItem value="financials" className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 bg-white dark:bg-gray-800 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Financials</h3>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shipping & Handling</label>
                   <Input 
                     type="number"
                     className="text-right bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                     value={currentInvoice.shipping || 0}
                     onChange={(e) => {
                       const shipping = Number(e.target.value)
                       const total = currentInvoice.subtotal + shipping + (currentInvoice.tax || 0)
                       updateInvoice({ shipping, total })
                     }}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tax Amount</label>
                   <Input 
                     type="number"
                     className="text-right bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                     value={currentInvoice.tax || 0}
                     onChange={(e) => {
                       const tax = Number(e.target.value)
                       const total = currentInvoice.subtotal + (currentInvoice.shipping || 0) + tax
                       updateInvoice({ tax, total })
                     }}
                   />
                </div>
             </div>

             <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal</span>
                 <span className="text-sm font-semibold text-gray-900 dark:text-white">
                   {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency || 'USD' }).format(currentInvoice.subtotal || 0)}
                 </span>
               </div>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm text-gray-600 dark:text-gray-400">Shipping</span>
                 <span className="text-sm text-gray-900 dark:text-white">
                   {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency || 'USD' }).format(currentInvoice.shipping || 0)}
                 </span>
               </div>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm text-gray-600 dark:text-gray-400">Tax</span>
                 <span className="text-sm text-gray-900 dark:text-white">
                   {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency || 'USD' }).format(currentInvoice.tax || 0)}
                 </span>
               </div>
               <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                 <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                 <span className="text-lg font-bold text-gray-900 dark:text-white">
                   {new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency || 'USD' }).format(currentInvoice.total || 0)}
                 </span>
               </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Link</label>
                <Input 
                  placeholder="https://payment.link/..."
                  value={currentInvoice.paymentLink || ''}
                  onChange={(e) => handleFormChange('paymentLink', e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
             </div>

             {/* Deposit/Amount Paid */}
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Deposit/Amount Paid</label>
                 <Input 
                   type="number"
                   className="text-right bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                   value={(currentInvoice.payment?.amountPaid) || 0}
                   onChange={(e) => {
                     const amountPaid = Number(e.target.value)
                     updateInvoice({ 
                       payment: { 
                         ...currentInvoice.payment, 
                         amountPaid,
                         status: amountPaid >= currentInvoice.total ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid'
                       } 
                     })
                   }}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount</label>
                 <Input 
                   type="number"
                   className="text-right bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                   value={currentInvoice.discount || 0}
                   onChange={(e) => {
                     const discount = Number(e.target.value)
                     const total = currentInvoice.subtotal + (currentInvoice.shipping || 0) + (currentInvoice.tax || 0) - discount
                     updateInvoice({ discount, total })
                   }}
                 />
               </div>
             </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section: Bank Details */}
        <AccordionItem value="bank" className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 bg-white dark:bg-gray-800 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Bank Details
            </h3>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-4">
            <p className="text-sm text-gray-500">These details will appear on the invoice for bank transfer payments.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank Name</label>
                <Input 
                  value={currentInvoice.bankDetails?.bankName || ''}
                  onChange={(e) => updateInvoice({ bankDetails: { ...currentInvoice.bankDetails, bankName: e.target.value } })}
                  placeholder="Chase, Bank of America, etc."
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</label>
                <Input 
                  value={currentInvoice.bankDetails?.accountName || ''}
                  onChange={(e) => updateInvoice({ bankDetails: { ...currentInvoice.bankDetails, accountName: e.target.value } })}
                  placeholder="FTW LLC"
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                <Input 
                  value={currentInvoice.bankDetails?.accountNumber || ''}
                  onChange={(e) => updateInvoice({ bankDetails: { ...currentInvoice.bankDetails, accountNumber: e.target.value } })}
                  placeholder="xxxx-xxxx-xxxx"
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Routing Number</label>
                <Input 
                  value={currentInvoice.bankDetails?.routingNumber || ''}
                  onChange={(e) => updateInvoice({ bankDetails: { ...currentInvoice.bankDetails, routingNumber: e.target.value } })}
                  placeholder="xxxxxxxxx"
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SWIFT/BIC (International)</label>
                <Input 
                  value={currentInvoice.bankDetails?.swift || ''}
                  onChange={(e) => updateInvoice({ bankDetails: { ...currentInvoice.bankDetails, swift: e.target.value } })}
                  placeholder="Optional"
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">IBAN (International)</label>
                <Input 
                  value={currentInvoice.bankDetails?.iban || ''}
                  onChange={(e) => updateInvoice({ bankDetails: { ...currentInvoice.bankDetails, iban: e.target.value } })}
                  placeholder="Optional"
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 4: Addresses */}
        <AccordionItem value="addresses" className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 bg-white dark:bg-gray-800 shadow-sm">
           <AccordionTrigger className="hover:no-underline py-4">
             <h3 className="text-base font-semibold text-gray-900 dark:text-white">Addresses</h3>
           </AccordionTrigger>
           <AccordionContent className="pt-2 pb-4 space-y-6">
              <AddressForm 
                label="Billing Address"
                address={currentInvoice.clientAddress || { street: '', city: '', state: '', zip: '', country: '' }}
                onChange={(field, value) => {
                  const base = currentInvoice.clientAddress || { street: '', city: '', state: '', zip: '', country: '' }
                  updateInvoice({ clientAddress: { ...base, [field]: value } } as any)
                }}
              />
              <AddressForm 
                label="Shipping Address"
                address={currentInvoice.shippingAddress || { street: '', city: '', state: '', zip: '', country: '' }}
                onChange={(field, value) => {
                  const base = currentInvoice.shippingAddress || { street: '', city: '', state: '', zip: '', country: '' }
                  updateInvoice({ shippingAddress: { ...base, [field]: value } } as any)
                }}
              />
           </AccordionContent>
        </AccordionItem>

        {/* Section 5: Terms & Notes */}
        <AccordionItem value="terms" className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 bg-white dark:bg-gray-800 shadow-sm">
           <AccordionTrigger className="hover:no-underline py-4">
             <h3 className="text-base font-semibold text-gray-900 dark:text-white">Terms & Notes</h3>
           </AccordionTrigger>
           <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                 <Textarea 
                   value={currentInvoice.notes}
                   onChange={(e) => handleFormChange('notes', e.target.value)}
                   className="h-24 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                   placeholder="Additional notes or instructions..."
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Terms & Conditions</label>
                 <Textarea 
                   value={currentInvoice.terms || ''}
                   onChange={(e) => handleFormChange('terms', e.target.value)}
                   className="h-32 font-mono text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                   placeholder="Payment due within 30 days. Late fees may apply..."
                 />
              </div>
           </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  )
}