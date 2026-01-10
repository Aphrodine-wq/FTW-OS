"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSystemHandlers = setupSystemHandlers;
const electron_1 = require("electron");
const os_1 = __importDefault(require("os"));
function setupSystemHandlers() {
    electron_1.ipcMain.handle('system:get-stats', async () => {
        const cpus = os_1.default.cpus();
        const totalMem = os_1.default.totalmem();
        const freeMem = os_1.default.freemem();
        // Calculate CPU usage roughly
        // Note: os.cpus() returns times since boot, so to get instantaneous usage we'd need to diff two samples.
        // For simplicity in this v1, we'll return a calculated average or just loadavg
        const avgCpu = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
            const idle = cpu.times.idle;
            return acc + ((total - idle) / total);
        }, 0) / cpus.length * 100;
        return {
            cpu: avgCpu,
            mem: {
                total: totalMem,
                free: freeMem,
                used: totalMem - freeMem,
                percent: ((totalMem - freeMem) / totalMem) * 100
            },
            uptime: os_1.default.uptime(),
            platform: os_1.default.platform(),
            arch: os_1.default.arch(),
            hostname: os_1.default.hostname()
        };
    });
}
