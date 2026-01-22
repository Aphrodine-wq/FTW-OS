import { app, ipcMain, dialog } from 'electron'
import * as fs from 'fs-extra'
import * as path from 'path'
import archiver from 'archiver'

export function setupBackupHandlers() {
  const DATA_DIR = path.join(app.getPath('userData'), 'data')
  const BACKUP_DIR = path.join(app.getPath('userData'), 'backups')

  // Ensure backup directory exists
  fs.ensureDirSync(BACKUP_DIR)

  /**
   * Create a backup of the data directory
   */
  ipcMain.handle('backup:create', async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.zip`)
      const output = fs.createWriteStream(backupPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`Backup created: ${backupPath} (${archive.pointer()} total bytes)`)
          resolve({ success: true, path: backupPath, size: archive.pointer() })
        })

        archive.on('error', (err: any) => {
          console.error('Backup error:', err)
          reject({ success: false, error: err.message })
        })

        archive.pipe(output)
        archive.directory(DATA_DIR, false)
        archive.finalize()
      })
    } catch (error) {
      console.error('Backup failed:', error)
      return { success: false, error: String(error) }
    }
  })

  /**
   * List all available backups
   */
  ipcMain.handle('backup:list', async () => {
    try {
      const files = await fs.readdir(BACKUP_DIR)
      const backups = await Promise.all(
        files
          .filter(f => f.endsWith('.zip'))
          .map(async file => {
            const filePath = path.join(BACKUP_DIR, file)
            const stats = await fs.stat(filePath)
            return {
              name: file,
              path: filePath,
              size: stats.size,
              created: stats.mtime
            }
          })
      )
      // Sort by newest first
      return { success: true, backups: backups.sort((a, b) => b.created.getTime() - a.created.getTime()) }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  /**
   * Restore from a backup file (Manual selection or internal path)
   */
  ipcMain.handle('backup:restore', async (_, backupPath?: string) => {
    try {
      let targetZip = backupPath

      // If no path provided, open dialog
      if (!targetZip) {
        const result = await dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [{ name: 'Zip Archives', extensions: ['zip'] }]
        })
        if (result.canceled || result.filePaths.length === 0) return { success: false, error: 'Cancelled' }
        targetZip = result.filePaths[0]
      }

      if (!targetZip) return { success: false, error: 'No file selected' }

      // 1. Create a temp safety backup of current data before overwriting
      const safetyBackup = path.join(BACKUP_DIR, `pre-restore-${Date.now()}.zip`)
      await new Promise<void>((resolve, reject) => {
         const output = fs.createWriteStream(safetyBackup)
         const archive = archiver('zip')
         output.on('close', () => resolve())
         archive.on('error', reject)
         archive.pipe(output)
         archive.directory(DATA_DIR, false)
         archive.finalize()
      })

      // 2. Clear current data directory
      await fs.emptyDir(DATA_DIR)

      // 3. Extract zip (Using basic unzip logic or specialized lib if needed)
      // Since we don't have 'unzipper' or 'adm-zip' in package.json yet, we might need to add it.
      // For now, we'll assume the user will install 'adm-zip' or similar. 
      // ACTUALLY: Let's check package.json. We don't have an unzip lib.
      // Strategy: We will use a system command (tar/powershell) or recommend installing 'adm-zip'.
      // For robustness in this plan, I'll add 'adm-zip' to the plan or use a simpler approach.
      
      // Let's use a shell command for now as a fallback if no lib, 
      // but 'adm-zip' is safer. 
      // I will add a TODO to install adm-zip. 
      
      // Temporary: Just copy the zip to data dir (not a real restore) - wait, that's bad.
      // Let's use 'tar' (available on Win10+ and Mac/Linux)
      const { exec } = require('child_process')
      await new Promise<void>((resolve, reject) => {
        // tar -xf archive.zip -C /target/directory
        exec(`tar -xf "${targetZip}" -C "${DATA_DIR}"`, (err: any) => {
            if (err) reject(err)
            else resolve()
        })
      })

      return { success: true }
    } catch (error) {
      console.error('Restore failed:', error)
      return { success: false, error: String(error) }
    }
  })
}
