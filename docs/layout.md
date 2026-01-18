# FTW-OS Software Layout
## ASCII Architecture Diagram

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         APPLICATION BOOT SEQUENCE                             ║
╚═══════════════════════════════════════════════════════════════════════════════╝

    index.html
         │
         ▼
    main.tsx ──────────────────────────────────────────────────────┐
         │                                                          │
         ├─► QueryClientProvider                                    │
         │        │                                                  │
         │        └─► ErrorBoundary                                 │
         │                 │                                         │
         │                 └─► AppWithSplash                       │
         │                          │                                │
         │                          ├─► Phase: 'splash'             │
         │                          │        │                        │
         │                          │        └─► SplashScreen        │
         │                          │                                 │
         │                          ├─► Phase: 'gate'                │
         │                          │        │                        │
         │                          │        └─► LandingGate         │
         │                          │             │                   │
         │                          │             ├─► FloatingParticles│
         │                          │             ├─► LandingHeader  │
         │                          │             └─► AuthModal      │
         │                          │                                 │
         │                          └─► Phase: 'app'                 │
         │                                   │                         │
         │                                   └─► App (lazy)           │
         │                                        │                   │
         │                                        ├─► useStoreInit    │
         │                                        │   │               │
         │                                        │   ├─► SettingsStore│
         │                                        │   ├─► ThemeStore   │
         │                                        │   ├─► AuthStore    │
         │                                        │   └─► SecureStore  │
         │                                        │                    │
         │                                        └─► AppInner         │
         │                                             │               │
         │                                             ├─► useTheme    │
         │                                             │               │
         │                                             ├─► TitleBar    │
         │                                             │               │
         │                                             ├─► PhotonNav   │
         │                                             │   │           │
         │                                             │   └─► [Navigation Items]│
         │                                             │               │
         │                                             ├─► ModuleRouter │
         │                                             │   │           │
         │                                             │   └─► [Modules]│
         │                                             │               │
         │                                             └─► CommandPalette│
         │                                                  │           │
         │                                                  └─► Toaster│
         │                                                              │
         └──────────────────────────────────────────────────────────────┘


╔═══════════════════════════════════════════════════════════════════════════════╗
║                         COMPONENT HIERARCHY                                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

AppWithSplash
    │
    ├─► SplashScreen (Phase 1)
    │
    ├─► LandingGate (Phase 2)
    │    │
    │    ├─► FloatingParticles
    │    ├─► LandingHeader
    │    │    ├─► Logo Icon (Zap)
    │    │    └─► Title & Version
    │    └─► AuthModal
    │
    └─► App (Phase 3)
         │
         ├─► AppInner
         │    │
         │    ├─► TitleBar
         │    │
         │    ├─► PhotonNav (Sidebar)
         │    │    ├─► Navigation Items
         │    │    └─► Command Palette Trigger
         │    │
         │    ├─► Main Content Area
         │    │    │
         │    │    └─► ModuleRouter
         │    │         │
         │    │         ├─► Dashboard Modules
         │    │         │    ├─► Dashboard
         │    │         │    ├─► PulseDashboard
         │    │         │    └─► AnalyticsDashboard
         │    │         │
         │    │         ├─► Finance Modules
         │    │         │    ├─► DocumentBuilder
         │    │         │    ├─► ExpenseManager
         │    │         │    ├─► InvoiceHistory
         │    │         │    ├─► ProductManager
         │    │         │    └─► TaxVault
         │    │         │
         │    │         ├─► Productivity Modules
         │    │         │    ├─► ProjectHub
         │    │         │    ├─► TaskList
         │    │         │    ├─► TimeTracker
         │    │         │    ├─► Calendar
         │    │         │    └─► DocumentHub
         │    │         │
         │    │         ├─► CRM Modules
         │    │         │    ├─► ClientManager
         │    │         │    └─► LeadsPipeline
         │    │         │
         │    │         ├─► Knowledge Modules
         │    │         │    ├─► Brain
         │    │         │    ├─► CourseTracker
         │    │         │    └─► SnippetLibrary
         │    │         │
         │    │         ├─► Infrastructure Modules
         │    │         │    ├─► ServerManager
         │    │         │    ├─► DockerPilot
         │    │         │    └─► UptimeMonitor
         │    │         │
         │    │         ├─► Automation Modules
         │    │         │    ├─► WorkflowEditor
         │    │         │    └─► WebhookServer
         │    │         │
         │    │         ├─► Marketing Modules
         │    │         │    ├─► MarketingDashboard
         │    │         │    ├─► SEOToolkit
         │    │         │    ├─► AdManager
         │    │         │    └─► NewsletterStudio
         │    │         │
         │    │         ├─► Development Modules
         │    │         │    ├─► DevHQ
         │    │         │    └─► TraeCoder
         │    │         │
         │    │         ├─► AI Modules
         │    │         │    ├─► ResearchAgent
         │    │         │    └─► VoiceCommand
         │    │         │
         │    │         ├─► HR Modules
         │    │         │    ├─► AssetInventory
         │    │         │    └─► PayrollLite
         │    │         │
         │    │         ├─► Legal Modules
         │    │         │    └─► ContractWizard
         │    │         │
         │    │         ├─► Communication Modules
         │    │         │    └─► EmailClient
         │    │         │
         │    │         ├─► Security Modules
         │    │         │    └─► PasswordManager
         │    │         │
         │    │         └─► System Modules
         │    │              ├─► SettingsPanel
         │    │              └─► SystemUpdate
         │    │
         │    └─► CommandPalette
         │         └─► Toaster (Notifications)
         │
         └─► LoginScreen (if not authenticated)


╔═══════════════════════════════════════════════════════════════════════════════╗
║                         STATE MANAGEMENT ARCHITECTURE                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

    ┌─────────────────────────────────────────────────────────────┐
    │                    Zustand Stores                            │
    └─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
    ┌─────────┐          ┌─────────┐          ┌─────────┐
    │ Settings│          │  Theme  │          │   Auth  │
    │  Store  │          │  Store  │          │  Store  │
    └─────────┘          └─────────┘          └─────────┘
        │                     │                     │
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ useStoreInit    │
                    │    Hook         │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   AppInner      │
                    │  (Consumes)    │
                    └─────────────────┘

    Additional Stores:
    ├─► SecureSettingsStore (Encrypted settings)
    ├─► InvoiceStore (Invoice management)
    ├─► ExpenseStore (Expense tracking)
    ├─► TaskStore (Task management)
    ├─► ProjectStore (Project data)
    ├─► EmployeeStore (HR data)
    ├─► NotificationStore (Notifications)
    ├─► SyncStore (Sync state)
    ├─► TimeTrackerStore (Time tracking)
    ├─► WidgetStore (Widget configuration)
    └─► TemplateStore (Template registry)


╔═══════════════════════════════════════════════════════════════════════════════╗
║                         FILE STRUCTURE                                         ║
╚═══════════════════════════════════════════════════════════════════════════════╝

src/
│
├── main.tsx                    [Entry Point]
├── App.tsx                     [Main App Component - 140 lines]
├── AppWithSplash.tsx           [Splash Screen Wrapper]
│
├── lib/                        [Core Libraries]
│   ├── module-config.ts        [Module name mappings]
│   ├── module-router.tsx        [Module routing logic]
│   ├── lazy-modules.ts         [Lazy-loaded components]
│   ├── query-client.ts         [React Query setup]
│   ├── utils.ts                [Utility functions]
│   └── seed-data.ts            [Seed data]
│
├── hooks/                       [Custom Hooks]
│   ├── useStoreInitialization.ts  [Store init hook]
│   ├── useTheme.ts             [Theme management]
│   ├── useErrorHandler.ts      [Error handling]
│   └── useInvoice.ts           [Invoice operations]
│
├── stores/                      [Zustand State Stores]
│   ├── auth-store.ts
│   ├── theme-store.ts
│   ├── settings-store.ts
│   ├── secure-settings-store.ts
│   ├── invoice-store.ts
│   ├── expense-store.ts
│   ├── task-store.ts
│   ├── project-store.ts
│   ├── employee-store.ts
│   ├── notification-store.ts
│   ├── sync-store.ts
│   ├── time-tracker-store.ts
│   ├── widget-store.ts
│   └── template-store.ts
│
├── components/
│   ├── ErrorBoundary.tsx       [Error boundary]
│   │
│   ├── ui/                      [UI Components]
│   │   ├── landing/             [Landing page components]
│   │   │   ├── FloatingParticles.tsx
│   │   │   ├── LandingHeader.tsx
│   │   │   └── AuthModal.tsx
│   │   ├── LandingGate.tsx      [Main landing page]
│   │   ├── SplashScreen.tsx     [Splash screen]
│   │   ├── TitleBar.tsx         [Window title bar]
│   │   └── [shadcn components]
│   │
│   ├── layout/                  [Layout Components]
│   │   ├── PhotonNav.tsx        [Sidebar navigation]
│   │   ├── CommandPalette.tsx   [Command palette]
│   │   ├── StatusBar.tsx        [Status bar]
│   │   └── TopNav.tsx           [Top navigation]
│   │
│   ├── modules/                  [Feature Modules]
│   │   ├── core/                 [Core modules]
│   │   │   ├── dashboard/        [Dashboard variants]
│   │   │   ├── settings/         [Settings panel]
│   │   │   └── sync/             [Sync status]
│   │   │
│   │   ├── finance/              [Finance modules]
│   │   │   ├── DocumentBuilder.tsx
│   │   │   ├── TaxVault.tsx
│   │   │   ├── expenses/         [Expense management]
│   │   │   ├── invoices/         [Invoice system]
│   │   │   ├── products/         [Product management]
│   │   │   └── analytics/        [Financial analytics]
│   │   │
│   │   ├── productivity/         [Productivity tools]
│   │   │   ├── ProjectHub.tsx
│   │   │   ├── tasks/            [Task management]
│   │   │   ├── tracker/          [Time tracking]
│   │   │   ├── calendar/         [Calendar]
│   │   │   └── documents/        [Document management]
│   │   │
│   │   ├── crm/                  [CRM modules]
│   │   │   ├── clients/          [Client management]
│   │   │   └── pipeline/         [Leads pipeline]
│   │   │
│   │   ├── knowledge/            [Knowledge base]
│   │   │   ├── Brain.tsx
│   │   │   ├── CourseTracker.tsx
│   │   │   └── SnippetLibrary.tsx
│   │   │
│   │   ├── infra/                [Infrastructure]
│   │   │   ├── ServerManager.tsx
│   │   │   ├── DockerPilot.tsx
│   │   │   └── UptimeMonitor.tsx
│   │   │
│   │   ├── automation/           [Automation]
│   │   │   ├── WorkflowEditor.tsx
│   │   │   └── WebhookServer.tsx
│   │   │
│   │   ├── marketing/            [Marketing tools]
│   │   │   ├── MarketingDashboard.tsx
│   │   │   ├── SEOToolkit.tsx
│   │   │   ├── AdManager.tsx
│   │   │   └── NewsletterStudio.tsx
│   │   │
│   │   ├── dev/                  [Development tools]
│   │   │   ├── DevHQ.tsx
│   │   │   └── TraeCoder.tsx
│   │   │
│   │   ├── ai/                   [AI features]
│   │   │   ├── ResearchAgent.tsx
│   │   │   └── VoiceCommand.tsx
│   │   │
│   │   ├── hr/                   [Human Resources]
│   │   │   ├── AssetInventory.tsx
│   │   │   ├── PayrollLite.tsx
│   │   │   └── EmployeeDirectory.tsx
│   │   │
│   │   ├── legal/                [Legal tools]
│   │   │   └── ContractWizard.tsx
│   │   │
│   │   ├── communication/        [Communication]
│   │   │   └── EmailClient.tsx
│   │   │
│   │   ├── security/             [Security]
│   │   │   └── PasswordManager.tsx
│   │   │
│   │   └── system/               [System]
│   │       └── SystemUpdate.tsx
│   │
│   └── widgets/                  [Widget System]
│       ├── core/                 [Core widgets]
│       │   ├── AppWidget.tsx
│       │   ├── Widgets.tsx
│       │   ├── finance/          [Finance widgets]
│       │   ├── productivity/     [Productivity widgets]
│       │   ├── real/             [Real-time widgets]
│       │   └── sector-[a-d]/     [Sector widgets]
│       │
│       ├── api/                  [API widgets]
│       │   ├── CryptoPricesWidget.tsx
│       │   ├── NewsFeedWidget.tsx
│       │   └── WeatherWidget.tsx
│       │
│       ├── fun/                  [Fun widgets]
│       │   ├── WidgetExcuse.tsx
│       │   ├── WidgetNasa.tsx
│       │   ├── WidgetQuote.tsx
│       │   └── WidgetRoast.tsx
│       │
│       └── revolutionary/        [Advanced widgets]
│           ├── NeuralFlowWidget.tsx
│           └── RevenueReactorWidget.tsx
│
├── services/                     [Business Logic Services]
│   ├── supabase.ts              [Supabase client]
│   ├── sync-service.ts          [Sync operations]
│   ├── fps-service.ts           [FPS monitoring]
│   ├── performance-service.ts   [Performance tracking]
│   ├── revenue-service.ts       [Revenue calculations]
│   ├── xp-service.ts            [XP/Level system]
│   ├── activity-tracking-service.ts
│   └── utils.ts                 [Service utilities]
│
├── types/                        [TypeScript Types]
│   ├── employee.ts
│   └── invoice.ts
│
└── styles/                       [Styling]
    └── themes.css                [Theme definitions]


╔═══════════════════════════════════════════════════════════════════════════════╗
║                         DATA FLOW DIAGRAM                                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝

    ┌──────────────┐
    │   Electron   │
    │   Main Process│
    └──────┬───────┘
           │ IPC
           ▼
    ┌──────────────┐
    │  Renderer    │
    │  Process     │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐      ┌──────────────┐
    │  React Query │◄─────┤  Supabase    │
    │  (Cache)     │      │  (Backend)   │
    └──────┬───────┘      └──────────────┘
           │
           ▼
    ┌──────────────┐
    │  Zustand    │
    │  Stores     │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Components │
    │  (UI)       │
    └──────────────┘

    Local Storage:
    ├─► auth-storage
    ├─► fairtrade-widgets-v5
    ├─► ftw-theme-storage
    └─► [Module-specific storage]

    Session Storage:
    └─► hasBooted (prevents double boot)


╔═══════════════════════════════════════════════════════════════════════════════╗
║                         MODULE ROUTING SYSTEM                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

    activeTab (state)
         │
         ▼
    ModuleRouter
         │
         ├─► Switch Statement
         │    │
         │    ├─► 'dashboard' ──► Dashboard
         │    ├─► 'pulse' ───────► PulseDashboard
         │    ├─► 'analytics' ──► AnalyticsDashboard
         │    ├─► 'finance' ────► DocumentBuilder
         │    ├─► 'expenses' ───► ExpenseManager
         │    ├─► 'history' ────► InvoiceHistory
         │    ├─► 'products' ───► ProductManager
         │    ├─► 'taxes' ──────► TaxVault
         │    ├─► 'crm' ────────► ClientManager
         │    ├─► 'pipeline' ───► LeadsPipeline
         │    ├─► 'mail' ───────► EmailClient
         │    ├─► 'projects' ───► ProjectHub
         │    ├─► 'tasks' ──────► TaskList
         │    ├─► 'tracker' ────► TimeTracker
         │    ├─► 'calendar' ───► Calendar
         │    ├─► 'documents' ──► DocumentHub
         │    ├─► 'contracts' ──► ContractWizard
         │    ├─► 'assets' ─────► AssetInventory
         │    ├─► 'payroll' ────► PayrollLite
         │    ├─► 'marketing' ──► MarketingDashboard
         │    ├─► 'seo' ────────► SEOToolkit
         │    ├─► 'ads' ────────► AdManager
         │    ├─► 'newsletter' ─► NewsletterStudio
         │    ├─► 'dev' ────────► DevHQ
         │    ├─► 'trae' ───────► TraeCoder
         │    ├─► 'research' ───► ResearchAgent
         │    ├─► 'voice' ──────► VoiceCommand
         │    ├─► 'settings' ───► SettingsPanel
         │    ├─► 'vault' ──────► PasswordManager
         │    ├─► 'update' ─────► SystemUpdate
         │    └─► default ──────► Dashboard
         │
         └─► Suspense Boundary
              └─► PageLoader (fallback)


╔═══════════════════════════════════════════════════════════════════════════════╗
║                         THEME SYSTEM                                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

    ThemeStore
         │
         ├─► mode: 'light' | 'dark' | 'monochrome' | 'glass' | 
         │        'midnight' | 'cyberpunk' | 'retro'
         │
         ├─► background: 'default' | 'mesh' | 'aurora' | 
         │               'deep' | 'cyber' | 'custom'
         │
         ├─► customColor: string (hex)
         │
         └─► radius: number (border radius)

         │
         ▼
    useTheme Hook
         │
         ├─► Applies theme classes to document.body
         ├─► Generates themeClassName
         └─► Generates themeStyle (background + radius)

         │
         ▼
    AppInner
         │
         └─► Applies theme to root div


╔═══════════════════════════════════════════════════════════════════════════════╗
║                         OPTIMIZATION ARCHITECTURE                              ║
╚═══════════════════════════════════════════════════════════════════════════════╝

    Code Splitting:
    ├─► Lazy loading for all modules
    ├─► Dynamic imports for stores
    ├─► Suspense boundaries for async components
    └─► Module router for on-demand loading

    Performance:
    ├─► React.memo for component memoization
    ├─► useMemo for expensive calculations
    ├─► useCallback for stable function references
    ├─► FPS monitoring service
    └─► Performance tracking service

    State Management:
    ├─► Zustand for lightweight state
    ├─► React Query for server state
    ├─► Local storage for persistence
    └─► Session storage for temporary state

    Bundle Optimization:
    ├─► Tree shaking enabled
    ├─► Code splitting by route
    ├─► Lazy module loading
    └─► Chunk optimization in Vite config


╔═══════════════════════════════════════════════════════════════════════════════╗
║                         EXTERNAL INTEGRATIONS                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

    ┌──────────────┐
    │  Supabase   │◄─── Authentication, Database, Storage
    └──────────────┘

    ┌──────────────┐
    │  Electron   │◄─── File System, System APIs, IPC
    └──────────────┘

    ┌──────────────┐
    │  React Query│◄─── Data Fetching, Caching, Sync
    └──────────────┘

    ┌──────────────┐
    │  Framer Motion│◄─── Animations, Transitions
    └──────────────┘

    ┌──────────────┐
    │  Monaco Editor│◄─── Code Editor (TraeCoder)
    └──────────────┘

    ┌──────────────┐
    │  Recharts   │◄─── Data Visualization
    └──────────────┘


╔═══════════════════════════════════════════════════════════════════════════════╗
║                         KEY METRICS                                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝

    File Size Reduction:
    ├─► App.tsx: 380 lines → 140 lines (63% reduction)
    ├─► LandingGate.tsx: 190 lines → 80 lines (58% reduction)
    └─► Total: ~570 lines extracted to dedicated modules

    Module Count:
    ├─► 30+ Feature Modules
    ├─► 20+ Widget Components
    ├─► 15+ Zustand Stores
    └─► 10+ Custom Hooks

    Performance Targets:
    ├─► 250 FPS target
    ├─► Lazy loading for all routes
    ├─► Code splitting by feature
    └─► Optimized bundle size


╔═══════════════════════════════════════════════════════════════════════════════╗
║                         DEVELOPMENT WORKFLOW                                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

    Development:
    npm run dev
         │
         ├─► Vite Dev Server (React)
         └─► Electron Process

    Building:
    npm run build
         │
         ├─► TypeScript Compilation
         ├─► Vite Build (React)
         ├─► Electron Builder
         └─► Installer Generation

    Testing:
    npm run typecheck  ──► TypeScript validation
    npm run lint      ──► ESLint validation
    npm run test      ──► Unit tests (Vitest)


═══════════════════════════════════════════════════════════════════════════════
                              END OF LAYOUT
═══════════════════════════════════════════════════════════════════════════════

