import React, { useState } from 'react'
import { TextInputPanel } from '@/components/modules/finance/invoices/editor/TextInputPanel'
import { InvoicePreview } from '@/components/modules/finance/invoices/preview/InvoicePreview'
import { PreviewControls } from '@/components/modules/finance/invoices/preview/PreviewControls'
import { ClientManager } from '@/components/modules/crm/clients/ClientManager'
import { ProductManager } from '@/components/modules/finance/products/ProductManager'
import { ExpenseManager } from '@/components/modules/finance/expenses/ExpenseManager'
import { InvoiceHistory } from '@/components/modules/finance/invoices/history/InvoiceHistory'
import { SettingsPanel } from '@/components/modules/core/settings/SettingsPanel'
import { TemplateGallery } from '@/components/modules/finance/invoices/templates/TemplateGallery'
import { TimeTracker } from '@/components/modules/productivity/tracker/TimeTracker'
import { CompUpdateManager } from '@/components/modules/productivity/documents/CompUpdateManager'
import { TaskList } from '@/components/modules/productivity/tasks/TaskList'
import { AnalyticsDashboard } from '@/components/modules/core/dashboard/AnalyticsDashboard'
import { LeadsPipeline } from '@/components/modules/crm/pipeline/LeadsPipeline'
import { TopNav } from '@/components/layout/TopNav'
import { TitleBar } from '@/components/ui/title-bar'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { injectSeedData } from '@/seed-data'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TrendingUp, BarChart3, Users, CreditCard, Plug, ChevronRight, LayoutDashboard, Code, CheckSquare, FileText, PlusCircle, History, Package, Receipt, LayoutTemplate, Settings, FileBox, Target } from 'lucide-react'
import { Dashboard } from '@/components/modules/core/dashboard/Dashboard'
import { Toaster } from '@/components/ui/toaster'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/services/utils'

import { useSettingsStore } from '@/stores/settings-store'
import { useThemeStore } from '@/stores/theme-store'
import '@/styles/themes.css'

import { PhotonNav } from '@/components/layout/PhotonNav'

import { DocumentBuilder } from '@/components/modules/finance/DocumentBuilder'

function App() {
  console.log('[App] Component rendering...')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [cmdOpen, setCmdOpen] = useState(false)
  const { loadSettings } = useSettingsStore()
  const { activeTheme, mode } = useThemeStore()

  React.useEffect(() => {
    console.log('[App] Effect: Loading settings and seed data...')
    loadSettings()
    injectSeedData()
      .then(() => console.log('[App] Seed data injection complete'))
      .catch(err => console.error('[App] Seed data injection error:', err))
  }, [])

  React.useEffect(() => {
    document.body.className = `theme-${activeTheme}`
    document.documentElement.setAttribute('data-theme-mode', mode)
  }, [activeTheme, mode])


  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full"
        >
          {(() => {
            switch (activeTab) {
              case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />
              case 'analytics': return <AnalyticsDashboard onNavigate={setActiveTab} />
              
              // Finance & Documents (Unified)
              case 'finance': return <DocumentBuilder /> // Unified Builder
              
              case 'expenses': return <ExpenseManager />
              case 'products': return <ProductManager />
              case 'templates': return <TemplateGallery />
              case 'history': return <InvoiceHistory setActiveTab={setActiveTab} />

              // CRM
              case 'crm': return <ClientManager />
              case 'pipeline': return <LeadsPipeline />

              // Productivity
              case 'tasks': return <TaskList />
              case 'documents': return <CompUpdateManager />
              case 'tracker': return <TimeTracker />
              
              // Settings
              case 'settings': return <SettingsPanel />
              
              default: return <Dashboard setActiveTab={setActiveTab} />
            }
          })()}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans transition-colors duration-300">
      <TitleBar />
      
      {/* Floating Navigation Capsule */}
      <PhotonNav activeTab={activeTab} setActiveTab={setActiveTab} setCmdOpen={setCmdOpen} />

      {/* Main Content Area - Padded top to account for floating nav */}
      <main className="flex-1 overflow-auto p-4 pt-24 md:p-6 lg:p-8 relative">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col">
          <div className="noise-overlay" /> {/* Premium Texture */}
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </div>
      </main>

      <Toaster />
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} onSelect={setActiveTab} />
    </div>
  )
}

export default App
