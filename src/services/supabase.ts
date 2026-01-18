import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a safe client that won't crash if keys are missing
// This allows the app to load even if Supabase isn't configured
const createSafeClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. App will run in LOCAL-ONLY mode.')
    // Return a dummy object that explicitly fails data operations but keeps app alive
    return {
      auth: {
        signInWithOAuth: () => Promise.reject(new Error('Supabase not configured. Please add credentials in Settings.')),
        signInWithPassword: () => Promise.reject(new Error('Supabase not configured.')),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: (table: string) => ({
        select: () => ({ 
            order: () => Promise.resolve({ data: [], error: null }),
            eq: () => Promise.resolve({ data: [], error: null }),
            single: () => Promise.resolve({ data: null, error: null })
        }),
        insert: () => Promise.reject(new Error('Database not connected. Please configure Supabase in Settings.')),
        update: () => ({ eq: () => Promise.reject(new Error('Database not connected.')) }),
        delete: () => ({ eq: () => Promise.reject(new Error('Database not connected.')) }),
        upsert: () => Promise.reject(new Error('Database not connected.'))
      }),
      storage: {
        from: () => ({
            upload: () => Promise.reject(new Error('Storage not connected.')),
            getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      }
    } as any
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSafeClient()

export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey
}