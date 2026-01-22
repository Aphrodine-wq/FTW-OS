import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock window and localStorage
const mockIpcRenderer = {
  invoke: vi.fn()
}

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
}

vi.stubGlobal('window', { ipcRenderer: mockIpcRenderer })
vi.stubGlobal('localStorage', mockLocalStorage)

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}))

import { useSettingsStore } from './settings-store'

describe('SettingsStore', () => {
  beforeEach(() => {
    // Reset store
    useSettingsStore.setState({
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
        paymentLinks: { stripe: '', paypal: '', custom: '' }
      }
    })
    
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should update preferences and auto-save', async () => {
    mockIpcRenderer.invoke.mockResolvedValue(true)

    useSettingsStore.getState().updatePreferences({ theme: 'dark' })

    const preferences = useSettingsStore.getState().preferences
    expect(preferences.theme).toBe('dark')
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('db:save-settings', expect.any(Object))
  })

  it('should not auto-save if disabled', async () => {
    // Disable auto-save
    useSettingsStore.setState((state) => ({
        preferences: { ...state.preferences, autoSave: false }
    }))
    
    mockIpcRenderer.invoke.mockClear()

    useSettingsStore.getState().updatePreferences({ theme: 'dark' })

    expect(mockIpcRenderer.invoke).not.toHaveBeenCalled()
  })

  it('should load settings from IPC', async () => {
    const mockSettings = {
        preferences: { theme: 'dark' },
        businessProfile: { name: 'Test Corp' }
    }
    mockIpcRenderer.invoke.mockResolvedValue(mockSettings)

    await useSettingsStore.getState().loadSettings()

    const state = useSettingsStore.getState()
    expect(state.preferences.theme).toBe('dark')
    expect(state.businessProfile?.name).toBe('Test Corp')
  })

  it('should fallback to localStorage if IPC fails', async () => {
    mockIpcRenderer.invoke.mockRejectedValue(new Error('IPC Error'))
    
    const localSettings = {
        preferences: { theme: 'dark' },
        businessProfile: { name: 'Local Corp' }
    }
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(localSettings))

    await useSettingsStore.getState().loadSettings()

    const state = useSettingsStore.getState()
    expect(state.preferences.theme).toBe('dark')
    expect(state.businessProfile?.name).toBe('Local Corp')
  })
})
