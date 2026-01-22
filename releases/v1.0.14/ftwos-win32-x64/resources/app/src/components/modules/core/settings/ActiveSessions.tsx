import React from 'react'
import { Monitor, Smartphone, Globe, LogOut, Clock, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/services/utils'

interface Session {
  id: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'web'
  ipAddress: string
  lastActive: Date
  isCurrent: boolean
  location: string
}

export function ActiveSessions() {
  // Mock data - in real app, fetch from /api/sessions
  const [sessions, setSessions] = React.useState<Session[]>([
    {
      id: '1',
      deviceName: 'Windows PC (FTW-OS)',
      deviceType: 'desktop',
      ipAddress: '192.168.1.105',
      lastActive: new Date(),
      isCurrent: true,
      location: 'New York, US'
    },
    {
      id: '2',
      deviceName: 'iPhone 15 Pro',
      deviceType: 'mobile',
      ipAddress: '10.0.0.12',
      lastActive: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
      isCurrent: false,
      location: 'New York, US'
    },
    {
      id: '3',
      deviceName: 'Chrome on MacBook',
      deviceType: 'web',
      ipAddress: '172.16.0.5',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      isCurrent: false,
      location: 'London, UK'
    }
  ])

  const handleRevoke = (id: string) => {
    // In real app, call API to revoke session
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'desktop': return <Monitor className="w-5 h-5" />
      case 'mobile': return <Smartphone className="w-5 h-5" />
      default: return <Globe className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-light">Active Sessions</h2>
          <p className="text-sm text-slate-500">Manage devices logged into your account</p>
        </div>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border transition-all",
              session.isCurrent 
                ? "bg-blue-500/5 border-blue-500/20" 
                : "bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-blue-500/30"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2.5 rounded-lg",
                session.isCurrent ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}>
                {getIcon(session.deviceType)}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {session.deviceName}
                  </h3>
                  {session.isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                      THIS DEVICE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{session.ipAddress}</span>
                  <span>•</span>
                  <span>{session.location}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {session.isCurrent ? 'Active now' : `Last active ${session.lastActive.toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!session.isCurrent && (
              <button
                onClick={() => handleRevoke(session.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Revoke Session"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
