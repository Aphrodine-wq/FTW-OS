import React, { useState } from 'react'
import { Calculator, DollarSign, TrendingUp } from 'lucide-react'
import { AppWidget } from '../AppWidget'

export function QuickROIWidget({ id, onRemove }: { id?: string, onRemove?: () => void }) {
  const [revenue, setRevenue] = useState('')
  const [cost, setCost] = useState('')
  
  const rev = parseFloat(revenue) || 0
  const cst = parseFloat(cost) || 0
  const profit = rev - cst
  const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : '0.0'

  return (
    <AppWidget title="Quick ROI" icon={Calculator} id={id || 'roi'} onRemove={onRemove || (() => {})}>
        <div className="h-full flex flex-col space-y-3">
            <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Project Revenue</label>
                <div className="relative">
                    <DollarSign className="absolute left-2 top-1.5 h-3 w-3 text-slate-400" />
                    <input 
                        type="number" 
                        value={revenue}
                        onChange={e => setRevenue(e.target.value)}
                        className="w-full pl-6 pr-2 py-1 text-sm bg-slate-50 border rounded font-mono"
                        placeholder="0.00"
                    />
                </div>
            </div>
            
            <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Est. Cost</label>
                <div className="relative">
                    <DollarSign className="absolute left-2 top-1.5 h-3 w-3 text-slate-400" />
                    <input 
                        type="number" 
                        value={cost}
                        onChange={e => setCost(e.target.value)}
                        className="w-full pl-6 pr-2 py-1 text-sm bg-slate-50 border rounded font-mono"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="mt-auto pt-3 border-t flex justify-between items-center">
                <div>
                    <div className="text-[10px] text-slate-400 font-bold">NET PROFIT</div>
                    <div className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        ${profit.toLocaleString()}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold">MARGIN</div>
                    <div className="text-sm font-mono flex items-center gap-1 justify-end">
                        <TrendingUp className="h-3 w-3" />
                        {margin}%
                    </div>
                </div>
            </div>
        </div>
    </AppWidget>
  )
}
