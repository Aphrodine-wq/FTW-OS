import { ipcMain, app } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'

export function setupFileSystemHandlers() {
  // List directory contents
  ipcMain.handle('fs:ls', async (_, dirPath) => {
    try {
      const targetPath = dirPath || app.getPath('documents')
      const files = await fs.readdir(targetPath)
      
      const details = await Promise.all(files.map(async (file) => {
        try {
          const fullPath = path.join(targetPath, file)
          const stats = await fs.stat(fullPath)
          
          return {
            name: file,
            path: fullPath,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            updatedAt: stats.mtime,
            type: stats.isDirectory() ? 'folder' : path.extname(file).slice(1) || 'file'
          }
        } catch (e) {
          return null
        }
      }))
      
      return details.filter(Boolean)
    } catch (e) {
      console.error('FS Error:', e)
      throw e
    }
  })

  // Get home directory path
  ipcMain.handle('fs:get-home', () => {
    return app.getPath('home')
  })

  // Get documents path
  ipcMain.handle('fs:get-documents', () => {
    return app.getPath('documents')
  })
}
