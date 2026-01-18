/**
 * Theme Presets Library
 * Pre-configured theme combinations for quick customization
 */

export interface ThemePreset {
  mode: 'light' | 'dark' | 'monochrome' | 'glass' | 'midnight' | 'cyberpunk' | 'retro'
  background: 'default' | 'mesh' | 'aurora' | 'deep' | 'cyber' | 'custom'
  accent: string
  radius: number
  font?: 'default' | 'mono' | 'serif' | 'display'
  blur?: boolean
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  corporate: {
    mode: 'light',
    background: 'default',
    accent: '#1e40af',
    radius: 0.5,
    font: 'default'
  },
  
  obsidian: {
    mode: 'dark',
    background: 'deep',
    accent: '#3b82f6',
    radius: 0.75,
    font: 'default'
  },
  
  synthwave: {
    mode: 'cyberpunk',
    background: 'cyber',
    accent: '#ec4899',
    radius: 1,
    font: 'default'
  },
  
  minimal: {
    mode: 'light',
    background: 'default',
    accent: '#64748b',
    radius: 0.25,
    font: 'default'
  },
  
  sunset: {
    mode: 'light',
    background: 'aurora',
    accent: '#f59e0b',
    radius: 1,
    font: 'default'
  },
  
  hacker: {
    mode: 'dark',
    background: 'mesh',
    accent: '#10b981',
    radius: 0,
    font: 'mono'
  },
  
  glassmorphism: {
    mode: 'glass',
    background: 'aurora',
    accent: '#8b5cf6',
    radius: 1.5,
    font: 'default',
    blur: true
  },
  
  ocean: {
    mode: 'dark',
    background: 'deep',
    accent: '#06b6d4',
    radius: 1,
    font: 'default'
  },
  
  forest: {
    mode: 'dark',
    background: 'mesh',
    accent: '#22c55e',
    radius: 0.75,
    font: 'default'
  },
  
  neon: {
    mode: 'cyberpunk',
    background: 'cyber',
    accent: '#a855f7',
    radius: 1.25,
    font: 'default'
  }
}

/**
 * Apply a theme preset
 */
export function applyThemePreset(presetName: string): ThemePreset | null {
  const preset = THEME_PRESETS[presetName]
  if (!preset) return null
  
  return preset
}

/**
 * Get all available presets
 */
export function getAvailablePresets(): string[] {
  return Object.keys(THEME_PRESETS)
}

