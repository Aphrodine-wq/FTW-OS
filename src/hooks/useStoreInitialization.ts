/**
 * Store Initialization Hook
 * Handles async loading and initialization of Zustand stores
 */

import { useState, useEffect } from 'react'

import type { UseBoundStore, StoreApi } from 'zustand'
import type { SettingsStore as SettingsStoreType } from '@/stores/settings-store'
import type { SecureSettingsStore as SecureSettingsStoreType } from '@/stores/secure-settings-store'
import type { ThemeState } from '@/stores/theme-store'
import type { AuthState } from '@/stores/auth-store'
import type { AnimatePresenceProps } from 'framer-motion'

// Deferred store imports to break circular dependency chain
type SettingsStore = UseBoundStore<StoreApi<SettingsStoreType>>
type SecureSettingsStore = UseBoundStore<StoreApi<SecureSettingsStoreType>>
type ThemeStore = UseBoundStore<StoreApi<ThemeState>>
type AuthStore = UseBoundStore<StoreApi<AuthState>>

let useSettingsStore: SettingsStore | undefined
let useSecureSettings: SecureSettingsStore | undefined
let useThemeStore: ThemeStore | undefined
let useAuthStore: AuthStore | undefined
let AnimatePresence: React.ComponentType<AnimatePresenceProps> | undefined

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
    }) : Promise.resolve(),
  ]

  // Wait for all stores to load in parallel
  await Promise.all(storePromises)
}

export interface StoreState {
  loadSettings: () => void
  mode: 'light' | 'dark'
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
          isAuthenticated: authStore.isAuthenticated,
          initializeListener: authStore.initializeListener,
          loadAllKeys: secureStore.loadAllKeys,
          setSecureKey: secureStore.setSecureKey
        }

        setStoreState(initialState)

        // Subscribe to store changes and store unsubscribe functions
        const unsubTheme = useThemeStore.subscribe((state) => {
          if (mounted) {
            setStoreState((prev: StoreState | null) => prev ? {
              ...prev,
              mode: state.mode
            } : null)
          }
        })
        unsubscribeFns.push(unsubTheme)

        const unsubAuth = useAuthStore.subscribe((state) => {
          if (mounted) {
            setStoreState((prev: StoreState | null) => prev ? {
              ...prev,
              isAuthenticated: state.isAuthenticated
            } : null)
          }
        })
        unsubscribeFns.push(unsubAuth)

        setStoresReady(true)
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error))
        console.error('[App] Failed to initialize stores:', errorObj)
        if (mounted) setStoreError(errorObj)
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

