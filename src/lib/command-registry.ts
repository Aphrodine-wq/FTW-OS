/**
 * Command Registry
 * Central registry for all application commands
 */

import { 
  LayoutDashboard, CheckSquare, FileText, Plus, Clock, 
  Moon, Settings, Download, RefreshCw, Calendar, 
  DollarSign, Users, Target, Zap, Brain, 
  Mail, Folder, BarChart3, Activity, Server
} from 'lucide-react'
import { ComponentType } from 'react'

export interface CommandAction {
  id: string
  label: string
  category: string
  keywords: string[]
  icon: ComponentType<{ className?: string }>
  action: () => void | Promise<void>
  shortcut?: string
}

// Navigation commands will be dynamically created with navigation function
export const createNavigationCommands = (navigate: (page: string) => void): CommandAction[] => [
  {
    id: 'nav-dashboard',
    label: 'Go to Dashboard',
    category: 'Navigation',
    keywords: ['home', 'overview', 'main', 'dashboard'],
    icon: LayoutDashboard,
    action: () => navigate('dashboard'),
    shortcut: '⌘⇧D'
  },
  {
    id: 'nav-tasks',
    label: 'Go to Tasks',
    category: 'Navigation',
    keywords: ['todo', 'checklist', 'tasks', 'task'],
    icon: CheckSquare,
    action: () => navigate('tasks'),
    shortcut: '⌘⇧T'
  },
  {
    id: 'nav-finance',
    label: 'Go to Finance',
    category: 'Navigation',
    keywords: ['finance', 'money', 'billing', 'invoices'],
    icon: DollarSign,
    action: () => navigate('finance'),
    shortcut: '⌘⇧F'
  },
  {
    id: 'nav-projects',
    label: 'Go to Projects',
    category: 'Navigation',
    keywords: ['projects', 'project', 'work'],
    icon: Target,
    action: () => navigate('projects'),
    shortcut: '⌘⇧P'
  },
  {
    id: 'nav-analytics',
    label: 'Go to Analytics',
    category: 'Navigation',
    keywords: ['analytics', 'stats', 'reports'],
    icon: BarChart3,
    action: () => navigate('analytics')
  },
  {
    id: 'nav-pulse',
    label: 'Go to Pulse',
    category: 'Navigation',
    keywords: ['pulse', 'activity'],
    icon: Activity,
    action: () => navigate('pulse')
  },
  {
    id: 'nav-brain',
    label: 'Go to Knowledge Base',
    category: 'Navigation',
    keywords: ['brain', 'knowledge', 'notes', 'docs'],
    icon: Brain,
    action: () => navigate('brain')
  },
  {
    id: 'nav-calendar',
    label: 'Go to Calendar',
    category: 'Navigation',
    keywords: ['calendar', 'schedule', 'events'],
    icon: Calendar,
    action: () => navigate('calendar')
  },
  {
    id: 'nav-servers',
    label: 'Go to Server Manager',
    category: 'Navigation',
    keywords: ['servers', 'server', 'infrastructure'],
    icon: Server,
    action: () => navigate('servers')
  },
  {
    id: 'nav-workflows',
    label: 'Go to Automations',
    category: 'Navigation',
    keywords: ['workflows', 'automation', 'automations'],
    icon: Zap,
    action: () => navigate('workflows')
  }
]

// Quick action commands (will be enhanced with actual store actions)
export const createQuickActionCommands = (
  setQuickCaptureOpen?: (open: boolean) => void,
  setCreateInvoiceOpen?: (open: boolean) => void,
  setCreateTaskOpen?: (open: boolean) => void
): CommandAction[] => [
  {
    id: 'quick-capture',
    label: 'Quick Capture',
    category: 'Quick Actions',
    keywords: ['capture', 'quick', 'note', 'task', 'expense'],
    icon: Plus,
    action: () => setQuickCaptureOpen?.(true),
    shortcut: '⌘⇧Space'
  },
  {
    id: 'create-invoice',
    label: 'Create New Invoice',
    category: 'Quick Actions',
    keywords: ['invoice', 'bill', 'payment', 'new', 'create'],
    icon: FileText,
    action: () => {
      setCreateInvoiceOpen?.(true)
    }
  },
  {
    id: 'create-task',
    label: 'Create New Task',
    category: 'Quick Actions',
    keywords: ['task', 'todo', 'add', 'create'],
    icon: CheckSquare,
    action: () => {
      setCreateTaskOpen?.(true)
    }
  },
  {
    id: 'track-time',
    label: 'Start Time Tracking',
    category: 'Quick Actions',
    keywords: ['timer', 'clock', 'time', 'track'],
    icon: Clock,
    action: () => {
      // Will be implemented with time tracker store
      console.log('Start time tracking')
    }
  }
]

// Settings commands
export const createSettingsCommands = (
  navigate: (page: string) => void,
  toggleTheme?: () => void
): CommandAction[] => [
  {
    id: 'toggle-theme',
    label: 'Toggle Dark Mode',
    category: 'Settings',
    keywords: ['theme', 'appearance', 'dark', 'light', 'mode'],
    icon: Moon,
    action: () => toggleTheme?.(),
    shortcut: '⌘⇧L'
  },
  {
    id: 'open-settings',
    label: 'Open Settings',
    category: 'Settings',
    keywords: ['settings', 'preferences', 'config', 'options'],
    icon: Settings,
    action: () => navigate('settings'),
    shortcut: '⌘,'
  }
]

// Data/workflow commands
export const createDataCommands = (
  exportData?: () => void,
  syncNow?: () => void
): CommandAction[] => [
  {
    id: 'export-data',
    label: 'Export All Data',
    category: 'Data',
    keywords: ['export', 'backup', 'download', 'data'],
    icon: Download,
    action: () => exportData?.()
  },
  {
    id: 'sync-now',
    label: 'Sync Now',
    category: 'Data',
    keywords: ['sync', 'refresh', 'update', 'cloud'],
    icon: RefreshCw,
    action: () => syncNow?.()
  }
]

/**
 * Get all commands for the command palette
 */
export const getAllCommands = (
  navigate: (page: string) => void,
  options?: {
    setQuickCaptureOpen?: (open: boolean) => void
    setCreateInvoiceOpen?: (open: boolean) => void
    setCreateTaskOpen?: (open: boolean) => void
    toggleTheme?: () => void
    exportData?: () => void
    syncNow?: () => void
  }
): CommandAction[] => {
  return [
    ...createNavigationCommands(navigate),
    ...createQuickActionCommands(
      options?.setQuickCaptureOpen,
      options?.setCreateInvoiceOpen,
      options?.setCreateTaskOpen
    ),
    ...createSettingsCommands(navigate, options?.toggleTheme),
    ...createDataCommands(options?.exportData, options?.syncNow)
  ]
}

