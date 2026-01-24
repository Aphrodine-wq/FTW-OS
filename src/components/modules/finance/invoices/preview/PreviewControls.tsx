import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Copy, Printer, Save, Mail, CheckCircle, FilePlus, Loader2, MessageSquare, FileSpreadsheet, Send } from 'lucide-react'
import { useInvoice } from '@/hooks/useInvoice'
import { useToast } from '@/components/ui/use-toast'
import { validateInvoiceForm } from '@/lib/invoice-validation'
import { useSettingsStore } from '@/stores/settings-store'
// html2canvas and jsPDF are lazy-loaded only when exporting PDF

export function PreviewControls() {
  const { currentInvoice, updateInvoice, generateInvoice } = useInvoice()
  const { toast } = useToast()
  const { businessProfile, integrations } = useSettingsStore()
  const [isExporting, setIsExporting] = useState(false)
  const [isSendingSMS, setIsSendingSMS] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const handleSave = async () => {
    if (!currentInvoice) return
    const { valid, errors } = validateInvoiceForm(currentInvoice)
    if (!valid) {
      const msg = Object.values(errors).join('. ')
      toast({ title: 'Validation failed', description: msg, variant: 'destructive' })
      return
    }

    try {
      const existingInvoices = await window.ipcRenderer.invoke('db:get-invoices') || []
      const index = existingInvoices.findIndex((inv: any) => inv.id === currentInvoice.id)
      let newInvoices
      
      if (index >= 0) {
        newInvoices = [...existingInvoices]
        newInvoices[index] = { ...currentInvoice, updatedAt: new Date() }
      } else {
        newInvoices = [...existingInvoices, { ...currentInvoice, createdAt: new Date(), updatedAt: new Date() }]
      }
      
      await window.ipcRenderer.invoke('db:save-invoices', newInvoices)
      
      toast({
        title: "Invoice Saved",
        description: `Invoice #${currentInvoice.invoiceNumber} has been saved to your history.`,
      })
    } catch (error) {
      console.error('Failed to save invoice:', error)
      toast({
        title: "Save Failed",
        description: "There was an error saving your invoice.",
        variant: "destructive"
      })
    }
  }

  const handleExportPDF = async () => {
    if (!currentInvoice) return
    setIsExporting(true)

    try {
      // Dynamically import heavy libraries only when needed
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ])

      const element = document.getElementById('invoice-preview')
      if (!element) throw new Error('Preview element not found')

      // 1. High-Resolution Capture
      const canvas = await html2canvas(element, {
        scale: 3, // Higher resolution for print quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff' // Ensure white background
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      // 2. Multi-Page Logic
      let heightLeft = imgHeight
      let position = 0
      let page = 1

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      // Add subsequent pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight // This shifts the image up
        // Actually, simpler logic: position -= pdfHeight
        position = -(pdfHeight * page)
        
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
        page++
      }

      pdf.save(`Invoice-${currentInvoice.invoiceNumber}.pdf`)

      toast({
        title: "PDF Exported",
        description: `Successfully generated ${page} page(s).`,
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportDOCX = async () => {
    if (!currentInvoice) return
    setIsExporting(true)
    try {
      const res = await generateInvoice('docx')
      if (res.success && res.data?.blob) {
        const url = URL.createObjectURL(res.data.blob)
        const a = document.createElement('a')
        a.href = url
        a.download = res.data.filename
        a.click()
        URL.revokeObjectURL(url)
        toast({
          title: "DOCX Exported",
          description: `Saved as ${res.data.filename}`,
        })
      } else {
        throw new Error('Failed to generate DOCX')
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not generate DOCX. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportHTML = async () => {
    if (!currentInvoice) return
    setIsExporting(true)
    try {
      const res = await generateInvoice('html')
      if (res.success && res.data?.html) {
        const blob = new Blob([res.data.html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = res.data.filename
        a.click()
        URL.revokeObjectURL(url)
        toast({
          title: "HTML Exported",
          description: `Saved as ${res.data.filename}`,
        })
      } else {
        throw new Error('Failed to generate HTML')
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not generate HTML. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportExcel = async () => {
    if (!currentInvoice) return
    setIsExporting(true)
    try {
      const res = await generateInvoice('excel')
      if (res.success && res.data?.blob) {
        const url = URL.createObjectURL(res.data.blob)
        const a = document.createElement('a')
        a.href = url
        a.download = res.data.filename
        a.click()
        URL.revokeObjectURL(url)
        toast({
          title: "Excel Exported",
          description: `Saved as ${res.data.filename}`,
        })
      } else {
        throw new Error('Failed to generate Excel')
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Export Failed",
        description: "Could not generate Excel file. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleMarkPaid = () => {
    if (currentInvoice) {
      updateInvoice({ status: 'paid' })
      toast({
        title: "Marked as Paid",
        description: "Invoice status updated.",
      })
    }
  }

  const handleDuplicate = () => {
    if (currentInvoice) {
      const newNumber = currentInvoice.invoiceNumber.replace(/\d+$/, (n) => String(Number(n) + 1).padStart(n.length, '0'))
      updateInvoice({
        id: Math.random().toString(36).substr(2, 9),
        invoiceNumber: newNumber,
        status: 'draft',
        issueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      toast({
        title: "Invoice Duplicated",
        description: `Created new invoice #${newNumber}`,
      })
    }
  }

  const handleEmail = async () => {
    if (!currentInvoice) return
    
    // Check if email is configured
    const settings = await window.ipcRenderer.invoke('db:get-settings')
    const smtpConfig = settings?.smtpConfig
    
    if (!smtpConfig?.host || !smtpConfig?.user || !smtpConfig?.pass) {
      // Fall back to mailto: if SMTP not configured
      const subject = `Invoice #${currentInvoice.invoiceNumber} from ${businessProfile?.companyName || 'Your Business'}`
      const body = `Dear Client,\n\nPlease find attached invoice #${currentInvoice.invoiceNumber} for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency }).format(currentInvoice.total)}.\n\nThank you for your business!`
      window.open(`mailto:${currentInvoice.clientEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
      toast({
        title: "Email Client Opened",
        description: "Configure SMTP in Settings to send directly from the app.",
      })
      return
    }

    if (!currentInvoice.clientEmail) {
      toast({
        title: "No Email Address",
        description: "Please add a client email address to send the invoice.",
        variant: "destructive"
      })
      return
    }

    setIsSendingEmail(true)
    
    try {
      // Generate PDF for attachment
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ])

      const element = document.getElementById('invoice-preview')
      if (!element) throw new Error('Preview element not found')

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const imgHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight)
      
      const pdfBase64 = pdf.output('datauristring').split(',')[1]

      // Send via backend
      const result = await window.ipcRenderer.invoke('mail:send', {
        config: {
          host: smtpConfig.host,
          port: smtpConfig.port || 587,
          secure: smtpConfig.port === 465,
          user: smtpConfig.user,
          pass: smtpConfig.pass
        },
        mailOptions: {
          from: smtpConfig.user,
          to: currentInvoice.clientEmail,
          subject: `Invoice #${currentInvoice.invoiceNumber} from ${businessProfile?.companyName || 'Your Business'}`,
          text: `Dear ${currentInvoice.clientName || 'Client'},\n\nPlease find attached invoice #${currentInvoice.invoiceNumber} for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency }).format(currentInvoice.total)}.\n\nDue Date: ${new Date(currentInvoice.dueDate).toLocaleDateString()}\n\nThank you for your business!\n\n${businessProfile?.companyName || ''}`,
          html: `<p>Dear ${currentInvoice.clientName || 'Client'},</p><p>Please find attached invoice <strong>#${currentInvoice.invoiceNumber}</strong> for <strong>${new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency }).format(currentInvoice.total)}</strong>.</p><p>Due Date: ${new Date(currentInvoice.dueDate).toLocaleDateString()}</p><p>Thank you for your business!</p><p>${businessProfile?.companyName || ''}</p>`,
          attachments: [{
            filename: `Invoice-${currentInvoice.invoiceNumber}.pdf`,
            content: pdfBase64,
            encoding: 'base64'
          }]
        }
      })

      if (result.success) {
        // Update invoice status to 'sent'
        updateInvoice({ status: 'sent' })
        
        toast({
          title: "Invoice Sent",
          description: `Invoice emailed to ${currentInvoice.clientEmail}`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Email send error:', error)
      toast({
        title: "Email Failed",
        description: error.message || "Could not send email. Check your SMTP settings.",
        variant: "destructive"
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleSMS = async () => {
    if (!currentInvoice) return
    setIsSendingSMS(true)
    
    // In a real app, you'd look up the client's phone number from the DB
    // For now, we'll prompt the user (or mock it)
    const phone = prompt("Enter client phone number (e.g. +1234567890):")
    if (!phone) {
      setIsSendingSMS(false)
      return
    }

    const body = `Invoice #${currentInvoice.invoiceNumber} for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: currentInvoice.currency }).format(currentInvoice.total)} is due. Please check your email for details.`

    try {
      const result = await window.ipcRenderer.invoke('send-sms', { to: phone, body })
      if (result.success) {
        toast({
          title: "SMS Sent",
          description: `Message sent to ${phone}`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "SMS Failed",
        description: error.message || "Could not send SMS. Check your Twilio settings.",
        variant: "destructive"
      })
    } finally {
      setIsSendingSMS(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={!currentInvoice} title="Duplicate Invoice">
        <FilePlus className="h-4 w-4" />
      </Button>
      
      <Button variant="outline" size="sm" onClick={handleMarkPaid} disabled={!currentInvoice || currentInvoice.status === 'paid'} title="Mark as Paid">
        <CheckCircle className="h-4 w-4 text-green-600" />
      </Button>

      <Button variant="outline" size="sm" onClick={handleEmail} disabled={!currentInvoice || isSendingEmail} title="Send via Email">
        {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
      </Button>

      <Button variant="outline" size="sm" onClick={handleSMS} disabled={!currentInvoice || isSendingSMS} title="Send via SMS">
        {isSendingSMS ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
      </Button>

      <div className="h-4 w-px bg-border mx-1" />

      <Button variant="outline" size="sm" onClick={handleSave} disabled={!currentInvoice}>
        <Save className="mr-2 h-4 w-4" />
        Save
      </Button>

      <Button size="sm" onClick={handleExportPDF} disabled={!currentInvoice || isExporting}>
        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Export PDF
      </Button>
      <Button size="sm" onClick={handleExportDOCX} disabled={!currentInvoice || isExporting}>
        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Export DOCX
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportHTML} disabled={!currentInvoice || isExporting} title="Export HTML">
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        <span className="sr-only">HTML</span>
      </Button>

      <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={!currentInvoice || isExporting} title="Export Excel">
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
        <span className="sr-only">Excel</span>
      </Button>
    </div>
  )
}
