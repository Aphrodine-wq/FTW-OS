/**
 * Command History Hook
 * Global undo/redo functionality
 */

import { useState, useEffect } from 'react'

export interface Command {
  execute: () => void
  undo: () => void
}

export function useCommandHistory() {
  const [history, setHistory] = useState<Command[]>([])
  const [pointer, setPointer] = useState(-1)

  const execute = (command: Command) => {
    command.execute()
    setHistory(prev => [...prev.slice(0, pointer + 1), command])
    setPointer(p => p + 1)
  }

  const undo = () => {
    if (pointer < 0) return
    history[pointer].undo()
    setPointer(p => p - 1)
  }

  const redo = () => {
    if (pointer >= history.length - 1) return
    history[pointer + 1].execute()
    setPointer(p => p + 1)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'z' && e.shiftKey || e.key === 'y')) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [pointer, history])

  return {
    execute,
    undo,
    redo,
    canUndo: pointer >= 0,
    canRedo: pointer < history.length - 1
  }
}

