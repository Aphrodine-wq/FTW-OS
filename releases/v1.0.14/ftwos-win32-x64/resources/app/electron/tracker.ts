import { BrowserWindow } from 'electron'
import chokidar, { FSWatcher } from 'chokidar'
import { StorageService } from './storage'
import path from 'path'

interface ActivityLog {
  timestamp: Date;
  filePath: string;
  type: 'add' | 'change' | 'unlink';
}

interface TimeSession {
  id: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  logs: ActivityLog[];
  status: 'active' | 'completed';
}

export class TrackerService {
  private static watcher: FSWatcher | null = null
  private static currentSession: TimeSession | null = null
  private static mainWindow: BrowserWindow | null = null

  static setWindow(window: BrowserWindow) {
    this.mainWindow = window
  }

  static async startSession(projectId: string, folderPath: string) {
    if (this.currentSession) {
      throw new Error('Session already active')
    }

    this.currentSession = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      startTime: new Date(),
      duration: 0,
      logs: [],
      status: 'active'
    }

    // Start watching
    try {
      this.watcher = chokidar.watch(folderPath, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100
        }
      })

      this.watcher.on('error', (error: any) => {
        console.error('Watcher Error:', error)
        // Optionally notify frontend
        if (this.mainWindow) {
          this.mainWindow.webContents.send('tracker:error', error.message)
        }
      })

      this.watcher.on('all', (event: string, filePath: string) => {
        const log: ActivityLog = {
          timestamp: new Date(),
          filePath: path.relative(folderPath, filePath),
          type: event === 'add' ? 'add' : event === 'unlink' ? 'unlink' : 'change'
        }
        
        if (this.currentSession) {
          this.currentSession.logs.push(log)
          // Send live update to frontend
          if (this.mainWindow) {
            this.mainWindow.webContents.send('tracker:activity', log)
          }
        }
      })
    } catch (error) {
      console.error('Failed to start watcher:', error)
      throw error
    }

    return this.currentSession
  }

  static async stopSession() {
    if (!this.currentSession) return null

    if (this.watcher) {
      await this.watcher.close()
      this.watcher = null
    }

    const endTime = new Date()
    const duration = (endTime.getTime() - this.currentSession.startTime.getTime()) / 1000

    this.currentSession.endTime = endTime
    this.currentSession.duration = duration
    this.currentSession.status = 'completed'

    // Save session to DB
    const sessions = await StorageService.read('sessions', [])
    await StorageService.write('sessions', [...sessions, this.currentSession])

    const completedSession = this.currentSession
    this.currentSession = null
    
    return completedSession
  }

  static async saveManualSession(session: TimeSession) {
    const sessions = await StorageService.read('sessions', [])
    await StorageService.write('sessions', [...sessions, session])
    return true
  }

  static getCurrentSession() {
    return this.currentSession
  }

  static async getProjectSessions(projectId: string) {
    const sessions = await StorageService.read('sessions', [])
    return sessions.filter((s: any) => s.projectId === projectId)
  }
}
