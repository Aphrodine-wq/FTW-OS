import { supabase } from './supabase'

export interface PerformanceMetrics {
  timestamp: number
  loadTime: number
  memoryUsage: number
  cpuUsage?: number
  networkRequests: number
  bundleSize: number
  lighthouseScore?: number
  chunkLoadTimes?: Record<string, number>
  totalChunks?: number
  largestChunk?: { name: string; size: number }
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  memoryUsage: number
  cpuUsage: number
  activeUsers: number
  responseTime: number
  errorRate: number
}

class PerformanceService {
  private metrics: PerformanceMetrics[] = []
  private readonly MAX_METRICS_HISTORY = 100
  private chunkLoadTimes: Map<string, number> = new Map()
  private intervalIds: number[] = []
  private observer: PerformanceObserver | null = null

  // Performance budgets
  private readonly BUDGETS = {
    initialLoad: 2000, // 2 seconds
    chunkLoad: 500, // 500ms per chunk
    memoryUsage: 150, // 150MB
    bundleSize: 5, // 5MB initial bundle
  }

  // Track page load performance
  trackPageLoad(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart
        const chunkMetrics = this.getChunkLoadMetrics()

        this.recordMetrics({
          timestamp: Date.now(),
          loadTime,
          memoryUsage: this.getMemoryUsage(),
          networkRequests: performance.getEntriesByType('resource').length,
          bundleSize: this.estimateBundleSize(),
          chunkLoadTimes: Object.fromEntries(this.chunkLoadTimes),
          totalChunks: this.chunkLoadTimes.size,
          largestChunk: this.getLargestChunk()
        })

        // Check performance budgets
        this.checkPerformanceBudgets(loadTime, this.getMemoryUsage(), this.estimateBundleSize())
      }
    }
  }

  // Track chunk load time
  trackChunkLoad(chunkName: string, loadTime: number): void {
    this.chunkLoadTimes.set(chunkName, loadTime)
    
    // Warn if chunk load exceeds budget
    if (loadTime > this.BUDGETS.chunkLoad) {
      console.warn(`Chunk "${chunkName}" loaded in ${loadTime}ms (exceeds budget of ${this.BUDGETS.chunkLoad}ms)`)
    }
  }

  // Get chunk load metrics
  private getChunkLoadMetrics(): Record<string, number> {
    return Object.fromEntries(this.chunkLoadTimes)
  }

  // Get largest chunk
  private getLargestChunk(): { name: string; size: number } | undefined {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    let largest: { name: string; size: number } | undefined

    resources.forEach(resource => {
      if (resource.name.includes('.js') && resource.transferSize) {
        const size = resource.transferSize / 1024 / 1024 // MB
        if (!largest || size > largest.size) {
          largest = { name: resource.name.split('/').pop() || 'unknown', size }
        }
      }
    })

    return largest
  }

  // Check performance budgets
  private checkPerformanceBudgets(loadTime: number, memoryUsage: number, bundleSize: number): void {
    const violations: string[] = []

    if (loadTime > this.BUDGETS.initialLoad) {
      violations.push(`Initial load time ${loadTime}ms exceeds budget of ${this.BUDGETS.initialLoad}ms`)
    }

    if (memoryUsage > this.BUDGETS.memoryUsage) {
      violations.push(`Memory usage ${memoryUsage.toFixed(2)}MB exceeds budget of ${this.BUDGETS.memoryUsage}MB`)
    }

    if (bundleSize > this.BUDGETS.bundleSize) {
      violations.push(`Bundle size ${bundleSize.toFixed(2)}MB exceeds budget of ${this.BUDGETS.bundleSize}MB`)
    }

    if (violations.length > 0) {
      console.warn('Performance budget violations:', violations)
    }
  }

  // Get current memory usage
  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  // Estimate bundle size (rough approximation)
  private estimateBundleSize(): number {
    // This is a rough estimate - in production you'd track actual bundle size
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    let totalSize = 0

    resources.forEach(resource => {
      if (resource.transferSize) {
        totalSize += resource.transferSize
      }
    })

    return totalSize / 1024 / 1024 // MB
  }

  // Record performance metrics
  recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    const fullMetrics: PerformanceMetrics = {
      timestamp: Date.now(),
      loadTime: 0,
      memoryUsage: 0,
      networkRequests: 0,
      bundleSize: 0,
      ...metrics
    }

    this.metrics.push(fullMetrics)

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS_HISTORY)
    }

    // Store in localStorage for persistence
    this.persistMetrics()
  }

  // Get performance metrics
  getMetrics(hours: number = 24): PerformanceMetrics[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000)
    return this.metrics.filter(m => m.timestamp > cutoff)
  }

  // Get average metrics
  getAverageMetrics(hours: number = 24): Partial<PerformanceMetrics> {
    const recentMetrics = this.getMetrics(hours)

    if (recentMetrics.length === 0) return {}

    const averages = recentMetrics.reduce((acc, metric) => ({
      loadTime: acc.loadTime + metric.loadTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      networkRequests: acc.networkRequests + metric.networkRequests,
      bundleSize: acc.bundleSize + metric.bundleSize
    }), {
      loadTime: 0,
      memoryUsage: 0,
      networkRequests: 0,
      bundleSize: 0
    })

    return {
      loadTime: averages.loadTime / recentMetrics.length,
      memoryUsage: averages.memoryUsage / recentMetrics.length,
      networkRequests: averages.networkRequests / recentMetrics.length,
      bundleSize: averages.bundleSize / recentMetrics.length
    }
  }

  // Check system health
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // Get recent metrics
      const recentMetrics = this.getMetrics(1) // Last hour
      const avgMetrics = this.getAverageMetrics(1)

      // Calculate health status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      let errorRate = 0

      // Simple health checks
      if (avgMetrics.loadTime && avgMetrics.loadTime > 3000) { // > 3 seconds
        status = 'warning'
      }
      if (avgMetrics.memoryUsage && avgMetrics.memoryUsage > 200) { // > 200MB
        status = 'warning'
      }
      if (avgMetrics.loadTime && avgMetrics.loadTime > 5000) { // > 5 seconds
        status = 'critical'
      }
      if (avgMetrics.memoryUsage && avgMetrics.memoryUsage > 300) { // > 300MB
        status = 'critical'
      }

      // Get uptime (simplified - would need server-side tracking)
      const uptime = Date.now() - (recentMetrics[0]?.timestamp || Date.now())

      return {
        status,
        uptime,
        memoryUsage: avgMetrics.memoryUsage || 0,
        cpuUsage: 0, // Would need browser API or server metrics
        activeUsers: 1, // Would need server metrics
        responseTime: avgMetrics.loadTime || 0,
        errorRate
      }
    } catch (error) {
      console.error('Error getting system health:', error)
      return {
        status: 'critical',
        uptime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        activeUsers: 0,
        responseTime: 0,
        errorRate: 1
      }
    }
  }

  // Performance monitoring for React components
  createPerformanceMonitor(componentName: string) {
    return {
      start: () => {
        const startTime = performance.now()
        return {
          end: () => {
            const endTime = performance.now()
            const duration = endTime - startTime

            console.log(`${componentName} render time: ${duration.toFixed(2)}ms`)

            // Record if it's a slow render
            if (duration > 16.67) { // Slower than 60fps
              this.recordMetrics({
                timestamp: Date.now(),
                loadTime: duration,
                memoryUsage: this.getMemoryUsage()
              })
            }

            return duration
          }
        }
      }
    }
  }

  // Track API call performance
  trackApiCall(url: string, method: string, startTime: number, endTime: number, success: boolean): void {
    const duration = endTime - startTime

    console.log(`${method} ${url}: ${duration.toFixed(2)}ms`)

    // Record slow API calls
    if (duration > 1000) { // > 1 second
      this.recordMetrics({
        timestamp: Date.now(),
        loadTime: duration,
        networkRequests: 1
      })
    }
  }

  // Persist metrics to localStorage
  private persistMetrics(): void {
    try {
      const metricsToStore = this.metrics.slice(-50) // Store last 50 metrics
      localStorage.setItem('ftwos_performance_metrics', JSON.stringify(metricsToStore))
    } catch (error) {
      console.warn('Failed to persist performance metrics:', error)
    }
  }

  // Load metrics from localStorage
  loadPersistedMetrics(): void {
    try {
      const stored = localStorage.getItem('ftwos_performance_metrics')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.metrics = parsed
      }
    } catch (error) {
      console.warn('Failed to load persisted performance metrics:', error)
    }
  }

  // Clear old metrics
  clearOldMetrics(days: number = 7): void {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
    this.persistMetrics()
  }

  // Get performance report
  generateReport(): {
    summary: Partial<PerformanceMetrics>
    trends: {
      loadTime: 'improving' | 'stable' | 'degrading'
      memoryUsage: 'improving' | 'stable' | 'degrading'
    }
    recommendations: string[]
  } {
    const last24h = this.getAverageMetrics(24)
    const last1h = this.getAverageMetrics(1)

    const trends = {
      loadTime: this.calculateTrend('loadTime'),
      memoryUsage: this.calculateTrend('memoryUsage')
    }

    const recommendations: string[] = []

    if (last24h.loadTime && last24h.loadTime > 2000) {
      recommendations.push('Consider implementing code splitting to reduce initial bundle size')
    }

    if (last24h.memoryUsage && last24h.memoryUsage > 150) {
      recommendations.push('Monitor for memory leaks and optimize component re-renders')
    }

    if (trends.loadTime === 'degrading') {
      recommendations.push('Performance is degrading - review recent changes')
    }

    return {
      summary: last24h,
      trends,
      recommendations
    }
  }

  // Calculate trend for a metric
  private calculateTrend(metric: keyof PerformanceMetrics): 'improving' | 'stable' | 'degrading' {
    const recent = this.getMetrics(1) // Last hour
    const older = this.getMetrics(24).filter(m => m.timestamp < Date.now() - (60 * 60 * 1000)) // Before last hour

    if (recent.length < 5 || older.length < 5) return 'stable'

    const recentAvg = recent.reduce((sum, m) => sum + (m[metric] as number || 0), 0) / recent.length
    const olderAvg = older.reduce((sum, m) => sum + (m[metric] as number || 0), 0) / older.length

    const change = ((recentAvg - olderAvg) / olderAvg) * 100

    if (Math.abs(change) < 5) return 'stable'
    return change > 0 ? 'degrading' : 'improving'
  }

  // Track bundle size
  trackBundleSize(): number {
    const size = this.estimateBundleSize()
    this.recordMetrics({ bundleSize: size })
    return size
  }

  // Get performance budgets
  getBudgets() {
    return { ...this.BUDGETS }
  }

  // Initialize performance monitoring
  initialize(): void {
    this.loadPersistedMetrics()

    // Track page load on mount
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        this.trackPageLoad()
      } else {
        window.addEventListener('load', () => this.trackPageLoad())
      }

      // Monitor chunk loading
      this.monitorChunkLoading()

      // Track bundle size periodically - STORE INTERVAL ID
      const bundleInterval = setInterval(() => this.trackBundleSize(), 60000) as unknown as number
      this.intervalIds.push(bundleInterval)

      // Clear old metrics weekly - STORE INTERVAL ID
      const cleanupInterval = setInterval(() => this.clearOldMetrics(7), 7 * 24 * 60 * 60 * 1000) as unknown as number
      this.intervalIds.push(cleanupInterval)
    }
  }

  // Add cleanup method
  destroy(): void {
    // Clear all intervals
    this.intervalIds.forEach(id => clearInterval(id))
    this.intervalIds = []

    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }

  // Monitor chunk loading
  private monitorChunkLoading(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.name.includes('.js')) {
            const resourceEntry = entry as PerformanceResourceTiming
            const loadTime = resourceEntry.responseEnd - resourceEntry.fetchStart
            const chunkName = resourceEntry.name.split('/').pop() || 'unknown'
            this.trackChunkLoad(chunkName, loadTime)
          }
        }
      })

      this.observer.observe({ entryTypes: ['resource'] })
    } catch (e) {
      console.warn('PerformanceObserver not supported:', e)
    }
  }
}

export const performanceService = new PerformanceService()

// Add cleanup on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceService.destroy()
  })
}
