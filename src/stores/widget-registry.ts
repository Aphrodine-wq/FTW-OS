import { create } from 'zustand'
import { 
  LayoutGrid, Calculator, Wifi, Activity, 
  Github, Cloud, Gamepad2, Receipt, 
  Briefcase, Calendar, MessageSquare, Terminal,
  Brain, Zap, Flame, CloudRain, Bitcoin, Newspaper, Coffee
} from 'lucide-react'

// NOTE: Components are NOT imported here to avoid circular dependencies.
// Components are lazy-loaded in Dashboard.tsx via WIDGET_MAP.

export interface WidgetDefinition {
  type: string
  title: string
  description: string
  category: 'productivity' | 'finance' | 'dev' | 'system' | 'fun' | 'revolutionary'
  icon: any
  defaultSize: { w: number; h: number }
  premium?: boolean
}

interface WidgetRegistryState {
  definitions: WidgetDefinition[]
  getDefinition: (type: string) => WidgetDefinition | undefined
}

const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  // Revolutionary Widgets
  {
    type: 'neural-flow',
    title: 'Neural Flow',
    description: 'AI-powered work pattern analyzer with productivity insights',
    category: 'revolutionary',
    icon: Brain,
    defaultSize: { w: 4, h: 6 },
    premium: true
  },
  {
    type: 'revenue-reactor',
    title: 'Revenue Reactor',
    description: 'Nuclear-powered revenue intelligence and predictions',
    category: 'finance',
    icon: Zap,
    defaultSize: { w: 4, h: 6 },
    premium: true
  },
  {
    type: 'trae-coder',
    title: 'Trae Coder',
    description: 'Full-stack development environment with AI assistance',
    category: 'dev',
    icon: Terminal,
    defaultSize: { w: 6, h: 6 },
    premium: true
  },
  {
    type: 'pressure-cooker',
    title: 'Pressure Cooker',
    description: 'Real-time stress monitoring and burnout prevention',
    category: 'productivity',
    icon: Flame,
    defaultSize: { w: 3, h: 5 },
    premium: true
  },
  
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
  {
    type: 'crypto-matrix',
    title: 'Crypto Matrix',
    description: 'Live cryptocurrency prices',
    category: 'finance',
    icon: Terminal,
    defaultSize: { w: 6, h: 4 }
  },
  {
    type: 'weather',
    title: 'Weather',
    description: 'Live weather conditions and forecast',
    category: 'productivity',
    icon: CloudRain,
    defaultSize: { w: 3, h: 4 }
  },
  {
    type: 'crypto-prices',
    title: 'Crypto Prices',
    description: 'Real-time cryptocurrency market data',
    category: 'finance',
    icon: Bitcoin,
    defaultSize: { w: 3, h: 5 }
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
  {
    type: 'net-vis',
    title: 'Network Vis',
    description: 'Real-time network traffic',
    category: 'system',
    icon: Wifi,
    defaultSize: { w: 6, h: 4 }
  },
  {
    type: 'system-resources',
    title: 'System Resources',
    description: 'CPU and RAM usage',
    category: 'system',
    icon: Activity,
    defaultSize: { w: 3, h: 4 }
  },

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

export const useWidgetRegistry = create<WidgetRegistryState>((set, get) => ({
  definitions: WIDGET_DEFINITIONS,
  getDefinition: (type: string) => WIDGET_DEFINITIONS.find(w => w.type === type)
}))
