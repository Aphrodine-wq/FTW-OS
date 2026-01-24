import { app, BrowserWindow, shell, ipcMain, dialog, session } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import { SQLiteService } from './sqlite'
import { setupStorageHandlers } from './storage'
import { setupSystemHandlers } from './system'
import { setupIntegrationHandlers } from './integrations'
import { setupFileSystemHandlers } from './fs-handlers'
import { setupVaultHandlers } from './vault'
import { setupMailHandlers } from './mail'
import { setupBackupHandlers } from './backup'
import { setupTerminalHandlers } from './terminal'
import { setupGithubHandlers } from './github' // Import the new handler
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

// Initialize SQLite first, then other handlers
SQLiteService.init().then(() => {
  console.log('SQLite database initialized')
}).catch(err => {
  console.error('SQLite initialization failed:', err)
})

// Initialize handlers
setupStorageHandlers()
setupSystemHandlers()
setupIntegrationHandlers()
setupFileSystemHandlers()
setupVaultHandlers()
setupMailHandlers()
setupGithubHandlers() // Initialize GitHub handlers
setupBackupHandlers()

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
      webSecurity: true, // Enable security
      allowRunningInsecureContent: false, // Disable insecure content
      devTools: true,
      sandbox: false // Required for preload scripts
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

  // Initialize Terminal Handlers with window reference
  setupTerminalHandlers(win)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  // Only use dev server if explicitly set AND not in auto-update mode
  // Auto-update mode uses built files for faster reloads
  if (VITE_DEV_SERVER_URL && !process.argv.includes('--dev')) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else if (!app.isPackaged && process.argv.includes('--dev')) {
    // Check if dist_build exists - if so, use built files instead of dev server
    const distBuildPath = path.join(__dirname, '../dist_build/index.html')
    const fs = require('fs')
    if (fs.existsSync(distBuildPath)) {
      console.log('📦 Loading from built files (auto-update mode)')
      win.loadFile(distBuildPath).catch(e => {
        console.error('Failed to load built files:', e)
        dialog.showErrorBox('Startup Error', `Failed to load application file.\nPath: ${distBuildPath}\nError: ${e.message}`)
      })
    } else {
      // Fallback to dev server if built files don't exist
      console.log('🌐 Loading from dev server (built files not found)')
      win.loadURL('http://localhost:5173')
    }
  } else {
    // FORCE PRODUCTION PATH
    // In the packaged app, __dirname is .../resources/app/dist-electron
    // The build is in .../resources/app/dist_build
    const prodPath = path.join(__dirname, '../dist_build/index.html');
    
    console.log('FORCE LOADING PRODUCTION PATH:', prodPath);
    
    win.loadFile(prodPath).catch(e => {
        console.error('CRITICAL: Failed to load production build:', e);
        // Only fallback if absolutely necessary, but honestly we should just crash/alert here
        // because loading the source index.html is useless.
        dialog.showErrorBox('Startup Error', `Failed to load application file.\nPath: ${prodPath}\nError: ${e.message}`);
    });
  }
  
  win.once('ready-to-show', () => {
    win?.show()
    // Open DevTools only in dev mode
    if (VITE_DEV_SERVER_URL) {
      win?.webContents.openDevTools()
    } else if (process.argv.includes('--debug')) {
      // Allow explicit debug flag in production
      win?.webContents.openDevTools()
    }
    // Otherwise, strictly NO DevTools in production for cleaner look
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

// Standardized Error Handler Wrapper
const handleIPC = (handler: (...args: any[]) => Promise<any>) => {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('IPC Error:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }
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
ipcMain.handle('tracker:start-session', handleIPC(async (_, { projectId, path }) => {
  return await TrackerService.startSession(projectId, path)
}))

ipcMain.handle('tracker:stop-session', handleIPC(async () => {
  return await TrackerService.stopSession()
}))

ipcMain.handle('tracker:get-current', handleIPC(async () => {
  return TrackerService.getCurrentSession()
}))

ipcMain.handle('tracker:get-sessions', handleIPC(async (_, projectId) => {
  return await TrackerService.getProjectSessions(projectId)
}))

ipcMain.handle('tracker:save-manual', handleIPC(async (_, session) => {
  return await TrackerService.saveManualSession(session)
}))

ipcMain.handle('dialog:open-directory-legacy', handleIPC(async () => {
  if (!win) return null
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  })
  return result.filePaths[0]
}))

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
  // Setup CSP: Content Security Policy (after app is ready, before creating windows)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // Only apply CSP to our app's pages
    if (details.url.startsWith('file://') || details.url.startsWith('http://localhost') || details.url.includes('vite')) {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self';" +
            "script-src 'self' 'unsafe-inline';" + // Removed 'unsafe-eval' for security
            "style-src 'self' 'unsafe-inline';" +
            "img-src 'self' data: https: blob:;" +
            "connect-src 'self' https://*.supabase.co https://*.supabase.in http://localhost:* ws://localhost:* wss://*.supabase.co wss://*.supabase.in;" +
            "font-src 'self' data:;" +
            "frame-src 'self';" +
            "object-src 'none';" +
            "base-uri 'self';" +
            "worker-src 'self' blob:;" // Allow web workers
          ]
        }
      })
    } else {
      callback({ responseHeaders: details.responseHeaders })
    }
  })

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
