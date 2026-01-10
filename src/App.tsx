import React, { useState, Suspense } from 'react'
import { TopNav } from '@/components/layout/TopNav'
import { TitleBar } from '@/components/ui/title-bar'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { injectSeedData } from '@/seed-data'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Loader2 } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/services/utils'

import { useSettingsStore } from '@/stores/settings-store'
import { useThemeStore } from '@/stores/theme-store'
import '@/styles/themes.css'

import { PhotonNav } from '@/components/layout/PhotonNav'

// Lazy Load Modules for Performance
const Dashboard = React.lazy(() => import('@/components/modules/core/dashboard/Dashboard').then(module => ({ default: module.Dashboard })))
const AnalyticsDashboard = React.lazy(() => import('@/components/modules/core/dashboard/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })))
const DocumentBuilder = React.lazy(() => import('@/components/modules/finance/DocumentBuilder').then(module => ({ default: module.DocumentBuilder })))
const ExpenseManager = React.lazy(() => import('@/components/modules/finance/expenses/ExpenseManager').then(module => ({ default: module.ExpenseManager })))
const ProductManager = React.lazy(() => import('@/components/modules/finance/products/ProductManager').then(module => ({ default: module.ProductManager })))
const TemplateGallery = React.lazy(() => import('@/components/modules/finance/invoices/templates/TemplateGallery').then(module => ({ default: module.TemplateGallery })))
const InvoiceHistory = React.lazy(() => import('@/components/modules/finance/invoices/history/InvoiceHistory').then(module => ({ default: module.InvoiceHistory })))
const ClientManager = React.lazy(() => import('@/components/modules/crm/clients/ClientManager').then(module => ({ default: module.ClientManager })))
const LeadsPipeline = React.lazy(() => import('@/components/modules/crm/pipeline/LeadsPipeline').then(module => ({ default: module.LeadsPipeline })))
const DevHQ = React.lazy(() => import('@/components/modules/dev/DevHQ').then(module => ({ default: module.DevHQ })))
// Use Enhanced Task List
const TaskList = React.lazy(() => import('@/components/modules/productivity/tasks/TaskListEnhanced').then(module => ({ default: module.TaskListEnhanced })))
const CompUpdateManager = React.lazy(() => import('@/components/modules/productivity/documents/CompUpdateManager').then(module => ({ default: module.CompUpdateManager })))
const TimeTracker = React.lazy(() => import('@/components/modules/productivity/tracker/TimeTracker').then(module => ({ default: module.TimeTracker })))
const SettingsPanel = React.lazy(() => import('@/components/modules/core/settings/SettingsPanel').then(module => ({ default: module.SettingsPanel })))

const PageLoader = () => (
  <div className="h-full w-full flex flex-col items-center justify-center text-[var(--text-muted)]">
    <Loader2 className="h-10 w-10 animate-spin mb-4 opacity-50" />
    <p className="text-sm font-medium tracking-widest uppercase opacity-50">Loading Module...</p>
  </div>
)

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
              case 'dev': return <DevHQ />
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
            <Suspense fallback={<PageLoader />}>
              {renderContent()}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>

      <Toaster />
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} onSelect={setActiveTab} />
    </div>
  )
}

export default App
