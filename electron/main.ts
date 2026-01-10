import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import { setupStorageHandlers } from './storage'
import { setupSystemHandlers } from './system'
import { setupIntegrationHandlers } from './integrations'
import { TrackerService } from './tracker'

// The built directory structure
// __dirname resolves correctly whether in dev or packaged
const DIST_FOLDER = path.join(__dirname, '../dist_build')
process.env.DIST = DIST_FOLDER
process.env.PUBLIC = process.env.DIST

// Define safe paths
const PUBLIC_PATH = process.env.PUBLIC || ''
const DIST_PATH = process.env.DIST || ''

let win: BrowserWindow | null

// Initialize handlers
setupStorageHandlers()
setupSystemHandlers()
setupIntegrationHandlers()

// Global Error Handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  // Optionally show a dialog to the user
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(PUBLIC_PATH, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false // NUCLEAR OPTION: Strictly disable DevTools
    },
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: "FTWOS",
    backgroundColor: '#ffffff',
    show: false,
    frame: false, // Frameless window
    titleBarStyle: 'hidden', // Hide title bar
    autoHideMenuBar: true,
  })

  // Initialize Tracker Service
  if (win) TrackerService.setWindow(win)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(DIST_PATH, 'index.html'))
  }
  
  win.once('ready-to-show', () => {
    win?.show()
    // Explicitly close DevTools
    win?.webContents.closeDevTools()
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

// Window Controls Handlers
ipcMain.handle('window:minimize', () => {
  win?.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (win?.isMaximized()) {
    win.unmaximize()
  } else {
    win?.maximize()
  }
})

ipcMain.handle('window:close', () => {
  win?.close()
})

// Tracker Handlers
ipcMain.handle('tracker:start-session', async (_, { projectId, path }) => {
  return await TrackerService.startSession(projectId, path)
})

ipcMain.handle('tracker:stop-session', async () => {
  return await TrackerService.stopSession()
})

ipcMain.handle('tracker:get-current', () => {
  return TrackerService.getCurrentSession()
})

ipcMain.handle('tracker:get-sessions', async (_, projectId) => {
  return await TrackerService.getProjectSessions(projectId)
})

ipcMain.handle('tracker:save-manual', async (_, session) => {
  return await TrackerService.saveManualSession(session)
})

ipcMain.handle('dialog:open-directory', async () => {
  if (!win) return null
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  })
  return result.filePaths[0]
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()

  // Setup auto-updater (only in production)
  if (app.isPackaged) {
    // Configure auto-updater
    autoUpdater.checkForUpdatesAndNotify()

    // Listen for update events
    autoUpdater.on('update-available', () => {
      if (win) {
        win.webContents.send('update:available', {
          version: autoUpdater.currentVersion.version,
        })
      }
    })

    autoUpdater.on('update-downloaded', () => {
      if (win) {
        win.webContents.send('update:downloaded')
      }
    })

    // Check for updates every hour
    setInterval(() => {
      autoUpdater.checkForUpdates()
    }, 60 * 60 * 1000)
  }
})
