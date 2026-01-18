/**
 * Settings Sync Service
 * Export and import application settings
 */

import { useThemeStore } from '@/stores/theme-store'
import { useLayoutStore } from '@/stores/layout-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useWidgetStore } from '@/stores/widget-store'
import { toast } from '@/components/ui/use-toast'

export interface SettingsExport {
  theme: ReturnType<typeof useThemeStore.getState>
  layout: ReturnType<typeof useLayoutStore.getState>
  widgets: ReturnType<typeof useWidgetStore.getState>
  preferences: ReturnType<typeof useSettingsStore.getState>
  version: string
  exportDate: string
}

export const settingsSync = {
  /**
   * Export all settings to JSON file
   */
  export: () => {
    try {
      const settings: SettingsExport = {
        theme: useThemeStore.getState(),
        layout: useLayoutStore.getState(),
        widgets: useWidgetStore.getState(),
        preferences: useSettingsStore.getState(),
        version: '2.0.0',
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(settings, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ftw-os-settings-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: 'Settings exported',
        description: 'Your settings have been saved to a file.'
      })
    } catch (error) {
      console.error('Failed to export settings:', error)
      toast({
        title: 'Export failed',
        description: 'Could not export settings.',
        variant: 'destructive'
      })
    }
  },
  
  /**
   * Import settings from JSON file
   */
  import: async (file: File) => {
    try {
      const text = await file.text()
      const settings: SettingsExport = JSON.parse(text)
      
      // Validate version compatibility
      if (settings.version && !settings.version.startsWith('2.')) {
        throw new Error('Settings file is from an incompatible version')
      }
      
      // Apply settings
      if (settings.theme) {
        useThemeStore.setState(settings.theme)
      }
      
      if (settings.layout) {
        useLayoutStore.setState(settings.layout)
      }
      
      if (settings.widgets) {
        useWidgetStore.setState(settings.widgets)
      }
      
      if (settings.preferences) {
        useSettingsStore.setState(settings.preferences)
      }
      
      toast({
        title: 'Settings imported',
        description: 'Your settings have been restored.'
      })
    } catch (error: any) {
      console.error('Failed to import settings:', error)
      toast({
        title: 'Import failed',
        description: error.message || 'Could not import settings.',
        variant: 'destructive'
      })
    }
  }
}

