import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Terminal, Server, Plus, Power, 
  Activity, Cpu, HardDrive
} from 'lucide-react'
import { cn } from '@/services/utils'

const SERVERS = [
  { id: '1', name: 'Production VPS', ip: '192.168.1.10', status: 'Online', cpu: '12%', mem: '45%', disk: '60%' },
  { id: '2', name: 'Staging DB', ip: '192.168.1.11', status: 'Online', cpu: '5%', mem: '20%', disk: '15%' },
  { id: '3', name: 'Backup Node', ip: '192.168.1.12', status: 'Offline', cpu: '-', mem: '-', disk: '-' },
]

export function ServerManager() {
  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Server Manager</h2>
          <p className="text-muted-foreground">SSH Access and Resource Monitoring</p>
        </div>
        <Button className="gap-2 bg-slate-900 text-white">
            <Plus className="h-4 w-4" /> Add Server
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVERS.map(server => (
            <Card key={server.id} className="group">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-3 rounded-lg",
                                server.status === 'Online' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            )}>
                                <Server className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{server.name}</h3>
                                <div className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit">
                                    {server.ip}
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <Power className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                            <Cpu className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                            <span className="text-xs font-bold">{server.cpu}</span>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                            <Activity className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                            <span className="text-xs font-bold">{server.mem}</span>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                            <HardDrive className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                            <span className="text-xs font-bold">{server.disk}</span>
                        </div>
                    </div>

                    <Button className="w-full gap-2" disabled={server.status === 'Offline'}>
                        <Terminal className="h-4 w-4" /> Connect via SSH
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  )
}
