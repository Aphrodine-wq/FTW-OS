import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, DollarSign, Calendar, FileText, 
  TrendingUp, AlertCircle, Download, Upload, Folder,
  BarChart3, PieChart as PieChartIcon, FileSpreadsheet, FileDown
} from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts'
import { useExpenseStore } from '@/stores/expense-store'
import { useInvoiceStore } from '@/stores/invoice-store'
import { useSettingsStore } from '@/stores/settings-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import { format, addMonths, startOfQuarter, endOfQuarter, isBefore, isAfter, differenceInDays } from 'date-fns'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

interface TaxDocument {
  id: string
  name: string
  type: 'w2' | '1099' | 'receipt' | 'other'
  year: number
  quarter?: number
  fileUrl?: string
  uploadedAt: Date
}

export function TaxVault() {
  const { expenses, loadExpenses } = useExpenseStore()
  const { invoices, fetchInvoices } = useInvoiceStore()
  const { preferences } = useSettingsStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'overview' | 'quarterly' | 'documents' | 'comparison'>('overview')
  const [taxYear, setTaxYear] = useState(new Date().getFullYear())
  const [documents, setDocuments] = useState<TaxDocument[]>([])
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)

  useEffect(() => {
    loadExpenses()
    fetchInvoices()
  }, [])

  // Calculate quarterly data
  const quarterlyData = useMemo(() => {
    const quarters = [1, 2, 3, 4].map(q => {
      const quarterStart = new Date(taxYear, (q - 1) * 3, 1)
      const quarterEnd = endOfQuarter(quarterStart)
      
      const quarterInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.issueDate)
        return invDate >= quarterStart && invDate <= quarterEnd && inv.status === 'paid'
      })
      
      const quarterExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date)
        return expDate >= quarterStart && expDate <= quarterEnd
      })
      
      const income = quarterInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
      const deductions = quarterExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
      const taxable = Math.max(0, income - deductions)
      const taxRate = (preferences.defaultTaxRate || 25) / 100
      const estimatedTax = taxable * taxRate
      
      return {
        quarter: q,
        income,
        deductions,
        taxable,
        estimatedTax,
        paidInvoices: quarterInvoices.length,
        expenseCount: quarterExpenses.length
      }
    })
    
    return quarters
  }, [invoices, expenses, taxYear, preferences.defaultTaxRate])

  // Calculate Real Data
  const stats = useMemo(() => {
    // Filter by tax year
    const yearInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.issueDate)
      return invDate.getFullYear() === taxYear && inv.status === 'paid'
    })
    
    const yearExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date)
      return expDate.getFullYear() === taxYear
    })
    
    // 1. Total Income (Invoices Paid)
    const totalIncome = yearInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
    
    // 2. Total Deductions (Expenses)
    const totalDeductions = yearExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
    
    // 3. Taxable Income
    const taxableIncome = Math.max(0, totalIncome - totalDeductions)
    
    // 4. Estimated Tax (Using default rate from settings or 25% fallback)
    const taxRate = (preferences.defaultTaxRate || 25) / 100
    const estimatedTax = taxableIncome * taxRate
    
    // 5. Self-employment tax (15.3% on first $160,200 for 2024)
    const selfEmploymentTax = Math.min(taxableIncome, 160200) * 0.153
    
    // 6. Total estimated tax
    const totalEstimatedTax = estimatedTax + selfEmploymentTax

    // 7. Expense Categories for Chart
    const categoryMap: Record<string, number> = {}
    yearExpenses.forEach(e => {
        const cat = e.category || 'Uncategorized'
        categoryMap[cat] = (categoryMap[cat] || 0) + e.amount
    })
    
    const chartData = Object.entries(categoryMap).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
    }))

    return { 
      totalIncome, 
      totalDeductions, 
      taxableIncome, 
      estimatedTax, 
      selfEmploymentTax,
      totalEstimatedTax,
      chartData,
      yearInvoices: yearInvoices.length,
      yearExpenses: yearExpenses.length
    }
  }, [invoices, expenses, taxYear, preferences.defaultTaxRate])

  // Calculate upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const deadlines = [
      { date: new Date(currentYear, 3, 15), event: 'Federal Tax Return', type: 'annual' },
      { date: new Date(currentYear, 5, 15), event: 'Q2 Estimated Tax', type: 'quarterly' },
      { date: new Date(currentYear, 8, 15), event: 'Q3 Estimated Tax', type: 'quarterly' },
      { date: new Date(currentYear, 0, 15), event: 'Q4 Estimated Tax (Previous Year)', type: 'quarterly' },
    ]
    
    return deadlines
      .filter(d => isAfter(d.date, now) || differenceInDays(now, d.date) < 30)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(d => ({
        ...d,
        daysUntil: differenceInDays(d.date, now),
        status: differenceInDays(d.date, now) < 0 ? 'overdue' : differenceInDays(d.date, now) < 7 ? 'urgent' : 'upcoming'
      }))
  }, [])

  const handleExportReport = async (format: 'pdf' | 'excel') => {
    try {
      if (format === 'excel') {
        const workbook = new ExcelJS.Workbook()
        const overviewSheet = workbook.addWorksheet('Tax Overview')
        overviewSheet.columns = [
          { header: 'Metric', key: 'metric', width: 25 },
          { header: 'Amount', key: 'amount', width: 20 }
        ]
        overviewSheet.addRow({ metric: 'Total Income', amount: stats.totalIncome })
        overviewSheet.addRow({ metric: 'Total Deductions', amount: stats.totalDeductions })
        overviewSheet.addRow({ metric: 'Taxable Income', amount: stats.taxableIncome })
        overviewSheet.addRow({ metric: 'Estimated Tax', amount: stats.estimatedTax })
        overviewSheet.addRow({ metric: 'Self-Employment Tax', amount: stats.selfEmploymentTax })
        overviewSheet.addRow({ metric: 'Total Estimated Tax', amount: stats.totalEstimatedTax })
        
        const quarterlySheet = workbook.addWorksheet('Quarterly Breakdown')
        quarterlySheet.columns = [
          { header: 'Quarter', key: 'quarter', width: 10 },
          { header: 'Income', key: 'income', width: 15 },
          { header: 'Deductions', key: 'deductions', width: 15 },
          { header: 'Taxable Income', key: 'taxable', width: 15 },
          { header: 'Estimated Tax', key: 'estimatedTax', width: 15 }
        ]
        quarterlyData.forEach(q => {
          quarterlySheet.addRow({
            quarter: `Q${q.quarter}`,
            income: q.income,
            deductions: q.deductions,
            taxable: q.taxable,
            estimatedTax: q.estimatedTax
          })
        })
        
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', `tax_report_${taxYear}.xlsx`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text(`Tax Report ${taxYear}`, 14, 20)
        doc.setFontSize(12)
        let y = 35
        doc.text(`Total Income: $${stats.totalIncome.toFixed(2)}`, 14, y)
        y += 10
        doc.text(`Total Deductions: $${stats.totalDeductions.toFixed(2)}`, 14, y)
        y += 10
        doc.text(`Taxable Income: $${stats.taxableIncome.toFixed(2)}`, 14, y)
        y += 10
        doc.text(`Estimated Tax: $${stats.totalEstimatedTax.toFixed(2)}`, 14, y)
        doc.save(`tax_report_${taxYear}.pdf`)
      }
      toast({ title: "Report Exported", description: `Tax report exported as ${format.toUpperCase()}` })
    } catch (error) {
      toast({ title: "Export Failed", description: "Failed to export report", variant: "destructive" })
    }
  }

  const handleDocumentUpload = (file: File, type: TaxDocument['type'], quarter?: number) => {
    const doc: TaxDocument = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type,
      year: taxYear,
      quarter,
      uploadedAt: new Date()
    }
    setDocuments([...documents, doc])
    toast({ title: "Document Uploaded", description: "Tax document added to vault" })
  }

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tax Vault</h2>
          <p className="text-muted-foreground">
            Real-time tax estimation for {taxYear} based on {stats.yearInvoices} invoices and {stats.yearExpenses} expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={String(taxYear)} onValueChange={(v) => setTaxYear(Number(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={() => handleExportReport('excel')}>
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleExportReport('pdf')}>
            <FileDown className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="comparison">Year Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Estimated Tax Card */}
            <Card className="bg-slate-900 text-white border-slate-800">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Calculator className="h-6 w-6 text-blue-400" />
                        </div>
                        <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                            {taxYear} YTD
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-slate-400">Total Estimated Tax</p>
                        <h3 className="text-4xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalEstimatedTax)}
                        </h3>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-800 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Income Tax ({preferences.defaultTaxRate || 25}%)</span>
                            <span className="font-bold text-white">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.estimatedTax)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Self-Employment Tax</span>
                            <span className="font-bold text-white">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.selfEmploymentTax)}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-800">
                            <span className="text-slate-400">Taxable Income</span>
                            <span className="font-bold text-white">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.taxableIncome)}
                            </span>
                        </div>
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
                    {upcomingDeadlines.length > 0 ? (
                        upcomingDeadlines.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-center justify-center w-10 h-10 bg-slate-100 rounded-lg font-bold text-xs">
                                        <span>{format(item.date, 'MMM')}</span>
                                        <span className="text-sm">{format(item.date, 'd')}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-sm block">{item.event}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {item.daysUntil < 0 
                                              ? `${Math.abs(item.daysUntil)} days overdue`
                                              : `${item.daysUntil} days remaining`}
                                        </span>
                                    </div>
                                </div>
                                <Badge 
                                  variant={item.status === 'overdue' ? 'destructive' : item.status === 'urgent' ? 'default' : 'secondary'}
                                >
                                    {item.status}
                                </Badge>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-4">
                            No upcoming deadlines
                        </div>
                    )}
                </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Income vs Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Income', value: stats.totalIncome },
                                { name: 'Deductions', value: stats.totalDeductions },
                                { name: 'Taxable', value: stats.taxableIncome }
                            ]}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                                <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Income</span>
                        <span className="font-bold text-green-600">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalIncome)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Deductions</span>
                        <span className="font-bold text-blue-600">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalDeductions)}
                        </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Taxable Income</span>
                        <span className="font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.taxableIncome)}
                        </span>
                    </div>
                </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Breakdown</CardTitle>
              <CardDescription>Tax estimates by quarter for {taxYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quarterlyData}>
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" name="Income" />
                    <Bar dataKey="deductions" fill="#3b82f6" name="Deductions" />
                    <Bar dataKey="estimatedTax" fill="#ef4444" name="Estimated Tax" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                {quarterlyData.map(q => (
                  <Card key={q.quarter}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Q{q.quarter}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Income</span>
                        <span className="font-medium">${q.income.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deductions</span>
                        <span className="font-medium">${q.deductions.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Est. Tax</span>
                        <span className="font-bold text-red-600">${q.estimatedTax.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Tax Documents</h3>
              <p className="text-sm text-muted-foreground">Store and organize your tax documents</p>
            </div>
            <Button onClick={() => setShowDocumentDialog(true)}>
              <Upload className="h-4 w-4 mr-2" /> Upload Document
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.length > 0 ? (
              documents.map(doc => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Folder className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.type.toUpperCase()} • {doc.year} {doc.quarter ? `Q${doc.quarter}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="p-12 text-center">
                  <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Comparison</CardTitle>
              <CardDescription>Compare tax data across years</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Year comparison feature coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Upload Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Tax Document</DialogTitle>
            <DialogDescription>Add a tax document to your vault</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Document Type</Label>
              <Select onValueChange={(v: TaxDocument['type']) => setCurrentExpense({ ...currentExpense, taxCategory: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="w2">W-2</SelectItem>
                  <SelectItem value="1099">1099</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quarter (Optional)</Label>
              <Select onValueChange={(v) => {
                const quarter = v ? Number(v) : undefined
                // Store in a temporary state
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1</SelectItem>
                  <SelectItem value="2">Q2</SelectItem>
                  <SelectItem value="3">Q3</SelectItem>
                  <SelectItem value="4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>File</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleDocumentUpload(file, 'other')
                    setShowDocumentDialog(false)
                  }
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
