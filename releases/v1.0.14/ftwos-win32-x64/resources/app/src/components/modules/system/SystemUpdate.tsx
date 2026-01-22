import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Download, RefreshCw, CheckCircle2, AlertTriangle, 
  Settings, ShieldCheck, HardDrive
} from 'lucide-react'
import { cn } from '@/services/utils'

export function SystemUpdate() {
  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState<'uptodate' | 'available'>('uptodate')

  const handleCheck = () => {
    setChecking(true)
    setTimeout(() => {
        setChecking(false)
        setStatus('available')
    }, 2000)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center space-y-6">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                    <div className={cn(
                        "absolute inset-0 rounded-full opacity-20 animate-pulse",
                        status === 'uptodate' ? "bg-green-500" : "bg-blue-500"
                    )} />
                    {status === 'uptodate' ? (
                        <ShieldCheck className="h-12 w-12 text-green-600" />
                    ) : (
                        <Download className="h-12 w-12 text-blue-600" />
                    )}
                </div>

                <div>
                    <h2 className="text-2xl font-bold">
                        {status === 'uptodate' ? 'System is Up to Date' : 'Update Available'}
                    </h2>
                    <p className="text-slate-500 mt-2">
                        {status === 'uptodate' ? 'Version 2.1.0 (Build 402)' : 'Version 2.2.0 is ready to install'}
                    </p>
                </div>

                {status === 'available' && (
                    <div className="text-left bg-slate-50 p-4 rounded-lg text-sm space-y-2">
                        <p className="font-bold">What's New:</p>
                        <ul className="list-disc pl-4 text-slate-600 space-y-1">
                            <li>Improved AI response time</li>
                            <li>New "Darker" theme mode</li>
                            <li>Fixed PDF export bug</li>
                        </ul>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {status === 'uptodate' ? (
                        <Button size="lg" onClick={handleCheck} disabled={checking}>
                            {checking ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                            {checking ? 'Checking...' : 'Check for Updates'}
                        </Button>
                    ) : (
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Download & Install
                        </Button>
                    )}
                    
                    <div className="flex justify-center gap-4 text-xs text-slate-400 mt-4">
                        <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" /> 45GB Free</span>
                        <span>•</span>
                        <span>Auto-update: ON</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
