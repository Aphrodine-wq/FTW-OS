import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Activity, CheckCircle, XCircle, Clock, 
  ArrowUp, Globe
} from 'lucide-react'
import { cn } from '@/services/utils'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

const MONITORS = [
  { id: '1', name: 'Main Website', url: 'https://ftw-os.com', status: 'Up', response: 120, uptime: '99.99%' },
  { id: '2', name: 'API Server', url: 'https://api.ftw-os.com', status: 'Up', response: 85, uptime: '99.95%' },
  { id: '3', name: 'Doc Portal', url: 'https://docs.ftw-os.com', status: 'Down', response: 0, uptime: '98.50%' },
]

const DATA = [
  { time: '10:00', ms: 120 },
  { time: '10:05', ms: 135 },
  { time: '10:10', ms: 110 },
  { time: '10:15', ms: 140 },
  { time: '10:20', ms: 125 },
  { time: '10:25', ms: 115 },
]

export function UptimeMonitor() {
  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Uptime Monitor</h2>
          <p className="text-muted-foreground">Global availability tracking</p>
        </div>
        <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4" /> Add Monitor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Global Status */}
        <Card className="md:col-span-3 bg-slate-900 text-white border-slate-800">
            <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-full animate-pulse">
                        <Activity className="h-8 w-8 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">All Systems Operational</h3>
                        <p className="text-slate-400 text-sm">Last incident: 12 days ago (DNS Resolution)</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-green-400">99.98%</div>
                    <div className="text-xs text-slate-500 uppercase">30-Day Uptime</div>
                </div>
            </CardContent>
        </Card>

        {/* Monitor List */}
        <div className="md:col-span-1 space-y-4">
            {MONITORS.map(m => (
                <Card key={m.id} className={cn("cursor-pointer border-l-4", m.status === 'Up' ? "border-l-green-500" : "border-l-red-500")}>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold flex items-center gap-2">
                                    {m.name}
                                    {m.status === 'Down' && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">DOWN</span>}
                                </h4>
                                <a href={m.url} target="_blank" className="text-xs text-slate-500 hover:underline">{m.url}</a>
                            </div>
                            <div className={cn("text-xs font-bold", m.status === 'Up' ? "text-green-600" : "text-red-600")}>
                                {m.response > 0 ? `${m.response}ms` : 'TIMEOUT'}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Detail Chart */}
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" /> Response Time (Main Website)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={DATA}>
                            <defs>
                                <linearGradient id="colorMs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="ms" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMs)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Plus } from 'lucide-react'
