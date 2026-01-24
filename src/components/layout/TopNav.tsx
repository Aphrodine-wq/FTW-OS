import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FileText, Users, Code, Zap, Settings, Search, Bell, Target, TrendingUp, Receipt, Briefcase, Calculator, FileCheck, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/services/utils'

interface TopNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

import { ConnectModal } from './ConnectModal'

export function TopNav({ activeTab: _activeTab, setActiveTab }: TopNavProps) {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)
  const [showConnect, setShowConnect] = useState(false)

  const menus = [
    {
      id: 'finance',
      label: 'Finance',
      icon: TrendingUp,
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & Stats' },
        { id: 'new', label: 'New Invoice', icon: FileText, desc: 'Create & Send' },
        { id: 'history', label: 'Invoices', icon: Receipt, desc: 'View History' },
        { id: 'expenses', label: 'Expenses', icon: Calculator, desc: 'Track Spending' },
      ]
    },
    {
      id: 'productivity',
      label: 'Productivity',
      icon: Zap,
      items: [
        { id: 'tracker', label: 'Time Tracker', icon: Code, desc: 'Log Hours' },
        { id: 'tasks', label: 'Kanban Board', icon: Briefcase, desc: 'Manage Tasks' },
        { id: 'documents', label: 'Documents', icon: FileCheck, desc: 'Contracts & Updates' },
      ]
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: Users,
      items: [
        { id: 'leads', label: 'Pipeline', icon: Target, desc: 'Manage Leads' },
        { id: 'clients', label: 'Clients', icon: Users, desc: 'Client Database' },
      ]
    },
    {
      id: 'core',
      label: 'System',
      icon: Settings,
      items: [
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, desc: 'Deep Insights' },
        { id: 'settings', label: 'Settings', icon: Settings, desc: 'Configuration' },
      ]
    }
  ]

  return (
    <div 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-main)]"
      )}
      onMouseLeave={() => setHoveredMenu(null)}
    >
      <div className="flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer select-none" onClick={() => setActiveTab('dashboard')}>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors bg-[var(--accent-primary)] text-[var(--bg-app)]">
            <Zap className="h-5 w-5" />
          </div>
          <span>FTW<span className="text-[var(--text-muted)]">OS</span></span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          {menus.map(menu => (
            <div 
              key={menu.id}
              className="relative px-4 py-6 cursor-pointer group"
              onMouseEnter={() => setHoveredMenu(menu.id)}
            >
              <div className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors relative z-10",
                hoveredMenu === menu.id 
                  ? "text-[var(--text-main)]" 
                  : "text-[var(--text-muted)]"
              )}>
                <menu.icon className="h-4 w-4" />
                {menu.label}
              </div>
              
              {/* Hover Pill */}
              {hoveredMenu === menu.id && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute inset-0 m-auto h-10 w-full rounded-lg -z-0 bg-[var(--bg-surface-hover)]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-64 justify-start border transition-colors bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-main)]"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="text-xs">Search (Cmd+K)</span>
            <div className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-surface-hover)]">⌘K</div>
          </Button>
          
          <div className="h-8 w-[1px] bg-[var(--border-subtle)] mx-1" />

          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            onClick={() => setShowConnect(true)}
          >
            <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400/20" />
          </Button>

          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            onClick={() => setActiveTab('new')}
          >
            <Plus className="h-5 w-5" />
          </Button>

          <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-offset-2 ring-offset-transparent transition-all cursor-pointer bg-[var(--accent-primary)] text-[var(--bg-app)] ring-[var(--accent-glow)]">
            JD
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {hoveredMenu && (
          <motion.div 
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute top-16 left-0 w-full border-b shadow-2xl overflow-hidden bg-[var(--bg-app)]/90 backdrop-blur-xl border-[var(--border-subtle)]"
            )}
          >
            <div className="max-w-7xl mx-auto py-8 px-6">
              <div className="grid grid-cols-4 gap-6">
                 {menus.find(m => m.id === hoveredMenu)?.items.map(item => (
                   <motion.div 
                     key={item.id}
                     layout
                     className="flex gap-4 p-4 rounded-xl cursor-pointer transition-all group hover:bg-[var(--bg-surface-hover)]"
                     onClick={() => { setActiveTab(item.id); setHoveredMenu(null) }}
                   >
                     <div className="h-12 w-12 rounded-xl flex items-center justify-center transition-colors shadow-sm bg-[var(--bg-surface)] text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)] group-hover:text-[var(--bg-app)]">
                       <item.icon className="h-6 w-6" />
                     </div>
                     <div>
                       <h4 className="font-bold text-sm mb-1 group-hover:underline text-[var(--text-main)]">{item.label}</h4>
                       <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                     </div>
                   </motion.div>
                 ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConnectModal open={showConnect} onOpenChange={setShowConnect} />
    </div>
  )
}
