/**
 * Edit Mode Controls Component
 * Displays controls when dashboard is in edit mode
 */

import React from 'react'

interface EditModeControlsProps {
  onReset: () => void
  onDone: () => void
}

export function EditModeControls({ onReset, onDone }: EditModeControlsProps) {
  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 border border-white/10">
      <span className="font-bold text-sm">EDIT MODE</span>
      <button onClick={onReset} className="text-xs hover:text-red-400">
        Reset
      </button>
      <button
        onClick={onDone}
        className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold"
      >
        Done
      </button>
    </div>
  )
}

