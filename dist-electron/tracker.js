"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackerService = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const storage_1 = require("./storage");
const path_1 = __importDefault(require("path"));
class TrackerService {
    static watcher = null;
    static currentSession = null;
    static mainWindow = null;
    static setWindow(window) {
        this.mainWindow = window;
    }
    static async startSession(projectId, folderPath) {
        if (this.currentSession) {
            throw new Error('Session already active');
        }
        this.currentSession = {
            id: Math.random().toString(36).substr(2, 9),
            projectId,
            startTime: new Date(),
            duration: 0,
            logs: [],
            status: 'active'
        };
        // Start watching
        try {
            this.watcher = chokidar_1.default.watch(folderPath, {
                ignored: /(^|[\/\\])\../, // ignore dotfiles
                persistent: true,
                ignoreInitial: true,
                awaitWriteFinish: {
                    stabilityThreshold: 1000,
                    pollInterval: 100
                }
            });
            this.watcher.on('error', (error) => {
                console.error('Watcher Error:', error);
                // Optionally notify frontend
                if (this.mainWindow) {
                    this.mainWindow.webContents.send('tracker:error', error.message);
                }
            });
            this.watcher.on('all', (event, filePath) => {
                const log = {
                    timestamp: new Date(),
                    filePath: path_1.default.relative(folderPath, filePath),
                    type: event === 'add' ? 'add' : event === 'unlink' ? 'unlink' : 'change'
                };
                if (this.currentSession) {
                    this.currentSession.logs.push(log);
                    // Send live update to frontend
                    if (this.mainWindow) {
                        this.mainWindow.webContents.send('tracker:activity', log);
                    }
                }
            });
        }
        catch (error) {
            console.error('Failed to start watcher:', error);
            throw error;
        }
        return this.currentSession;
    }
    static async stopSession() {
        if (!this.currentSession)
            return null;
        if (this.watcher) {
            await this.watcher.close();
            this.watcher = null;
        }
        const endTime = new Date();
        const duration = (endTime.getTime() - this.currentSession.startTime.getTime()) / 1000;
        this.currentSession.endTime = endTime;
        this.currentSession.duration = duration;
        this.currentSession.status = 'completed';
        // Save session to DB
        const sessions = await storage_1.StorageService.read('sessions', []);
        await storage_1.StorageService.write('sessions', [...sessions, this.currentSession]);
        const completedSession = this.currentSession;
        this.currentSession = null;
        return completedSession;
    }
    static async saveManualSession(session) {
        const sessions = await storage_1.StorageService.read('sessions', []);
        await storage_1.StorageService.write('sessions', [...sessions, session]);
        return true;
    }
    static getCurrentSession() {
        return this.currentSession;
    }
    static async getProjectSessions(projectId) {
        const sessions = await storage_1.StorageService.read('sessions', []);
        return sessions.filter((s) => s.projectId === projectId);
    }
}
exports.TrackerService = TrackerService;
