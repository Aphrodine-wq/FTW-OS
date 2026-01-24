/**
 * Module Preloader
 * Implements intelligent preloading and prefetching for application modules
 * with network-aware adaptive strategies
 */

// Network connection quality types
type ConnectionQuality = 'fast' | 'moderate' | 'slow' | 'offline'

// Module categories for chunk grouping
export const MODULE_CATEGORIES = {
  core: ['dashboard', 'pulse', 'analytics', 'settings'],
  automation: ['workflows', 'webhooks'],
  infrastructure: ['servers', 'docker', 'uptime'],
  knowledge: ['brain', 'courses', 'snippets'],
  finance: ['finance', 'expenses', 'history', 'products', 'taxes'],
  crm: ['crm', 'pipeline'],
  communication: ['mail'],
  productivity: ['projects', 'tasks', 'tracker', 'calendar', 'documents'],
  legal: ['contracts'],
  hr: ['assets', 'payroll'],
  marketing: ['marketing', 'seo', 'ads', 'newsletter'],
  dev: ['dev', 'trae'],
  ai: ['research', 'voice'],
  security: ['vault'],
  system: ['update'],
} as const

// Module loading priorities (higher = more important)
export const MODULE_PRIORITIES: Record<string, number> = {
  dashboard: 10,
  settings: 9,
  finance: 8,
  tasks: 8,
  projects: 7,
  calendar: 7,
  mail: 6,
  crm: 6,
  analytics: 5,
  expenses: 5,
  history: 5,
  tracker: 5,
  documents: 5,
  pulse: 4,
  workflows: 4,
  brain: 4,
  products: 4,
  pipeline: 4,
  contracts: 3,
  assets: 3,
  payroll: 3,
  marketing: 3,
  seo: 3,
  ads: 3,
  newsletter: 3,
  dev: 3,
  trae: 3,
  research: 2,
  voice: 2,
  webhooks: 2,
  servers: 2,
  docker: 2,
  uptime: 2,
  courses: 2,
  snippets: 2,
  taxes: 2,
  vault: 1,
  update: 1,
}

// Preload cache
const preloadedModules = new Set<string>()
const preloadPromises = new Map<string, Promise<React.ComponentType<{ setActiveTab: (tab: string) => void }>>>()
const prefetchPromises = new Map<string, Promise<React.ComponentType<{ setActiveTab: (tab: string) => void }>>>()
// Track pending callbacks for cleanup
const pendingCallbacks = new Map<string, number>()
// Track module load times for adaptive prioritization
const moduleLoadTimes = new Map<string, number>()

/**
 * Detect network connection quality
 */
function getConnectionQuality(): ConnectionQuality {
  if (typeof navigator === 'undefined') return 'moderate'
  
  // Check if offline
  if (!navigator.onLine) return 'offline'
  
  // Use Network Information API if available
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection
  if (connection) {
    if (connection.saveData) return 'slow'
    switch (connection.effectiveType) {
      case '4g': return 'fast'
      case '3g': return 'moderate'
      case '2g':
      case 'slow-2g': return 'slow'
      default: return 'moderate'
    }
  }
  
  return 'moderate'
}

/**
 * Get preload batch size based on network quality
 */
function getPreloadBatchSize(): number {
  switch (getConnectionQuality()) {
    case 'fast': return 5
    case 'moderate': return 3
    case 'slow': return 1
    case 'offline': return 0
  }
}

/**
 * Get preload delay based on network quality (in ms)
 */
function getPreloadDelay(): number {
  switch (getConnectionQuality()) {
    case 'fast': return 1000
    case 'moderate': return 2000
    case 'slow': return 5000
    case 'offline': return 0
  }
}

/**
 * Get module category
 */
export function getModuleCategory(moduleId: string): string {
  for (const [category, modules] of Object.entries(MODULE_CATEGORIES)) {
    if (modules.includes(moduleId as (typeof modules)[number])) {
      return category
    }
  }
  return 'other'
}

/**
 * Get module priority
 */
export function getModulePriority(moduleId: string): number {
  return MODULE_PRIORITIES[moduleId] || 0
}

/**
 * Preload a module (high priority, immediate)
 */
export async function preloadModule(moduleId: string): Promise<void> {
  if (preloadedModules.has(moduleId) || preloadPromises.has(moduleId)) {
    return
  }

  const importFn = getModuleImport(moduleId)
  if (!importFn) {
    return
  }

  const startTime = performance.now()
  const promise = importFn().then(() => {
    preloadedModules.add(moduleId)
    preloadPromises.delete(moduleId)
    // Track load time for adaptive optimization
    moduleLoadTimes.set(moduleId, performance.now() - startTime)
  }).catch((err) => {
    console.warn(`Failed to preload module ${moduleId}:`, err)
    preloadPromises.delete(moduleId)
  })

  preloadPromises.set(moduleId, promise)
  return promise
}

/**
 * Prefetch a module (low priority, background)
 */
export function prefetchModule(moduleId: string): void {
  if (preloadedModules.has(moduleId) || preloadPromises.has(moduleId) || prefetchPromises.has(moduleId)) {
    return
  }

  const importFn = getModuleImport(moduleId)
  if (!importFn) {
    return
  }

  // Cancel any existing pending callback for this module
  if (pendingCallbacks.has(moduleId)) {
    const existingId = pendingCallbacks.get(moduleId)!
    if ('cancelIdleCallback' in window) {
      (window as any).cancelIdleCallback(existingId)
    } else {
      clearTimeout(existingId)
    }
    pendingCallbacks.delete(moduleId)
  }

  // Use requestIdleCallback if available, otherwise setTimeout
  const schedulePrefetch = () => {
      if ('requestIdleCallback' in window) {
      const callbackId = (window as Window & { requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number }).requestIdleCallback(() => {
        pendingCallbacks.delete(moduleId)
        const promise = importFn().then(() => {
          preloadedModules.add(moduleId)
          prefetchPromises.delete(moduleId)
        }).catch((err) => {
          console.warn(`Failed to prefetch module ${moduleId}:`, err)
          prefetchPromises.delete(moduleId)
        })
        prefetchPromises.set(moduleId, promise)
      }, { timeout: 2000 })

      pendingCallbacks.set(moduleId, callbackId)
    } else {
      const timeoutId = setTimeout(() => {
        pendingCallbacks.delete(moduleId)
        const promise = importFn().then(() => {
          preloadedModules.add(moduleId)
          prefetchPromises.delete(moduleId)
        }).catch((err) => {
          console.warn(`Failed to prefetch module ${moduleId}:`, err)
          prefetchPromises.delete(moduleId)
        })
        prefetchPromises.set(moduleId, promise)
      }, 100) as unknown as number

      pendingCallbacks.set(moduleId, timeoutId)
    }
  }

  schedulePrefetch()
}

/**
 * Cancel all pending prefetch callbacks
 */
export function cancelPendingPrefetches(): void {
  pendingCallbacks.forEach((callbackId) => {
    if ('cancelIdleCallback' in window) {
      (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(callbackId)
    } else {
      clearTimeout(callbackId)
    }
  })
  pendingCallbacks.clear()
}

/**
 * Preload modules by category
 */
export function preloadModuleCategory(category: string): void {
  const modules = MODULE_CATEGORIES[category as keyof typeof MODULE_CATEGORIES]
  if (modules) {
    modules.forEach(moduleId => preloadModule(moduleId))
  }
}

/**
 * Preload high-priority modules with smart scheduling
 * Network-aware: adjusts batch size and timing based on connection quality
 */
export function preloadHighPriorityModules(): void {
  const quality = getConnectionQuality()
  
  // Skip preloading if offline
  if (quality === 'offline') return
  
  const batchSize = getPreloadBatchSize()
  const delay = getPreloadDelay()
  
  // IMMEDIATE preload (priority >= 9) - only what user sees on dashboard
  const immediatePriorityModules = Object.entries(MODULE_PRIORITIES)
    .filter(([_, priority]) => priority >= 9)
    .map(([moduleId]) => moduleId)
    .sort((a, b) => MODULE_PRIORITIES[b] - MODULE_PRIORITIES[a])

  immediatePriorityModules.forEach(moduleId => preloadModule(moduleId))

  // DEFER secondary modules (priority 7-8) to idle time with batching
  const deferredPriorityModules = Object.entries(MODULE_PRIORITIES)
    .filter(([_, priority]) => priority >= 7 && priority < 9)
    .map(([moduleId]) => moduleId)
    .sort((a, b) => MODULE_PRIORITIES[b] - MODULE_PRIORITIES[a])

  // Batch prefetching based on network quality
  const prefetchBatch = (modules: string[], index: number) => {
    const batch = modules.slice(index, index + batchSize)
    if (batch.length === 0) return
    
    batch.forEach(moduleId => prefetchModule(moduleId))
    
    // Schedule next batch
    if (index + batchSize < modules.length) {
      setTimeout(() => prefetchBatch(modules, index + batchSize), delay)
    }
  }

  // Use requestIdleCallback for deferred modules with network-aware batching
  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number }).requestIdleCallback(() => {
      prefetchBatch(deferredPriorityModules, 0)
    }, { timeout: 5000 })
  } else {
    setTimeout(() => {
      prefetchBatch(deferredPriorityModules, 0)
    }, delay)
  }
}

/**
 * Module component type
 */
type ModuleComponent = React.ComponentType<{ setActiveTab: (tab: string) => void }>

/**
 * Get module import function
 */
export function getModuleImport(moduleId: string): (() => Promise<ModuleComponent>) | null {
  // Map module IDs to their lazy import paths
  const moduleImports: Record<string, () => Promise<ModuleComponent>> = {
    dashboard: () => import('@/lib/lazy-modules').then(m => m.Dashboard),
    pulse: () => import('@/lib/lazy-modules').then(m => m.PulseDashboard),
    analytics: () => import('@/lib/lazy-modules').then(m => m.AnalyticsDashboard),
    workflows: () => import('@/lib/lazy-modules').then(m => m.WorkflowEditor),
    webhooks: () => import('@/lib/lazy-modules').then(m => m.WebhookServer),
    servers: () => import('@/lib/lazy-modules').then(m => m.ServerManager),
    docker: () => import('@/lib/lazy-modules').then(m => m.DockerPilot),
    uptime: () => import('@/lib/lazy-modules').then(m => m.UptimeMonitor),
    brain: () => import('@/lib/lazy-modules').then(m => m.Brain),
    courses: () => import('@/lib/lazy-modules').then(m => m.CourseTracker),
    snippets: () => import('@/lib/lazy-modules').then(m => m.SnippetLibrary),
    finance: () => import('@/lib/lazy-modules').then(m => m.DocumentBuilder),
    expenses: () => import('@/lib/lazy-modules').then(m => m.ExpenseManager),
    history: () => import('@/lib/lazy-modules').then(m => m.InvoiceHistory),
    products: () => import('@/lib/lazy-modules').then(m => m.ProductManager),
    taxes: () => import('@/lib/lazy-modules').then(m => m.TaxVault),
    crm: () => import('@/lib/lazy-modules').then(m => m.ClientManager),
    pipeline: () => import('@/lib/lazy-modules').then(m => m.LeadsPipeline),
    mail: () => import('@/lib/lazy-modules').then(m => m.EmailClient),
    projects: () => import('@/lib/lazy-modules').then(m => m.ProjectHub),
    tasks: () => import('@/lib/lazy-modules').then(m => m.TaskList),
    tracker: () => import('@/lib/lazy-modules').then(m => m.TimeTracker),
    calendar: () => import('@/lib/lazy-modules').then(m => m.Calendar),
    documents: () => import('@/lib/lazy-modules').then(m => m.DocumentHub),
    contracts: () => import('@/lib/lazy-modules').then(m => m.ContractWizard),
    assets: () => import('@/lib/lazy-modules').then(m => m.AssetInventory),
    payroll: () => import('@/lib/lazy-modules').then(m => m.PayrollLite),
    marketing: () => import('@/lib/lazy-modules').then(m => m.MarketingDashboard),
    seo: () => import('@/lib/lazy-modules').then(m => m.SEOToolkit),
    ads: () => import('@/lib/lazy-modules').then(m => m.AdManager),
    newsletter: () => import('@/lib/lazy-modules').then(m => m.NewsletterStudio),
    dev: () => import('@/lib/lazy-modules').then(m => m.DevHQ),
    research: () => import('@/lib/lazy-modules').then(m => m.ResearchAgent),
    voice: () => import('@/lib/lazy-modules').then(m => m.VoiceCommand),
    settings: () => import('@/lib/lazy-modules').then(m => m.SettingsPanel),
    vault: () => import('@/lib/lazy-modules').then(m => m.PasswordManager),
    update: () => import('@/lib/lazy-modules').then(m => m.SystemUpdate),
  }

  return moduleImports[moduleId] || null
}

/**
 * Check if module is preloaded
 */
export function isModulePreloaded(moduleId: string): boolean {
  return preloadedModules.has(moduleId)
}

/**
 * Initialize preloading strategy
 * Preloads high-priority modules after initial load
 */
export function initializePreloading(): void {
  // Wait for initial load to complete
  if (document.readyState === 'complete') {
    preloadHighPriorityModules()
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloadHighPriorityModules()
      }, 2000) // Wait 2s after page load
    })
  }
}

/**
 * Get preload statistics for performance monitoring
 */
export function getPreloadStats(): {
  loaded: string[]
  pending: string[]
  avgLoadTime: number
  connectionQuality: ConnectionQuality
} {
  const loadTimes = Array.from(moduleLoadTimes.values())
  return {
    loaded: Array.from(preloadedModules),
    pending: Array.from(preloadPromises.keys()),
    avgLoadTime: loadTimes.length > 0 ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0,
    connectionQuality: getConnectionQuality()
  }
}

/**
 * Preload modules related to the current module (adjacency-based prefetching)
 */
export function preloadAdjacentModules(currentModuleId: string): void {
  const category = getModuleCategory(currentModuleId)
  const categoryModules = MODULE_CATEGORIES[category as keyof typeof MODULE_CATEGORIES]
  
  if (categoryModules) {
    // Prefetch other modules in the same category
    categoryModules
      .filter(m => m !== currentModuleId && !preloadedModules.has(m))
      .slice(0, 2) // Limit to 2 adjacent modules
      .forEach(moduleId => prefetchModule(moduleId))
  }
}