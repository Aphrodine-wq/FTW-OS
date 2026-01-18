/**
 * Floating Action Button
 * Quick access button for Quick Capture
 */

import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface FloatingActionButtonProps {
  onClick: () => void
  label?: string
  shortcut?: string
}

export function FloatingActionButton({ 
  onClick, 
  label = 'Quick Capture',
  shortcut = '⌘⇧Space'
}: FloatingActionButtonProps) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        title={`${label} (${shortcut})`}
      >
        <Plus className="h-6 w-6" />
      </Button>
      
      {/* Tooltip on hover */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {label}
          <span className="ml-2 text-gray-400">{shortcut}</span>
        </div>
      </div>
    </motion.div>
  )
}








