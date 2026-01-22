import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, TrendingUp, DollarSign, Target, 
  MousePointer2, Eye, Plus, Filter, MoreHorizontal
} from 'lucide-react'
import { cn } from '@/services/utils'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

const CAMPAIGNS = [
  { id: 1, name: 'Summer Sale Promo', platform: 'Facebook', status: 'Active', spend: 1250, clicks: 850, conversions: 42, roas: 3.5 },
  { id: 2, name: 'B2B Lead Gen', platform: 'LinkedIn', status: 'Active', spend: 2400, clicks: 320, conversions: 15, roas: 2.1 },
  { id: 3, name: 'Retargeting - Cart', platform: 'Google', status: 'Paused', spend: 800, clicks: 410, conversions: 28, roas: 4.2 },
  { id: 4, name: 'Brand Awareness', platform: 'Instagram', status: 'Ended', spend: 500, clicks: 1200, conversions: 5, roas: 0.8 },
]

const CHART_DATA = [
  { name: 'Mon', spend: 400, revenue: 1200 },
  { name: 'Tue', spend: 350, revenue: 900 },
  { name: 'Wed', spend: 500, revenue: 1600 },
  { name: 'Thu', spend: 450, revenue: 1400 },
  { name: 'Fri', spend: 600, revenue: 2100 },
  { name: 'Sat', spend: 550, revenue: 1800 },
  { name: 'Sun', spend: 400, revenue: 1300 },
]

export function AdManager() {
  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ad Manager</h2>
          <p className="text-muted-foreground">Track spend and optimize ROAS across platforms</p>
        </div>
        <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4" /> Create Campaign
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                        <h3 className="text-2xl font-bold mt-2">$4,950</h3>
                    </div>
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <DollarSign className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Impressions</p>
                        <h3 className="text-2xl font-bold mt-2">142.5K</h3>
                    </div>
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Eye className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Clicks</p>
                        <h3 className="text-2xl font-bold mt-2">2,780</h3>
                    </div>
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                        <MousePointer2 className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg ROAS</p>
                        <h3 className="text-2xl font-bold mt-2">2.8x</h3>
                    </div>
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                        <Target className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
            <CardTitle>Spend vs Revenue</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHART_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            cursor={{ fill: '#f3f4f6' }}
                        />
                        <Legend />
                        <Bar dataKey="spend" name="Ad Spend" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Campaigns</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
            </Button>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-left">
                        <tr>
                            <th className="p-4 font-medium">Campaign</th>
                            <th className="p-4 font-medium">Platform</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Spend</th>
                            <th className="p-4 font-medium text-right">Conv.</th>
                            <th className="p-4 font-medium text-right">ROAS</th>
                            <th className="p-4 font-medium w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {CAMPAIGNS.map((c) => (
                            <tr key={c.id} className="group hover:bg-slate-50">
                                <td className="p-4 font-medium">{c.name}</td>
                                <td className="p-4">{c.platform}</td>
                                <td className="p-4">
                                    <Badge variant={c.status === 'Active' ? 'default' : 'secondary'} className={
                                        c.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''
                                    }>
                                        {c.status}
                                    </Badge>
                                </td>
                                <td className="p-4 text-right">${c.spend.toLocaleString()}</td>
                                <td className="p-4 text-right">{c.conversions}</td>
                                <td className="p-4 text-right font-bold text-green-600">{c.roas}x</td>
                                <td className="p-4 text-center">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
