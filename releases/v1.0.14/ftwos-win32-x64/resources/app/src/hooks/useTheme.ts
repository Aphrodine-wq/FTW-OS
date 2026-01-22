/**
 * Theme Hook
 * Handles theme application - simplified to light/dark only
 */

import { useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface ThemeConfig {
  mode: 'light' | 'dark'
}

/**
 * Hook for managing theme application
 * @param config Theme configuration object
 * @returns Object containing className and style for theme application
 */
export const useTheme = (config: ThemeConfig) => {
  const { mode } = config

  // Apply theme classes to document
  useEffect(() => {
    document.body.className = `theme-${mode}`
    document.documentElement.setAttribute('data-theme-mode', mode)
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [mode])

  // Get theme className
  const themeClassName = useMemo(() => {
    return cn(
      "h-screen w-screen overflow-hidden font-sans select-none transition-colors duration-500 flex flex-col",
      mode === 'light' && "bg-white text-gray-900",
      mode === 'dark' && "bg-gray-950 text-gray-100"
    )
  }, [mode])

  // Get theme style (empty for now, can add custom properties if needed)
  const themeStyle = useMemo(() => {
    return {}
  }, [])

  return {
    themeClassName,
    themeStyle
  }
}

