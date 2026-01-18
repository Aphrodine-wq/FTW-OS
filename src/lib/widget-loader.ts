/**
 * Dynamic Widget Loader
 * Loads widgets on-demand to reduce initial bundle size
 */

import React, { ComponentType, lazy } from 'react'

// Widget import map - organized by category for better chunking
const WIDGET_IMPORTS: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
  // Core System Widgets
  'system-health': () => import('@/components/widgets/core/sector-b/SystemHealth').then(m => ({ default: m.SystemHealth })),
  'system-resources': () => import('@/components/widgets/core/sector-b/SystemResourcesWidget').then(m => ({ default: m.SystemResourcesWidget })),
  'net-vis': () => import('@/components/widgets/core/sector-a/NetVisWidget').then(m => ({ default: m.NetVisWidget })),
  'quick-roi': () => import('@/components/widgets/core/sector-a/QuickROIWidget').then(m => ({ default: m.QuickROIWidget })),
  'day-stream': () => import('@/components/widgets/core/sector-a/DayStreamWidget').then(m => ({ default: m.DayStreamWidget })),
  'pomodoro': () => import('@/components/widgets/core/sector-d/PomodoroMax').then(m => ({ default: m.PomodoroMax })),
  'crypto-matrix': () => import('@/components/widgets/core/sector-c/CryptoMatrix').then(m => ({ default: m.CryptoMatrix })),
  
  // Real/External Widgets
  'github': () => import('@/components/widgets/core/real/RealGithub').then(m => ({ default: m.RealGithubWidget })),
  'soundcloud': () => import('@/components/widgets/core/real/RealSoundCloud').then(m => ({ default: m.RealSoundCloudWidget })),
  'steam': () => import('@/components/widgets/core/real/RealSteam').then(m => ({ default: m.RealSteamWidget })),
  'ollama': () => import('@/components/widgets/core/real/OllamaChat').then(m => ({ default: m.OllamaChat })),
  
  // API Widgets
  'weather': () => import('@/components/widgets/api/WeatherWidget').then(m => ({ default: m.WeatherWidget })),
  'crypto-prices': () => import('@/components/widgets/api/CryptoPricesWidget').then(m => ({ default: m.CryptoPricesWidget })),
  'news-feed': () => import('@/components/widgets/api/NewsFeedWidget').then(m => ({ default: m.NewsFeedWidget })),
  
  // Legacy Widgets (from Widgets.tsx)
  'weather-old': () => import('@/components/widgets/core/Widgets').then(m => ({ default: m.WeatherWidget })),
  'caffeine': () => import('@/components/widgets/core/Widgets').then(m => ({ default: m.CaffeineWidget })),
  
  // Finance Widgets
  'quick-invoice': () => import('@/components/widgets/core/finance/QuickInvoiceWidget').then(m => ({ default: m.QuickInvoiceWidget })),
  
  // Productivity Widgets
  'project-status': () => import('@/components/widgets/core/productivity/ProjectStatusWidget').then(m => ({ default: m.ProjectStatusWidget })),
  
  // Fun Widgets
  'roast': () => import('@/components/widgets/fun/WidgetRoast').then(m => ({ default: m.WidgetRoast })),
  'nasa': () => import('@/components/widgets/fun/WidgetNasa').then(m => ({ default: m.WidgetNasa })),
  'excuse': () => import('@/components/widgets/fun/WidgetExcuse').then(m => ({ default: m.WidgetExcuse })),
  'quote': () => import('@/components/widgets/fun/WidgetQuote').then(m => ({ default: m.WidgetQuote })),
  
  // Revolutionary Widgets
  'neural-flow': () => import('@/components/widgets/revolutionary/NeuralFlowWidget').then(m => ({ default: m.NeuralFlowWidget })),
  
  // Dev Modules (as widgets)
  'trae-coder': () => import('@/components/modules/dev/TraeCoder').then(m => ({ default: m.TraeCoder })),
}

// Widget preload cache
const preloadedWidgets = new Set<string>()
const preloadPromises = new Map<string, Promise<any>>()

/**
 * Preload a widget for faster rendering
 */
export function preloadWidget(type: string): void {
  if (preloadedWidgets.has(type) || preloadPromises.has(type)) {
    return
  }
  
  const importFn = WIDGET_IMPORTS[type]
  if (!importFn) {
    return
  }
  
  const promise = importFn().then(() => {
    preloadedWidgets.add(type)
    preloadPromises.delete(type)
  })
  
  preloadPromises.set(type, promise)
}

/**
 * Preload multiple widgets
 */
export function preloadWidgets(types: string[]): void {
  types.forEach(type => preloadWidget(type))
}

/**
 * Get lazy component for a widget type
 */
export function getWidgetComponent(type: string): React.LazyExoticComponent<ComponentType<any>> {
  const importFn = WIDGET_IMPORTS[type]
  
  if (!importFn) {
    // Fallback to excuse widget if type not found
    return React.lazy(() => import('@/components/widgets/fun/WidgetExcuse').then(m => ({ default: m.WidgetExcuse })))
  }
  
  return React.lazy(importFn)
}

/**
 * Check if widget type is supported
 */
export function isWidgetSupported(type: string): boolean {
  return type in WIDGET_IMPORTS
}

/**
 * Get all supported widget types
 */
export function getSupportedWidgetTypes(): string[] {
  return Object.keys(WIDGET_IMPORTS)
}

