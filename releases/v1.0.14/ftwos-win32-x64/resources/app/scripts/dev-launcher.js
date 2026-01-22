/**
 * Development Launcher
 * Orchestrates file watcher, auto-build, and Electron
 */

const { spawn, execFile } = require('child_process')
const path = require('path')
const DevWatcher = require('./dev-watcher')
const AutoBuilder = require('./auto-build')

class DevLauncher {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..')
    this.watcher = new DevWatcher(this.rootDir)
    this.builder = new AutoBuilder(this.rootDir)
    this.electronProcess = null
    this.isInitialBuild = true
  }

  async start() {
    console.log('🚀 Starting FTW-OS Development Launcher')
    console.log('   Root directory:', this.rootDir)
    console.log('')

    // Start file watcher
    this.watcher.start()

    // Handle file changes
    this.watcher.on('change', async ({ relativePath }) => {
      console.log(`\n📦 Rebuilding due to: ${relativePath}`)
      await this.rebuild()
    })

    this.watcher.on('ready', async () => {
      // Initial build
      console.log('\n🔨 Running initial build...')
      await this.rebuild()
    })

    // Handle errors
    this.watcher.on('error', (error) => {
      console.error('❌ Watcher error:', error)
    })

    // Handle process termination
    process.on('SIGINT', () => this.stop())
    process.on('SIGTERM', () => this.stop())
    process.on('exit', () => this.stop())
  }

  async rebuild() {
    // Mark as building
    this.watcher.setBuilding(true)

    // Build
    const success = await this.builder.buildAndNotify((success) => {
      if (success) {
        // Restart Electron after successful build
        this.restartElectron()
      }
    })

    this.watcher.setBuilding(false)
    return success
  }

  restartElectron() {
    // Kill existing Electron process
    if (this.electronProcess) {
      console.log('🛑 Stopping Electron...')
      this.electronProcess.kill('SIGTERM')
      this.electronProcess = null

      // Wait a bit for process to fully terminate
      setTimeout(() => {
        this.launchElectron()
      }, 1000)
    } else {
      this.launchElectron()
    }
  }

  launchElectron() {
    console.log('🚀 Launching Electron...')

    const mainPath = path.join(this.rootDir, 'dist-electron', 'main.js')

    // Check if dist-electron exists
    const fs = require('fs')
    if (!fs.existsSync(mainPath)) {
      console.error('❌ Electron main file not found:', mainPath)
      console.error('   Please run: npm run build:electron')
      return
    }

    // Find electron executable
    let electronExecutable
    if (process.platform === 'win32') {
      // On Windows, use the .cmd file from node_modules/.bin
      electronExecutable = path.join(this.rootDir, 'node_modules', '.bin', 'electron.cmd')
      // If that doesn't exist, try to find electron in node_modules/electron
      if (!fs.existsSync(electronExecutable)) {
        const electronPackage = path.join(this.rootDir, 'node_modules', 'electron')
        if (fs.existsSync(electronPackage)) {
          electronExecutable = path.join(electronPackage, 'dist', 'electron.exe')
        }
      }
    } else {
      electronExecutable = path.join(this.rootDir, 'node_modules', '.bin', 'electron')
      if (!fs.existsSync(electronExecutable)) {
        const electronPackage = path.join(this.rootDir, 'node_modules', 'electron')
        if (fs.existsSync(electronPackage)) {
          electronExecutable = path.join(electronPackage, 'dist', 'electron')
        }
      }
    }

    if (!fs.existsSync(electronExecutable)) {
      console.error('❌ Electron executable not found')
      console.error('   Please run: npm install')
      return
    }

    // Launch Electron (don't set VITE_DEV_SERVER_URL so it uses built files)
    // For Windows .cmd files, use cmd.exe to avoid shell deprecation warning
    if (process.platform === 'win32' && electronExecutable.endsWith('.cmd')) {
      // Use cmd.exe /c to run .cmd files safely
      this.electronProcess = spawn(
        'cmd.exe',
        ['/c', electronExecutable, '.', '--dev'],
        {
          cwd: this.rootDir,
          stdio: 'inherit',
          shell: false, // No shell needed when using cmd.exe directly
          env: {
            ...process.env,
            // Don't set VITE_DEV_SERVER_URL - let Electron load from built files
            NODE_ENV: 'development'
          }
        }
      )
    } else {
      // Use execFile for .exe files (more secure)
      this.electronProcess = execFile(
        electronExecutable,
        ['.', '--dev'],
        {
          cwd: this.rootDir,
          stdio: 'inherit',
          env: {
            ...process.env,
            // Don't set VITE_DEV_SERVER_URL - let Electron load from built files
            NODE_ENV: 'development'
          }
        }
      )
    }

    this.electronProcess.on('exit', (code) => {
      console.log(`\n📱 Electron exited with code ${code}`)
      this.electronProcess = null
    })

    this.electronProcess.on('error', (error) => {
      console.error('❌ Electron error:', error)
      this.electronProcess = null
    })
  }

  stop() {
    console.log('\n🛑 Stopping development launcher...')

    // Stop watcher
    this.watcher.stop()

    // Kill Electron
    if (this.electronProcess) {
      this.electronProcess.kill('SIGTERM')
      this.electronProcess = null
    }

    console.log('✅ Stopped')
    process.exit(0)
  }
}

// Start launcher if run directly
if (require.main === module) {
  const launcher = new DevLauncher()
  launcher.start().catch((error) => {
    console.error('❌ Failed to start launcher:', error)
    process.exit(1)
  })
}

module.exports = DevLauncher



