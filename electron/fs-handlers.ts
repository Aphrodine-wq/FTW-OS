import { ipcMain, app, dialog } from 'electron'
import fs from 'fs-extra'
import path from 'path'

// Document categories for AI sorting
const DOCUMENT_CATEGORIES = [
  'Invoices',
  'Contracts', 
  'Tax Documents',
  'Receipts',
  'Reports',
  'Correspondence'
] as const

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

  // Open Directory Dialog (merged from files.ts)
  ipcMain.handle('dialog:open-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // List Files with sorting (merged from files.ts)
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

  // Read File (merged from files.ts)
  ipcMain.handle('files:read', async (_, filePath) => {
    try {
      return await fs.readFile(filePath, 'utf8')
    } catch (e) {
      console.error('Failed to read file', e)
      throw e
    }
  })

  // Write File (merged from files.ts)
  ipcMain.handle('files:write', async (_, { filePath, content }) => {
    try {
      await fs.writeFile(filePath, content, 'utf8')
      return true
    } catch (e) {
      console.error('Failed to write file', e)
      return false
    }
  })

  // === NEW: Document AI Sorting Handlers ===

  // Read document text for AI classification (truncated for LLM context)
  ipcMain.handle('document:read-text', async (_, filePath: string) => {
    try {
      const ext = path.extname(filePath).toLowerCase()
      const supportedExts = ['.txt', '.md', '.html', '.htm', '.json', '.csv']
      
      if (!supportedExts.includes(ext)) {
        return { success: false, error: `Unsupported file type: ${ext}` }
      }

      const content = await fs.readFile(filePath, 'utf8')
      // Truncate to 4000 chars for LLM context window
      const truncated = content.slice(0, 4000)
      
      return { 
        success: true, 
        content: truncated,
        truncated: content.length > 4000,
        originalLength: content.length
      }
    } catch (e) {
      console.error('Failed to read document:', e)
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  // Ensure category folders exist in Documents directory
  ipcMain.handle('document:ensure-folders', async () => {
    try {
      const documentsPath = app.getPath('documents')
      
      for (const category of DOCUMENT_CATEGORIES) {
        const categoryPath = path.join(documentsPath, category)
        await fs.ensureDir(categoryPath)
      }
      
      return { success: true, basePath: documentsPath, categories: DOCUMENT_CATEGORIES }
    } catch (e) {
      console.error('Failed to create category folders:', e)
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  // Move file to category folder with collision handling
  ipcMain.handle('document:move-to-category', async (_, { sourcePath, category }: { sourcePath: string, category: string }) => {
    try {
      // Validate category
      if (!DOCUMENT_CATEGORIES.includes(category as typeof DOCUMENT_CATEGORIES[number])) {
        return { success: false, error: `Invalid category: ${category}` }
      }

      // Validate source path exists
      if (!await fs.pathExists(sourcePath)) {
        return { success: false, error: 'Source file does not exist' }
      }

      // Prevent directory traversal attacks
      const documentsPath = app.getPath('documents')
      const resolvedSource = path.resolve(sourcePath)
      
      // Build destination path
      const categoryPath = path.join(documentsPath, category)
      await fs.ensureDir(categoryPath)
      
      const fileName = path.basename(sourcePath)
      let destPath = path.join(categoryPath, fileName)
      
      // Handle filename collisions by appending timestamp
      if (await fs.pathExists(destPath)) {
        const ext = path.extname(fileName)
        const base = path.basename(fileName, ext)
        const timestamp = Date.now()
        destPath = path.join(categoryPath, `${base}_${timestamp}${ext}`)
      }
      
      // Move file
      await fs.move(resolvedSource, destPath)
      
      return { 
        success: true, 
        newPath: destPath,
        category,
        fileName: path.basename(destPath)
      }
    } catch (e) {
      console.error('Failed to move document:', e)
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  // Get category folders status
  ipcMain.handle('document:get-categories', async () => {
    try {
      const documentsPath = app.getPath('documents')
      const categories = await Promise.all(
        DOCUMENT_CATEGORIES.map(async (category) => {
          const categoryPath = path.join(documentsPath, category)
          const exists = await fs.pathExists(categoryPath)
          let count = 0
          if (exists) {
            const files = await fs.readdir(categoryPath)
            count = files.length
          }
          return { name: category, path: categoryPath, exists, fileCount: count }
        })
      )
      return { success: true, categories, basePath: documentsPath }
    } catch (e) {
      console.error('Failed to get categories:', e)
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })
}
