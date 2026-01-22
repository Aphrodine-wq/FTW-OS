import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Laptop, Smartphone, Monitor, HardDrive, 
  Plus, Search, QrCode, Tag
} from 'lucide-react'
import { cn } from '@/services/utils'

const ASSETS = [
  { id: '1', name: 'MacBook Pro M3', type: 'Laptop', serial: 'FVX29...', status: 'In Use', assignee: 'Walt' },
  { id: '2', name: 'Dell UltraSharp 32', type: 'Monitor', serial: 'DL92...', status: 'In Use', assignee: 'Walt' },
  { id: '3', name: 'iPhone 15 Pro', type: 'Phone', serial: 'IMEI...', status: 'Spare', assignee: '-' },
  { id: '4', name: 'Keychron Q1', type: 'Peripheral', serial: 'KCN...', status: 'In Use', assignee: 'Walt' },
]

export function AssetInventory() {
  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Asset Inventory</h2>
          <p className="text-muted-foreground">Track hardware, licenses, and assignments</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
                <QrCode className="h-4 w-4" /> Scan Tag
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" /> Add Asset
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
            { label: 'Total Assets', value: '12', icon: HardDrive, color: 'text-blue-500' },
            { label: 'Total Value', value: '$18,450', icon: Tag, color: 'text-green-500' },
            { label: 'Assigned', value: '8', icon: Laptop, color: 'text-purple-500' },
            { label: 'Spare', value: '4', icon: Smartphone, color: 'text-orange-500' },
        ].map((stat, i) => (
            <Card key={i}>
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                    </div>
                    <div className={cn("p-3 rounded-xl bg-slate-100", stat.color)}>
                        <stat.icon className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
            <div className="rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-left">
                        <tr>
                            <th className="p-4 font-medium">Asset Name</th>
                            <th className="p-4 font-medium">Type</th>
                            <th className="p-4 font-medium">Serial / Tag</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Assigned To</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {ASSETS.map((asset) => (
                            <tr key={asset.id} className="group hover:bg-slate-50">
                                <td className="p-4 font-medium">{asset.name}</td>
                                <td className="p-4">{asset.type}</td>
                                <td className="p-4 font-mono text-xs text-slate-500">{asset.serial}</td>
                                <td className="p-4">
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        asset.status === 'In Use' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                    )}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="p-4">{asset.assignee}</td>
                                <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm">Edit</Button>
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
