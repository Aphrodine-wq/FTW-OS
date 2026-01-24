import { create } from 'zustand'
import { BusinessProfile } from '@/types/invoice'
import { logger } from '@/lib/logger'

// Retry configuration for resilient operations
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 500,
  maxDelay: 5000
}

// Exponential backoff helper
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T | null> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelay
      )
      logger.warn(`${operationName} failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries}), retrying in ${delay}ms`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  logger.error(`${operationName} failed after ${RETRY_CONFIG.maxRetries} attempts`, lastError)
  return null
}

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
    steamApiKey: string
    steamId: string
    githubToken: string
    soundcloudClientId: string
    soundcloudClientSecret: string
    soundcloudUsername: string
    spotifyClientId?: string
    spotifyClientSecret?: string
    openaiApiKey?: string
    anthropicApiKey?: string
    googleClientId?: string
    googleClientSecret?: string
    paymentLinks?: {
      stripe?: string
      paypal?: string
      custom?: string // For crypto or other
    }
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
    steamApiKey: '',
    steamId: '',
    githubToken: '',
    soundcloudClientId: '',
    soundcloudClientSecret: '',
    soundcloudUsername: '',
    spotifyClientId: '',
    spotifyClientSecret: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    googleClientId: '',
    googleClientSecret: '',
    paymentLinks: {
      stripe: '',
      paypal: '',
      custom: ''
    }
  },

  setBusinessProfile: (profile) => {
    set({ businessProfile: profile })
    if (get().preferences.autoSave) {
        get().saveSettings()
    }
  },

  updatePreferences: (newPreferences) => {
    set((state) => ({
      preferences: { ...state.preferences, ...newPreferences }
    }))
    if (get().preferences.autoSave) {
        get().saveSettings()
    }
  },

  updateIntegrations: (newIntegrations) => {
    set((state) => ({
      integrations: { ...state.integrations, ...newIntegrations }
    }))
    if (get().preferences.autoSave) {
        get().saveSettings()
    }
  },

  loadSettings: async () => {
    try {
      // Load from Electron Store (File System) with retry
      const saved = await withRetry(
        () => window.ipcRenderer.invoke('db:get-settings'),
        'Load settings from backend'
      )
      
      if (saved) {
        set({
          businessProfile: saved.businessProfile || null,
          preferences: { ...get().preferences, ...saved.preferences },
          integrations: { ...get().integrations, ...saved.integrations }
        })
        return
      }
      
      // Fallback to localStorage if backend unavailable or no data
      const local = localStorage.getItem('invoiceforge-settings')
      if (local) {
        try {
          const parsed = JSON.parse(local)
          set({
            businessProfile: parsed.businessProfile || null,
            preferences: { ...get().preferences, ...parsed.preferences },
            integrations: { ...get().integrations, ...parsed.integrations }
          })
          // Try to migrate to backend
          withRetry(
            () => window.ipcRenderer.invoke('db:save-settings', parsed),
            'Migrate settings to backend'
          ).catch(() => {}) // Non-critical, ignore
        } catch (e) {
          logger.error('Failed to parse local settings', e)
        }
      }
    } catch (error) {
      logger.error('Failed to load settings', error)
    }
  },

  saveSettings: async () => {
    const state = get()
    const data = {
      businessProfile: state.businessProfile,
      preferences: state.preferences,
      integrations: state.integrations,
    }
    
    // Save to localStorage first (immediate, always works)
    try {
      localStorage.setItem('invoiceforge-settings', JSON.stringify(data))
    } catch (e) {
      logger.warn('Failed to save to localStorage', e)
    }
    
    // Then save to Electron Store with retry (async, more reliable long-term)
    withRetry(
      () => window.ipcRenderer.invoke('db:save-settings', data),
      'Save settings to backend'
    ).catch(() => {
      // Already logged in withRetry
    })
  },
}))
