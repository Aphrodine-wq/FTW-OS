import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/services/utils'
import {
  LayoutDashboard,
  Receipt,
  Users,
  Briefcase,
  CheckSquare,
  FileText,
  Settings,
  Brain,
  Zap,
  PieChart,
  Command,
  Search,
  Plus,
  Unlock,
  Lock,
  BarChart3,
  FileBox,
  Code,
  Target,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'

interface PhotonNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  setCmdOpen: (open: boolean) => void
}

export function PhotonNav({ activeTab, setActiveTab, setCmdOpen }: PhotonNavProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { mode, layoutMode, setTheme } = useThemeStore()

  const toggleLayoutMode = () => {
    setTheme({ layoutMode: layoutMode === 'locked' ? 'edit' : 'locked' })
  }

  const navStructure = [
    {
      id: 'core',
      label: 'Core',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Main interface' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, desc: 'Insights' },
        { id: 'settings', label: 'Settings', icon: Settings, desc: 'Preferences' },
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: Receipt,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      items: [
        { id: 'finance', label: 'Invoices', icon: Receipt, desc: 'Create & manage' },
        { id: 'expenses', label: 'Expenses', icon: PieChart, desc: 'Track costs' },
        { id: 'products', label: 'Products', icon: FileBox, desc: 'Catalog' },
        { id: 'history', label: 'History', icon: Code, desc: 'Archives' },
      ]
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      items: [
        { id: 'crm', label: 'Clients', icon: Users, desc: 'Contacts' },
        { id: 'pipeline', label: 'Pipeline', icon: Target, desc: 'Sales' },
      ]
    },
    {
      id: 'productivity',
      label: 'Productivity',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      items: [
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, desc: 'Todo' },
        { id: 'dev', label: 'Dev HQ', icon: Code, desc: 'Codebase' },
        { id: 'documents', label: 'Documents', icon: FileText, desc: 'Updates' },
        { id: 'tracker', label: 'Time Tracker', icon: Zap, desc: 'Sessions' },
      ]
    }
  ]

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={false}
        animate={{
          width: isExpanded ? 1000 : 280,
          height: isExpanded ? 520 : 64,
          borderRadius: isExpanded ? 28 : 9999
        }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false)
          setActiveSection(null)
        }}
        className={cn(
          "relative backdrop-blur-3xl border shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden",
          mode === 'glass'
            ? "bg-black/60 border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            : "bg-white/90 border-black/10 shadow-xl"
        )}
      >
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          mode === 'glass'
            ? "bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10"
            : "bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5"
        )} />

        {/* === COLLAPSED STATE (Elegant Capsule) === */}
        <motion.div
          animate={{ opacity: isExpanded ? 0 : 1, pointerEvents: isExpanded ? 'none' : 'auto' }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-between px-6"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-cyan-400 blur-sm"
              />
              <motion.div
                className="relative h-3 w-3 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 shadow-lg"
              />
            </div>
            <div className="flex flex-col gap-0 leading-none">
              <span className="font-black text-base tracking-tighter bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                FTW
              </span>
              <span className={cn("text-[10px] font-bold tracking-widest uppercase", mode === 'glass' ? "text-white/40" : "text-black/40")}>
                OS v{__APP_VERSION__}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {navStructure.map(s => (
              <motion.div
                key={s.id}
                whileHover={{ scale: 1.1 }}
                className={cn("h-1.5 w-5 rounded-full", `bg-gradient-to-r ${s.color}`)}
              />
            ))}
          </div>
        </motion.div>

        {/* === EXPANDED STATE === */}
        <motion.div
          animate={{ opacity: isExpanded ? 1 : 0, pointerEvents: isExpanded ? 'auto' : 'none' }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 p-6 flex flex-col gap-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="h-4 w-4 text-purple-400" />
              </motion.div>
              <span className={cn("text-sm font-semibold", mode === 'glass' ? "text-white/70" : "text-black/70")}>
                Navigation Hub
              </span>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={toggleLayoutMode}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium",
                  mode === 'glass'
                    ? (layoutMode === 'edit' ? "bg-amber-500/20 text-amber-300" : "bg-white/10 hover:bg-white/15 text-white")
                    : (layoutMode === 'edit' ? "bg-amber-500/15 text-amber-700" : "bg-black/10 hover:bg-black/15 text-black")
                )}
              >
                {layoutMode === 'edit' ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                <span>{layoutMode === 'edit' ? 'Edit' : 'Locked'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setCmdOpen(true)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  mode === 'glass'
                    ? "bg-white/10 hover:bg-white/15 text-white"
                    : "bg-black/10 hover:bg-black/15 text-black"
                )}
              >
                <Search className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          <div className={cn("h-px", mode === 'glass' ? "bg-white/10" : "bg-black/10")} />

          {/* Main Grid */}
          <div className="flex-1 flex gap-4">
            {/* Sidebar - Sections */}
            <div className="w-40 flex flex-col gap-1.5">
              <AnimatePresence mode="wait">
                {navStructure.map(section => (
                  <motion.button
                    key={section.id}
                    onMouseEnter={() => setActiveSection(section.id)}
                    whileHover={{ x: 4 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                      activeSection === section.id
                        ? (mode === 'glass' ? "bg-white/15 text-white" : "bg-black/10 text-black")
                        : (mode === 'glass' ? "text-white/50 hover:bg-white/5 hover:text-white" : "text-black/50 hover:bg-black/5 hover:text-black")
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-md transition-colors",
                      activeSection === section.id
                        ? `bg-gradient-to-r ${section.color}`
                        : section.bgColor
                    )}>
                      <section.icon className={cn(
                        "h-4 w-4",
                        activeSection === section.id ? "text-white" : "text-current opacity-70"
                      )} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold">{section.label}</div>
                    </div>
                    {activeSection === section.id && (
                      <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Main Content - Items Grid */}
            <div className="flex-1 grid grid-cols-2 gap-3 content-start overflow-y-auto pr-2 max-h-96">
              <AnimatePresence mode="wait">
                {activeSection && navStructure.find(s => s.id === activeSection)?.items.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      setActiveTab(item.id)
                      setIsExpanded(false)
                    }}
                    whileHover={{ y: -2 }}
                    className={cn(
                      "flex flex-col gap-2.5 p-4 rounded-xl border transition-all text-left group/item",
                      mode === 'glass'
                        ? (activeTab === item.id
                          ? "bg-white/20 border-white/30"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20")
                        : (activeTab === item.id
                          ? "bg-black/10 border-black/20"
                          : "bg-black/5 border-black/10 hover:bg-black/8 hover:border-black/15")
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <item.icon className={cn(
                        "h-5 w-5 transition-transform group-hover/item:scale-110",
                        mode === 'glass' ? "text-white/80" : "text-black/80"
                      )} />
                      <ChevronRight className={cn(
                        "h-3.5 w-3.5 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-1 group-hover/item:translate-x-0",
                        mode === 'glass' ? "text-white/40" : "text-black/40"
                      )} />
                    </div>
                    <div>
                      <div className={cn("text-sm font-semibold", mode === 'glass' ? "text-white" : "text-black")}>
                        {item.label}
                      </div>
                      <div className={cn("text-xs", mode === 'glass' ? "text-white/40" : "text-black/40")}>
                        {item.desc}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>

              {!activeSection && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "col-span-2 h-32 flex items-center justify-center text-sm italic",
                    mode === 'glass' ? "text-white/20" : "text-black/20"
                  )}>
                  Select a module →
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
