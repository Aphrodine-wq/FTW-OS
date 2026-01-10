import { create } from 'zustand'
import { BusinessProfile } from '@/types/invoice'

interface SettingsStore {
  businessProfile: BusinessProfile | null
  preferences: {
    theme: 'light' | 'dark'
    autoSave: boolean
    autoSaveInterval: number
    defaultCurrency: string
    defaultTaxRate: number
    dateFormat: string
  }
  integrations: {
    spotifyClientId: string
    spotifyToken: string
    steamApiKey: string
    steamId: string
  }
  
  // Actions
  setBusinessProfile: (profile: BusinessProfile) => void
  updatePreferences: (preferences: Partial<SettingsStore['preferences']>) => void
  updateIntegrations: (integrations: Partial<SettingsStore['integrations']>) => void
  loadSettings: () => void
  saveSettings: () => void
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  businessProfile: null,
  preferences: {
    theme: 'light',
    autoSave: true,
    autoSaveInterval: 30,
    defaultCurrency: 'USD',
    defaultTaxRate: 0,
    dateFormat: 'MM/DD/YYYY',
  },
  integrations: {
    spotifyClientId: '',
    spotifyToken: '',
    steamApiKey: '',
    steamId: ''
  },

  setBusinessProfile: (profile) => set({ businessProfile: profile }),
  
  updatePreferences: (newPreferences) => set((state) => ({
    preferences: { ...state.preferences, ...newPreferences }
  })),

  updateIntegrations: (newIntegrations) => set((state) => ({
    integrations: { ...state.integrations, ...newIntegrations }
  })),
  
  loadSettings: async () => {
    try {
      // Load from Electron Store (File System)
      const saved = await window.ipcRenderer.invoke('db:get-settings')
      if (saved) {
        set({
            businessProfile: saved.businessProfile || null,
            preferences: { ...get().preferences, ...saved.preferences },
            integrations: { ...get().integrations, ...saved.integrations }
        })
      } else {
        // Fallback to localStorage if migration needed
        const local = localStorage.getItem('invoiceforge-settings')
        if (local) {
          const parsed = JSON.parse(local)
          set(parsed)
          // Migrate to DB
          window.ipcRenderer.invoke('db:save-settings', parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  },
  
  saveSettings: async () => {
    const state = get()
    const data = {
      businessProfile: state.businessProfile,
      preferences: state.preferences,
      integrations: state.integrations,
    }
    // Save to Electron Store
    await window.ipcRenderer.invoke('db:save-settings', data)
    // Backup to localStorage
    localStorage.setItem('invoiceforge-settings', JSON.stringify(data))
  },
}))
