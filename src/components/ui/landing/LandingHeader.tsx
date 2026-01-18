/**
 * Landing Header Component
 * Header section with logo and title
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export const LandingHeader: React.FC = () => {
  return (
    <div className="text-center space-y-6">
      <motion.div 
        whileHover={{ rotate: 180, scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-white border border-slate-200 mb-4 shadow-2xl shadow-blue-500/10 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:opacity-100 transition-opacity" />
        <Zap className="h-10 w-10 text-blue-600 relative z-10" />
      </motion.div>
      
      <div className="space-y-2">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter">
          FTW<span className="text-blue-600">OS</span>
        </h1>
        <p className="text-slate-400 text-lg font-medium tracking-wide">
          NEURAL INTERFACE <span className="text-blue-400">v1.0.6</span>
        </p>
      </div>
    </div>
  )
}

