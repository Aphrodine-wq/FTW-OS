/**
 * Keyboard Shortcuts Help Modal
 * Displays all available keyboard shortcuts
 */

import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Focus, 
  Settings, 
  Plus, 
  LayoutDashboard, 
  CheckSquare, 
  FileText,
  Moon,
  Download,
  RefreshCw,
  Undo,
  Redo
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Shortcut {
  id: string
  label: string
  keys: string[]
  category: string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  {
    id: 'cmd-k',
    label: 'Open Command Palette',
    keys: ['⌘', 'K'],
    category: 'Navigation',
    icon: Search,
    description: 'Quick access to all commands and navigation'
  },
  {
    id: 'cmd-shift-d',
    label: 'Go to Dashboard',
    keys: ['⌘', '⇧', 'D'],
    category: 'Navigation',
    icon: LayoutDashboard
  },
  {
    id: 'cmd-shift-t',
    label: 'Go to Tasks',
    keys: ['⌘', '⇧', 'T'],
    category: 'Navigation',
    icon: CheckSquare
  },
  {
    id: 'cmd-shift-f',
    label: 'Go to Finance',
    keys: ['⌘', '⇧', 'F'],
    category: 'Navigation',
    icon: FileText
  },
  
  // Quick Actions
  {
    id: 'cmd-shift-space',
    label: 'Quick Capture',
    keys: ['⌘', '⇧', 'Space'],
    category: 'Quick Actions',
    icon: Plus,
    description: 'Capture tasks, notes, or expenses instantly'
  },
  {
    id: 'cmd-shift-focus',
    label: 'Toggle Focus Mode',
    keys: ['⌘', '⇧', 'F'],
    category: 'Quick Actions',
    icon: Focus,
    description: 'Enter distraction-free mode'
  },
  
  // Settings
  {
    id: 'cmd-comma',
    label: 'Open Settings',
    keys: ['⌘', ','],
    category: 'Settings',
    icon: Settings
  },
  {
    id: 'cmd-shift-l',
    label: 'Toggle Dark Mode',
    keys: ['⌘', '⇧', 'L'],
    category: 'Settings',
    icon: Moon
  },
  
  // Data
  {
    id: 'cmd-shift-e',
    label: 'Export Data',
    keys: ['⌘', '⇧', 'E'],
    category: 'Data',
    icon: Download
  },
  {
    id: 'cmd-shift-r',
    label: 'Sync Now',
    keys: ['⌘', '⇧', 'R'],
    category: 'Data',
    icon: RefreshCw
  },
  
  // Editing
  {
    id: 'cmd-z',
    label: 'Undo',
    keys: ['⌘', 'Z'],
    category: 'Editing',
    icon: Undo
  },
  {
    id: 'cmd-shift-z',
    label: 'Redo',
    keys: ['⌘', '⇧', 'Z'],
    category: 'Editing',
    icon: Redo
  },
]

interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category)))
  
  const formatKey = (key: string) => {
    const keyMap: Record<string, string> = {
      '⌘': 'Cmd',
      '⇧': 'Shift',
      '⌥': 'Option',
      '⌃': 'Ctrl',
      'Space': 'Space',
    }
    return keyMap[key] || key
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            All available keyboard shortcuts for FTW-OS
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {categories.map(category => {
              const categoryShortcuts = SHORTCUTS.filter(s => s.category === category)
              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map(shortcut => {
                      const Icon = shortcut.icon
                      return (
                        <div
                          key={shortcut.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {Icon && (
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-sm">{shortcut.label}</div>
                              {shortcut.description && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {shortcut.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, idx) => (
                              <React.Fragment key={idx}>
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs px-2 py-1 min-w-[32px] text-center"
                                >
                                  {key}
                                </Badge>
                                {idx < shortcut.keys.length - 1 && (
                                  <span className="text-muted-foreground text-xs mx-1">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t text-xs text-muted-foreground">
          <p>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">?</kbd> to open this help anytime</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}












