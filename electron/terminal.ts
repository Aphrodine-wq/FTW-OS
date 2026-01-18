import { ipcMain } from 'electron'
import os from 'os'

// Fallback to standard child_process if node-pty is missing
let pty: any = null
try {
  pty = require('node-pty')
} catch (e) {
  console.warn('node-pty not found, falling back to basic shell spawning')
}

// Store active terminals
const terminals: Record<string, any> = {}

export function setupTerminalHandlers(mainWindow: Electron.BrowserWindow) {
  ipcMain.handle('terminal:create', (_, id) => {
    if (terminals[id]) return 

    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
    
    if (pty) {
        // Robust PTY
        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env
        })

        ptyProcess.onData((data: string) => {
            mainWindow.webContents.send(`terminal:data:${id}`, data)
        })

        terminals[id] = ptyProcess
    } else {
        // Fallback: standard spawn (limited interactivity, no color codes usually)
        const { spawn } = require('child_process')
        const child = spawn(shell, [], {
            cwd: os.homedir(),
            shell: true
        })

        child.stdout.on('data', (data: any) => {
            mainWindow.webContents.send(`terminal:data:${id}`, data.toString())
        })

        child.stderr.on('data', (data: any) => {
            mainWindow.webContents.send(`terminal:data:${id}`, data.toString())
        })

        terminals[id] = child
    }

    return true
  })

  ipcMain.on('terminal:write', (_, { id, data }) => {
    const term = terminals[id]
    if (!term) return

    if (pty) {
        term.write(data)
    } else {
        term.stdin.write(data)
    }
  })

  ipcMain.handle('terminal:resize', (_, { id, cols, rows }) => {
    const term = terminals[id]
    if (term && pty) {
        term.resize(cols, rows)
    }
  })

  ipcMain.handle('terminal:destroy', (_, id) => {
    const term = terminals[id]
    if (term) {
        if (pty) term.kill()
        else term.kill()
        delete terminals[id]
    }
  })
}
