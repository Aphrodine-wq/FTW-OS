"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
exports.setupStorageHandlers = setupStorageHandlers;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const twilio_1 = __importDefault(require("twilio"));
const supabase_1 = require("./supabase");
const DATA_DIR = path_1.default.join(electron_1.app.getPath('userData'), 'data');
// Ensure data directory exists
if (!fs_1.default.existsSync(DATA_DIR)) {
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
}
class StorageService {
    static getPath(filename) {
        return path_1.default.join(DATA_DIR, `${filename}.json`);
    }
    static async read(filename, defaultValue) {
        try {
            const filePath = this.getPath(filename);
            if (!fs_1.default.existsSync(filePath)) {
                await this.write(filename, defaultValue);
                return defaultValue;
            }
            const data = await fs_1.default.promises.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error(`Failed to read ${filename}:`, error);
            return defaultValue;
        }
    }
    static async write(filename, data) {
        try {
            const filePath = this.getPath(filename);
            await fs_1.default.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
            // Try to sync to Supabase if available
            // Map filename to table name (assuming 1:1 for simplicity)
            if (Array.isArray(data)) {
                await supabase_1.SupabaseService.syncTable(filename, data);
            }
            return true;
        }
        catch (error) {
            console.error(`Failed to write ${filename}:`, error);
            return false;
        }
    }
}
exports.StorageService = StorageService;
function setupStorageHandlers() {
    // Initialize Supabase
    supabase_1.SupabaseService.init();
    // Invoices
    electron_1.ipcMain.handle('db:get-invoices', async () => {
        return await StorageService.read('invoices', []);
    });
    electron_1.ipcMain.handle('db:save-invoices', async (_, invoices) => {
        return await StorageService.write('invoices', invoices);
    });
    // Clients
    electron_1.ipcMain.handle('db:get-clients', async () => {
        return await StorageService.read('clients', []);
    });
    electron_1.ipcMain.handle('db:save-clients', async (_, clients) => {
        return await StorageService.write('clients', clients);
    });
    // Settings
    electron_1.ipcMain.handle('db:get-settings', async () => {
        return await StorageService.read('settings', {});
    });
    electron_1.ipcMain.handle('db:save-settings', async (_, settings) => {
        return await StorageService.write('settings', settings);
    });
    // Products
    electron_1.ipcMain.handle('db:get-products', async () => {
        return await StorageService.read('products', []);
    });
    electron_1.ipcMain.handle('db:save-products', async (_, products) => {
        return await StorageService.write('products', products);
    });
    // Expenses
    electron_1.ipcMain.handle('db:get-expenses', async () => {
        return await StorageService.read('expenses', []);
    });
    electron_1.ipcMain.handle('db:save-expenses', async (_, expenses) => {
        return await StorageService.write('expenses', expenses);
    });
    // Recurring Profiles
    electron_1.ipcMain.handle('db:get-recurring', async () => {
        return await StorageService.read('recurring', []);
    });
    electron_1.ipcMain.handle('db:save-recurring', async (_, profiles) => {
        return await StorageService.write('recurring', profiles);
    });
    // Project Management
    electron_1.ipcMain.handle('db:get-tasks', async () => {
        return await StorageService.read('tasks', []);
    });
    electron_1.ipcMain.handle('db:save-tasks', async (_, tasks) => {
        return await StorageService.write('tasks', tasks);
    });
    electron_1.ipcMain.handle('db:get-updates', async () => {
        return await StorageService.read('updates', []);
    });
    electron_1.ipcMain.handle('db:save-updates', async (_, updates) => {
        return await StorageService.write('updates', updates);
    });
    // SMS Handler
    electron_1.ipcMain.handle('send-sms', async (_, { to, body }) => {
        try {
            const settings = await StorageService.read('settings', {});
            const { accountSid, authToken, fromNumber } = settings.smsConfig || {};
            if (!accountSid || !authToken || !fromNumber) {
                throw new Error('Twilio configuration missing');
            }
            const client = (0, twilio_1.default)(accountSid, authToken);
            const message = await client.messages.create({
                body,
                from: fromNumber,
                to
            });
            return { success: true, sid: message.sid };
        }
        catch (error) {
            console.error('SMS Send Failed:', error);
            return { success: false, error: error.message };
        }
    });
    // Backup & Restore
    electron_1.ipcMain.handle('db:export-data', async () => {
        try {
            const data = {
                invoices: await StorageService.read('invoices', []),
                clients: await StorageService.read('clients', []),
                settings: await StorageService.read('settings', {}),
                products: await StorageService.read('products', []),
                expenses: await StorageService.read('expenses', []),
                recurring: await StorageService.read('recurring', [])
            };
            return data;
        }
        catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db:import-data', async (_, data) => {
        try {
            if (data.invoices)
                await StorageService.write('invoices', data.invoices);
            if (data.clients)
                await StorageService.write('clients', data.clients);
            if (data.settings)
                await StorageService.write('settings', data.settings);
            if (data.products)
                await StorageService.write('products', data.products);
            if (data.expenses)
                await StorageService.write('expenses', data.expenses);
            if (data.recurring)
                await StorageService.write('recurring', data.recurring);
            return true;
        }
        catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    });
    // CRM: Leads
    electron_1.ipcMain.handle('db:get-leads', async () => {
        return await StorageService.read('leads', []);
    });
    electron_1.ipcMain.handle('db:save-leads', async (_, leads) => {
        return await StorageService.write('leads', leads);
    });
    // CRM: Proposals
    electron_1.ipcMain.handle('db:get-proposals', async () => {
        return await StorageService.read('proposals', []);
    });
    electron_1.ipcMain.handle('db:save-proposals', async (_, proposals) => {
        return await StorageService.write('proposals', proposals);
    });
    // Subscriptions
    electron_1.ipcMain.handle('db:get-subscriptions', async () => {
        return await StorageService.read('subscriptions', []);
    });
    electron_1.ipcMain.handle('db:save-subscriptions', async (_, subscriptions) => {
        return await StorageService.write('subscriptions', subscriptions);
    });
    // Reports
    electron_1.ipcMain.handle('db:get-reports', async () => {
        return await StorageService.read('reports', []);
    });
    electron_1.ipcMain.handle('db:save-reports', async (_, reports) => {
        return await StorageService.write('reports', reports);
    });
    // Integrations
    electron_1.ipcMain.handle('db:get-integrations', async () => {
        return await StorageService.read('integrations', []);
    });
    electron_1.ipcMain.handle('db:save-integrations', async (_, integrations) => {
        return await StorageService.write('integrations', integrations);
    });
    // Currency Rates (Mock for now, or fetch from API)
    electron_1.ipcMain.handle('settings:get-currency-rates', async () => {
        return { 'USD': 1, 'EUR': 0.92, 'GBP': 0.79, 'CAD': 1.36 };
    });
}
