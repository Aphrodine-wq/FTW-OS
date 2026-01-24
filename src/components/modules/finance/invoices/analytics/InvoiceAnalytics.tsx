import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Invoice } from '@/types/invoice'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, Clock } from 'lucide-react'

interface InvoiceAnalyticsProps {
  invoices: Invoice[]
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function InvoiceAnalytics({ invoices }: InvoiceAnalyticsProps) {
  // Revenue by month (last 6 months)
  const revenueByMonth = useMemo(() => {
    const now = new Date()
    const sixMonthsAgo = subMonths(now, 5)
    const months = eachMonthOfInterval({ start: startOfMonth(sixMonthsAgo), end: endOfMonth(now) })
    
    return months.map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const monthInvoices = invoices.filter(inv => {
        const date = new Date(inv.issueDate)
        return date >= monthStart && date <= monthEnd
      })
      
      const total = monthInvoices.reduce((sum, inv) => sum + inv.total, 0)
      const paid = monthInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
      
      return {
        month: format(month, 'MMM'),
        fullMonth: format(month, 'MMMM yyyy'),
        total,
        paid,
        count: monthInvoices.length
      }
    })
  }, [invoices])

  // Status distribution
  const statusDistribution = useMemo(() => {
    const distribution = invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(distribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      amount: invoices.filter(inv => inv.status === status).reduce((sum, inv) => sum + inv.total, 0)
    }))
  }, [invoices])

  // Top clients by revenue
  const topClients = useMemo(() => {
    const clientRevenue = invoices.reduce((acc, inv) => {
      acc[inv.clientId] = (acc[inv.clientId] || 0) + inv.total
      return acc
    }, {} as Record<string, number>)

    return Object.entries(clientRevenue)
      .map(([client, revenue]) => ({ client, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [invoices])

  // Key metrics
  const metrics = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const paidRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
    const avgInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0
    const collectionRate = totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0
    
    // Calculate month-over-month growth
    const thisMonth = revenueByMonth[revenueByMonth.length - 1]?.total || 0
    const lastMonth = revenueByMonth[revenueByMonth.length - 2]?.total || 0
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    const uniqueClients = new Set(invoices.map(inv => inv.clientId)).size

    return {
      totalRevenue,
      paidRevenue,
      avgInvoiceValue,
      collectionRate,
      growth,
      uniqueClients,
      totalInvoices: invoices.length
    }
  }, [invoices, revenueByMonth])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                <div className={`flex items-center text-xs mt-1 ${metrics.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.growth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(metrics.growth).toFixed(1)}% vs last month
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Collection Rate</p>
                <p className="text-2xl font-bold">{metrics.collectionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(metrics.paidRevenue)} collected</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Invoice</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.avgInvoiceValue)}</p>
                <p className="text-xs text-muted-foreground mt-1">{metrics.totalInvoices} invoices</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Clients</p>
                <p className="text-2xl font-bold">{metrics.uniqueClients}</p>
                <p className="text-xs text-muted-foreground mt-1">unique clients</p>
              </div>
              <Users className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelFormatter={(label) => revenueByMonth.find(m => m.month === label)?.fullMonth}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} name="Paid" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Invoice Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value} invoices`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span>{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{item.value}</span>
                      <span className="text-muted-foreground ml-2">({formatCurrency(item.amount)})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Top Clients by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topClients} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="client" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
