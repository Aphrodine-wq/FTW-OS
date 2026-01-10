import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const COINS = [
  { sym: 'BTC', price: '42,350', change: 2.4 },
  { sym: 'ETH', price: '2,240', change: -0.8 },
  { sym: 'SOL', price: '98.50', change: 5.2 },
  { sym: 'ADA', price: '0.52', change: -1.2 },
  { sym: 'XRP', price: '0.58', change: 0.5 },
  { sym: 'DOT', price: '7.20', change: -2.1 },
]

export function CryptoMatrix() {
  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      {COINS.map((c) => (
        <div key={c.sym} className="flex justify-between items-center p-1.5 bg-slate-50 border border-slate-100 rounded hover:border-slate-300 transition-colors">
          <div>
            <div className="font-black text-xs text-slate-900">{c.sym}</div>
            <div className="text-[10px] text-slate-500 font-mono">${c.price}</div>
          </div>
          <div className={`text-[10px] font-bold flex items-center ${c.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {c.change >= 0 ? <TrendingUp className="h-2 w-2 mr-0.5" /> : <TrendingDown className="h-2 w-2 mr-0.5" />}
            {Math.abs(c.change)}%
          </div>
        </div>
      ))}
    </div>
  )
}
