import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Receipt,
  Users,
  CheckSquare,
  Settings,
  BarChart3,
  FileText,
  Clock
} from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'

interface PhotonNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  setCmdOpen?: (open: boolean) => void
}

export function PhotonNav({ activeTab, setActiveTab }: PhotonNavProps) {
  const { mode } = useThemeStore()

  const navItems = [
    { id: 'pulse', label: 'Pulse', icon: LayoutDashboard },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'finance', label: 'Finance', icon: Receipt },
    { id: 'expenses', label: 'Expenses', icon: FileText },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'tracker', label: 'Tracker', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className={cn(
      "w-20 flex flex-col items-center py-6 gap-4 border-r",
      mode === 'glass' 
        ? "bg-black/60 border-white/10" 
        : "bg-white border-gray-200"
    )}>
      {/* Logo */}
      <div className="mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">FTW</span>
        </div>
      </div>

      {/* Nav Items */}
      {navItems.map((item) => (
        <motion.button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all relative group",
            activeTab === item.id
              ? "bg-primary text-primary-foreground shadow-lg"
              : mode === 'glass'
              ? "text-white/60 hover:text-white hover:bg-white/10"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
          title={item.label}
        >
          <item.icon className="h-5 w-5" />
          
          {/* Tooltip */}
          <div className={cn(
            "absolute left-full ml-2 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
            mode === 'glass'
              ? "bg-black/80 text-white"
              : "bg-gray-900 text-white"
          )}>
            {item.label}
          </div>
        </motion.button>
      ))}
    </div>
  )
}
