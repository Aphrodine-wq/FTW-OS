import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus } from 'lucide-react'
import { Product, LineItem } from '@/types/invoice'

interface LineItemEditorProps {
  items: LineItem[]
  products: Product[]
  onChange: (items: LineItem[]) => void
  currency: string
}

export function LineItemEditor({ items, products, onChange, currency }: LineItemEditorProps) {
  const [showProductSuggestions, setShowProductSuggestions] = useState<string | null>(null)

  const handleLineItemChange = (id: string, field: string, value: any) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate)
        }
        return updatedItem
      }
      return item
    })
    onChange(newItems)
  }

  const handleProductSelect = (productId: string, itemId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      const newItems = items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            description: product.name,
            rate: product.unitPrice,
            amount: Number(item.quantity) * product.unitPrice
          }
        }
        return item
      })
      onChange(newItems)
    }
    setShowProductSuggestions(null)
  }

  const addItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }
    onChange([...items, newItem])
  }

  const removeItem = (id: string) => {
    onChange(items.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Line Items</label>
        <Button variant="ghost" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border space-y-3">
            <div className="flex gap-2 items-start relative">
              <div className="flex-1 relative space-y-2">
                <Input 
                  value={item.description}
                  onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                  placeholder="Description"
                  onFocus={() => setShowProductSuggestions(item.id)}
                />
                
                {/* Product Autocomplete */}
                {showProductSuggestions === item.id && products.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
                    {products.map(p => (
                      <div 
                        key={p.id} 
                        className="p-2 hover:bg-accent cursor-pointer text-sm flex justify-between"
                        onClick={() => handleProductSelect(p.id, item.id)}
                      >
                        <span>{p.name}</span>
                        <span className="text-muted-foreground">${p.unitPrice}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-20">
                 <Input 
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleLineItemChange(item.id, 'quantity', Number(e.target.value))}
                  placeholder="Qty"
                />
              </div>

              <div className="w-24">
                <Input 
                  type="number"
                  value={item.rate}
                  onChange={(e) => handleLineItemChange(item.id, 'rate', Number(e.target.value))}
                  placeholder="Rate"
                />
              </div>

              <div className="w-24 py-2 px-3 text-right font-mono text-sm font-bold bg-muted rounded-md">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(item.amount)}
              </div>

              <Button 
                variant="ghost" 
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <Textarea 
                className="h-16 text-xs resize-none bg-white dark:bg-slate-950"
                placeholder="Additional item details (optional)..."
                value={item.details || ''}
                onChange={(e) => handleLineItemChange(item.id, 'details', e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}