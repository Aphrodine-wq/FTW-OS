import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, TrendingUp, Users, Share2, 
  Instagram, Twitter, Linkedin, Facebook,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { cn } from '@/services/utils'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const MOCK_DATA = [
  { name: 'Mon', followers: 1040, engagement: 240 },
  { name: 'Tue', followers: 1080, engagement: 300 },
  { name: 'Wed', followers: 1150, engagement: 280 },
  { name: 'Thu', followers: 1220, engagement: 450 },
  { name: 'Fri', followers: 1300, engagement: 400 },
  { name: 'Sat', followers: 1380, engagement: 500 },
  { name: 'Sun', followers: 1450, engagement: 480 },
]

export function MarketingDashboard() {
  return (
    <div className="space-y-6 h-full flex flex-col overflow-y-auto p-2">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Marketing Center</h2>
          <p className="text-muted-foreground">Track your brand growth and social reach</p>
        </div>
        <Button className="gap-2">
            <Share2 className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: 'Total Followers', value: '12.5K', change: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Engagement Rate', value: '5.2%', change: '+0.8%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Reach', value: '45.2K', change: '-2.4%', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'Click Through', value: '1.8%', change: '+0.4%', icon: ArrowUpRight, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
            <Card key={i}>
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                        <span className={cn(
                            "text-xs font-medium flex items-center gap-1 mt-1",
                            stat.change.startsWith('+') ? "text-green-600" : "text-red-600"
                        )}>
                            {stat.change.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {stat.change} vs last week
                        </span>
                    </div>
                    <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                        <stat.icon className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Audience Growth</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_DATA}>
                            <defs>
                                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="followers" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFollowers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card>
            <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {[
                    { name: 'Twitter / X', handle: '@ftw_os', icon: Twitter, status: 'Connected', color: 'text-sky-500' },
                    { name: 'LinkedIn', handle: 'FTW Systems', icon: Linkedin, status: 'Connected', color: 'text-blue-700' },
                    { name: 'Instagram', handle: '@ftw.life', icon: Instagram, status: 'Connect', color: 'text-pink-600' },
                    { name: 'Facebook', handle: 'FTW Page', icon: Facebook, status: 'Connect', color: 'text-blue-600' },
                ].map((account, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <account.icon className={cn("h-5 w-5", account.color)} />
                            <div>
                                <p className="font-medium text-sm">{account.name}</p>
                                <p className="text-xs text-muted-foreground">{account.handle}</p>
                            </div>
                        </div>
                        <Button variant={account.status === 'Connected' ? "outline" : "default"} size="sm" className="h-7 text-xs">
                            {account.status}
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
