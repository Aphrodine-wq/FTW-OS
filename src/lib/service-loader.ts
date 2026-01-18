/**
 * Service Loader
 * Lazy loads services on-demand to reduce initial bundle size
 */

// Service import map
const SERVICE_IMPORTS: Record<string, () => Promise<any>> = {
  // Heavy services - load on demand
  'workflow-engine': () => import('@/services/workflow-engine'),
  'sync-service': () => import('@/services/sync-service'),
  'context-loader': () => import('@/services/context-loader'),
  'performance-service': () => import('@/services/performance-service'),
  'activity-tracking-service': () => import('@/services/activity-tracking-service'),
  'revenue-service': () => import('@/services/revenue-service'),
  'xp-service': () => import('@/services/xp-service'),
  'fps-service': () => import('@/services/fps-service'),
  'settings-sync': () => import('@/services/settings-sync'),
  'smart-notifications': () => import('@/services/smart-notifications'),
  
  // Lightweight services - can be loaded eagerly
  'supabase': () => import('@/services/supabase'),
  'utils': () => import('@/services/utils'),
}

// Service cache
const loadedServices = new Map<string, any>()
const loadingPromises = new Map<string, Promise<any>>()

/**
 * Load a service lazily
 */
export async function loadService<T = any>(serviceName: string): Promise<T> {
  // Return cached service if already loaded
  if (loadedServices.has(serviceName)) {
    return loadedServices.get(serviceName)
  }

  // Return existing promise if already loading
  if (loadingPromises.has(serviceName)) {
    return loadingPromises.get(serviceName)
  }

  const importFn = SERVICE_IMPORTS[serviceName]
  if (!importFn) {
    throw new Error(`Service "${serviceName}" not found`)
  }

  // Load the service
  const promise = importFn().then((module) => {
    const service = module.default || module
    loadedServices.set(serviceName, service)
    loadingPromises.delete(serviceName)
    return service
  })

  loadingPromises.set(serviceName, promise)
  return promise
}

/**
 * Preload a service (for critical services)
 */
export function preloadService(serviceName: string): void {
  if (loadedServices.has(serviceName) || loadingPromises.has(serviceName)) {
    return
  }

  loadService(serviceName).catch((error) => {
    console.warn(`Failed to preload service "${serviceName}":`, error)
  })
}

/**
 * Preload multiple services
 */
export function preloadServices(serviceNames: string[]): void {
  serviceNames.forEach(name => preloadService(name))
}

/**
 * Get service synchronously (only if already loaded)
 */
export function getService<T = any>(serviceName: string): T | null {
  return loadedServices.get(serviceName) || null
}

/**
 * Check if service is loaded
 */
export function isServiceLoaded(serviceName: string): boolean {
  return loadedServices.has(serviceName)
}

/**
 * Initialize critical services
 * These are loaded early for app functionality
 */
export function initializeCriticalServices(): void {
  // Preload lightweight services that are needed immediately
  preloadServices(['supabase', 'utils'])
}

