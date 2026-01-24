import { app, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import twilio from 'twilio'
import { SupabaseService } from './supabase'

const DATA_DIR = path.join(app.getPath('userData'), 'data')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export class StorageService {
  static getPath(filename: string) {
    return path.join(DATA_DIR, `${filename}.json`)
  }

  static async read<T>(filename: string, defaultValue: T): Promise<T> {
    try {
      const filePath = this.getPath(filename)
      if (!fs.existsSync(filePath)) {
        await this.write(filename, defaultValue)
        return defaultValue
      }
      const data = await fs.promises.readFile(filePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error(`Failed to read ${filename}:`, error)
      return defaultValue
    }
  }

  static async write<T>(filename: string, data: T): Promise<boolean> {
    try {
      const filePath = this.getPath(filename)
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
      
      // Try to sync to Supabase if available
      // Map filename to table name (assuming 1:1 for simplicity)
      if (Array.isArray(data)) {
        await SupabaseService.syncTable(filename, data)
      }
      
      return true
    } catch (error) {
      console.error(`Failed to write ${filename}:`, error)
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
      const registry = await StorageService.read<any[]>('document_registry', [])
      return registry.filter(r => r.category === category)
    } catch (error) {
      console.error('Failed to get documents by category:', error)
      return []
    }
  })
}
