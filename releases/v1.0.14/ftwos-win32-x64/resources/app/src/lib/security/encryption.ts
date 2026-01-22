/**
 * Secure Storage Encryption
 * Uses Electron's safeStorage API for encrypted data storage
 */

/**
 * SecureVault - Encrypted storage wrapper
 * Note: This is a renderer-side wrapper. Actual encryption happens in main process via vault.ts
 * This provides a consistent API for the renderer process.
 */
export class SecureVault {
  /**
   * Store encrypted data
   * @param key - Storage key
   * @param value - Value to encrypt and store
   */
  static async setSecure(key: string, value: any): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      
      // Use IPC to store in main process vault (which uses safeStorage)
      if (window.ipcRenderer) {
        await window.ipcRenderer.invoke('vault:set', { key, value: serialized })
      } else {
        // Fallback for non-Electron environments (development)
        console.warn('SecureVault: IPC not available, using localStorage fallback')
        localStorage.setItem(`secure_${key}`, serialized)
      }
    } catch (error) {
      console.error('SecureVault: Failed to set secure value', error)
      throw error
    }
  }

  /**
   * Retrieve and decrypt data
   * @param key - Storage key
   * @returns Decrypted value or null if not found
   */
  static async getSecure<T>(key: string): Promise<T | null> {
    try {
      let value: string | null = null
      
      // Use IPC to retrieve from main process vault
      if (window.ipcRenderer) {
        value = await window.ipcRenderer.invoke('vault:get', key)
      } else {
        // Fallback for non-Electron environments
        value = localStorage.getItem(`secure_${key}`)
      }
      
      if (!value) return null
      
      return JSON.parse(value) as T
    } catch (error) {
      console.error('SecureVault: Failed to get secure value', error)
      return null
    }
  }

  /**
   * Remove encrypted data
   * @param key - Storage key
   */
  static async removeSecure(key: string): Promise<void> {
    try {
      if (window.ipcRenderer) {
        await window.ipcRenderer.invoke('vault:delete', key)
      } else {
        localStorage.removeItem(`secure_${key}`)
      }
    } catch (error) {
      console.error('SecureVault: Failed to remove secure value', error)
    }
  }

  /**
   * Check if encryption is available
   */
  static async isEncryptionAvailable(): Promise<boolean> {
    try {
      if (window.ipcRenderer) {
        return await window.ipcRenderer.invoke('vault:is-available')
      }
      return false
    } catch {
      return false
    }
  }
}

