import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Globe, Copy, RefreshCw, Activity, 
  CheckCircle, AlertTriangle, Play
} from 'lucide-react'

const WEBHOOKS = [
  { id: '1', name: 'Stripe Events', url: 'https://ftw-os.com/hooks/stripe_v1', status: 'Healthy', lastPing: '2m ago' },
  { id: '2', name: 'GitHub Actions', url: 'https://ftw-os.com/hooks/gh_deploy', status: 'Healthy', lastPing: '1h ago' },
  { id: '3', name: 'Typeform', url: 'https://ftw-os.com/hooks/tf_leads', status: 'Error', lastPing: '4h ago' },
]

export function WebhookServer() {
  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Webhook Server</h2>
          <p className="text-muted-foreground">Manage incoming event streams</p>
        </div>
        <Button variant="outline" className="gap-2">
            <Activity className="h-4 w-4" /> View Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {WEBHOOKS.map(hook => (
            <Card key={hook.id}>
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-3 rounded-full",
                            hook.status === 'Healthy' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        )}>
                            <Globe className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold">{hook.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600 font-mono">
                                    {hook.url}
                                </code>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className={cn(
                                "text-sm font-bold flex items-center gap-1 justify-end",
                                hook.status === 'Healthy' ? "text-green-600" : "text-red-600"
                            )}>
                                {hook.status === 'Healthy' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                {hook.status}
                            </div>
                            <div className="text-xs text-muted-foreground">Last ping: {hook.lastPing}</div>
                        </div>
                        <Button variant="outline" size="sm">Test</Button>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  )
}

function cn(classes: string, condition: string) {
    return classes + " " + condition
}
