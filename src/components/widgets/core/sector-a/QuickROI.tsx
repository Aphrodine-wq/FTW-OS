import React, { useState } from 'react'
import { Calculator, DollarSign, Percent } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/services/utils'
import { Input } from '@/components/ui/input'

export function QuickROI() {
  const { mode } = useThemeStore()
  const [values, setValues] = useState({
    rate: 150,
    hours: 40,
    expenses: 500
  })

  const revenue = values.rate * values.hours
  const profit = revenue - values.expenses
  const margin = (profit / revenue) * 100 || 0

  const handleChange = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: parseFloat(val) || 0 }))
  }

  return (
    <div className="h-full flex flex-col gap-2 p-1">
      <div className="flex items-center gap-2 mb-1 px-1">
         <Calculator className={cn("h-4 w-4", mode === 'glass' ? "text-amber-400" : "text-amber-600")} />
         <span className="text-xs font-bold uppercase tracking-widest">Quick ROI</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
         <div className="space-y-1">
            <label className="opacity-50">Rate ($/hr)</label>
            <Input 
                type="number" 
                value={values.rate} 
                onChange={e => handleChange('rate', e.target.value)}
                className="h-7 text-xs" 
            />
         </div>
         <div className="space-y-1">
            <label className="opacity-50">Est. Hours</label>
            <Input 
                type="number" 
                value={values.hours} 
                onChange={e => handleChange('hours', e.target.value)}
                className="h-7 text-xs" 
            />
         </div>
      </div>

      <div className={cn("mt-auto p-3 rounded-lg flex justify-between items-center", mode === 'glass' ? "bg-white/10" : "bg-gray-100")}>
         <div>
            <p className="text-[10px] opacity-60 uppercase">Net Profit</p>
            <p className={cn("text-lg font-black", profit > 0 ? "text-green-500" : "text-red-500")}>
                ${profit.toLocaleString()}
            </p>
         </div>
         <div className="text-right">
             <p className="text-[10px] opacity-60 uppercase">Margin</p>
             <p className={cn("text-sm font-bold flex items-center justify-end gap-1", margin > 50 ? "text-green-400" : "text-amber-400")}>
                {margin.toFixed(0)}%
             </p>
         </div>
      </div>
    </div>
  )
}
