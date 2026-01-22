import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/services/utils'
import { prefetchModule } from '@/lib/module-preloader'
import {
  LayoutDashboard,
  Receipt,
  Users,
  CheckSquare,
  FileText,
  Settings,
  Brain,
  Zap,
  PieChart,
  Search,
  Unlock,
  Lock,
  BarChart3,
  FileBox,
  Code,
  Target,
  ChevronRight,
  Sparkles,
  Mail,
  Calendar,
  Folder,
  Share2,
  Megaphone,
  PenTool,
  Scale,
  Shield,
  Key,
  Laptop,
  Globe,
  Server,
  Activity,
  Box,
  BookOpen,
  GraduationCap,
  Code2,
  Mic,
  Bot,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Terminal,
} from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { useSyncStore } from '@/stores/sync-store'

interface PhotonNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  setCmdOpen: (open: boolean) => void
}

export const PhotonNav = React.memo(function PhotonNav({ activeTab, setActiveTab, setCmdOpen }: PhotonNavProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>('core')
  const [isFocusMode, setIsFocusMode] = useState(false)
  const { mode, layoutMode, setTheme } = useThemeStore()
  const { syncStatus, lastSyncTime } = useSyncStore()

  // Handle Focus Mode: Only show when hovering near top if enabled
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isFocusMode) {
        // Show only if mouse is within 100px of top
        if (e.clientY < 100) {
          // Logic handled by hover state of container
        }
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isFocusMode])

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
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & Stats' },
      ]
    },
    {
      id: 'workspace',
      label: 'Workspace',
      icon: Folder,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      items: [
        { id: 'projects', label: 'Projects', icon: Folder, desc: 'Mission Control' },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, desc: 'Action Items' },
        { id: 'tracker', label: 'Time Tracker', icon: Clock, desc: 'Deep Work' },
        { id: 'calendar', label: 'Calendar', icon: Calendar, desc: 'Schedule' },
      ]
    },
    {
      id: 'engineering',
      label: 'Engineering',
      icon: Terminal,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-500/10',
      items: [
        { id: 'dev', label: 'Dev HQ', icon: Code, desc: 'Repository Manager' },
        { id: 'servers', label: 'Servers', icon: Server, desc: 'Infrastructure' },
        { id: 'docker', label: 'Docker', icon: Box, desc: 'Containers' },
        { id: 'workflows', label: 'Workflows', icon: Zap, desc: 'Automation' },
        { id: 'webhooks', label: 'Webhooks', icon: Globe, desc: 'API Listeners' },
      ]
    },
    {
      id: 'business',
      label: 'Business',
      icon: Receipt,
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-400/10',
      items: [
        { id: 'finance', label: 'Invoices', icon: Receipt, desc: 'Billing & Payments' },
        { id: 'expenses', label: 'Expenses', icon: PieChart, desc: 'Cost Tracking' },
        { id: 'crm', label: 'Clients', icon: Users, desc: 'Relationships' },
        { id: 'pipeline', label: 'Pipeline', icon: Target, desc: 'Deal Flow' },
        { id: 'products', label: 'Products', icon: FileBox, desc: 'Inventory' },
        { id: 'taxes', label: 'Tax Vault', icon: Shield, desc: 'Compliance' },
      ]
    },
    {
      id: 'growth',
      label: 'Growth',
      icon: Megaphone,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-500/10',
      items: [
        { id: 'documents', label: 'Drive', icon: Folder, desc: 'Assets' },
        { id: 'seo', label: 'SEO', icon: Search, desc: 'Visibility' },
        { id: 'mail', label: 'Mail', icon: Mail, desc: 'Communications' },
        { id: 'marketing', label: 'Marketing', icon: BarChart3, desc: 'Campaigns' },
      ]
    },
    {
      id: 'system',
      label: 'System',
      icon: Shield,
      color: 'from-slate-500 to-gray-600',
      bgColor: 'bg-slate-500/10',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings, desc: 'System Config' },
      ]
    }
  ]

  return (
    <div
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500",
        isFocusMode && !isExpanded ? "-translate-y-32 hover:translate-y-0" : "translate-y-0"
      )}
    >
      <motion.div
        initial={false}
        animate={{
          width: isExpanded ? 720 : 240,
          height: isExpanded ? 360 : 48,
          borderRadius: isExpanded ? 24 : 9999
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
              <span className="font-black text-sm tracking-tighter bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                FTW
              </span>
              <span className={cn("text-[9px] font-bold tracking-widest uppercase", mode === 'glass' ? "text-white/40" : "text-black/40")}>
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

        {/* === EXPANDED STATE - TOP NAVIGATION STYLE === */}
        <motion.div
          animate={{ opacity: isExpanded ? 1 : 0, pointerEvents: isExpanded ? 'auto' : 'none' }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 p-6 flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="h-4 w-4 text-purple-400" />
              </motion.div>
              <span className={cn("text-xs font-semibold", mode === 'glass' ? "text-white/70" : "text-black/70")}>
                Navigation Hub
              </span>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isFocusMode
                    ? "bg-purple-500/20 text-purple-400"
                    : (mode === 'glass' ? "bg-white/10 hover:bg-white/15 text-white" : "bg-black/10 hover:bg-black/15 text-black")
                )}
                title="Toggle Focus Mode"
              >
                {isFocusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </motion.button>

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

          {/* Top Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {navStructure.map(section => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                whileHover={{ y: -2 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0",
                  activeSection === section.id
                    ? (mode === 'glass'
                      ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                      : `bg-gradient-to-r ${section.color} text-white shadow-lg`)
                    : (mode === 'glass'
                      ? "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                      : "bg-black/5 hover:bg-black/10 text-black/60 hover:text-black")
                )}
              >
                <section.icon className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">{section.label}</span>
              </motion.button>
            ))}
          </div>

          <div className={cn("h-px", mode === 'glass' ? "bg-white/10" : "bg-black/10")} />

          {/* Items Display Area */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeSection && (
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-3 gap-3"
                >
                  {navStructure.find(s => s.id === activeSection)?.items.map((item, idx) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      onMouseEnter={() => prefetchModule(item.id)}
                      onFocus={() => prefetchModule(item.id)}
                      onClick={() => {
                        setActiveTab(item.id)
                        setIsExpanded(false)
                      }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      className={cn(
                        "flex flex-col gap-2.5 p-4 rounded-xl border transition-all text-left group/item",
                        mode === 'glass'
                          ? (activeTab === item.id
                            ? "bg-white/20 border-white/30 shadow-lg"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20")
                          : (activeTab === item.id
                            ? "bg-black/10 border-black/20 shadow-lg"
                            : "bg-black/5 border-black/10 hover:bg-black/8 hover:border-black/15")
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <item.icon className={cn(
                          "h-4 w-4 transition-transform group-hover/item:scale-110",
                          mode === 'glass' ? "text-white/80" : "text-black/80"
                        )} />
                        <ChevronRight className={cn(
                          "h-3.5 w-3.5 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-1 group-hover/item:translate-x-0",
                          mode === 'glass' ? "text-white/40" : "text-black/40"
                        )} />
                      </div>
                      <div>
                        <div className={cn("text-xs font-semibold", mode === 'glass' ? "text-white" : "text-black")}>
                          {item.label}
                        </div>
                        <div className={cn("text-[10px]", mode === 'glass' ? "text-white/40" : "text-black/40")}>
                          {item.desc}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {!activeSection && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "h-full flex items-center justify-center text-sm italic",
                  mode === 'glass' ? "text-white/20" : "text-black/20"
                )}>
                Select a section from the tabs above →
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
})
