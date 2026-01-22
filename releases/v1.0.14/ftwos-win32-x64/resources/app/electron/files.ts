import { ipcMain, dialog } from 'electron'
import fs from 'fs-extra'
import path from 'path'

export function setupFileHandlers() {
  // Open Directory Dialog
  ipcMain.handle('dialog:open-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // List Files (Recursive-ish or just one level for now)
  // For simplicity, we'll do one level, or a simple recursive tree if small
  ipcMain.handle('files:list', async (_, dirPath) => {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true })
      return items.map(item => ({
        name: item.name,
        path: path.join(dirPath, item.name),
        isDirectory: item.isDirectory()
      })).sort((a, b) => {
        // Folders first
        if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name)
        return a.isDirectory ? -1 : 1
      })
    } catch (e) {
      console.error('Failed to list files', e)
      return []
    }
  })

  // Read File
  ipcMain.handle('files:read', async (_, filePath) => {
    try {
      return await fs.readFile(filePath, 'utf8')
    } catch (e) {
      console.error('Failed to read file', e)
      throw e
    }
  })

  // Write File
  ipcMain.handle('files:write', async (_, { filePath, content }) => {
    try {
      await fs.writeFile(filePath, content, 'utf8')
      return true
    } catch (e) {
      console.error('Failed to write file', e)
      return false
    }
  })
}