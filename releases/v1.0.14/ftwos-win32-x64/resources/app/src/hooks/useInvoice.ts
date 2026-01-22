import { useState, useEffect } from 'react'
import { Invoice } from '@/types/invoice'
import { useInvoiceStore } from '@/stores/invoice-store'
import { InvoiceParser } from '@/services/parser'
import { InvoiceGenerator } from '@/services/generator'
import { useSettingsStore } from '@/stores/settings-store'

export const useInvoice = () => {
  const { 
    currentInvoice, 
    setCurrentInvoice, 
    addInvoice, 
    updateInvoice, 
    generateInvoiceNumber 
  } = useInvoiceStore()
  const { businessProfile, preferences } = useSettingsStore()
  
  const [parsedData, setParsedData] = useState<any>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  const parseText = async (text: string) => {
    setIsParsing(true)
    setParseError(null)
    
    try {
      const parsed = InvoiceParser.parse(text)
      setParsedData(parsed)
      
      // Create or update invoice from parsed data
      if (currentInvoice) {
        updateInvoice(currentInvoice.id, {
          ...currentInvoice,
          invoiceNumber: parsed.invoiceNumber || generateInvoiceNumber(),
          lineItems: parsed.lineItems,
          notes: parsed.notes,
          terms: parsed.terms,
          currency: parsed.currency,
        })
      } else {
        const newInvoice: Invoice = {
          id: Math.random().toString(36).substr(2, 9),
          invoiceNumber: parsed.invoiceNumber || generateInvoiceNumber(),
          status: 'draft',
          clientId: parsed.clientName || 'Unknown Client',
          businessProfileId: 'default',
          issueDate: parsed.issueDate || new Date(),
          dueDate: parsed.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          lineItems: parsed.lineItems,
          subtotal: parsed.lineItems.reduce((sum, item) => sum + item.amount, 0),
          discounts: [],
          taxes: parsed.taxRate ? [{
            id: 'tax-1',
            name: 'Tax',
            rate: parsed.taxRate,
            amount: parsed.lineItems.reduce((sum, item) => sum + item.amount, 0) * (parsed.taxRate / 100)
          }] : [],
          total: parsed.lineItems.reduce((sum, item) => sum + item.amount, 0) + 
                (parsed.taxRate ? parsed.lineItems.reduce((sum, item) => sum + item.amount, 0) * (parsed.taxRate / 100) : 0),
          currency: parsed.currency || 'USD',
          notes: parsed.notes,
          terms: parsed.terms,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setCurrentInvoice(newInvoice)
        addInvoice(newInvoice)
      }
      
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse text')
    } finally {
      setIsParsing(false)
    }
  }

  const generateInvoice = async (format: 'docx' | 'pdf' | 'html' | 'excel') => {
    if (!currentInvoice) throw new Error('No invoice to generate')
    
    try {
      if (format === 'pdf') {
        // Logic handled in PreviewControls for now via html2canvas
        // This hook serves as a state manager primarily
        return { success: true, data: currentInvoice }
      }
      
      const profile = businessProfile || {
        name: 'Business',
        email: '',
        phone: '',
        address: { street: '', city: '', state: '', zip: '', country: '' }
      }
      
      if (format === 'docx') {
        const buf = await InvoiceGenerator.generateDOCX(currentInvoice as any, profile as any)
        const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
        return { success: true, data: { blob, filename: `Invoice-${currentInvoice.invoiceNumber}.docx` } }
      }
      
      if (format === 'html') {
        const html = await InvoiceGenerator.generateHTML(currentInvoice as any, profile as any)
        return { success: true, data: { html, filename: `Invoice-${currentInvoice.invoiceNumber}.html` } }
      }

      if (format === 'excel') {
        const buf = await InvoiceGenerator.generateExcel(currentInvoice as any, profile as any)
        const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        return { success: true, data: { blob, filename: `Invoice-${currentInvoice.invoiceNumber}.xlsx` } }
      }
      
      return { success: false, data: null }
    } catch (error) {
      throw new Error(`Failed to generate invoice: ${error}`)
    }
  }

  return {
    currentInvoice,
    parsedData,
    isParsing,
    parseError,
    parseText,
    generateInvoice,
    setCurrentInvoice,
  }
}
