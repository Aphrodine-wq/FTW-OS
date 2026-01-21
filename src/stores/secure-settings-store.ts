import { create } from 'zustand'

// Define which keys are sensitive and should be in Vault
const SENSITIVE_KEYS = [
    'openaiApiKey', 'anthropicApiKey', 'githubToken', 
    'steamApiKey', 'spotifyClientSecret', 'soundcloudClientSecret',
    'googleClientId', 'googleClientSecret'
] as const

type SensitiveKey = typeof SENSITIVE_KEYS[number]

interface SecureSettingsStore {
  // We keep a local cache of keys so UI doesn't flicker
  // But we NEVER persist this to localStorage
  cachedKeys: Record<string, string>
  
  // Actions
  setSecureKey: (key: string, value: string) => Promise<void>
  getSecureKey: (key: string) => Promise<string | null>
  loadAllKeys: () => Promise<void>
}

export const useSecureSettings = create<SecureSettingsStore>((set, get) => ({
  cachedKeys: {},

  setSecureKey: async (key, value) => {
    // 1. Update Memory Cache (for UI responsiveness)
    set(state => ({
        cachedKeys: { ...state.cachedKeys, [key]: value }
    }))
    
    // 2. Persist to Secure Vault via IPC
    await window.ipcRenderer.invoke('vault:set', { key, value })
  },

  getSecureKey: async (key) => {
    // Check cache first
    const cached = get().cachedKeys[key]
    if (cached) return cached

    // Fetch from Vault
    const value = await window.ipcRenderer.invoke('vault:get', key)
    if (value) {
        set(state => ({
            cachedKeys: { ...state.cachedKeys, [key]: value }
        }))
    }
    return value
  },

  loadAllKeys: async () => {
    const newCache: Record<string, string> = {}
    
    // Load all known sensitive keys in parallel
    await Promise.all(SENSITIVE_KEYS.map(async (key) => {
        const val = await window.ipcRenderer.invoke('vault:get', key)
        if (val) newCache[key] = val
    }))

    set({ cachedKeys: newCache })
  }
}))