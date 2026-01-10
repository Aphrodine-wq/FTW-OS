"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const path_1 = __importDefault(require("path"));
const storage_1 = require("./storage");
const system_1 = require("./system");
const integrations_1 = require("./integrations");
const tracker_1 = require("./tracker");
// The built directory structure
// __dirname resolves correctly whether in dev or packaged
const DIST_FOLDER = path_1.default.join(__dirname, '../dist_build');
process.env.DIST = DIST_FOLDER;
process.env.PUBLIC = process.env.DIST;
// Define safe paths
const PUBLIC_PATH = process.env.PUBLIC || '';
const DIST_PATH = process.env.DIST || '';
let win;
// Initialize handlers
(0, storage_1.setupStorageHandlers)();
(0, system_1.setupSystemHandlers)();
(0, integrations_1.setupIntegrationHandlers)();
// Global Error Handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Optionally show a dialog to the user
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
function createWindow() {
    win = new electron_1.BrowserWindow({
        icon: path_1.default.join(PUBLIC_PATH, 'electron-vite.svg'),
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
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
    });
    // Initialize Tracker Service
    if (win)
        tracker_1.TrackerService.setWindow(win);
    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString());
    });
    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    }
    else {
        win.loadFile(path_1.default.join(DIST_PATH, 'index.html'));
    }
    win.once('ready-to-show', () => {
        win?.show();
        // Explicitly close DevTools
        win?.webContents.closeDevTools();
    });
    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:'))
            electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
}
// Window Controls Handlers
electron_1.ipcMain.handle('window:minimize', () => {
    win?.minimize();
});
electron_1.ipcMain.handle('window:maximize', () => {
    if (win?.isMaximized()) {
        win.unmaximize();
    }
    else {
        win?.maximize();
    }
});
electron_1.ipcMain.handle('window:close', () => {
    win?.close();
});
// Tracker Handlers
electron_1.ipcMain.handle('tracker:start-session', async (_, { projectId, path }) => {
    return await tracker_1.TrackerService.startSession(projectId, path);
});
electron_1.ipcMain.handle('tracker:stop-session', async () => {
    return await tracker_1.TrackerService.stopSession();
});
electron_1.ipcMain.handle('tracker:get-current', () => {
    return tracker_1.TrackerService.getCurrentSession();
});
electron_1.ipcMain.handle('tracker:get-sessions', async (_, projectId) => {
    return await tracker_1.TrackerService.getProjectSessions(projectId);
});
electron_1.ipcMain.handle('tracker:save-manual', async (_, session) => {
    return await tracker_1.TrackerService.saveManualSession(session);
});
electron_1.ipcMain.handle('dialog:open-directory', async () => {
    if (!win)
        return null;
    const result = await electron_1.dialog.showOpenDialog(win, {
        properties: ['openDirectory']
    });
    return result.filePaths[0];
});
electron_1.app.on('window-all-closed', () => {
    win = null;
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized())
            win.restore();
        win.focus();
    }
});
electron_1.app.on('activate', () => {
    const allWindows = electron_1.BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    }
    else {
        createWindow();
    }
});
electron_1.app.whenReady().then(() => {
    createWindow();
    // Setup auto-updater (only in production)
    if (electron_1.app.isPackaged) {
        // Configure auto-updater
        electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
        // Listen for update events
        electron_updater_1.autoUpdater.on('update-available', () => {
            if (win) {
                win.webContents.send('update:available', {
                    version: electron_updater_1.autoUpdater.currentVersion.version,
                });
            }
        });
        electron_updater_1.autoUpdater.on('update-downloaded', () => {
            if (win) {
                win.webContents.send('update:downloaded');
            }
        });
        // Check for updates every hour
        setInterval(() => {
            electron_updater_1.autoUpdater.checkForUpdates();
        }, 60 * 60 * 1000);
    }
});
