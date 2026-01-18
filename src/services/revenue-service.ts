import { supabase } from './supabase'

interface InvoiceData {
  amount: number | null
  status: string
  created_at: string
  due_date: string | null
  paid_at: string | null
  client_id: string | null
  clients?: {
    name: string | null
  } | null
}

export interface RevenueMetrics {
  totalRevenue: number
  monthlyRevenue: number
  outstandingInvoices: number
  overdueInvoices: number
  averagePaymentTime: number
  topClients: Array<{
    name: string
    revenue: number
    percentage: number
  }>
  revenueTrend: Array<{
    month: string
    revenue: number
    growth: number
  }>
  paymentVelocity: number
  churnRisk: number
}

export interface RevenuePrediction {
  nextMonth: number
  confidence: number
  factors: string[]
  recommendations: string[]
}

class RevenueService {
  // Get comprehensive revenue metrics
  async getRevenueMetrics(userId?: string): Promise<RevenueMetrics> {
    try {
      // Get total revenue
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('amount, status, created_at, due_date, paid_at, client_id, clients(name)')
        .eq(userId ? 'user_id' : '', userId || '')
        .order('created_at', { ascending: false })

      if (error) throw error

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      // Calculate metrics
      const totalRevenue = invoices
        .filter((inv: InvoiceData) => inv.status === 'paid')
        .reduce((sum: number, inv: InvoiceData) => sum + (inv.amount || 0), 0)

      const monthlyRevenue = invoices
        .filter((inv: InvoiceData) => {
          const paidDate = new Date(inv.paid_at!)
          return inv.status === 'paid' &&
                 paidDate.getMonth() === currentMonth &&
                 paidDate.getFullYear() === currentYear
        })
        .reduce((sum: number, inv: InvoiceData) => sum + (inv.amount || 0), 0)

      const outstandingInvoices = invoices
        .filter((inv: InvoiceData) => inv.status === 'sent')
        .reduce((sum: number, inv: InvoiceData) => sum + (inv.amount || 0), 0)

      const overdueInvoices = invoices
        .filter((inv: InvoiceData) => {
          return inv.status === 'sent' &&
                 inv.due_date && new Date(inv.due_date) < now
        })
        .reduce((sum: number, inv: InvoiceData) => sum + (inv.amount || 0), 0)

      // Calculate average payment time
      const paidInvoices = invoices.filter((inv: InvoiceData) => inv.paid_at && inv.created_at)
      const paymentTimes = paidInvoices.map((inv: InvoiceData) => {
        const created = new Date(inv.created_at).getTime()
        const paid = new Date(inv.paid_at!).getTime()
        return (paid - created) / (1000 * 60 * 60 * 24) // days
      })

      const averagePaymentTime = paymentTimes.length > 0
        ? paymentTimes.reduce((sum: number, time: number) => sum + time, 0) / paymentTimes.length
        : 0

      // Top clients
      const clientRevenue = new Map<string, { name: string, revenue: number }>()
      invoices
        .filter((inv: InvoiceData) => inv.status === 'paid')
        .forEach((inv: InvoiceData) => {
          const clientId = inv.client_id || 'unknown'
          const clientName = inv.clients?.name || 'Unknown Client'
          const amount = inv.amount || 0

          if (clientRevenue.has(clientId)) {
            clientRevenue.get(clientId)!.revenue += amount
          } else {
            clientRevenue.set(clientId, { name: clientName, revenue: amount })
          }
        })

      const topClients = Array.from(clientRevenue.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(client => ({
          ...client,
          percentage: totalRevenue > 0 ? (client.revenue / totalRevenue) * 100 : 0
        }))

      // Revenue trend (last 6 months)
      const revenueTrend: Array<{ month: string; revenue: number; growth: number }> = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1)
        const monthRevenue = invoices
          .filter((inv: InvoiceData) => {
            if (!inv.paid_at) return false
            const paidDate = new Date(inv.paid_at)
            return paidDate.getMonth() === date.getMonth() &&
                   paidDate.getFullYear() === date.getFullYear() &&
                   inv.status === 'paid'
          })
          .reduce((sum: number, inv: InvoiceData) => sum + (inv.amount || 0), 0)

        revenueTrend.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthRevenue,
          growth: i === 5 ? 0 : ((monthRevenue - (revenueTrend[5-i-1]?.revenue || 0)) / (revenueTrend[5-i-1]?.revenue || 1)) * 100
        })
      }

      // Payment velocity (invoices paid this month / total sent this month)
      const sentThisMonth = invoices.filter((inv: InvoiceData) => {
        const createdDate = new Date(inv.created_at)
        return createdDate.getMonth() === currentMonth &&
               createdDate.getFullYear() === currentYear
      }).length

      const paidThisMonth = invoices.filter((inv: InvoiceData) => {
        if (!inv.paid_at) return false
        const paidDate = new Date(inv.paid_at)
        return paidDate.getMonth() === currentMonth &&
               paidDate.getFullYear() === currentYear &&
               inv.status === 'paid'
      }).length

      const paymentVelocity = sentThisMonth > 0 ? (paidThisMonth / sentThisMonth) * 100 : 0

      // Simple churn risk based on overdue invoices
      const churnRisk = overdueInvoices > 0 ? Math.min((overdueInvoices / outstandingInvoices) * 100, 100) : 0

      return {
        totalRevenue,
        monthlyRevenue,
        outstandingInvoices,
        overdueInvoices,
        averagePaymentTime,
        topClients,
        revenueTrend,
        paymentVelocity,
        churnRisk
      }
    } catch (error) {
      console.error('Error fetching revenue metrics:', error)
      throw error
    }
  }

  // Get revenue predictions
  async getRevenuePrediction(userId?: string): Promise<RevenuePrediction> {
    try {
      const metrics = await this.getRevenueMetrics(userId)

      // Simple linear regression for prediction
      const trend = metrics.revenueTrend.slice(-3) // Last 3 months
      if (trend.length < 2) {
        return {
          nextMonth: metrics.monthlyRevenue,
          confidence: 50,
          factors: ['Insufficient data for prediction'],
          recommendations: ['Continue tracking revenue for better predictions']
        }
      }

      // Calculate trend
      const revenues = trend.map(t => t.revenue)
      const avgGrowth = revenues.reduce((sum, rev, i) => {
        if (i === 0) return sum
        return sum + ((rev - revenues[i-1]) / revenues[i-1]) * 100
      }, 0) / (revenues.length - 1)

      const predictedRevenue = metrics.monthlyRevenue * (1 + avgGrowth / 100)
      const confidence = Math.max(30, Math.min(90, 50 + Math.abs(avgGrowth) * 2))

      const factors = []
      if (metrics.paymentVelocity > 80) factors.push('High payment velocity')
      if (metrics.churnRisk < 20) factors.push('Low churn risk')
      if (avgGrowth > 10) factors.push('Strong growth trend')
      if (metrics.outstandingInvoices > metrics.monthlyRevenue * 0.5) factors.push('High outstanding invoices')

      const recommendations = []
      if (metrics.churnRisk > 30) recommendations.push('Focus on collecting overdue invoices')
      if (metrics.paymentVelocity < 70) recommendations.push('Improve payment terms')
      if (avgGrowth < 0) recommendations.push('Analyze reasons for revenue decline')

      return {
        nextMonth: Math.max(0, predictedRevenue),
        confidence,
        factors,
        recommendations
      }
    } catch (error) {
      console.error('Error generating revenue prediction:', error)
      throw error
    }
  }

  // Get real-time revenue alerts
  async getRevenueAlerts(userId?: string): Promise<Array<{
    type: 'warning' | 'danger' | 'success'
    title: string
    message: string
    action?: string
  }>> {
    try {
      const metrics = await this.getRevenueMetrics(userId)
      const alerts: Array<{
        type: 'warning' | 'danger' | 'success'
        title: string
        message: string
        action?: string
      }> = []

      // Overdue invoices alert
      if (metrics.overdueInvoices > 0) {
        alerts.push({
          type: 'danger',
          title: 'Overdue Invoices',
          message: `$${metrics.overdueInvoices.toLocaleString()} in overdue invoices`,
          action: 'Send reminders'
        })
      }

      // High outstanding amount
      if (metrics.outstandingInvoices > metrics.monthlyRevenue * 0.8) {
        alerts.push({
          type: 'warning',
          title: 'High Outstanding Balance',
          message: `$${metrics.outstandingInvoices.toLocaleString()} still outstanding`,
          action: 'Follow up with clients'
        })
      }

      // Payment velocity low
      if (metrics.paymentVelocity < 60) {
        alerts.push({
          type: 'warning',
          title: 'Slow Payment Velocity',
          message: `Only ${metrics.paymentVelocity.toFixed(1)}% of invoices paid on time`,
          action: 'Review payment terms'
        })
      }

      // Revenue growth
      const recentTrend = metrics.revenueTrend.slice(-2)
      if (recentTrend.length === 2) {
        const growth = recentTrend[1].growth
        if (growth > 20) {
          alerts.push({
            type: 'success',
            title: 'Revenue Growth!',
            message: `+${growth.toFixed(1)}% revenue growth this month`,
            action: 'Celebrate success'
          })
        } else if (growth < -10) {
          alerts.push({
            type: 'warning',
            title: 'Revenue Decline',
            message: `${Math.abs(growth).toFixed(1)}% revenue decrease`,
            action: 'Analyze causes'
          })
        }
      }

      return alerts
    } catch (error) {
      console.error('Error fetching revenue alerts:', error)
      return []
    }
  }
}

export const revenueService = new RevenueService()
