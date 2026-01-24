import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import initSqlJs, { Database } from 'sql.js'

const DATA_DIR = path.join(app.getPath('userData'), 'data')
const DB_PATH = path.join(DATA_DIR, 'ftwos.db')
const JSON_BACKUP_DIR = path.join(DATA_DIR, 'json_backup')

let db: Database | null = null

// Table schemas for all data types
const SCHEMAS = {
  invoices: `
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoiceNumber TEXT NOT NULL,
      clientId TEXT,
      clientName TEXT,
      clientEmail TEXT,
      clientAddress TEXT,
      issueDate TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      currency TEXT DEFAULT 'USD',
      subtotal REAL DEFAULT 0,
      taxRate REAL DEFAULT 0,
      taxAmount REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      notes TEXT,
      terms TEXT,
      items TEXT, -- JSON array of line items
      payments TEXT, -- JSON array of payments
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `,
  clients: `
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      company TEXT,
      notes TEXT,
      tags TEXT, -- JSON array
      totalSpent REAL DEFAULT 0,
      invoiceCount INTEGER DEFAULT 0,
      lastActive TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `,
  expenses: `
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      vendor TEXT,
      date TEXT NOT NULL,
      receiptPath TEXT,
      notes TEXT,
      tags TEXT, -- JSON array
      recurring INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `,
  products: `
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      unit TEXT DEFAULT 'unit',
      category TEXT,
      sku TEXT,
      taxable INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `,
  tasks: `
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      projectId TEXT,
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      dueDate TEXT,
      assignee TEXT,
      tags TEXT, -- JSON array
      estimatedHours REAL,
      actualHours REAL,
      completedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `,
  projects: `
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      clientId TEXT,
      status TEXT DEFAULT 'active',
      startDate TEXT,
      endDate TEXT,
      budget REAL,
      hourlyRate REAL,
      tags TEXT, -- JSON array
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `,
  leads: `
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      source TEXT,
      status TEXT DEFAULT 'new',
      value REAL,
      notes TEXT,
      tags TEXT, -- JSON array
      nextFollowUp TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `,
  proposals: `
    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      clientId TEXT,
      leadId TEXT,
      content TEXT,
      status TEXT DEFAULT 'draft',
      value REAL,
      validUntil TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `,
  recurring: `
    CREATE TABLE IF NOT EXISTS recurring (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      templateId TEXT,
      clientId TEXT,
      frequency TEXT DEFAULT 'monthly',
      nextRun TEXT,
      lastRun TEXT,
      enabled INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `,
  updates: `
    CREATE TABLE IF NOT EXISTS updates (
      id TEXT PRIMARY KEY,
      projectId TEXT,
      type TEXT,
      content TEXT NOT NULL,
      authorId TEXT,
      createdAt TEXT NOT NULL
    )
  `,
  subscriptions: `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      clientId TEXT,
      productId TEXT,
      amount REAL NOT NULL,
      frequency TEXT DEFAULT 'monthly',
      startDate TEXT,
      nextBillingDate TEXT,
      status TEXT DEFAULT 'active',
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `,
  reports: `
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      data TEXT, -- JSON blob
      generatedAt TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `,
  integrations: `
    CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      config TEXT, -- JSON blob
      enabled INTEGER DEFAULT 1,
      lastSync TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `,
  document_registry: `
    CREATE TABLE IF NOT EXISTS document_registry (
      id TEXT PRIMARY KEY,
      originalPath TEXT NOT NULL,
      currentPath TEXT NOT NULL,
      category TEXT,
      confidence REAL,
      sortedAt TEXT,
      createdAt TEXT NOT NULL
    )
  `,
  time_entries: `
    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      projectId TEXT,
      taskId TEXT,
      description TEXT,
      startTime TEXT NOT NULL,
      endTime TEXT,
      duration INTEGER, -- seconds
      billable INTEGER DEFAULT 1,
      billed INTEGER DEFAULT 0,
      hourlyRate REAL,
      createdAt TEXT NOT NULL
    )
  `,
  settings: `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT
    )
  `
}

// Index definitions for common queries
const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(clientId)',
  'CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)',
  'CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(issueDate)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(projectId)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
  'CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)',
  'CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category)',
  'CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(projectId)',
  'CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name)',
  'CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)'
]

export class SQLiteService {
  static async init(): Promise<boolean> {
    if (db) return true

    try {
      // Ensure data directory exists
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }

      // Initialize sql.js
      const SQL = await initSqlJs()

      // Load existing database or create new one
      if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH)
        db = new SQL.Database(fileBuffer)
        console.log('SQLite: Loaded existing database')
      } else {
        db = new SQL.Database()
        console.log('SQLite: Created new database')
      }

      // Create all tables
      for (const [table, schema] of Object.entries(SCHEMAS)) {
        db.run(schema)
        console.log(`SQLite: Ensured table '${table}' exists`)
      }

      // Create indexes
      for (const indexSql of INDEXES) {
        db.run(indexSql)
      }

      // Migrate from JSON if needed
      await this.migrateFromJSON()

      // Save database
      await this.save()

      console.log('SQLite: Initialization complete')
      return true
    } catch (error) {
      console.error('SQLite: Failed to initialize', error)
      return false
    }
  }

  static async save(): Promise<boolean> {
    if (!db) return false

    try {
      const data = db.export()
      const buffer = Buffer.from(data)
      fs.writeFileSync(DB_PATH, buffer)
      return true
    } catch (error) {
      console.error('SQLite: Failed to save database', error)
      return false
    }
  }

  // Generic CRUD operations
  static async getAll<T>(table: string): Promise<T[]> {
    if (!db) {
      await this.init()
    }
    if (!db) return []

    try {
      const stmt = db.prepare(`SELECT * FROM ${table}`)
      const results: T[] = []
      
      while (stmt.step()) {
        const row = stmt.getAsObject() as any
        // Parse JSON fields if they exist
        for (const key of Object.keys(row)) {
          if (typeof row[key] === 'string' && 
              (row[key].startsWith('[') || row[key].startsWith('{'))) {
            try {
              row[key] = JSON.parse(row[key])
            } catch {
              // Keep as string if not valid JSON
            }
          }
        }
        results.push(row)
      }
      stmt.free()
      
      return results
    } catch (error) {
      console.error(`SQLite: Failed to get all from ${table}`, error)
      return []
    }
  }

  static async getById<T>(table: string, id: string): Promise<T | null> {
    if (!db) {
      await this.init()
    }
    if (!db) return null

    try {
      const stmt = db.prepare(`SELECT * FROM ${table} WHERE id = ?`)
      stmt.bind([id])
      
      if (stmt.step()) {
        const row = stmt.getAsObject() as any
        // Parse JSON fields
        for (const key of Object.keys(row)) {
          if (typeof row[key] === 'string' && 
              (row[key].startsWith('[') || row[key].startsWith('{'))) {
            try {
              row[key] = JSON.parse(row[key])
            } catch {
              // Keep as string
            }
          }
        }
        stmt.free()
        return row
      }
      stmt.free()
      return null
    } catch (error) {
      console.error(`SQLite: Failed to get by id from ${table}`, error)
      return null
    }
  }

  static async upsertMany<T extends { id: string }>(table: string, items: T[]): Promise<boolean> {
    if (!db) {
      await this.init()
    }
    if (!db || items.length === 0) return true

    try {
      db.run('BEGIN TRANSACTION')

      for (const item of items) {
        // Build upsert query dynamically
        const columns = Object.keys(item)
        const placeholders = columns.map(() => '?').join(', ')
        const values = columns.map(col => {
          const val = (item as any)[col]
          // Stringify arrays and objects
          if (Array.isArray(val) || (typeof val === 'object' && val !== null && !(val instanceof Date))) {
            return JSON.stringify(val)
          }
          if (val instanceof Date) {
            return val.toISOString()
          }
          return val
        })

        const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
        db.run(sql, values)
      }

      db.run('COMMIT')
      await this.save()
      return true
    } catch (error) {
      console.error(`SQLite: Failed to upsert into ${table}`, error)
      db?.run('ROLLBACK')
      return false
    }
  }

  static async deleteById(table: string, id: string): Promise<boolean> {
    if (!db) {
      await this.init()
    }
    if (!db) return false

    try {
      db.run(`DELETE FROM ${table} WHERE id = ?`, [id])
      await this.save()
      return true
    } catch (error) {
      console.error(`SQLite: Failed to delete from ${table}`, error)
      return false
    }
  }

  // Settings-specific methods (key-value store)
  static async getSettings(): Promise<Record<string, any>> {
    if (!db) {
      await this.init()
    }
    if (!db) return {}

    try {
      const stmt = db.prepare('SELECT key, value FROM settings')
      const settings: Record<string, any> = {}
      
      while (stmt.step()) {
        const row = stmt.getAsObject() as { key: string; value: string }
        try {
          settings[row.key] = JSON.parse(row.value)
        } catch {
          settings[row.key] = row.value
        }
      }
      stmt.free()
      
      return settings
    } catch (error) {
      console.error('SQLite: Failed to get settings', error)
      return {}
    }
  }

  static async saveSettings(settings: Record<string, any>): Promise<boolean> {
    if (!db) {
      await this.init()
    }
    if (!db) return false

    try {
      db.run('BEGIN TRANSACTION')
      
      const now = new Date().toISOString()
      for (const [key, value] of Object.entries(settings)) {
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value)
        db.run(
          'INSERT OR REPLACE INTO settings (key, value, updatedAt) VALUES (?, ?, ?)',
          [key, valueStr, now]
        )
      }
      
      db.run('COMMIT')
      await this.save()
      return true
    } catch (error) {
      console.error('SQLite: Failed to save settings', error)
      db?.run('ROLLBACK')
      return false
    }
  }

  // Migration from JSON files
  private static async migrateFromJSON(): Promise<void> {
    const jsonFiles = [
      'invoices', 'clients', 'expenses', 'products', 'tasks', 
      'leads', 'proposals', 'recurring', 'updates', 'subscriptions',
      'reports', 'integrations', 'document_registry'
    ]

    let migrated = false

    for (const file of jsonFiles) {
      const jsonPath = path.join(DATA_DIR, `${file}.json`)
      if (fs.existsSync(jsonPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
          if (Array.isArray(data) && data.length > 0) {
            // Check if table is empty before migrating
            const existing = await this.getAll(file)
            if (existing.length === 0) {
              await this.upsertMany(file, data)
              console.log(`SQLite: Migrated ${data.length} records from ${file}.json`)
              migrated = true
            }
          }
        } catch (error) {
          console.error(`SQLite: Failed to migrate ${file}.json`, error)
        }
      }
    }

    // Migrate settings separately (it's an object, not array)
    const settingsPath = path.join(DATA_DIR, 'settings.json')
    if (fs.existsSync(settingsPath)) {
      try {
        const existingSettings = await this.getSettings()
        if (Object.keys(existingSettings).length === 0) {
          const data = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
          await this.saveSettings(data)
          console.log('SQLite: Migrated settings.json')
          migrated = true
        }
      } catch (error) {
        console.error('SQLite: Failed to migrate settings.json', error)
      }
    }

    // Backup and remove JSON files after successful migration
    if (migrated) {
      if (!fs.existsSync(JSON_BACKUP_DIR)) {
        fs.mkdirSync(JSON_BACKUP_DIR, { recursive: true })
      }

      for (const file of [...jsonFiles, 'settings']) {
        const jsonPath = path.join(DATA_DIR, `${file}.json`)
        if (fs.existsSync(jsonPath)) {
          const backupPath = path.join(JSON_BACKUP_DIR, `${file}.json`)
          fs.copyFileSync(jsonPath, backupPath)
          fs.unlinkSync(jsonPath)
          console.log(`SQLite: Backed up and removed ${file}.json`)
        }
      }
    }
  }

  // Query helper for complex queries
  static query<T>(sql: string, params: any[] = []): T[] {
    if (!db) return []

    try {
      const stmt = db.prepare(sql)
      if (params.length > 0) {
        stmt.bind(params)
      }
      
      const results: T[] = []
      while (stmt.step()) {
        const row = stmt.getAsObject() as any
        // Parse JSON fields
        for (const key of Object.keys(row)) {
          if (typeof row[key] === 'string' && 
              (row[key].startsWith('[') || row[key].startsWith('{'))) {
            try {
              row[key] = JSON.parse(row[key])
            } catch {
              // Keep as string
            }
          }
        }
        results.push(row)
      }
      stmt.free()
      
      return results
    } catch (error) {
      console.error('SQLite: Query failed', error)
      return []
    }
  }

  // Export all data (for backups)
  static async exportAll(): Promise<Record<string, any[]>> {
    const tables = Object.keys(SCHEMAS).filter(t => t !== 'settings')
    const data: Record<string, any[]> = {}

    for (const table of tables) {
      data[table] = await this.getAll(table)
    }
    data.settings = [await this.getSettings()]

    return data
  }

  // Import data (for restores)
  static async importAll(data: Record<string, any[]>): Promise<boolean> {
    try {
      for (const [table, items] of Object.entries(data)) {
        if (table === 'settings' && items[0]) {
          await this.saveSettings(items[0])
        } else if (Array.isArray(items) && items.length > 0) {
          await this.upsertMany(table, items)
        }
      }
      return true
    } catch (error) {
      console.error('SQLite: Import failed', error)
      return false
    }
  }
}
