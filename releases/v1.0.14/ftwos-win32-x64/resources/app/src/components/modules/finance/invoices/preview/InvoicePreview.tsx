import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useInvoice } from '@/hooks/useInvoice'
import { useTemplateStore } from '@/stores/template-store'
import { useSettingsStore } from '@/stores/settings-store'
import { TEMPLATES } from '@/stores/template-registry'
import { MessageSquare, Send, X, Loader2, Printer } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { TemplateMinimal } from './templates/TemplateMinimal'
import { TemplateCreative } from './templates/TemplateCreative'
import { TemplateStandard } from './templates/TemplateStandard'

export function InvoicePreview() {
  const { currentInvoice } = useInvoice()
  const { activeTemplateId } = useTemplateStore()
  const { businessProfile, integrations } = useSettingsStore()
  const { toast } = useToast()

  const [showSmsModal, setShowSmsModal] = useState(false)
  const [smsPhone, setSmsPhone] = useState('')
  const [smsMessage, setSmsMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Determine Payment Link
  const paymentLink = currentInvoice?.paymentLink || integrations?.paymentLinks?.custom || integrations?.paymentLinks?.stripe || integrations?.paymentLinks?.paypal

  const handlePrint = () => {
    // Add print class to body temporarily
    document.body.classList.add('printing')
    window.print()
    // Remove after short delay to ensure print dialog captures it
    setTimeout(() => document.body.classList.remove('printing'), 1000)
  }

  // Effect to listen for Ctrl+P
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        handlePrint()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleOpenSms = () => {
    if (!currentInvoice) return
    const total = new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency }).format(currentInvoice.total)
    setSmsMessage(`Hi, please find attached invoice #${currentInvoice.invoiceNumber} for ${total}. Thank you!`)
    setShowSmsModal(true)
  }

  const handleSendSms = async () => {
    if (!smsPhone || !smsMessage) {
      toast({ title: "Error", description: "Phone number and message are required", variant: "destructive" })
      return
    }

    setIsSending(true)
    try {
      // Invoke IPC handler
      const result = await window.ipcRenderer.invoke('send-sms', { to: smsPhone, body: smsMessage })
      
      if (result.success) {
        toast({ title: "Sent!", description: "Invoice sent via SMS successfully.", variant: "default" })
        setShowSmsModal(false)
        setSmsPhone('')
      } else {
        throw new Error(result.error || 'Failed to send')
      }
    } catch (error: any) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" })
    } finally {
      setIsSending(false)
    }
  }

  if (!currentInvoice) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select or create an invoice to preview
      </div>
    )
  }

  const config = TEMPLATES.find(t => t.id === activeTemplateId) || TEMPLATES[0]

  const renderLayout = () => {
    const props = { invoice: currentInvoice, business: businessProfile, paymentLink }
    
    switch (config.style) {
      case 'minimalist':
        return <TemplateMinimal {...props} />
      case 'creative':
        return <TemplateCreative {...props} />
      default:
        return <TemplateStandard {...props} />
    }
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">Invoice Preview</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">Template: {config.name}</p>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">{config.category}</Badge>
             <Badge variant={currentInvoice.status === 'paid' ? 'success' : 'default'} className="uppercase text-xs font-semibold">
               {currentInvoice.status}
             </Badge>
             <Button 
               variant="outline" 
               size="sm" 
               className="gap-2 h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700" 
               onClick={handlePrint} 
               title="Print (Ctrl+P)"
             >
                <Printer className="h-4 w-4" />
                Print
             </Button>
             <Button 
               variant="outline" 
               size="sm" 
               className="gap-2 h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700" 
               onClick={handleOpenSms}
             >
                <MessageSquare className="h-4 w-4 text-blue-500" />
                SMS
             </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0 bg-gray-100 dark:bg-gray-950/50">
        <div className="min-h-full p-8 flex justify-center">
            {/* Template Container - Scaled to fit if needed, but for now scrolling */}
            <div id="invoice-preview" className="w-full max-w-[210mm] shadow-2xl transition-all duration-500 ease-in-out bg-white text-gray-900 rounded-lg overflow-hidden border border-gray-200">
                {renderLayout()}
            </div>
        </div>
      </CardContent>

      <AnimatePresence>
        {showSmsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowSmsModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Send Invoice via SMS
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setShowSmsModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-5 bg-white dark:bg-gray-800">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Recipient Phone</label>
                  <Input 
                    placeholder="+1234567890" 
                    value={smsPhone} 
                    onChange={(e) => setSmsPhone(e.target.value)}
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enter full number with country code (e.g. +1...)</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <Textarea 
                    value={smsMessage} 
                    onChange={(e) => setSmsMessage(e.target.value)}
                    className="min-h-[100px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSendSms} disabled={isSending}>
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isSending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Card>
  )
}