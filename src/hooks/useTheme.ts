/**
 * Theme Hook
 * Handles theme application and background styling
 */

import { useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface ThemeConfig {
  mode: string
  background: string
  customColor?: string
  radius: number
  fontFamily?: 'default' | 'mono' | 'serif' | 'display'
  fontSize?: 'xs' | 'sm' | 'base' | 'lg'
  lineHeight?: 'tight' | 'normal' | 'relaxed'
}

/**
 * Hook for managing theme application
 * @param config Theme configuration object
 * @returns Object containing className and style for theme application
 */
const FONT_FAMILIES = {
  default: 'Inter, system-ui, sans-serif',
  mono: 'JetBrains Mono, monospace',
  serif: 'Merriweather, serif',
  display: 'Montserrat, sans-serif'
}

const FONT_SIZES = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem'
}

const LINE_HEIGHTS = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75'
}

export const useTheme = (config: ThemeConfig) => {
  const { mode, background, customColor, radius, fontFamily = 'default', fontSize = 'base', lineHeight = 'normal' } = config

  // Apply theme classes to document
  useEffect(() => {
    document.body.className = `theme-${mode}`
    document.documentElement.setAttribute('data-theme-mode', mode)
    
    // Apply font family
    const root = document.documentElement
    root.style.setProperty('--font-family', FONT_FAMILIES[fontFamily])
    root.style.setProperty('--font-size', FONT_SIZES[fontSize])
    root.style.setProperty('--line-height', LINE_HEIGHTS[lineHeight])
  }, [mode, fontFamily, fontSize, lineHeight])

  // Get background style
  const backgroundStyle = useMemo(() => {
    if (background === 'custom' && customColor) {
      return { backgroundColor: customColor }
    }
    return {}
  }, [background, customColor])

  // Get theme className
  const themeClassName = useMemo(() => {
    return cn(
      "h-screen w-screen overflow-hidden font-sans select-none transition-colors duration-500 flex flex-col",
      mode === 'monochrome' && "bg-gray-50 text-gray-900",
      mode === 'glass' && "bg-[#0f172a] text-white",
      mode === 'midnight' && "bg-[#050510] text-purple-100",
      mode === 'cyberpunk' && "bg-black text-yellow-400",
      mode === 'retro' && "bg-black text-green-500 font-mono",
      background === 'mesh' && "bg-[radial-gradient(at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900",
      background === 'aurora' && "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-slate-900 via-teal-900 to-slate-900",
      background === 'deep' && "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black",
      background === 'cyber' && "bg-[linear-gradient(to_bottom,_var(--tw-gradient-stops))] from-black via-purple-950 to-black"
    )
  }, [mode, background])

  // Get combined style with radius
  const themeStyle = useMemo(() => {
    return {
      ...backgroundStyle,
      ['--radius' as any]: `${radius}px`
    }
  }, [backgroundStyle, radius])

  return {
    themeClassName,
    themeStyle
  }
}

