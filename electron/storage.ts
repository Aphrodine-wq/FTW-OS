import { app, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import twilio from 'twilio'
import { SupabaseService } from './supabase'
import { SQLiteService } from './sqlite'

const DATA_DIR = path.join(app.getPath('userData'), 'data')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Legacy StorageService - now wraps SQLiteService
export class StorageService {
  static getPath(filename: string) {
    return path.join(DATA_DIR, `${filename}.json`)
  }

  // Read now uses SQLite
  static async read<T>(table: string, defaultValue: T): Promise<T> {
    try {
      if (table === 'settings') {
        const settings = await SQLiteService.getSettings()
        return (Object.keys(settings).length > 0 ? settings : defaultValue) as T
      }
      
      const data = await SQLiteService.getAll<any>(table)
      return (data.length > 0 ? data : defaultValue) as T
    } catch (error) {
      console.error(`Failed to read ${table}:`, error)
      return defaultValue
    }
  }

  // Write now uses SQLite
  static async write<T>(table: string, data: T): Promise<boolean> {
    try {
      if (table === 'settings') {
        await SQLiteService.saveSettings(data as Record<string, any>)
      } else if (Array.isArray(data)) {
        await SQLiteService.upsertMany(table, data)
        // Try to sync to Supabase if available
        await SupabaseService.syncTable(table, data)
      }
      
      return true
    } catch (error) {
      console.error(`Failed to write ${table}:`, error)
      return false
    }
  }
}

export function setupStorageHandlers() {
  // Initialize Supabase
  SupabaseService.init()

  // Invoices
  ipcMain.handle('db:get-invoices', async () => {
    return await StorageService.read('invoices', [])
  })

  ipcMain.handle('db:save-invoices', async (_, invoices) => {
    return await StorageService.write('invoices', invoices)
  })

  // Clients
  ipcMain.handle('db:get-clients', async () => {
    return await StorageService.read('clients', [])
  })

  ipcMain.handle('db:save-clients', async (_, clients) => {
    return await StorageService.write('clients', clients)
  })

  // Settings
  ipcMain.handle('db:get-settings', async () => {
    return await StorageService.read('settings', {})
  })

  ipcMain.handle('db:save-settings', async (_, settings) => {
    return await StorageService.write('settings', settings)
  })

  // Products
  ipcMain.handle('db:get-products', async () => {
    return await StorageService.read('products', [])
  })

  ipcMain.handle('db:save-products', async (_, products) => {
    return await StorageService.write('products', products)
  })

  // Expenses
  ipcMain.handle('db:get-expenses', async () => {
    return await StorageService.read('expenses', [])
  })

  ipcMain.handle('db:save-expenses', async (_, expenses) => {
    return await StorageService.write('expenses', expenses)
  })

  // Recurring Profiles
  ipcMain.handle('db:get-recurring', async () => {
    return await StorageService.read('recurring', [])
  })

  ipcMain.handle('db:save-recurring', async (_, profiles) => {
    return await StorageService.write('recurring', profiles)
  })

  // Project Management
  ipcMain.handle('db:get-tasks', async () => {
    return await StorageService.read('tasks', [])
  })

  ipcMain.handle('db:save-tasks', async (_, tasks) => {
    return await StorageService.write('tasks', tasks)
  })

  ipcMain.handle('db:get-updates', async () => {
    return await StorageService.read('updates', [])
  })

  ipcMain.handle('db:save-updates', async (_, updates) => {
    return await StorageService.write('updates', updates)
  })

  // SMS Handler
  ipcMain.removeHandler('send-sms') // Prevent duplicate handler error
  ipcMain.handle('send-sms', async (_, { to, body }) => {
    try {
      const settings = await StorageService.read('settings', {}) as any
      const { accountSid, authToken, fromNumber } = settings.smsConfig || {}

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error('Twilio configuration missing')
      }

      const client = twilio(accountSid, authToken)
      const message = await client.messages.create({
        body,
        from: fromNumber,
        to
      })

      return { success: true, sid: message.sid }
    } catch (error: any) {
      console.error('SMS Send Failed:', error)
      return { success: false, error: error.message }
    }
  })

  // Backup & Restore
  ipcMain.handle('db:export-data', async () => {
    try {
      const data = {
        invoices: await StorageService.read('invoices', []),
        clients: await StorageService.read('clients', []),
        settings: await StorageService.read('settings', {}),
        products: await StorageService.read('products', []),
        expenses: await StorageService.read('expenses', []),
        recurring: await StorageService.read('recurring', [])
      }
      return data
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  })

  ipcMain.handle('db:import-data', async (_, data) => {
    try {
      if (data.invoices) await StorageService.write('invoices', data.invoices)
      if (data.clients) await StorageService.write('clients', data.clients)
      if (data.settings) await StorageService.write('settings', data.settings)
      if (data.products) await StorageService.write('products', data.products)
      if (data.expenses) await StorageService.write('expenses', data.expenses)
      if (data.recurring) await StorageService.write('recurring', data.recurring)
      return true
    } catch (error) {
      console.error('Import failed:', error)
      throw error
    }
  })

  // CRM: Leads
  ipcMain.handle('db:get-leads', async () => {
    return await StorageService.read('leads', [])
  })

  ipcMain.handle('db:save-leads', async (_, leads) => {
    return await StorageService.write('leads', leads)
  })

  // CRM: Proposals
  ipcMain.handle('db:get-proposals', async () => {
    return await StorageService.read('proposals', [])
  })

  ipcMain.handle('db:save-proposals', async (_, proposals) => {
    return await StorageService.write('proposals', proposals)
  })

  // Subscriptions
  ipcMain.handle('db:get-subscriptions', async () => {
    return await StorageService.read('subscriptions', [])
  })

  ipcMain.handle('db:save-subscriptions', async (_, subscriptions) => {
    return await StorageService.write('subscriptions', subscriptions)
  })

  // Reports
  ipcMain.handle('db:get-reports', async () => {
    return await StorageService.read('reports', [])
  })

  ipcMain.handle('db:save-reports', async (_, reports) => {
    return await StorageService.write('reports', reports)
  })

  // Integrations
  ipcMain.handle('db:get-integrations', async () => {
    return await StorageService.read('integrations', [])
  })

  ipcMain.handle('db:save-integrations', async (_, integrations) => {
    return await StorageService.write('integrations', integrations)
  })

  // Currency Rates (Mock for now, or fetch from API)
  ipcMain.handle('settings:get-currency-rates', async () => {
    return { 'USD': 1, 'EUR': 0.92, 'GBP': 0.79, 'CAD': 1.36 }
  })

  // Document Registry - Track AI-sorted documents
  ipcMain.handle('db:get-document-registry', async () => {
    return await StorageService.read('document_registry', [])
  })

  ipcMain.handle('db:save-document-registry', async (_, registry) => {
    return await StorageService.write('document_registry', registry)
  })

  ipcMain.handle('db:add-document-record', async (_, record: {
    id: string
    originalPath: string
    currentPath: string
    category: string
    confidence: number
    sortedAt: string
  }) => {
    try {
      const registry = await StorageService.read<any[]>('document_registry', [])
      
      // Check if document already exists (by original path)
      const existingIndex = registry.findIndex(r => r.originalPath === record.originalPath)
      if (existingIndex >= 0) {
        registry[existingIndex] = record
      } else {
        registry.push(record)
      }
      
      await StorageService.write('document_registry', registry)
      return { success: true }
    } catch (error) {
      console.error('Failed to add document record:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('db:get-documents-by-category', async (_, category: string) => {
    try {
      // Use SQLite query for better performance
      return SQLiteService.query(
        'SELECT * FROM document_registry WHERE category = ?',
        [category]
      )
    } catch (error) {
      console.error('Failed to get documents by category:', error)
      return []
    }
  })

  // Time Entries (for time tracking)
  ipcMain.handle('db:get-time-entries', async () => {
    return await StorageService.read('time_entries', [])
  })

  ipcMain.handle('db:save-time-entries', async (_, entries) => {
    return await StorageService.write('time_entries', entries)
  })

  // Projects
  ipcMain.handle('db:get-projects', async () => {
    return await StorageService.read('projects', [])
  })

  ipcMain.handle('db:save-projects', async (_, projects) => {
    return await StorageService.write('projects', projects)
  })

  // Advanced Query Handlers (leverage SQLite for speed)
  ipcMain.handle('db:query', async (_, { table, where, orderBy, limit }) => {
    try {
      let sql = `SELECT * FROM ${table}`
      const params: any[] = []

      if (where && Object.keys(where).length > 0) {
        const conditions = Object.entries(where).map(([key, value]) => {
          params.push(value)
          return `${key} = ?`
        })
        sql += ` WHERE ${conditions.join(' AND ')}`
      }

      if (orderBy) {
        sql += ` ORDER BY ${orderBy.column} ${orderBy.direction || 'ASC'}`
      }

      if (limit) {
        sql += ` LIMIT ${limit}`
      }

      return SQLiteService.query(sql, params)
    } catch (error) {
      console.error('Query failed:', error)
      return []
    }
  })

  // Get invoices by client (optimized query)
  ipcMain.handle('db:get-invoices-by-client', async (_, clientId: string) => {
    return SQLiteService.query(
      'SELECT * FROM invoices WHERE clientId = ? ORDER BY issueDate DESC',
      [clientId]
    )
  })

  // Get tasks by project (optimized query)
  ipcMain.handle('db:get-tasks-by-project', async (_, projectId: string) => {
    return SQLiteService.query(
      'SELECT * FROM tasks WHERE projectId = ? ORDER BY createdAt DESC',
      [projectId]
    )
  })

  // Get expenses by date range (optimized query)
  ipcMain.handle('db:get-expenses-by-range', async (_, { startDate, endDate }) => {
    return SQLiteService.query(
      'SELECT * FROM expenses WHERE date >= ? AND date <= ? ORDER BY date DESC',
      [startDate, endDate]
    )
  })

  // Dashboard stats (single query instead of multiple reads)
  ipcMain.handle('db:get-dashboard-stats', async () => {
    try {
      const invoiceStats = SQLiteService.query<any>(
        `SELECT 
          COUNT(*) as totalInvoices,
          SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END) as totalRevenue,
          SUM(CASE WHEN status = 'pending' OR status = 'sent' THEN total ELSE 0 END) as pendingRevenue,
          SUM(CASE WHEN status = 'overdue' THEN total ELSE 0 END) as overdueRevenue
        FROM invoices`
      )[0] || {}

      const clientCount = SQLiteService.query<any>(
        'SELECT COUNT(*) as count FROM clients'
      )[0]?.count || 0

      const taskStats = SQLiteService.query<any>(
        `SELECT 
          COUNT(*) as totalTasks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgressTasks
        FROM tasks`
      )[0] || {}

      const expenseTotal = SQLiteService.query<any>(
        'SELECT SUM(amount) as total FROM expenses'
      )[0]?.total || 0

      return {
        invoices: invoiceStats,
        clients: clientCount,
        tasks: taskStats,
        expenses: expenseTotal
      }
    } catch (error) {
      console.error('Failed to get dashboard stats:', error)
      return null
    }
  })

  // Full database export (for backups) - now uses SQLite export
  ipcMain.handle('db:export-all', async () => {
    try {
      return await SQLiteService.exportAll()
    } catch (error) {
      console.error('Full export failed:', error)
      throw error
    }
  })

  // Full database import (for restores)
  ipcMain.handle('db:import-all', async (_, data) => {
    try {
      return await SQLiteService.importAll(data)
    } catch (error) {
      console.error('Full import failed:', error)
      throw error
    }
  })
}
