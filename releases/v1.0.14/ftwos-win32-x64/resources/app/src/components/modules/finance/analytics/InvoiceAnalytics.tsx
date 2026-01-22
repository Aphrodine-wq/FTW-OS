import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useInvoiceStore } from '@/stores/invoice-store'
import { DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/services/utils'

export function InvoiceAnalytics() {
  const { invoices } = useInvoiceStore()

  const stats = React.useMemo(() => {
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0)

    const outstanding = invoices
      .filter(i => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.total, 0)

    const overdue = invoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + i.total, 0)

    const averageValue = invoices.length > 0 
      ? invoices.reduce((sum, i) => sum + i.total, 0) / invoices.length 
      : 0

    return { totalRevenue, outstanding, overdue, averageValue }
  }, [invoices])

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">${value.toLocaleString()}</h3>
        </div>
        <div className={cn("p-3 rounded-full", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={stats.totalRevenue} 
          icon={DollarSign} 
          colorClass="bg-green-100 text-green-600"
        />
        <StatCard 
          title="Outstanding" 
          value={stats.outstanding} 
          icon={Clock} 
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="Overdue" 
          value={stats.overdue} 
          icon={AlertCircle} 
          colorClass="bg-red-100 text-red-600"
        />
        <StatCard 
          title="Average Invoice" 
          value={stats.averageValue} 
          icon={TrendingUp} 
          colorClass="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-[300px]">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.slice(0, 5).map(invoice => (
                <div key={invoice.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{invoice.clientId}</p>
                    <p className="text-xs text-slate-500">{invoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">${invoice.total.toLocaleString()}</p>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium capitalize",
                      invoice.status === 'paid' ? "bg-green-100 text-green-700" :
                      invoice.status === 'overdue' ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    )}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <p>No invoices found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for Chart */}
        <Card className="h-[300px] flex items-center justify-center bg-slate-50 border-dashed">
            <div className="text-center text-slate-400">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Revenue Chart Coming Soon</p>
            </div>
        </Card>
      </div>
    </div>
  )
}
