import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { StorageService } from './storage'

let supabase: SupabaseClient | null = null

export class SupabaseService {
  static async init() {
    const settings = await StorageService.read('settings', {}) as any
    const { supabaseUrl, supabaseKey } = settings.supabaseConfig || {}

    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey)
      console.log('Supabase client initialized')
    }
  }

  static getClient() {
    return supabase
  }

  static async syncTable(table: string, localData: any[]) {
    if (!supabase) return

    // Simple strategy: Upsert local data to Supabase
    // Ideally, we'd handle conflicts and timestamps, but for now we push local state.
    const { error } = await supabase
      .from(table)
      .upsert(localData, { onConflict: 'id' })

    if (error) {
      console.error(`Supabase sync error for ${table}:`, error)
    } else {
      console.log(`Synced ${table} to Supabase`)
    }
  }

  static async fetchTable(table: string) {
    if (!supabase) return null

    const { data, error } = await supabase
      .from(table)
      .select('*')

    if (error) {
      console.error(`Supabase fetch error for ${table}:`, error)
      return null
    }
    return data
  }
}
