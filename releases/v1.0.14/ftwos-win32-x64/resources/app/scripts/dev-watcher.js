/**
 * Development File Watcher
 * Watches source files for changes and triggers rebuilds
 */

const chokidar = require('chokidar')
const path = require('path')
const { EventEmitter } = require('events')

class DevWatcher extends EventEmitter {
  constructor(rootDir) {
    super()
    this.rootDir = rootDir
    this.watcher = null
    this.debounceTimer = null
    this.debounceDelay = 1000 // 1 second debounce
    this.isBuilding = false
  }

  start() {
    const watchPaths = [
      path.join(this.rootDir, 'src/**/*'),
      path.join(this.rootDir, 'electron/**/*'),
      path.join(this.rootDir, 'public/**/*')
    ]

    const ignored = [
      /node_modules/,
      /dist_/,
      /\.git/,
      /\.cache/,
      /dist-electron/,
      /dist_build/,
      /dist_installer/,
      /releases/
    ]

    console.log('🔍 Starting file watcher...')
    console.log('   Watching:', watchPaths.map(p => path.relative(this.rootDir, p)).join(', '))

    this.watcher = chokidar.watch(watchPaths, {
      ignored,
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    })

    this.watcher
      .on('add', (filePath) => this.handleChange('add', filePath))
      .on('change', (filePath) => this.handleChange('change', filePath))
      .on('unlink', (filePath) => this.handleChange('unlink', filePath))
      .on('error', (error) => {
        console.error('❌ Watcher error:', error)
        this.emit('error', error)
      })
      .on('ready', () => {
        console.log('✅ File watcher ready')
        this.emit('ready')
      })

    return this
  }

  handleChange(event, filePath) {
    if (this.isBuilding) {
      console.log('⏳ Build in progress, queuing change...')
      return
    }

    const relativePath = path.relative(this.rootDir, filePath)
    console.log(`📝 ${event}: ${relativePath}`)

    // Debounce changes
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      this.emit('change', { event, filePath, relativePath })
      this.debounceTimer = null
    }, this.debounceDelay)
  }

  setBuilding(building) {
    this.isBuilding = building
  }

  stop() {
    if (this.watcher) {
      this.watcher.close()
      console.log('🛑 File watcher stopped')
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }
}

module.exports = DevWatcher
















