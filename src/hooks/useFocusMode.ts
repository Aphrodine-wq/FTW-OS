/**
 * Focus Mode Hook
 * Toggle distraction-free mode
 */

import { useState, useEffect } from 'react'

export function useFocusMode() {
  const [focusMode, setFocusMode] = useState(false)

  useEffect(() => {
    if (focusMode) {
      document.body.classList.add('focus-mode')
    } else {
      document.body.classList.remove('focus-mode')
    }
  }, [focusMode])

  // Hotkey: Cmd/Ctrl + Shift + F
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault()
        setFocusMode(f => !f)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Load preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ftw-focus-mode')
    if (saved === 'true') {
      setFocusMode(true)
    }
  }, [])

  // Save preference
  useEffect(() => {
    localStorage.setItem('ftw-focus-mode', focusMode.toString())
  }, [focusMode])

  return {
    focusMode,
    toggleFocus: () => setFocusMode(f => !f)
  }
}

