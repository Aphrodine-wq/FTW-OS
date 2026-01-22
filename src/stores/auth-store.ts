import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/services/supabase'
import { injectSeedData } from '@/lib/seed-data'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { googleOAuth, GoogleUser, GoogleTokens } from '@/services/google-oauth'
import { logger } from '@/lib/logger'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: 'admin' | 'user' | 'viewer'
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  tokens: GoogleTokens | null
  login: () => void
  loginWithGoogleOAuth: () => Promise<{ error?: string }>
  handleGoogleCallback: (url: string) => Promise<{ error?: string }>
  loginAsGuest: () => void
  loginWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  registerWithEmail: (email: string, password: string, name: string) => Promise<{ error?: string }>
  resetPassword: (email: string) => Promise<{ error?: string }>
  logout: () => void
  checkSession: () => Promise<void>
  initializeListener: () => () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      tokens: null,
      initializeListener: () => {
         // Simplified listener for Supabase auth state (if still using for other features)
         const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            if (event === 'SIGNED_OUT') {
                set({ isAuthenticated: false, user: null })
            } 
            // Note: We primarily use handleGoogleCallback for the main auth flow now
         })
         return () => subscription.unsubscribe()
      },
      login: async () => {
        // Redirect to new flow
        return useAuthStore.getState().loginWithGoogleOAuth()
      },
      loginWithGoogleOAuth: async () => {
        // New Google OAuth-only flow using credentials from vault
        try {
          const result = await googleOAuth.login()
          if (!result.success) {
            logger.error('Google OAuth login failed', result.error)
            return { error: result.error }
          }
          return {}
        } catch (error) {
          logger.error('Unexpected error during Google OAuth login', error)
          return { error: 'Unexpected login error' }
        }
      },
      handleGoogleCallback: async (url: string) => {
        // Handle OAuth callback and set user session
        try {
          const result = await googleOAuth.handleCallback(url)
          if (!result.success || !result.user) {
            logger.error('Google OAuth callback handling failed', result.error)
            return { error: result.error || 'Authentication failed' }
          }

          const googleUser = result.user
          set({
            isAuthenticated: true,
            user: {
              id: googleUser.id,
              name: googleUser.name,
              email: googleUser.email,
              avatar: googleUser.picture,
              role: 'admin'
            },
            tokens: result.tokens || null
          })

          logger.info('User logged in successfully via Google', { userId: googleUser.id })

          // Inject seed data for usable state
          injectSeedData().catch((err) => {
            logger.warn('Seed data injection failed', err)
          })

          return {}
        } catch (error) {
          logger.error('Unexpected error during Google callback handling', error)
          return { error: 'Callback handling failed' }
        }
      },
      loginAsGuest: () => {
        set({
            isAuthenticated: true,
            user: {
                id: 'guest-dev',
                name: 'Developer (Guest)',
                email: 'dev@ftwos.local',
                avatar: undefined,
                role: 'admin'
            }
        })
        // Inject seed data for usable state
        injectSeedData().catch(() => {
          // Seed data injection failed - non-critical
        })
      },
      logout: async () => {
        await supabase.auth.signOut()
        set({ isAuthenticated: false, user: null, tokens: null })
      },
      loginWithEmail: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            return { error: error.message }
          }

          if (data.user) {
            set({
              isAuthenticated: true,
              user: {
                id: data.user.id,
                name: data.user.user_metadata.full_name || data.user.email?.split('@')[0],
                email: data.user.email || '',
                avatar: data.user.user_metadata.avatar_url,
                role: 'admin'
              }
            })
          }

          return {}
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed'
          return { error: errorMessage }
        }
      },

      registerWithEmail: async (email: string, password: string, name: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
              }
            }
          })

          if (error) {
            return { error: error.message }
          }

          if (data.user) {
            // Note: Supabase sends a confirmation email by default
            // User won't be fully authenticated until they confirm
            return {}
          }

          return {}
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed'
          return { error: errorMessage }
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })

          if (error) {
            return { error: error.message }
          }

          return {}
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password reset failed'
          return { error: errorMessage }
        }
      },

      checkSession: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
            set({
                isAuthenticated: true,
                user: {
                    id: session.user.id,
                    name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
                    email: session.user.email || '',
                    avatar: session.user.user_metadata.avatar_url
                }
            })
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
)