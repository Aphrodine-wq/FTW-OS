import React from 'react'
import { Calendar, Clock } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/services/utils'

export function DayStream() {
  const { mode } = useThemeStore()
  const hours = Array.from({ length: 9 }, (_, i) => i + 9) // 9AM to 5PM
  const currentHour = new Date().getHours()

  return (
    <div className="h-full flex flex-col overflow-hidden p-1">
      <div className="flex items-center gap-2 mb-3 px-1">
         <Calendar className={cn("h-4 w-4", mode === 'glass' ? "text-blue-400" : "text-blue-600")} />
         <span className="text-xs font-bold uppercase tracking-widest">Day Stream</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0 relative">
         {/* Current Time Indicator Line */}
         <div 
            className="absolute left-0 right-0 border-t-2 border-red-500 z-10 flex items-center"
            style={{ top: `${((currentHour - 9) / 9) * 100}%` }}
         >
            <div className="bg-red-500 text-white text-[9px] px-1 rounded-r font-bold">NOW</div>
         </div>

         {hours.map(h => (
            <div key={h} className={cn("flex gap-3 py-2 border-b border-dashed last:border-0", mode === 'glass' ? "border-white/5" : "border-gray-200")}>
               <div className="w-10 text-right text-[10px] opacity-50 font-mono pt-1">
                  {h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}
               </div>
               <div className={cn("flex-1 p-1 rounded text-xs", 
                  h === 10 ? (mode === 'glass' ? "bg-blue-500/20 text-blue-200" : "bg-blue-100 text-blue-800") : 
                  h === 13 ? (mode === 'glass' ? "bg-amber-500/20 text-amber-200" : "bg-amber-100 text-amber-800") : 
                  "opacity-30"
               )}>
                  {h === 10 ? "Team Sync" : h === 13 ? "Deep Work" : "Open Slot"}
               </div>
            </div>
         ))}
      </div>
    </div>
  )
}
