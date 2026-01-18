import React, { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator, DollarSign, Calendar, FileText, 
  TrendingUp, AlertCircle, Download
} from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { useExpenseStore } from '@/stores/expense-store'
import { useInvoiceStore } from '@/stores/invoice-store'
import { useSettingsStore } from '@/stores/settings-store'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

export function TaxVault() {
  const { expenses, loadExpenses } = useExpenseStore()
  const { invoices, fetchInvoices } = useInvoiceStore()
  const { preferences } = useSettingsStore()

  useEffect(() => {
    loadExpenses()
    fetchInvoices()
  }, [])

  // Calculate Real Data
  const stats = useMemo(() => {
    // 1. Total Income (Invoices Paid) - For simplicity we take all for now, or filter by status if available
    const totalIncome = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
    
    // 2. Total Deductions (Expenses)
    const totalDeductions = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
    
    // 3. Taxable Income
    const taxableIncome = Math.max(0, totalIncome - totalDeductions)
    
    // 4. Estimated Tax (Using default rate from settings or 25% fallback)
    const taxRate = (preferences.defaultTaxRate || 25) / 100
    const estimatedTax = taxableIncome * taxRate

    // 5. Expense Categories for Chart
    const categoryMap: Record<string, number> = {}
    expenses.forEach(e => {
        const cat = e.category || 'Uncategorized'
        categoryMap[cat] = (categoryMap[cat] || 0) + e.amount
    })
    
    const chartData = Object.entries(categoryMap).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
    }))

    return { totalIncome, totalDeductions, taxableIncome, estimatedTax, chartData }
  }, [invoices, expenses, preferences.defaultTaxRate])

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tax Vault</h2>
          <p className="text-muted-foreground">Real-time tax estimation based on {invoices.length} invoices and {expenses.length} expenses</p>
        </div>
        <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Estimated Tax Card */}
        <Card className="bg-slate-900 text-white border-slate-800">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <Calculator className="h-6 w-6 text-blue-400" />
                    </div>
                    <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                        {new Date().getFullYear()} YTD
                    </Badge>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-slate-400">Estimated Tax Owed ({preferences.defaultTaxRate || 25}%)</p>
                    <h3 className="text-4xl font-bold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.estimatedTax)}
                    </h3>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between text-sm">
                    <span className="text-slate-400">Taxable Income</span>
                    <span className="font-bold text-white">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.taxableIncome)}
                    </span>
                </div>
            </CardContent>
        </Card>

        {/* Deduction Tracker */}
        <Card>
            <CardHeader>
                <CardTitle>Deductions Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                {stats.chartData.length > 0 ? (
                    <>
                        <div className="h-[200px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-2">
                            {stats.chartData.slice(0, 4).map(e => (
                                <div key={e.name} className="flex items-center gap-1 text-xs">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                                    {e.name}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                        No expenses logged yet.
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Tax Calendar */}
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {[
                    { date: 'Apr 15', event: 'Federal Tax Return', status: 'Upcoming', color: 'text-blue-600 bg-blue-50' },
                    { date: 'Jun 15', event: 'Q2 Estimated Tax', status: 'Future', color: 'text-slate-600 bg-slate-50' },
                    { date: 'Sep 15', event: 'Q3 Estimated Tax', status: 'Future', color: 'text-slate-600 bg-slate-50' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center w-10 h-10 bg-slate-100 rounded-lg font-bold text-xs">
                                <span>{item.date.split(' ')[0]}</span>
                                <span className="text-sm">{item.date.split(' ')[1]}</span>
                            </div>
                            <span className="font-medium text-sm">{item.event}</span>
                        </div>
                        <Badge variant="secondary" className={item.color}>
                            {item.status}
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
