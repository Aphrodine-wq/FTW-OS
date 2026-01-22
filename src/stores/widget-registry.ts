import { create } from 'zustand'
import { 
  Calculator, Activity, 
  Github, Cloud, Gamepad2, Receipt, 
  Briefcase, MessageSquare,
  CloudRain, Newspaper, Coffee
} from 'lucide-react'

// NOTE: Components are NOT imported here to avoid circular dependencies.
// Components are lazy-loaded in Dashboard.tsx via WIDGET_MAP.

import type { LucideIcon } from 'lucide-react'

export interface WidgetDefinition {
  type: string
  title: string
  description: string
  category: 'productivity' | 'finance' | 'dev' | 'system' | 'fun'
  icon: LucideIcon
  defaultSize: { w: number; h: number }
  premium?: boolean
}

interface WidgetRegistryState {
  definitions: WidgetDefinition[]
  getDefinition: (type: string) => WidgetDefinition | undefined
}

const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  // Fun & Inspiration
  {
    type: 'quote',
    title: 'Daily Inspiration',
    description: 'Curated quotes for hackers and founders',
    category: 'fun',
    icon: MessageSquare,
    defaultSize: { w: 4, h: 3 }
  },

  // Finance
  {
    type: 'quick-invoice',
    title: 'Quick Invoice',
    description: 'Recent invoices and quick creation',
    category: 'finance',
    icon: Receipt,
    defaultSize: { w: 3, h: 4 }
  },
  {
    type: 'quick-roi',
    title: 'Quick ROI',
    description: 'Calculate project profitability',
    category: 'finance',
    icon: Calculator,
    defaultSize: { w: 3, h: 4 }
  },
  // Finance Widgets Continue...
  {
    type: 'weather',
    title: 'Weather',
    description: 'Live weather conditions and forecast',
    category: 'productivity',
    icon: CloudRain,
    defaultSize: { w: 3, h: 4 }
  },
  {
    type: 'news-feed',
    title: 'News Feed',
    description: 'Latest news from around the world',
    category: 'productivity',
    icon: Newspaper,
    defaultSize: { w: 4, h: 6 }
  },
  {
    type: 'caffeine-tracker',
    title: 'Caffeine Tracker',
    description: 'Track your daily caffeine intake',
    category: 'productivity',
    icon: Coffee,
    defaultSize: { w: 3, h: 4 }
  },

  // Productivity
  {
    type: 'project-status',
    title: 'Project Status',
    description: 'Track active projects overview',
    category: 'productivity',
    icon: Briefcase,
    defaultSize: { w: 4, h: 4 }
  },
  {
    type: 'pomodoro',
    title: 'Focus Timer',
    description: 'Stay productive with Pomodoro',
    category: 'productivity',
    icon: Activity,
    defaultSize: { w: 3, h: 3 }
  },

  // System
  
  // Dev
  {
    type: 'github',
    title: 'GitHub',
    description: 'Track repository activity',
    category: 'dev',
    icon: Github,
    defaultSize: { w: 4, h: 4 }
  },
  {
    type: 'ollama',
    title: 'Ollama Chat',
    description: 'Local AI assistant',
    category: 'dev',
    icon: MessageSquare,
    defaultSize: { w: 4, h: 6 }
  },

  // Fun
  {
    type: 'soundcloud',
    title: 'SoundCloud',
    description: 'Music player widget',
    category: 'fun',
    icon: Cloud,
    defaultSize: { w: 4, h: 4 }
  },
  {
    type: 'steam',
    title: 'Steam',
    description: 'Game library status',
    category: 'fun',
    icon: Gamepad2,
    defaultSize: { w: 4, h: 4 }
  },

  // Productivity - Caffeine Tracker
  {
    type: 'caffeine',
    title: 'Caffeine Tracker',
    description: 'Track your daily coffee intake',
    category: 'productivity',
    icon: Activity,
    defaultSize: { w: 4, h: 4 }
  }
]

export const useWidgetRegistry = create<WidgetRegistryState>((_set, _get) => ({
  definitions: WIDGET_DEFINITIONS,
  getDefinition: (type: string) => WIDGET_DEFINITIONS.find(w => w.type === type)
}))
