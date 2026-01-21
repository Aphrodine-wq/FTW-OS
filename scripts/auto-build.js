/**
 * Auto-Build Script
 * Builds React and Electron when source files change
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

class AutoBuilder {
  constructor(rootDir) {
    this.rootDir = rootDir
    this.isBuilding = false
  }

  async build() {
    if (this.isBuilding) {
      console.log('⏳ Build already in progress, skipping...')
      return false
    }

    this.isBuilding = true
    const startTime = Date.now()

    try {
      console.log('🔨 Starting build...')

      // 1. Build React app
      console.log('   Building React app...')
      execSync('npm run build:react', {
        cwd: this.rootDir,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      })

      // 2. Compile Electron
      console.log('   Compiling Electron...')
      execSync('npm run build:electron', {
        cwd: this.rootDir,
        stdio: 'inherit'
      })

      // 3. Ensure dist_build exists and has index.html
      const distBuildPath = path.join(this.rootDir, 'dist_build')
      if (!fs.existsSync(distBuildPath)) {
        fs.mkdirSync(distBuildPath, { recursive: true })
      }

      const buildTime = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`✅ Build completed in ${buildTime}s`)

      return true
    } catch (error) {
      console.error('❌ Build failed:', error.message)
      return false
    } finally {
      this.isBuilding = false
    }
  }

  async buildAndNotify(callback) {
    const success = await this.build()
    if (callback) {
      callback(success)
    }
    return success
  }
}

module.exports = AutoBuilder















