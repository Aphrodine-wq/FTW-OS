import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, TrendingUp, Users, Target, Zap, Mail, Phone, MessageSquare } from 'lucide-react'
import { Invoice, Client, Expense, TimeSession, Task, Product, Subscription, Proposal, Lead, Report, Integration, CurrencyRates } from '@/types/invoice'
import { format, startOfYear, endOfYear, subMonths, addMonths } from 'date-fns'
import { motion } from 'framer-motion'

interface AnalyticsDashboardProps {
  onNavigate: (tab: string) => void
}

export function AnalyticsDashboard({ onNavigate }: AnalyticsDashboardProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [sessions, setSessions] = useState<TimeSession[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates>({})
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const data = await Promise.all([
        window.ipcRenderer.invoke('db:get-invoices'),
        window.ipcRenderer.invoke('db:get-clients'),
        window.ipcRenderer.invoke('db:get-expenses'),
        window.ipcRenderer.invoke('tracker:get-sessions'),
        window.ipcRenderer.invoke('db:get-tasks'),
        window.ipcRenderer.invoke('db:get-products'),
        window.ipcRenderer.invoke('db:get-subscriptions'),
        window.ipcRenderer.invoke('db:get-proposals'),
        window.ipcRenderer.invoke('db:get-leads'),
        window.ipcRenderer.invoke('db:get-reports'),
        window.ipcRenderer.invoke('db:get-integrations'),
        window.ipcRenderer.invoke('settings:get-currency-rates')
      ])

      setInvoices(data[0] || [])
      setClients(data[1] || [])
      setExpenses(data[2] || [])
      setSessions(data[3] || [])
      setTasks(data[4] || [])
      setProducts(data[5] || [])
      setSubscriptions(data[6] || [])
      setProposals(data[7] || [])
      setLeads(data[8] || [])
      setReports(data[9] || [])
      setIntegrations(data[10] || [])
      setCurrencyRates(data[11] || {})
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const totalRevenue = useCallback(() => {
    return invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0)
  }, [invoices])

  const monthlyRevenue = useCallback(() => {
    const now = new Date()
    const start = timeRange === '7d' ? subMonths(now, 0) : timeRange === '30d' ? subMonths(now, 1) :
                 timeRange === '90d' ? subMonths(now, 3) : startOfYear(now)

    return invoices
      .filter(inv => inv.status === 'paid' && new Date(inv.paidDate || inv.issueDate) >= start)
      .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0)
  }, [invoices, timeRange])

  const totalExpenses = useCallback(() => {
    return expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)
  }, [expenses])

  const profitMargin = useCallback(() => {
    const revenue = totalRevenue()
    const expenses = totalExpenses()
    return revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0
  }, [totalRevenue, totalExpenses])

  const recurringRevenue = useCallback(() => {
    return subscriptions
      .filter(sub => sub.active)
      .reduce((sum, sub) => {
        const monthly = sub.billingCycle === 'monthly' ? sub.price :
                       sub.billingCycle === 'yearly' ? sub.price / 12 : 0
        return sum + monthly
      }, 0)
  }, [subscriptions])

  const productivityScore = useCallback(() => {
    const totalHours = sessions.reduce((sum, session) => sum + session.duration, 0) / 3600
    const completedTasks = tasks.filter(t => t.status === 'done').length
    const totalTasks = tasks.length
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 + (totalHours * 10) : 0
  }, [sessions, tasks])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics & Insights</h2>
          <p className="text-muted-foreground">Advanced business intelligence and forecasting</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-green-600">
                    ${totalRevenue().toLocaleString()}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {timeRange}: ${monthlyRevenue().toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                  <h3 className="text-2xl font-bold text-blue-600">
                    {profitMargin().toFixed(1)}%
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gross margin
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recurring Revenue</p>
                  <h3 className="text-2xl font-bold text-purple-600">
                    ${recurringRevenue().toLocaleString()}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    MRR from subscriptions
                  </p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Productivity Score</p>
                  <h3 className="text-2xl font-bold text-orange-600">
                    {productivityScore().toFixed(0)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on output & time
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Leads ({leads.length})</span>
                <Badge variant="outline">{leads.filter(l => l.status === 'prospect').length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Qualified ({leads.filter(l => ['qualified', 'proposal', 'won'].includes(l.status)).length})</span>
                <Badge variant="outline">{Math.round((leads.filter(l => ['qualified', 'proposal', 'won'].includes(l.status)).length / leads.length) * 100) || 0}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Proposals ({proposals.length})</span>
                <Badge variant="outline">{proposals.filter(p => p.status === 'sent').length} sent</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Won Deals ({leads.filter(l => l.status === 'won').length})</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {leads.filter(l => l.status === 'won').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Gmail</span>
                </div>
                <Badge variant={integrations.find(i => i.type === 'gmail')?.active ? "default" : "secondary"}>
                  {integrations.find(i => i.type === 'gmail')?.active ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Twilio SMS</span>
                </div>
                <Badge variant={integrations.find(i => i.type === 'twilio')?.active ? "default" : "secondary"}>
                  {integrations.find(i => i.type === 'twilio')?.active ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Stripe Payments</span>
                </div>
                <Badge variant={integrations.find(i => i.type === 'stripe')?.active ? "default" : "secondary"}>
                  {integrations.find(i => i.type === 'stripe')?.active ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto p-6 flex flex-col gap-2" onClick={() => onNavigate('reports')}>
          <TrendingUp className="h-6 w-6" />
          <span>Generate Reports</span>
        </Button>
        <Button variant="outline" className="h-auto p-6 flex flex-col gap-2" onClick={() => onNavigate('forecast')}>
          <Target className="h-6 w-6" />
          <span>Revenue Forecast</span>
        </Button>
        <Button variant="outline" className="h-auto p-6 flex flex-col gap-2" onClick={() => onNavigate('leads')}>
          <Users className="h-6 w-6" />
          <span>Lead Pipeline</span>
        </Button>
      </div>
    </div>
  )
}
