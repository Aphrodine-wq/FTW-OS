import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Box, Play, Square, RotateCw, 
  Terminal, Trash2, Layers
} from 'lucide-react'
import { cn } from '@/services/utils'

const CONTAINERS = [
  { id: '1', name: 'postgres-db', image: 'postgres:15', status: 'Running', port: '5432:5432', uptime: '4d 2h' },
  { id: '2', name: 'redis-cache', image: 'redis:alpine', status: 'Running', port: '6379:6379', uptime: '4d 2h' },
  { id: '3', name: 'nginx-proxy', image: 'nginx:latest', status: 'Exited', port: '80:80', uptime: '-' },
]

export function DockerPilot() {
  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Docker Pilot</h2>
          <p className="text-muted-foreground">Local container orchestration</p>
        </div>
        <Button variant="outline" className="gap-2">
            <RotateCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
             <div className="grid grid-cols-12 gap-4 p-4 border-b bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="col-span-3">Container</div>
                <div className="col-span-2">Image</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Port</div>
                <div className="col-span-3 text-center">Actions</div>
            </div>
            {CONTAINERS.map(c => (
                <div key={c.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors border-b last:border-0">
                    <div className="col-span-3 flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            c.status === 'Running' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                        )}>
                            <Box className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{c.name}</span>
                    </div>
                    <div className="col-span-2 text-xs text-slate-600 font-mono">
                        {c.image}
                    </div>
                    <div className="col-span-2">
                        <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            c.status === 'Running' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                        )}>
                            {c.status} {c.uptime !== '-' && `(${c.uptime})`}
                        </span>
                    </div>
                    <div className="col-span-2 text-xs text-slate-500 font-mono">
                        {c.port}
                    </div>
                    <div className="col-span-3 flex justify-center gap-1">
                        {c.status === 'Running' ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600">
                                <Square className="h-4 w-4 fill-current" />
                            </Button>
                        ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-green-600">
                                <Play className="h-4 w-4 fill-current" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Terminal className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
