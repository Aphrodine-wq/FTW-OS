import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, DollarSign, Calendar, FileText, 
  Send, Plus, Download
} from 'lucide-react'

const CONTRACTORS = [
  { id: '1', name: 'Alex Design', role: 'Designer', rate: '$85/hr', status: 'Active', lastPaid: 'Jan 01' },
  { id: '2', name: 'Dev Squad', role: 'Frontend', rate: '$120/hr', status: 'Active', lastPaid: 'Jan 01' },
  { id: '3', name: 'Copy Pro', role: 'Writer', rate: '$0.15/word', status: 'Paused', lastPaid: 'Dec 15' },
]

export function PayrollLite() {
  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll Lite</h2>
          <p className="text-muted-foreground">Manage contractors and payment runs</p>
        </div>
        <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Send className="h-4 w-4" /> Run Payroll
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Monthly Burn</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">$4,850</div>
                <p className="text-xs text-muted-foreground mt-1">+12% vs last month</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Active Contractors</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">2</div>
                <p className="text-xs text-muted-foreground mt-1">1 Paused</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">Feb 01</div>
                <p className="text-xs text-muted-foreground mt-1">Est. $2,400</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contractor List</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add New
            </Button>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-left">
                        <tr>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Rate</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Last Paid</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {CONTRACTORS.map((c) => (
                            <tr key={c.id} className="group hover:bg-slate-50">
                                <td className="p-4 font-medium flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                                        {c.name[0]}
                                    </div>
                                    {c.name}
                                </td>
                                <td className="p-4">{c.role}</td>
                                <td className="p-4 font-mono">{c.rate}</td>
                                <td className="p-4">
                                    <Badge variant={c.status === 'Active' ? 'default' : 'secondary'}>
                                        {c.status}
                                    </Badge>
                                </td>
                                <td className="p-4 text-slate-500">{c.lastPaid}</td>
                                <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm">Pay</Button>
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
