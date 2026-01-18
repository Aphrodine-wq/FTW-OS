import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Package, Edit, Trash2 } from 'lucide-react'
import { Product } from '@/types/invoice'
import { useToast } from '@/components/ui/use-toast'

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({})
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const saved = await window.ipcRenderer.invoke('db:get-products') || []
    setProducts(saved)
  }

  const handleSave = async () => {
    if (!currentProduct.name || !currentProduct.unitPrice) return

    const newProduct = {
      ...currentProduct,
      id: currentProduct.id || Math.random().toString(36).substr(2, 9),
      createdAt: currentProduct.createdAt || new Date(),
      updatedAt: new Date()
    } as Product

    let updatedProducts
    if (currentProduct.id) {
      updatedProducts = products.map(p => p.id === currentProduct.id ? newProduct : p)
    } else {
      updatedProducts = [...products, newProduct]
    }

    await window.ipcRenderer.invoke('db:save-products', updatedProducts)
    setProducts(updatedProducts)
    setIsEditing(false)
    setCurrentProduct({})
    
    toast({
      title: "Product Saved",
      description: `${newProduct.name} has been saved.`
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(p => p.id !== id)
      await window.ipcRenderer.invoke('db:save-products', updatedProducts)
      setProducts(updatedProducts)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.description?.toLowerCase() || '').includes(search.toLowerCase())
  )

  if (products.length === 0 && !isEditing && !search) {
      return (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                  <Package className="h-12 w-12" />
              </div>
              <div className="text-center">
                  <h2 className="text-xl font-bold">No Products Yet</h2>
                  <p className="text-muted-foreground">Create your first product or service to get started.</p>
              </div>
              <Button onClick={() => { setCurrentProduct({}); setIsEditing(true) }}>
                  <Plus className="mr-2 h-4 w-4" /> Create Product
              </Button>
          </div>
      )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Product Inventory</h2>
          <p className="text-muted-foreground">Manage your services and items</p>
        </div>
        <Button onClick={() => { setCurrentProduct({}); setIsEditing(true) }}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List Section */}
        <div className="md:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search products..."
              className="w-full pl-8 p-2 border rounded-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map(product => (
              <Card key={product.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.unitPrice)}
                      </div>
                      <div className="text-xs text-muted-foreground">{product.sku}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setCurrentProduct(product); setIsEditing(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                No products found
              </div>
            )}
          </div>
        </div>

        {/* Edit/Create Section */}
        {isEditing && (
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{currentProduct.id ? 'Edit Product' : 'New Product'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input 
                    className="w-full p-2 border rounded-md" 
                    value={currentProduct.name || ''}
                    onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                    placeholder="e.g. Web Design"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SKU (Optional)</label>
                  <input 
                    className="w-full p-2 border rounded-md" 
                    value={currentProduct.sku || ''}
                    onChange={(e) => setCurrentProduct({...currentProduct, sku: e.target.value})}
                    placeholder="e.g. SRV-001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit Price</label>
                  <input 
                    type="number"
                    className="w-full p-2 border rounded-md" 
                    value={currentProduct.unitPrice || ''}
                    onChange={(e) => setCurrentProduct({...currentProduct, unitPrice: Number(e.target.value)})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="w-full p-2 border rounded-md h-24 resize-none" 
                    value={currentProduct.description || ''}
                    onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                    placeholder="Product details..."
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
