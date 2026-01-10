import { Invoice, LineItem, Discount, Tax, BusinessProfile } from '@/types/invoice'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType } from 'docx'

export class InvoiceGenerator {
  static async generateDOCX(invoice: Invoice, businessProfile: BusinessProfile): Promise<Buffer> {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header with business info
          ...this.createHeader(businessProfile),
          
          // Invoice details
          ...this.createInvoiceDetails(invoice),
          
          // Client info
          ...this.createClientSection(invoice),
          
          // Line items table
          ...this.createLineItemsTable(invoice.lineItems),
          
          // Totals
          ...this.createTotalsSection(invoice),
          
          // Notes and terms
          ...this.createFooter(invoice),
        ],
      }],
    })

    return await Packer.toBuffer(doc)
  }

  static async generateHTML(invoice: Invoice, businessProfile: BusinessProfile): Promise<string> {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .invoice-details { margin-bottom: 30px; }
          .client-info { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .totals { text-align: right; margin-bottom: 30px; }
          .total-row { font-weight: bold; font-size: 18px; }
          .footer { margin-top: 40px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${businessProfile.name}</h1>
            <p>${businessProfile.address.street || ''}</p>
            <p>${businessProfile.address.city || ''} ${businessProfile.address.state || ''} ${businessProfile.address.zipCode || ''}</p>
            <p>${businessProfile.email}</p>
            <p>${businessProfile.phone}</p>
          </div>
          <div>
            <h1>INVOICE</h1>
            <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${invoice.issueDate.toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
          </div>
        </div>

        <div class="client-info">
          <h3>Bill To:</h3>
          <p><strong>${invoice.clientId}</strong></p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.lineItems.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${item.rate.toFixed(2)}</td>
                <td>$${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
          ${invoice.taxes.map(tax => `<p><strong>${tax.name} (${tax.rate}%):</strong> $${tax.amount.toFixed(2)}</p>`).join('')}
          ${invoice.discounts.map(discount => `<p><strong>${discount.description}:</strong> -$${discount.amount.toFixed(2)}</p>`).join('')}
          <p class="total-row"><strong>Total:</strong> $${invoice.total.toFixed(2)}</p>
        </div>

        ${invoice.notes ? `<div class="footer"><h4>Notes:</h4><p>${invoice.notes}</p></div>` : ''}
        ${invoice.terms ? `<div class="footer"><h4>Terms:</h4><p>${invoice.terms}</p></div>` : ''}
      </body>
      </html>
    `
  }

  private static createHeader(businessProfile: BusinessProfile): Paragraph[] {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: businessProfile.name,
            bold: true,
            size: 32,
          }),
        ],
        alignment: AlignmentType.RIGHT,
      }),
      new Paragraph({
        children: [
          new TextRun(businessProfile.address.street || ''),
        ],
        alignment: AlignmentType.RIGHT,
      }),
      new Paragraph({
        children: [
          new TextRun(`${businessProfile.address.city || ''} ${businessProfile.address.state || ''} ${businessProfile.address.zipCode || ''}`),
        ],
        alignment: AlignmentType.RIGHT,
      }),
      new Paragraph({
        children: [
          new TextRun(businessProfile.email),
        ],
        alignment: AlignmentType.RIGHT,
      }),
      new Paragraph({
        children: [
          new TextRun(businessProfile.phone),
        ],
        alignment: AlignmentType.RIGHT,
      }),
      new Paragraph({ text: '' }), // Spacer
    ]
  }

  private static createInvoiceDetails(invoice: Invoice): Paragraph[] {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: 'INVOICE',
            bold: true,
            size: 28,
          }),
        ],
        alignment: AlignmentType.LEFT,
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Invoice #: ', bold: true }),
          new TextRun(invoice.invoiceNumber),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Date: ', bold: true }),
          new TextRun(invoice.issueDate.toLocaleDateString()),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Due Date: ', bold: true }),
          new TextRun(invoice.dueDate.toLocaleDateString()),
        ],
      }),
      new Paragraph({ text: '' }), // Spacer
    ]
  }

  private static createClientSection(invoice: Invoice): Paragraph[] {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: 'Bill To:',
            bold: true,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun(invoice.clientId),
        ],
      }),
      new Paragraph({ text: '' }), // Spacer
    ]
  }

  private static createLineItemsTable(items: LineItem[]): Table {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true })], alignment: AlignmentType.LEFT })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Quantity', bold: true })], alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Rate', bold: true })], alignment: AlignmentType.RIGHT })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Amount', bold: true })], alignment: AlignmentType.RIGHT })],
            }),
          ],
        }),
        ...items.map(item => 
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun(item.description)], alignment: AlignmentType.LEFT })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun(item.quantity.toString())], alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun(`$${item.rate.toFixed(2)}`)], alignment: AlignmentType.RIGHT })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun(`$${item.amount.toFixed(2)}`)], alignment: AlignmentType.RIGHT })],
              }),
            ],
          })
        ),
      ],
    })
  }

  private static createTotalsSection(invoice: Invoice): Paragraph[] {
    const paragraphs: Paragraph[] = []

    // Subtotal
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Subtotal: ', bold: true }),
          new TextRun(`$${invoice.subtotal.toFixed(2)}`),
        ],
        alignment: AlignmentType.RIGHT,
      })
    )

    // Taxes
    invoice.taxes.forEach(tax => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${tax.name} (${tax.rate}%): `, bold: true }),
            new TextRun(`$${tax.amount.toFixed(2)}`),
          ],
          alignment: AlignmentType.RIGHT,
        })
      )
    })

    // Discounts
    invoice.discounts.forEach(discount => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${discount.description}: `, bold: true }),
            new TextRun(`-$${discount.amount.toFixed(2)}`),
          ],
          alignment: AlignmentType.RIGHT,
        })
      )
    })

    // Total
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Total: ', bold: true, size: 24 }),
          new TextRun({ text: `$${invoice.total.toFixed(2)}`, size: 24 }),
        ],
        alignment: AlignmentType.RIGHT,
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
