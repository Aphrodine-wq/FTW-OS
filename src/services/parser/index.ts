import { Invoice, LineItem, Discount, Tax } from '@/types/invoice'

export interface ParsedInvoiceData {
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  invoiceNumber?: string;
  issueDate?: Date;
  dueDate?: Date;
  lineItems: LineItem[];
  notes?: string;
  terms?: string;
  currency?: string;
  taxRate?: number;
  discount?: Discount;
}

export class InvoiceParser {
  private static readonly KEY_VALUE_PATTERNS = {
    client: /^(client|customer|bill to):\s*(.+)$/i,
    email: /^(email|contact):\s*(.+@.+)$/i,
    invoice: /^(invoice|inv):\s*(.+)$/i,
    date: /^(date|issued):\s*(.+)$/i,
    due: /^(due|payment due):\s*(.+)$/i,
    notes: /^(notes|comments?):\s*(.+)$/i,
    terms: /^(terms|payment terms):\s*(.+)$/i,
    currency: /^(currency):\s*(\w+)$/i,
    tax: /^(tax|vat|gst):\s*(\d+(?:\.\d+)?)%?$/i,
  };

  private static readonly LINE_ITEM_PATTERNS = [
    // Description | Quantity | Rate
    /^(.+?)\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*([\d,]+(?:\.\d+)?)$/,
    // Description - Quantity @ Rate
    /^(.+?)\s*-\s*(\d+(?:\.\d+)?)\s*@\s*([\d,]+(?:\.\d+)?)$/,
    // Description: Quantity x Rate
    /^(.+?)\s*:\s*(\d+(?:\.\d+)?)\s*x\s*([\d,]+(?:\.\d+)?)$/,
  ];

  private static readonly NATURAL_LANGUAGE_PATTERNS = {
    hours: /(\d+(?:\.\d+)?)\s+hours?\s+of?\s+(.+?)\s+at\s*\$?([\d,]+(?:\.\d+)?)/i,
    days: /(\d+(?:\.\d+)?)\s+days?\s+of?\s+(.+?)\s+at\s*\$?([\d,]+(?:\.\d+)?)/i,
    fixed: /(.+?)\s+fee\s+of\s*\$?([\d,]+(?:\.\d+)?)/i,
  };

  static parse(text: string): ParsedInvoiceData {
    const lines = text.split('\n').filter(line => line.trim());
    const data: ParsedInvoiceData = {
      lineItems: [],
      currency: 'USD',
    };

    let currentSection = 'header';

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Try key-value parsing first
      const keyValueResult = this.parseKeyValue(trimmed);
      if (keyValueResult) {
        Object.assign(data, keyValueResult);
        continue;
      }

      // Try line item parsing
      const lineItem = this.parseLineItem(trimmed);
      if (lineItem) {
        data.lineItems.push(lineItem);
        continue;
      }

      // Try natural language parsing
      const nlItem = this.parseNaturalLanguage(trimmed);
      if (nlItem) {
        data.lineItems.push(nlItem);
        continue;
      }
    }

    // Calculate totals
    data.lineItems.forEach(item => {
      item.amount = item.quantity * item.rate;
      item.id = Math.random().toString(36).substr(2, 9);
    });

    return data;
  }

  private static parseKeyValue(line: string): Partial<ParsedInvoiceData> | null {
    for (const [key, pattern] of Object.entries(this.KEY_VALUE_PATTERNS)) {
      const match = line.match(pattern);
      if (match) {
        switch (key) {
          case 'client':
            return { clientName: match[2].trim() };
          case 'email':
            return { clientEmail: match[2].trim() };
          case 'invoice':
            return { invoiceNumber: match[2].trim() };
          case 'date':
            return { issueDate: this.parseDate(match[2].trim()) };
          case 'due':
            return { dueDate: this.parseDueDate(match[2].trim()) };
          case 'notes':
            return { notes: match[2].trim() };
          case 'terms':
            return { terms: match[2].trim() };
          case 'currency':
            return { currency: match[2].trim().toUpperCase() };
          case 'tax':
            return { taxRate: parseFloat(match[2]) };
        }
      }
    }
    return null;
  }

  private static parseLineItem(line: string): LineItem | null {
    for (const pattern of this.LINE_ITEM_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        return {
          id: '',
          description: match[1].trim(),
          quantity: parseFloat(match[2]),
          rate: parseFloat(match[3].replace(/,/g, '')),
          amount: 0,
        };
      }
    }
    return null;
  }

  private static parseNaturalLanguage(line: string): LineItem | null {
    for (const [type, pattern] of Object.entries(this.NATURAL_LANGUAGE_PATTERNS)) {
      const match = line.match(pattern);
      if (match) {
        if (type === 'fixed') {
          return {
            id: '',
            description: match[1].trim(),
            quantity: 1,
            rate: parseFloat(match[2].replace(/,/g, '')),
            amount: 0,
          };
        } else {
          return {
            id: '',
            description: `${match[2].trim()} (${match[1]} ${type})`,
            quantity: parseFloat(match[1]),
            rate: parseFloat(match[3].replace(/,/g, '')),
            amount: 0,
          };
        }
      }
    }
    return null;
  }

  private static parseDate(dateStr: string): Date {
    // Try multiple date formats
    const formats = [
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format.source.includes('YYYY-MM-DD')) {
          return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        } else {
          return new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
        }
      }
    }

    // Try relative dates
    if (dateStr.toLowerCase() === 'today') return new Date();
    if (dateStr.toLowerCase() === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    return new Date(dateStr);
  }

  private static parseDueDate(dueStr: string): Date {
    const today = new Date();
    
    // Handle "Net X" format
    const netMatch = dueStr.match(/net\s+(\d+)/i);
    if (netMatch) {
      const days = parseInt(netMatch[1]);
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + days);
      return dueDate;
    }

    // Handle "X days" format
    const daysMatch = dueStr.match(/(\d+)\s+days?/i);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + days);
      return dueDate;
    }

    return this.parseDate(dueStr);
  }
}
