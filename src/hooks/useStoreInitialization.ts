/**
 * Store Initialization Hook
 * Handles async loading and initialization of Zustand stores
 */

import { useState, useEffect } from 'react'

// Deferred store imports to break circular dependency chain
let useSettingsStore: any
let useSecureSettings: any
let useThemeStore: any
let useAuthStore: any
let AnimatePresence: any
let motion: any

/**
 * Initialize stores lazily - parallelized for faster loading
 */
const initStores = async () => {
  // Load all stores in parallel for faster initialization
  const storePromises = [
    !useSettingsStore ? import('@/stores/settings-store').then(m => {
      useSettingsStore = m.useSettingsStore
    }) : Promise.resolve(),
    !useSecureSettings ? import('@/stores/secure-settings-store').then(m => {
      useSecureSettings = m.useSecureSettings
    }) : Promise.resolve(),
    !useThemeStore ? import('@/stores/theme-store').then(m => {
      useThemeStore = m.useThemeStore
    }) : Promise.resolve(),
    !useAuthStore ? import('@/stores/auth-store').then(m => {
      useAuthStore = m.useAuthStore
    }) : Promise.resolve(),
    !AnimatePresence ? import('framer-motion').then(m => {
      AnimatePresence = m.AnimatePresence
      motion = m.motion
    }) : Promise.resolve(),
  ]

  // Wait for all stores to load in parallel
  await Promise.all(storePromises)
}

export interface StoreState {
  loadSettings: () => void
  mode: string
  background: string
  customColor?: string
  radius: number
  fontFamily?: 'default' | 'mono' | 'serif' | 'display'
  fontSize?: 'xs' | 'sm' | 'base' | 'lg'
  lineHeight?: 'tight' | 'normal' | 'relaxed'
  isAuthenticated: boolean
  initializeListener: () => (() => void) | undefined
  loadAllKeys: () => void
  setSecureKey: (key: string, value: string) => void
}

/**
 * Hook for initializing and managing store state
 * @returns Object containing storesReady, storeError, and storeState
 */
export const useStoreInitialization = () => {
  const [storesReady, setStoresReady] = useState(false)
  const [storeError, setStoreError] = useState<Error | null>(null)
  const [storeState, setStoreState] = useState<StoreState | null>(null)

  useEffect(() => {
    let mounted = true
    const unsubscribeFns: Array<() => void> = []

    const loadStores = async () => {
      try {
        await initStores()
        if (!mounted) return

        const settingsStore = useSettingsStore.getState()
        const themeStore = useThemeStore.getState()
        const authStore = useAuthStore.getState()
        const secureStore = useSecureSettings.getState()

        const initialState: StoreState = {
          loadSettings: settingsStore.loadSettings,
          mode: themeStore.mode,
          background: themeStore.background,
          customColor: themeStore.customColor,
          radius: themeStore.radius,
          fontFamily: themeStore.fontFamily,
          fontSize: themeStore.fontSize,
          lineHeight: themeStore.lineHeight,
          isAuthenticated: authStore.isAuthenticated,
          initializeListener: authStore.initializeListener,
          loadAllKeys: secureStore.loadAllKeys,
          setSecureKey: secureStore.setSecureKey
        }

        setStoreState(initialState)

        // Subscribe to store changes and store unsubscribe functions
        const unsubTheme = useThemeStore.subscribe((state: any) => {
          if (mounted) {
            setStoreState((prev: StoreState | null) => prev ? {
              ...prev,
              mode: state.mode,
              background: state.background,
              customColor: state.customColor,
              radius: state.radius,
              fontFamily: state.fontFamily,
              fontSize: state.fontSize,
              lineHeight: state.lineHeight
            } : null)
          }
        })
        unsubscribeFns.push(unsubTheme)

        const unsubAuth = useAuthStore.subscribe((state: any) => {
          if (mounted) {
            setStoreState((prev: StoreState | null) => prev ? {
              ...prev,
              isAuthenticated: state.isAuthenticated
            } : null)
          }
        })
        unsubscribeFns.push(unsubAuth)

        setStoresReady(true)
      } catch (error: any) {
        console.error('[App] Failed to initialize stores:', error)
        if (mounted) setStoreError(error)
      }
    }

    loadStores()

    return () => {
      mounted = false
      unsubscribeFns.forEach(unsub => unsub())
    }
  }, [])

  return { storesReady, storeError, storeState }
}

