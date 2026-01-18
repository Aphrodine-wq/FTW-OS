import { Invoice, LineItem, Discount, Tax, BusinessProfile } from '@/types/invoice'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, ImageRun } from 'docx'
import QRCode from 'qrcode'
import ExcelJS from 'exceljs'

export class InvoiceGenerator {
  static async generateExcel(invoice: Invoice, businessProfile: BusinessProfile): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Invoice')
    const currencySymbol = invoice.currency || '$'

    // Set columns
    sheet.columns = [
      { header: '', key: 'A', width: 5 },
      { header: '', key: 'B', width: 25 },
      { header: '', key: 'C', width: 15 },
      { header: '', key: 'D', width: 15 },
      { header: '', key: 'E', width: 15 },
      { header: '', key: 'F', width: 15 },
    ]

    // Header
    sheet.mergeCells('B2:C2')
    sheet.getCell('B2').value = businessProfile.name
    sheet.getCell('B2').font = { size: 20, bold: true }

    sheet.getCell('B3').value = businessProfile.email
    sheet.getCell('B4').value = businessProfile.phone

    // Invoice Details
    sheet.mergeCells('E2:F2')
    sheet.getCell('E2').value = 'INVOICE'
    sheet.getCell('E2').font = { size: 20, bold: true, color: { argb: '3B82F6' } }
    sheet.getCell('E2').alignment = { horizontal: 'right' }

    sheet.getCell('E3').value = 'Invoice #:'
    sheet.getCell('F3').value = invoice.invoiceNumber
    
    sheet.getCell('E4').value = 'Date:'
    sheet.getCell('F4').value = invoice.issueDate.toLocaleDateString()

    sheet.getCell('E5').value = 'Due:'
    sheet.getCell('F5').value = invoice.dueDate.toLocaleDateString()

    // Bill To
    sheet.getCell('B7').value = 'BILL TO'
    sheet.getCell('B7').font = { bold: true, color: { argb: '666666' } }
    sheet.getCell('B8').value = invoice.clientId
    sheet.getCell('B8').font = { size: 14, bold: true }

    // Table Header
    const tableHeaderRow = 11
    sheet.getRow(tableHeaderRow).values = ['', 'Description', 'Week', 'Hours', 'Rate', 'Amount']
    sheet.getRow(tableHeaderRow).font = { bold: true }
    sheet.getRow(tableHeaderRow).getCell(6).alignment = { horizontal: 'right' } // Amount right align

    // Line Items
    let currentRow = tableHeaderRow + 1
    invoice.lineItems.forEach(item => {
      sheet.getRow(currentRow).values = [
        '',
        item.description,
        item.week || '-',
        item.quantity,
        item.rate,
        item.amount
      ]
      sheet.getCell(`E${currentRow}`).numFmt = `"${currencySymbol}"#,##0.00`
      sheet.getCell(`F${currentRow}`).numFmt = `"${currencySymbol}"#,##0.00`
      currentRow++
    })

    // Totals
    currentRow += 2
    
    // Subtotal
    sheet.getCell(`E${currentRow}`).value = 'Subtotal'
    sheet.getCell(`E${currentRow}`).font = { bold: true }
    sheet.getCell(`F${currentRow}`).value = invoice.subtotal
    sheet.getCell(`F${currentRow}`).numFmt = `"${currencySymbol}"#,##0.00`
    currentRow++

    // Tax
    if (invoice.tax > 0) {
        sheet.getCell(`E${currentRow}`).value = 'Tax'
        sheet.getCell(`F${currentRow}`).value = invoice.tax
        sheet.getCell(`F${currentRow}`).numFmt = `"${currencySymbol}"#,##0.00`
        currentRow++
    }

    // Total
    currentRow++
    sheet.getCell(`E${currentRow}`).value = 'TOTAL'
    sheet.getCell(`E${currentRow}`).font = { size: 14, bold: true }
    sheet.getCell(`F${currentRow}`).value = invoice.total
    sheet.getCell(`F${currentRow}`).font = { size: 14, bold: true }
    sheet.getCell(`F${currentRow}`).numFmt = `"${currencySymbol}"#,##0.00`
    sheet.getCell(`F${currentRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3B82F6' }
    }
    sheet.getCell(`F${currentRow}`).font = { color: { argb: 'FFFFFF' }, size: 14, bold: true }

    // Write buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return buffer as Buffer
  }

  private static async generateQRCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text)
    } catch (err) {
      console.error(err)
      return ''
    }
  }

  static async generateDOCX(invoice: Invoice, businessProfile: BusinessProfile): Promise<Buffer> {
    const currency = invoice.currency || 'USD'
    const currencySymbol = ({ USD: '$', EUR: '€', GBP: '£', JPY: '¥' } as Record<string, string>)[currency] || '$'
    
    // Generate QR Code if payment link exists
    const paymentLink = invoice.paymentLink || (businessProfile as any).paymentLinks?.stripe || (businessProfile as any).paymentLinks?.paypal || ''
    let qrImageBuffer: Buffer | null = null
    
    if (paymentLink) {
        try {
            const qrDataUrl = await QRCode.toDataURL(paymentLink)
            const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "")
            qrImageBuffer = Buffer.from(base64Data, 'base64') as unknown as Buffer
        } catch (e) {
            console.error("Failed to generate QR for DOCX", e)
        }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header with business info
          ...this.createHeader(businessProfile, invoice),
          
          // Bill To Section
          ...this.createClientSection(invoice),
          
          // Line items table
          this.createLineItemsTable(invoice.lineItems, currencySymbol),
          
          // Totals
          ...this.createTotalsSection(invoice, currencySymbol),
          
          // QR Code & Payment Info
          ...(qrImageBuffer ? [
              new Paragraph({ text: '' }),
              new Paragraph({
                  children: [
                      new TextRun({ text: "Scan to Pay:", bold: true }),
                  ]
              }),
              new Paragraph({
                  children: [
                      new ImageRun({
                          data: qrImageBuffer,
                          transformation: { width: 100, height: 100 }
                      })
                  ]
              })
          ] : []),

          // Notes and terms
          ...this.createFooter(invoice),
        ],
      }],
    })

    return await Packer.toBuffer(doc)
  }

  static async generateHTML(invoice: Invoice, businessProfile: BusinessProfile): Promise<string> {
    const currency = invoice.currency || 'USD'
    const currencySymbol = ({ USD: '$', EUR: '€', GBP: '£', JPY: '¥' } as Record<string, string>)[currency] || '$'
    
    const paymentLink = invoice.paymentLink || (businessProfile as any).paymentLinks?.stripe || (businessProfile as any).paymentLinks?.paypal || ''
    const qrCodeUrl = paymentLink ? await this.generateQRCode(paymentLink) : ''

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; align-items: flex-start; }
          .brand h1 { font-size: 24px; font-weight: bold; margin: 0; color: #222; }
          .brand p { margin: 4px 0 0; color: #666; font-size: 14px; }
          .invoice-meta { text-align: right; }
          .invoice-meta h1 { font-size: 24px; color: #3b82f6; margin: 0 0 10px 0; letter-spacing: 1px; }
          .meta-row { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 4px; font-size: 14px; }
          .meta-label { font-weight: bold; color: #666; }
          
          .bill-to { background-color: #f9fafb; padding: 20px; border-radius: 4px; margin-bottom: 30px; }
          .bill-to h3 { margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #666; letter-spacing: 0.5px; }
          .bill-to p { margin: 0; font-weight: bold; font-size: 16px; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 1px solid #e5e7eb; }
          td { padding: 16px 8px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
          .col-right { text-align: right; }
          .col-center { text-align: center; }
          
          .totals-container { display: flex; justify-content: flex-end; margin-bottom: 40px; }
          .totals { width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .grand-total { background-color: #3b82f6; color: white; padding: 12px 16px; border-radius: 4px; margin-top: 8px; font-weight: bold; font-size: 16px; }
          
          .footer-section { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; border-top: 1px solid #f3f4f6; }
          .payment-methods h4 { margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #666; }
          .payment-methods p { margin: 0; font-size: 13px; color: #444; }
          
          .qr-section { text-align: right; }
          .qr-code { width: 100px; height: 100px; }
          
          .center-footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <h1>${businessProfile.name}</h1>
            <p>Professional Development Services</p>
            <p style="margin-top: 10px; font-size: 12px;">${businessProfile.email}</p>
          </div>
          <div class="invoice-meta">
            <h1>INVOICE</h1>
            <div class="meta-row">
              <span class="meta-label">#</span>
              <span>${invoice.invoiceNumber}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Date:</span>
              <span>${invoice.issueDate.toLocaleDateString()}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Due:</span>
              <span>${invoice.dueDate.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div class="bill-to">
          <h3>Bill To</h3>
          <p>${invoice.clientId}</p>
          ${invoice.clientAddress ? `<p style="font-size: 14px; font-weight: normal; margin-top: 4px;">${invoice.clientAddress.street || ''} ${invoice.clientAddress.city || ''}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th width="40%">Description</th>
              <th class="col-center" width="15%">Week</th>
              <th class="col-center" width="10%">Hours</th>
              <th class="col-right" width="15%">Rate</th>
              <th class="col-right" width="20%">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.lineItems.map(item => `
              <tr>
                <td>${item.description}</td>
                <td class="col-center">${item.week || '-'}</td>
                <td class="col-center">${item.quantity}</td>
                <td class="col-right">${currencySymbol}${item.rate.toFixed(2)}/hr</td>
                <td class="col-right">${currencySymbol}${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals-container">
          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${currencySymbol}${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${Array.isArray((invoice as any).taxes) ? (invoice as any).taxes.map((tax: any) => `
              <div class="total-row">
                <span>${tax.name} (${tax.rate}%)</span>
                <span>${currencySymbol}${tax.amount.toFixed(2)}</span>
              </div>
            `).join('') : ''}
            
            <div class="total-row grand-total">
              <span>TOTAL</span>
              <span>${currencySymbol}${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="footer-section">
          <div class="payment-methods">
            <h4>Payment Methods</h4>
            <p>${invoice.terms || 'Due within 30 days'}</p>
            <p style="margin-top: 8px;">${paymentLink ? 'Pay online via QR code' : 'Bank Transfer / Check'}</p>
          </div>
          
          ${qrCodeUrl ? `
          <div class="qr-section">
            <img src="${qrCodeUrl}" class="qr-code" alt="Payment QR Code" />
            <p style="font-size: 10px; color: #666; margin-top: 4px;">Scan to Pay</p>
          </div>
          ` : ''}
        </div>
        
        <div class="center-footer">
          Thank you for your business
        </div>
      </body>
      </html>
    `
  }

  private static createHeader(businessProfile: BusinessProfile, invoice: Invoice): Paragraph[] {
    return [
      new Paragraph({
        children: [
            new TextRun({ text: businessProfile.name, bold: true, size: 32 }),
            new TextRun({ text: "\t\t\t\t\t\tINVOICE", bold: true, size: 32, color: "3B82F6" }),
        ],
        tabStops: [{ type: "right", position: 9000 }], // Right align via tab
      }),
      new Paragraph({
          children: [
              new TextRun({ text: "Professional Development Services", size: 18, color: "666666" }),
              new TextRun({ text: `\t\t\t\t\t\t# ${invoice.invoiceNumber}`, size: 20 }),
          ],
          tabStops: [{ type: "right", position: 9000 }],
      }),
      new Paragraph({
          children: [
              new TextRun({ text: `\t\t\t\t\t\tDate: ${invoice.issueDate.toLocaleDateString()}`, size: 18 }),
          ],
          tabStops: [{ type: "right", position: 9000 }],
      }),
       new Paragraph({
          children: [
              new TextRun({ text: `\t\t\t\t\t\tDue: ${invoice.dueDate.toLocaleDateString()}`, size: 18 }),
          ],
          tabStops: [{ type: "right", position: 9000 }],
      }),
      new Paragraph({ text: '' }),
    ]
  }

  private static createClientSection(invoice: Invoice): Paragraph[] {
    return [
      new Paragraph({
        shading: { fill: "F9FAFB", type: "clear" },
        children: [
          new TextRun({ text: ' BILL TO', size: 16, color: "666666" }),
        ],
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({
        shading: { fill: "F9FAFB", type: "clear" },
        children: [
          new TextRun({ text: ` ${invoice.clientId}`, bold: true, size: 24 }),
        ],
        spacing: { after: 200 }
      }),
      new Paragraph({ text: '' }),
    ]
  }

  private static createLineItemsTable(items: LineItem[], currencySymbol: string): Table {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Week', bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Hours', bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Rate', bold: true })], alignment: AlignmentType.RIGHT })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Amount', bold: true })], alignment: AlignmentType.RIGHT })] }),
          ],
        }),
        ...items.map(item => 
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(item.description)] }),
              new TableCell({ children: [new Paragraph({ text: item.week || '-', alignment: AlignmentType.CENTER })] }),
              new TableCell({ children: [new Paragraph({ text: item.quantity.toString(), alignment: AlignmentType.CENTER })] }),
              new TableCell({ children: [new Paragraph({ text: `${currencySymbol}${item.rate.toFixed(2)}/hr`, alignment: AlignmentType.RIGHT })] }),
              new TableCell({ children: [new Paragraph({ text: `${currencySymbol}${item.amount.toFixed(2)}`, alignment: AlignmentType.RIGHT })] }),
            ],
          })
        ),
      ],
    })
  }

  private static createTotalsSection(invoice: Invoice, currencySymbol: string): Paragraph[] {
    const paragraphs: Paragraph[] = []
    paragraphs.push(new Paragraph({ text: '' })) // Spacer

    // Subtotal
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Subtotal: ', bold: true }),
          new TextRun(`${currencySymbol}${invoice.subtotal.toFixed(2)}`),
        ],
        alignment: AlignmentType.RIGHT,
      })
    )

    // Taxes
    const taxes: any = (invoice as any).taxes
    if (Array.isArray(taxes)) {
      taxes.forEach((tax: any) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${tax.name} (${tax.rate}%): `, bold: true }),
              new TextRun(`${currencySymbol}${tax.amount.toFixed(2)}`),
            ],
            alignment: AlignmentType.RIGHT,
          })
        )
      })
    } else if (typeof (invoice as any).tax === 'number' && (invoice as any).tax > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Tax: `, bold: true }),
            new TextRun(`${currencySymbol}${(invoice as any).tax.toFixed(2)}`),
          ],
          alignment: AlignmentType.RIGHT,
        })
      )
    }

    // Discounts
    const discounts: any = (invoice as any).discounts
    if (Array.isArray(discounts)) {
      discounts.forEach((discount: any) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${discount.description}: `, bold: true }),
              new TextRun(`-${currencySymbol}${discount.amount.toFixed(2)}`),
            ],
            alignment: AlignmentType.RIGHT,
          })
        )
      })
    } else if (typeof invoice.discount === 'number' && invoice.discount) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Discount: `, bold: true }),
            new TextRun(`-${currencySymbol}${invoice.discount.toFixed(2)}`),
          ],
          alignment: AlignmentType.RIGHT,
        })
      )
    }

    // Total
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'TOTAL: ', bold: true, size: 28, color: "FFFFFF" }),
          new TextRun({ text: ` ${currencySymbol}${invoice.total.toFixed(2)} `, size: 28, color: "FFFFFF" }),
        ],
        alignment: AlignmentType.RIGHT,
        shading: { fill: "3B82F6", type: "clear" }, // Blue background
        spacing: { before: 200 }
      })
    )

    return paragraphs
  }

  private static createFooter(invoice: Invoice): Paragraph[] {
    const paragraphs: Paragraph[] = []

    if (invoice.notes) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Notes:', bold: true }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun(invoice.notes),
          ],
        }),
        new Paragraph({ text: '' })
      )
    }

    if (invoice.terms) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Terms:', bold: true }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun(invoice.terms),
          ],
        })
      )
    }

    return paragraphs
  }
}
