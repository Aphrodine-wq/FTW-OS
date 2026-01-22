import { ipcMain, shell } from 'electron'
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

  // Open file/folder in system default application
  // shell.openPath returns empty string on success, or error message string on failure
  ipcMain.handle('system:open-path', async (_, path: string) => {
    try {
      const err = await shell.openPath(path)
      if (err) {
        console.error('Failed to open path:', err)
        return { success: false, error: err }
      }
      return { success: true }
    } catch (error: any) {
      console.error('Failed to open path:', error)
      return { success: false, error: error.message }
    }
  })

  // Open URL in default browser
  ipcMain.handle('system:open-url', async (_, url: string) => {
    try {
      await shell.openExternal(url)
      return { success: true }
    } catch (error: any) {
      console.error('Failed to open URL:', error)
      return { success: false, error: error.message }
    }
  })
}
