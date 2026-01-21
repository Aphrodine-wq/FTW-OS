/**
 * Widget Registry
 * Centralized registry for all widgets with metadata
 */

import { ComponentType, lazy } from 'react'

export interface WidgetMetadata {
  id: string
  name: string
  category: 'finance' | 'productivity' | 'information' | 'system' | 'lifestyle' | 'fun'
  description?: string
  component: ComponentType<any> | (() => Promise<{ default: ComponentType<any> }>)
  requiresConfig?: boolean
  refreshInterval?: number
  icon?: string
}

// Lazy load widgets for better performance
const StockMarketWidget = lazy(() => import('@/components/widgets/finance/StockMarketWidget').then(m => ({ default: m.StockMarketWidget })))
const CurrencyWidget = lazy(() => import('@/components/widgets/finance/CurrencyWidget').then(m => ({ default: m.CurrencyWidget })))
const GasPricesWidget = lazy(() => import('@/components/widgets/finance/GasPricesWidget').then(m => ({ default: m.GasPricesWidget })))
const QuickInvoiceWidget = lazy(() => import('@/components/widgets/core/finance/QuickInvoiceWidget').then(m => ({ default: m.QuickInvoiceWidget })))

const CalendarWidget = lazy(() => import('@/components/widgets/productivity/CalendarWidget').then(m => ({ default: m.CalendarWidget })))
const TimeZonesWidget = lazy(() => import('@/components/widgets/productivity/TimeZonesWidget').then(m => ({ default: m.TimeZonesWidget })))
const PomodoroMax = lazy(() => import('@/components/widgets/core/sector-d/PomodoroMax').then(m => ({ default: m.PomodoroMax })))
const ProjectStatusWidget = lazy(() => import('@/components/widgets/core/productivity/ProjectStatusWidget').then(m => ({ default: m.ProjectStatusWidget })))

const RedditWidget = lazy(() => import('@/components/widgets/information/RedditWidget').then(m => ({ default: m.RedditWidget })))
const HackerNewsWidget = lazy(() => import('@/components/widgets/information/HackerNewsWidget').then(m => ({ default: m.HackerNewsWidget })))
const ProductHuntWidget = lazy(() => import('@/components/widgets/information/ProductHuntWidget').then(m => ({ default: m.ProductHuntWidget })))
const DevToWidget = lazy(() => import('@/components/widgets/information/DevToWidget').then(m => ({ default: m.DevToWidget })))
const NewsFeedWidget = lazy(() => import('@/components/widgets/api/NewsFeedWidget').then(m => ({ default: m.NewsFeedWidget })))

const NetworkSpeedWidget = lazy(() => import('@/components/widgets/system/NetworkSpeedWidget').then(m => ({ default: m.NetworkSpeedWidget })))
const BatteryWidget = lazy(() => import('@/components/widgets/system/BatteryWidget').then(m => ({ default: m.BatteryWidget })))
const DiskSpaceWidget = lazy(() => import('@/components/widgets/system/DiskSpaceWidget').then(m => ({ default: m.DiskSpaceWidget })))
const SystemHealth = lazy(() => import('@/components/widgets/core/sector-b/SystemHealth').then(m => ({ default: m.SystemHealth })))

const FitnessWidget = lazy(() => import('@/components/widgets/lifestyle/FitnessWidget').then(m => ({ default: m.FitnessWidget })))
const AirQualityWidget = lazy(() => import('@/components/widgets/lifestyle/AirQualityWidget').then(m => ({ default: m.AirQualityWidget })))

const WidgetQuote = lazy(() => import('@/components/widgets/fun/WidgetQuote').then(m => ({ default: m.WidgetQuote })))
const WidgetNasa = lazy(() => import('@/components/widgets/fun/WidgetNasa').then(m => ({ default: m.WidgetNasa })))
const WidgetRoast = lazy(() => import('@/components/widgets/fun/WidgetRoast').then(m => ({ default: m.WidgetRoast })))
const WidgetExcuse = lazy(() => import('@/components/widgets/fun/WidgetExcuse').then(m => ({ default: m.WidgetExcuse })))

// Widget registry with all widgets
export const WIDGET_REGISTRY: Record<string, WidgetMetadata[]> = {
  finance: [
    {
      id: 'stocks',
      name: 'Stock Market',
      category: 'finance',
      description: 'Track major stock indices (S&P 500, NASDAQ, DOW)',
      component: StockMarketWidget,
      refreshInterval: 60000, // 1 minute
    },
    {
      id: 'currency',
      name: 'Currency Exchange',
      category: 'finance',
      description: 'Live currency exchange rates',
      component: CurrencyWidget,
      refreshInterval: 300000, // 5 minutes
    },
    {
      id: 'gas-prices',
      name: 'Gas Prices',
      category: 'finance',
      description: 'Local gas prices',
      component: GasPricesWidget,
      refreshInterval: 3600000, // 1 hour
    },
    {
      id: 'quick-invoice',
      name: 'Quick Invoice',
      category: 'finance',
      description: 'Recent invoices and quick actions',
      component: QuickInvoiceWidget,
    },
  ],
  productivity: [
    {
      id: 'calendar',
      name: 'Calendar',
      category: 'productivity',
      description: 'Upcoming calendar events',
      component: CalendarWidget,
      refreshInterval: 300000, // 5 minutes
    },
    {
      id: 'timezones',
      name: 'Time Zones',
      category: 'productivity',
      description: 'Multiple time zones',
      component: TimeZonesWidget,
      refreshInterval: 300000, // 5 minutes
    },
    {
      id: 'pomodoro',
      name: 'Pomodoro Timer',
      category: 'productivity',
      description: 'Focus timer with breaks',
      component: PomodoroMax,
      refreshInterval: 1000, // 1 second
    },
    {
      id: 'project-status',
      name: 'Project Status',
      category: 'productivity',
      description: 'Active projects overview',
      component: ProjectStatusWidget,
      refreshInterval: 60000,
    },
  ],
  information: [
    {
      id: 'reddit',
      name: 'Reddit Trending',
      category: 'information',
      description: 'Trending posts from Reddit',
      component: RedditWidget,
      refreshInterval: 300000, // 5 minutes
    },
    {
      id: 'hackernews',
      name: 'Hacker News',
      category: 'information',
      description: 'Top stories from Hacker News',
      component: HackerNewsWidget,
      refreshInterval: 600000, // 10 minutes
    },
    {
      id: 'producthunt',
      name: 'Product Hunt',
      category: 'information',
      description: "Today's top products",
      component: ProductHuntWidget,
      refreshInterval: 3600000, // 1 hour
    },
    {
      id: 'devto',
      name: 'Dev.to',
      category: 'information',
      description: 'Trending articles from Dev.to',
      component: DevToWidget,
      refreshInterval: 600000, // 10 minutes
    },
    {
      id: 'news',
      name: 'News Feed',
      category: 'information',
      description: 'Latest news headlines',
      component: NewsFeedWidget,
      refreshInterval: 300000, // 5 minutes
    },
  ],
  system: [
    {
      id: 'network-speed',
      name: 'Network Speed',
      category: 'system',
      description: 'Current network speed',
      component: NetworkSpeedWidget,
      refreshInterval: 2000, // 2 seconds
    },
    {
      id: 'battery',
      name: 'Battery Status',
      category: 'system',
      description: 'Battery level and charging status',
      component: BatteryWidget,
      refreshInterval: 30000, // 30 seconds
    },
    {
      id: 'disk-space',
      name: 'Disk Space',
      category: 'system',
      description: 'Available disk space',
      component: DiskSpaceWidget,
      refreshInterval: 300000, // 5 minutes
    },
    {
      id: 'system-health',
      name: 'System Health',
      category: 'system',
      description: 'Overall system health metrics',
      component: SystemHealth,
      refreshInterval: 5000, // 5 seconds
    },
  ],
  lifestyle: [
    {
      id: 'fitness',
      name: 'Fitness Tracker',
      category: 'lifestyle',
      description: 'Steps, calories, and fitness goals',
      component: FitnessWidget,
      refreshInterval: 10000, // 10 seconds
    },
    {
      id: 'air-quality',
      name: 'Air Quality',
      category: 'lifestyle',
      description: 'Local air quality index (AQI)',
      component: AirQualityWidget,
      refreshInterval: 300000, // 5 minutes
    },
  ],
  fun: [
    {
      id: 'quote',
      name: 'Daily Quote',
      category: 'fun',
      description: 'Inspirational quotes',
      component: WidgetQuote,
    },
    {
      id: 'nasa',
      name: 'NASA Image',
      category: 'fun',
      description: 'NASA Astronomy Picture of the Day',
      component: WidgetNasa,
      refreshInterval: 86400000, // 24 hours
    },
    {
      id: 'roast',
      name: 'Code Roast',
      category: 'fun',
      description: 'Get roasted for your code',
      component: WidgetRoast,
    },
    {
      id: 'excuse',
      name: 'Developer Excuse',
      category: 'fun',
      description: 'Random developer excuses',
      component: WidgetExcuse,
    },
  ],
}

/**
 * Register a widget
 */
export function registerWidget(metadata: WidgetMetadata): void {
  if (!WIDGET_REGISTRY[metadata.category]) {
    WIDGET_REGISTRY[metadata.category] = []
  }
  WIDGET_REGISTRY[metadata.category].push(metadata)
}

/**
 * Get all widgets by category
 */
export function getWidgetsByCategory(category: string): WidgetMetadata[] {
  return WIDGET_REGISTRY[category] || []
}

/**
 * Get widget by ID
 */
export function getWidgetById(id: string): WidgetMetadata | undefined {
  for (const category of Object.values(WIDGET_REGISTRY)) {
    const widget = category.find(w => w.id === id)
    if (widget) return widget
  }
  return undefined
}

/**
 * Get all widgets
 */
export function getAllWidgets(): WidgetMetadata[] {
  return Object.values(WIDGET_REGISTRY).flat()
}
