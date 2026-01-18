/**
 * Keyboard Shortcuts Hook
 * Global keyboard shortcuts for the application
 */

import { useEffect } from 'react'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        const shiftMatch = shortcut.shift === undefined ? true : shortcut.shift === e.shiftKey
        const altMatch = shortcut.alt === undefined ? true : shortcut.alt === e.altKey
        const metaMatch = shortcut.meta === undefined ? true : shortcut.meta === (e.metaKey || e.ctrlKey)
        const keyMatch = shortcut.key.toLowerCase() === e.key.toLowerCase()
        
        if (ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch) {
          e.preventDefault()
          shortcut.action()
        }
      })
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Common shortcuts
export const COMMON_SHORTCUTS = {
  commandPalette: { key: 'k', meta: true },
  settings: { key: ',', meta: true },
  navigateDashboard: { key: 'd', meta: true, shift: true },
  navigateFinance: { key: 'f', meta: true, shift: true },
  navigateTasks: { key: 't', meta: true, shift: true }
}

