class FPSService {
  private fps = 0
  private frames = 0
  private lastTime = performance.now()
  private fpsHistory: number[] = []
  private maxHistory = 60 // 1 second at 60fps
  private callback?: (fps: number) => void

  startMonitoring(callback?: (fps: number) => void) {
    this.callback = callback
    this.animate()
  }

  stopMonitoring() {
    this.callback = undefined
  }

  private animate = () => {
    if (!this.callback) return

    this.frames++
    const currentTime = performance.now()

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime))
      this.fpsHistory.push(this.fps)

      if (this.fpsHistory.length > this.maxHistory) {
        this.fpsHistory.shift()
      }

      this.callback(this.fps)
      this.frames = 0
      this.lastTime = currentTime
    }

    requestAnimationFrame(this.animate)
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0
    return Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
  }

  getMinFPS(): number {
    return this.fpsHistory.length > 0 ? Math.min(...this.fpsHistory) : 0
  }

  getMaxFPS(): number {
    return this.fpsHistory.length > 0 ? Math.max(...this.fpsHistory) : 0
  }

  isSmooth(): boolean {
    const avg = this.getAverageFPS()
    return avg >= 50 // Consider 50+ fps as smooth
  }
}

export const fpsService = new FPSService()
