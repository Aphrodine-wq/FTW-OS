import create from 'zustand'
import { persist } from 'zustand/middleware'

export type WorkspaceInfo = {
  name: string
  timezone: string
  currency: string
  createdAt?: string
}

export type UserInfo = {
  name: string
  email: string
  role?: string
}

export type Preferences = {
  theme: 'light' | 'dark' | 'system'
  telemetry?: boolean
}

// Minimal onboarding state for first-run flow
type OnboardingState = {
  completed: boolean
  started: boolean
  workspace?: WorkspaceInfo
  user?: UserInfo
  preferences?: Preferences
  templateId?: string
}

export const useOnboardingStore = create<OnboardingState & {
  start: () => void
  setWorkspace: (w: WorkspaceInfo) => void
  setUser: (u: UserInfo) => void
  setPreferences: (p: Preferences) => void
  selectTemplate: (id: string) => void
  complete: () => void
  skip: () => void
}>(
  persist(
    (set, get) => ({
      completed: false,
      started: false,
      workspace: undefined,
      user: undefined,
      preferences: { theme: 'system', telemetry: true },
      templateId: undefined,
      start: () => set({ started: true }),
      setWorkspace: (w) => set({ workspace: w }),
      setUser: (u) => set({ user: u }),
      setPreferences: (p) => set({ preferences: p }),
      selectTemplate: (id) => set({ templateId: id }),
      complete: () => set({ completed: true }),
      skip: () => set({ completed: true }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
)
