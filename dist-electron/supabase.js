"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const storage_1 = require("./storage");
let supabase = null;
class SupabaseService {
    static async init() {
        const settings = await storage_1.StorageService.read('settings', {});
        const { supabaseUrl, supabaseKey } = settings.supabaseConfig || {};
        if (supabaseUrl && supabaseKey) {
            supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
            console.log('Supabase client initialized');
        }
    }
    static getClient() {
        return supabase;
    }
    static async syncTable(table, localData) {
        if (!supabase)
            return;
        // Simple strategy: Upsert local data to Supabase
        // Ideally, we'd handle conflicts and timestamps, but for now we push local state.
        const { error } = await supabase
            .from(table)
            .upsert(localData, { onConflict: 'id' });
        if (error) {
            console.error(`Supabase sync error for ${table}:`, error);
        }
        else {
            console.log(`Synced ${table} to Supabase`);
        }
    }
    static async fetchTable(table) {
        if (!supabase)
            return null;
        const { data, error } = await supabase
            .from(table)
            .select('*');
        if (error) {
            console.error(`Supabase fetch error for ${table}:`, error);
            return null;
        }
        return data;
    }
}
exports.SupabaseService = SupabaseService;
