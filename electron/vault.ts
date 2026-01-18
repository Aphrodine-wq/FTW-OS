import { ipcMain, app, safeStorage } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'

const VAULT_PATH = path.join(app.getPath('userData'), 'ftw_vault.enc')
const MASTER_KEY_PATH = path.join(app.getPath('userData'), 'ftw_master.enc') // Changed extension to imply encryption
const LEGACY_KEY_PATH = path.join(app.getPath('userData'), 'ftw_master.key') // Keep for migration

// Encryption Helpers (AES-256-GCM)
function encrypt(text: string, key: Buffer): { iv: string; content: string; tag: string } {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const tag = cipher.getAuthTag()
  return {
    iv: iv.toString('hex'),
    content: encrypted,
    tag: tag.toString('hex')
  }
}

function decrypt(encrypted: { iv: string; content: string; tag: string }, key: Buffer): string {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(encrypted.iv, 'hex'))
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'))
  let decrypted = decipher.update(encrypted.content, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// Master Key Management
let masterKey: Buffer | null = null

function getOrCreateMasterKey(): Buffer {
  if (masterKey) return masterKey

  // Check if safeStorage is available (it should be on prod builds of macOS/Windows)
  const useSafeStorage = safeStorage.isEncryptionAvailable()

  if (fs.existsSync(MASTER_KEY_PATH)) {
    // New Secure Path: Read encrypted master key from disk
    const encryptedKeyHex = fs.readFileSync(MASTER_KEY_PATH, 'utf8')
    if (useSafeStorage) {
      try {
        masterKey = safeStorage.decryptString(Buffer.from(encryptedKeyHex, 'hex')) as any // Type cast as Buffer
        // In some electron versions decryptString returns string, others Buffer. 
        // We need a Buffer for AES. If it's a string, Buffer.from(str) works.
        if (!Buffer.isBuffer(masterKey)) {
             masterKey = Buffer.from(masterKey as unknown as string, 'utf8')
        }
      } catch (e) {
        console.error('Failed to decrypt master key with safeStorage:', e)
        // Fallback or critical error
        throw new Error('Critical Security Error: Could not decrypt master key.')
      }
    } else {
      // Fallback: It was stored plainly (dev mode) or platform doesn't support it
      masterKey = Buffer.from(encryptedKeyHex, 'hex')
    }
  } else if (fs.existsSync(LEGACY_KEY_PATH)) {
    // Migration: We found an old insecure key
    console.log('Migrating legacy master key to secure storage...')
    const raw = fs.readFileSync(LEGACY_KEY_PATH)
    masterKey = raw
    
    // Save it securely now
    if (useSafeStorage) {
      const encryptedKey = safeStorage.encryptString(raw.toString('utf8'))
      fs.writeFileSync(MASTER_KEY_PATH, encryptedKey.toString('hex'))
    } else {
      fs.writeFileSync(MASTER_KEY_PATH, raw.toString('hex'))
    }
    
    // Rename legacy so we don't use it again (or delete it)
    fs.moveSync(LEGACY_KEY_PATH, LEGACY_KEY_PATH + '.bak')
  } else {
    // Create New Key
    masterKey = crypto.randomBytes(32)
    const keyString = masterKey.toString('utf8') // We store string representation if using encryptString
    
    if (useSafeStorage) {
       // On Windows/Mac, this encrypts with OS user credentials
       const encryptedKey = safeStorage.encryptString(keyString)
       fs.writeFileSync(MASTER_KEY_PATH, encryptedKey.toString('hex'))
    } else {
       // Linux or Dev fallback: Store raw hex
       fs.writeFileSync(MASTER_KEY_PATH, masterKey.toString('hex'))
    }
  }
  
  // Ensure we return a Buffer
  if (!Buffer.isBuffer(masterKey)) {
      masterKey = Buffer.from(masterKey as any) // Safety catch
  }
  
  return masterKey
}

export function setupVaultHandlers() {
  ipcMain.handle('vault:set', async (_, { key, value }) => {
    try {
      const mk = getOrCreateMasterKey()
      let vaultData: Record<string, any> = {}

      if (fs.existsSync(VAULT_PATH)) {
        try {
            const raw = await fs.readJSON(VAULT_PATH)
            const decryptedJson = decrypt(raw, mk)
            vaultData = JSON.parse(decryptedJson)
        } catch (e) {
            console.error('Vault Corrupt or Key Mismatch, resetting:', e)
            vaultData = {}
        }
      }

      vaultData[key] = value

      const encrypted = encrypt(JSON.stringify(vaultData), mk)
      await fs.writeJSON(VAULT_PATH, encrypted)
      return true
    } catch (e) {
      console.error('Vault Set Error:', e)
      return false
    }
  })

  ipcMain.handle('vault:get', async (_, key) => {
    try {
      if (!fs.existsSync(VAULT_PATH)) return null
      
      const mk = getOrCreateMasterKey()
      const raw = await fs.readJSON(VAULT_PATH)
      const decryptedJson = decrypt(raw, mk)
      const vaultData = JSON.parse(decryptedJson)
      
      return vaultData[key] || null
    } catch (e) {
      console.error('Vault Get Error:', e)
      return null
    }
  })

  ipcMain.handle('vault:delete', async (_, key) => {
    try {
      if (!fs.existsSync(VAULT_PATH)) return true
      
      const mk = getOrCreateMasterKey()
      const raw = await fs.readJSON(VAULT_PATH)
      const decryptedJson = decrypt(raw, mk)
      const vaultData = JSON.parse(decryptedJson)
      
      delete vaultData[key]
      
      const encrypted = encrypt(JSON.stringify(vaultData), mk)
      await fs.writeJSON(VAULT_PATH, encrypted)
      return true
    } catch (e) {
      console.error('Vault Delete Error:', e)
      return false
    }
  })

  ipcMain.handle('vault:is-available', async () => {
    return safeStorage.isEncryptionAvailable()
  })
}