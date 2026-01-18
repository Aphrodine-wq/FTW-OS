import React, { useState, useEffect } from 'react'
import { Activity, Wifi, ArrowUp, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { AppWidget } from '../AppWidget'

export function NetVisWidget({ id, onRemove }: { id?: string, onRemove?: () => void }) {
  // Empty State - No real data yet
  return (
    <AppWidget title="Network" icon={Wifi} id={id || 'net'} onRemove={onRemove || (() => {})}>
        <div className="h-full flex flex-col bg-black/90 rounded-lg overflow-hidden relative group border border-emerald-900/30">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="flex justify-between items-start p-3 z-10">
            <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500">
                  Network Monitor
                </span>
                <span className="text-[9px] text-emerald-400/50 font-mono">STATUS: STANDBY</span>
            </div>
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
             <div className="text-center">
                <Wifi className="w-8 h-8 text-emerald-500/20 mx-auto mb-2" />
                <p className="text-[10px] text-emerald-500 font-mono mb-2">NO ACTIVE CONNECTION</p>
                <button className="text-[9px] px-2 py-1 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" onClick={() => window.open('https://github.com/ftwos/net-agent', '_blank')}>
                  INSTALL AGENT
                </button>
             </div>
        </div>
        
        <div className="h-7 border-t border-emerald-500/20 flex justify-between items-center px-3 text-[9px] text-emerald-600 font-mono bg-black/40 z-10 mt-auto">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500"/> 
              DISCONNECTED
            </span>
            <span>PING: --</span>
        </div>
        </div>
    </AppWidget>
  )
}
