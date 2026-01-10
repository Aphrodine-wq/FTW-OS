import React from 'react'
import { Clock, Circle } from 'lucide-react'
import { AppWidget } from '../AppWidget'

export function DayStreamWidget({ id, onRemove }: { id?: string, onRemove?: () => void }) {
  const events = [
    { time: '09:00', title: 'Team Sync', type: 'meeting' },
    { time: '11:30', title: 'Client Review', type: 'call' },
    { time: '14:00', title: 'Deep Work', type: 'focus' },
    { time: '16:45', title: 'Wrap Up', type: 'admin' },
  ]

  return (
    <AppWidget title="Day Stream" icon={Clock} id={id || 'day'} onRemove={onRemove || (() => {})}>
        <div className="h-full flex flex-col relative pl-4 border-l-2 border-slate-100 space-y-6 pt-2">
            {/* Current Time Indicator */}
            <div className="absolute left-[-5px] top-[40%] flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">NOW</span>
            </div>

            {events.map((evt, i) => (
                <div key={i} className="relative group cursor-pointer">
                    <div className="absolute left-[-21px] top-1 h-2 w-2 rounded-full bg-slate-300 group-hover:bg-slate-800 transition-colors" />
                    <div className="pl-2">
                        <div className="text-xs font-mono text-slate-400">{evt.time}</div>
                        <div className="text-sm font-medium text-slate-700 group-hover:text-black transition-colors">{evt.title}</div>
                    </div>
                </div>
            ))}
        </div>
    </AppWidget>
  )
}
