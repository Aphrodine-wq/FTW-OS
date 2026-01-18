import { ipcMain } from 'electron'
import os from 'os'

export function setupSystemHandlers() {
  ipcMain.handle('system:get-stats', async () => {
    const cpus = os.cpus()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    
    // Calculate CPU usage roughly
    // Note: os.cpus() returns times since boot, so to get instantaneous usage we'd need to diff two samples.
    // For simplicity in this v1, we'll return a calculated average or just loadavg
    
    const avgCpu = cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0)
        const idle = cpu.times.idle
        return acc + ((total - idle) / total)
    }, 0) / cpus.length * 100

    return {
      cpu: avgCpu,
      mem: {
        total: totalMem,
        free: freeMem,
        used: totalMem - freeMem,
        percent: ((totalMem - freeMem) / totalMem) * 100
      },
      uptime: os.uptime(),
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname()
    }
  })
}
