import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Receipt, Edit, Trash2 } from 'lucide-react'
import { Expense } from '@/types/invoice'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { useExpenseStore } from '@/stores/expense-store'

export function ExpenseManager() {
  const { expenses, loadExpenses, addExpense, updateExpense, deleteExpense } = useExpenseStore()
  const [search, setSearch] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [currentExpense, setCurrentExpense] = useState<Partial<Expense>>({})
  const { toast } = useToast()

  useEffect(() => {
    loadExpenses()
  }, [])

  const handleSave = async () => {
    if (!currentExpense.description || !currentExpense.amount) return

    try {
        if (currentExpense.id) {
            await updateExpense(currentExpense.id, currentExpense)
            toast({ title: "Expense Updated", description: "Changes saved successfully." })
        } else {
            await addExpense({
                description: currentExpense.description,
                amount: currentExpense.amount,
                category: currentExpense.category || 'Other',
                date: currentExpense.date || new Date(),
            })
            toast({ title: "Expense Logged", description: "New expense added." })
        }
        setIsEditing(false)
        setCurrentExpense({})
    } catch (e) {
        toast({ title: "Error", description: "Failed to save expense.", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id)
      toast({ title: "Expense Deleted" })
    }
  }

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(search.toLowerCase()) || 
    e.category.toLowerCase().includes(search.toLowerCase())
  )

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expense Tracking</h2>
          <p className="text-muted-foreground">Monitor your business spending</p>
        </div>
        <Button onClick={() => { setCurrentExpense({ date: new Date() }); setIsEditing(true) }}>
          <Plus className="mr-2 h-4 w-4" /> Log Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List Section */}
        <div className="md:col-span-2 space-y-4">
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <span className="font-medium text-slate-600">Total Expenses</span>
              <span className="text-xl font-bold text-red-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalExpenses)}
              </span>
            </CardContent>
          </Card>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search expenses..."
              className="w-full pl-8 p-2 border rounded-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredExpenses.map(expense => (
              <Card key={expense.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{expense.description}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(expense.date, 'MMM dd, yyyy')} • {expense.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-red-600">
                      -{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expense.amount)}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setCurrentExpense(expense); setIsEditing(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredExpenses.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                No expenses found
              </div>
            )}
          </div>
        </div>

        {/* Edit/Create Section */}
        {isEditing && (
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{currentExpense.id ? 'Edit Expense' : 'Log Expense'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <input 
                    className="w-full p-2 border rounded-md" 
                    value={currentExpense.description || ''}
                    onChange={(e) => setCurrentExpense({...currentExpense, description: e.target.value})}
                    placeholder="e.g. Office Rent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <input 
                    type="number"
                    className="w-full p-2 border rounded-md" 
                    value={currentExpense.amount || ''}
                    onChange={(e) => setCurrentExpense({...currentExpense, amount: Number(e.target.value)})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={currentExpense.category || ''}
                    onChange={(e) => setCurrentExpense({...currentExpense, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    <option value="Operational">Operational</option>
                    <option value="Software">Software</option>
                    <option value="Office">Office Supplies</option>
                    <option value="Travel">Travel</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <input 
                    type="date"
                    className="w-full p-2 border rounded-md"
                    value={currentExpense.date ? format(currentExpense.date, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setCurrentExpense({...currentExpense, date: new Date(e.target.value)})}
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
