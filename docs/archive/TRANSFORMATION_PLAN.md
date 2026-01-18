# FTWOS TRANSFORMATION PLAN
## Production-Ready Enterprise System Roadmap

**Version:** 2.0.0 (Major Refactor)
**Date:** January 2026
**Status:** Planning Phase

---

## EXECUTIVE SUMMARY

Transform FTWOS from a demo-heavy system into a production-ready enterprise OS with real functionality, cross-device sync, authentication, and powerful integrations. This plan removes all mock/seed data, implements empty states, adds critical business features, and establishes a robust multi-device architecture.

**Key Goals:**
1. ❌ **Remove all mock/seed data** - Replace with empty states
2. 🔐 **Real authentication** - Email/password at boot
3. 🔄 **Cross-device sync** - Real-time data synchronization
4. 📊 **Production widgets** - Functional from day one
5. 🎨 **Working customization** - Real appearance settings
6. 📄 **Document management** - Project-based storage
7. 🤖 **Enhanced AI** - Multiple integrations
8. 🏢 **Office suite** - Full productivity tools
9. 📧 **Communication** - Email, calendar, notifications
10. ⚙️ **Integration hub** - Centralized settings

---

## PHASE 1: FOUNDATION CLEANUP & AUTHENTICATION
**Timeline:** Week 1-2
**Priority:** CRITICAL

### 1.1 Remove Mock Data System
**Files to modify:**
- [src/seed-data.ts](src/seed-data.ts) - Delete or disable entirely
- [src/stores/auth-store.ts](src/stores/auth-store.ts:63-76) - Remove `loginAsGuest` seed injection
- [src/AppWithSplash.tsx](src/AppWithSplash.tsx) - Remove auto-injection logic

**Actions:**
```typescript
// DELETE: src/seed-data.ts (entire file)
// OR: Add feature flag to disable
export const ENABLE_SEED_DATA = false; // Set to false for production
```

**Empty State Components to Create:**
- `EmptyInvoiceState.tsx` - "Create your first invoice"
- `EmptyClientState.tsx` - "Add your first client"
- `EmptyTaskState.tsx` - "Start tracking tasks"
- `EmptyExpenseState.tsx` - "Track your first expense"
- `EmptyDashboardState.tsx` - "Configure your workspace"

---

### 1.2 Implement Email/Password Authentication
**Replace:** Current Supabase OAuth-only auth
**With:** Email/password + OAuth options

**New Components:**
- `LoginScreen.tsx` - Email/password form
- `RegisterScreen.tsx` - User registration
- `ForgotPassword.tsx` - Password recovery
- `VerifyEmail.tsx` - Email verification

**Store Updates:**
```typescript
// src/stores/auth-store.ts
interface AuthState {
  isAuthenticated: boolean
  user: User | null
  sessionToken: string | null

  // New methods
  loginWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>

  // Keep existing
  login: () => void // OAuth
  logout: () => void
  checkSession: () => Promise<void>
}
```

**Electron Security:**
- Implement secure credential storage (electron-store with encryption)
- Add session management with token refresh
- Implement automatic logout on app close (optional setting)

**Backend Setup (Supabase):**
```sql
-- Enable email/password auth in Supabase dashboard
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

### 1.3 Boot Screen Authentication
**Replace:** Direct app launch
**With:** Mandatory login screen

**New Boot Flow:**
1. App starts → Splash screen (existing)
2. Check session → If valid, load app
3. If no session → Show login screen (blocks app access)
4. After login → Load user data and show dashboard

**Implementation:**
```typescript
// src/App.tsx
function App() {
  const { isAuthenticated, checkSession } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSession().finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <SplashScreen />
  if (!isAuthenticated) return <LoginScreen />

  return <MainApp />
}
```

---

## PHASE 2: CROSS-DEVICE SYNC
**Timeline:** Week 3-4
**Priority:** HIGH

### 2.1 Real-time Sync Architecture
**Technology:** Supabase Realtime + Conflict Resolution

**Core Features:**
- Real-time data sync across devices
- Offline-first with queue system
- Conflict resolution (last-write-wins + manual merge)
- Sync status indicators

**New Services:**
```typescript
// src/services/sync-service.ts
export class SyncService {
  // Sync engine
  private syncQueue: SyncOperation[] = []
  private isOnline: boolean = navigator.onLine

  // Methods
  async syncAll(): Promise<void>
  async syncEntity(type: string, id: string): Promise<void>
  async resolveConflict(conflict: Conflict): Promise<void>

  // Realtime subscriptions
  subscribeToChanges(userId: string): void
  unsubscribe(): void
}
```

**Conflict Resolution UI:**
- `ConflictResolver.tsx` - Side-by-side comparison
- Show fields that differ
- Allow user to choose version or merge manually
- Auto-resolve based on timestamps for simple conflicts

**Sync Store:**
```typescript
// src/stores/sync-store.ts
interface SyncState {
  isSyncing: boolean
  lastSyncTime: Date | null
  pendingChanges: number
  conflicts: Conflict[]
  syncStatus: 'online' | 'offline' | 'syncing' | 'error'

  startSync: () => Promise<void>
  resolveConflict: (id: string, resolution: any) => Promise<void>
  retryFailedSync: () => Promise<void>
}
```

**Status Indicators:**
- Navigation bar sync icon (green=synced, yellow=pending, red=offline)
- Sync timestamp display
- Pending changes counter
- Manual sync button

---

### 2.2 Multi-Device Session Management
**Features:**
- View active sessions
- Remote logout (kill sessions from other devices)
- Device fingerprinting
- Session activity log

**New Components:**
- `ActiveSessions.tsx` - List all logged-in devices
- `DeviceManager.tsx` - Manage trusted devices

**Backend:**
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  device_name TEXT,
  device_type TEXT, -- desktop, mobile, web
  ip_address TEXT,
  user_agent TEXT,
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## PHASE 3: WIDGET SYSTEM OVERHAUL
**Timeline:** Week 5-6
**Priority:** HIGH

### 3.1 Remove Mock Widget States
**Current Problem:** Widgets show "Configured" but use fake data

**Solution:** Empty states by default, real configuration

**Widget Refactor Pattern:**
```typescript
// Before (mock data everywhere)
const GitHubWidget = () => {
  const data = MOCK_GITHUB_DATA // ❌
  return <div>{data.commits}</div>
}

// After (real data or empty state)
const GitHubWidget = () => {
  const { githubToken } = useSettingsStore()
  const { data, isLoading, error } = useGitHubData(githubToken)

  if (!githubToken) return <EmptyState message="Configure GitHub token in Settings" />
  if (isLoading) return <Skeleton />
  if (error) return <ErrorState error={error} />
  if (!data) return <EmptyState message="No GitHub activity found" />

  return <GitHubContent data={data} />
}
```

**All Widgets to Refactor:**
- ✅ GitHub Widget - Real API integration (already exists, ensure no mock fallback)
- ✅ SoundCloud Widget - Real API integration (add empty state)
- ✅ Steam Widget - Real API integration (add empty state)
- ✅ Ollama Widget - Real local AI (add connection check)
- ⚠️ NetVis - Currently shows mock network data → **Make real**
- ⚠️ QuickROI - Calculator works but add project linking
- ⚠️ CryptoMatrix - Real crypto API (CoinGecko/CoinMarketCap)
- ⚠️ SystemResources - Real system monitoring (via Electron)
- ⚠️ Weather - Real weather API
- ⚠️ NASA - Real NASA APOD API

---

### 3.2 New Production-Ready Widgets
**Goal:** Add widgets that provide immediate value

**New Widgets to Build:**

#### 1. **Employee Timesheet Widget**
- Display team member hours
- Current week summary
- Quick clock in/out
- Integration with Time Tracker module

#### 2. **GitHub Activity Tracker Widget**
- Auto-track commits, PRs, issues across organization
- Team activity feed
- Repository insights
- Commit graph

#### 3. **Email Inbox Widget**
- Unread count
- Recent messages (last 5)
- Quick reply
- Integration with email module

#### 4. **Calendar Widget**
- Today's meetings
- Upcoming deadlines
- Quick event creation
- Sync with Google Calendar/Outlook

#### 5. **Company Notifications Widget**
- System notifications
- Team mentions
- Invoice status updates
- Client activity

#### 6. **Quick Invoice Widget**
- Create invoice in 3 clicks
- Recent invoices
- Unpaid invoice count
- Payment status

#### 7. **Project Status Widget**
- Active projects
- Task completion %
- Blockers/issues
- Team workload

#### 8. **Document Hub Widget**
- Recent documents
- Shared files
- Quick upload
- Search documents

---

### 3.3 Widget Configuration System
**Replace:** Hardcoded daily layouts
**With:** User-configurable widget library

**New Features:**
- Widget marketplace/library
- Drag from library to add
- Save custom layouts
- Import/export layouts
- Share layouts with team

**Widget Registry Enhancement:**
```typescript
// src/stores/widget-registry.ts
interface WidgetDefinition {
  id: string
  type: string
  name: string
  description: string
  icon: string
  category: 'productivity' | 'finance' | 'dev' | 'fun' | 'communication'
  requiresConfig: boolean
  configFields?: ConfigField[]
  defaultSize: { w: number; h: number }
  minSize: { w: number; h: number }
  maxSize: { w: number; h: number }
  preview: string // Image URL
  isPremium?: boolean
}

// Widget library categories
const WIDGET_CATEGORIES = {
  productivity: ['tasks', 'calendar', 'email', 'notes'],
  finance: ['invoices', 'expenses', 'crypto', 'roi'],
  dev: ['github', 'ollama', 'terminal', 'api-monitor'],
  communication: ['chat', 'notifications', 'meetings'],
  monitoring: ['system', 'network', 'analytics'],
  fun: ['weather', 'nasa', 'games', 'music']
}
```

---

## PHASE 4: ENHANCED INVOICE GENERATOR
**Timeline:** Week 7
**Priority:** MEDIUM

### 4.1 Real Invoice Generation
**Current State:** Basic PDF export exists
**Enhancement:** Professional multi-format export with real data

**New Features:**

#### 1. **Advanced PDF Generation**
- Professional templates (10+ designs)
- Custom branding (logo, colors, fonts)
- Digital signatures
- QR codes (payment links)
- Watermarks (draft/paid/overdue)
- Multi-page support
- Itemized tax breakdown

#### 2. **Additional Export Formats**
- Excel (.xlsx) - Accounting-ready
- CSV - Data export
- HTML - Web view
- JSON - API integration
- Print-optimized format

#### 3. **Recurring Invoices**
- Schedule automation
- Auto-send on due date
- Increment invoice numbers
- Template variations

#### 4. **Payment Integration**
- Stripe integration
- PayPal integration
- Crypto payment options
- Payment status webhooks
- Auto-mark paid when payment received

#### 5. **Invoice Analytics**
- Revenue charts
- Payment trends
- Client payment history
- Overdue tracking
- Forecasting

**Implementation:**
```typescript
// src/services/invoice-generator/advanced-pdf.ts
export class AdvancedInvoicePDF {
  async generate(invoice: Invoice, template: Template): Promise<Blob> {
    // Use jsPDF with custom fonts
    // Add QR code for payment
    // Include digital signature
    // Apply watermark based on status
  }

  async generateBatch(invoices: Invoice[]): Promise<Blob> {
    // Generate multiple invoices in one PDF
  }
}

// src/services/invoice-generator/excel-export.ts
export class ExcelExporter {
  async exportInvoice(invoice: Invoice): Promise<Blob>
  async exportInvoiceList(invoices: Invoice[]): Promise<Blob>
  async exportAccountingSummary(dateRange: DateRange): Promise<Blob>
}
```

---

## PHASE 5: EMPLOYEE & TIME TRACKING
**Timeline:** Week 8-9
**Priority:** HIGH

### 5.1 Employee Management System
**New Module:** HR/Team Management

**Features:**
- Employee directory
- Role management
- Department organization
- Contact information
- Employment status
- Salary/compensation tracking
- Performance reviews
- Document storage (contracts, IDs)

**Database Schema:**
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  company_id UUID REFERENCES companies NOT NULL,
  employee_number TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT,
  position TEXT,
  role TEXT DEFAULT 'employee',
  employment_type TEXT, -- full-time, part-time, contract
  hire_date DATE,
  termination_date DATE,
  status TEXT DEFAULT 'active', -- active, inactive, on-leave
  salary DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  manager_id UUID REFERENCES employees(id),
  avatar_url TEXT,
  address JSONB,
  emergency_contact JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5.2 Advanced Time Tracking System
**Current State:** Basic tracker exists
**Enhancement:** Professional time tracking with billing

**New Features:**

#### 1. **Enhanced Time Tracker**
- Multi-project tracking
- Billable vs non-billable hours
- Timer with activity detection
- Idle time detection
- Manual time entry
- Time editing/approval workflow
- Break tracking
- Overtime calculation

#### 2. **Timesheet Management**
- Weekly/monthly timesheets
- Approval workflow (employee → manager → admin)
- Bulk approval
- Time-off tracking (PTO, sick days)
- Holiday calendar
- Timesheet reports

#### 3. **Billing Integration**
- Auto-generate invoices from tracked time
- Hourly rate configuration per employee/project
- Time-based expense tracking
- Client billable hour reports

**Implementation:**
```typescript
// src/services/time-tracker.ts
export class TimeTrackerService {
  // Active tracking
  startTimer(projectId: string, taskId?: string): void
  stopTimer(): TimeEntry
  pauseTimer(): void
  resumeTimer(): void

  // Manual entry
  addTimeEntry(entry: TimeEntryInput): Promise<TimeEntry>
  updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<void>
  deleteTimeEntry(id: string): Promise<void>

  // Reporting
  getWeeklyTimesheet(employeeId: string, weekStart: Date): Promise<Timesheet>
  getProjectHours(projectId: string, dateRange: DateRange): Promise<number>
  getBillableHours(clientId: string, dateRange: DateRange): Promise<BillableReport>

  // Activity detection
  detectIdleTime(): number
  trackActivity(): void
}
```

**UI Components:**
- `TimeTracker.tsx` - Main timer interface (enhanced)
- `TimesheetView.tsx` - Weekly/monthly view
- `TimesheetApproval.tsx` - Manager approval interface
- `TimeReports.tsx` - Analytics and reporting
- `ActivityMonitor.tsx` - Idle/activity detection settings

---

## PHASE 6: GITHUB INTEGRATION & DEV TOOLS
**Timeline:** Week 10
**Priority:** MEDIUM

### 6.1 Comprehensive GitHub Integration
**Current State:** Basic repo list and stats
**Enhancement:** Full GitHub workflow automation

**New Features:**

#### 1. **Organization Activity Dashboard**
- All repos in organization
- Recent commits across all repos
- Open PRs and issues
- Team member activity
- Code review status
- CI/CD pipeline status

#### 2. **Automated Tracking**
- Webhook integration (listen to GitHub events)
- Auto-log commits to timesheet
- PR notifications
- Issue assignment notifications
- Deployment tracking

#### 3. **Project Management Integration**
- Link GitHub issues to internal tasks
- Sync GitHub Projects with FTWOS tasks
- Milestone tracking
- Release notes generation

#### 4. **Code Metrics**
- Lines of code by language
- Commit frequency
- Code churn
- Contributor statistics
- Repository health scores

**Implementation:**
```typescript
// src/services/github-service.ts
export class GitHubService {
  // Organization
  async getOrganizationRepos(org: string): Promise<Repository[]>
  async getOrganizationMembers(org: string): Promise<Member[]>
  async getOrganizationActivity(org: string, days: number): Promise<Activity[]>

  // Webhooks
  setupWebhook(repo: string, events: string[]): Promise<void>
  handleWebhookEvent(event: WebhookEvent): Promise<void>

  // Automation
  autoLogCommitTime(commit: Commit): Promise<TimeEntry>
  createTaskFromIssue(issue: Issue): Promise<Task>
  syncProjects(githubProject: Project): Promise<void>

  // Analytics
  getCodeMetrics(repo: string): Promise<Metrics>
  getContributorStats(repo: string): Promise<Stats[]>
}
```

---

### 6.2 Development Tools Module
**New Section:** Dev HQ Enhancements

**Features:**
- API testing tool (like Postman)
- Database query builder
- Log viewer (app logs, Electron logs)
- Environment variable manager
- Snippet library
- Terminal emulator (embedded)

---

## PHASE 7: OFFICE SUITE & INTEGRATIONS
**Timeline:** Week 11-12
**Priority:** MEDIUM

### 7.1 Email Client Integration
**Technology:** IMAP/SMTP or API (Gmail, Outlook)

**Features:**
- Multiple email accounts
- Inbox with folders
- Compose/reply/forward
- Attachments
- Search
- Templates
- Auto-responders
- Email tracking (read receipts)

**Implementation:**
```typescript
// src/services/email-service.ts
export class EmailService {
  // Connection
  async connectIMAP(config: IMAPConfig): Promise<void>
  async connectSMTP(config: SMTPConfig): Promise<void>

  // Inbox
  async fetchEmails(folder: string, limit: number): Promise<Email[]>
  async searchEmails(query: string): Promise<Email[]>

  // Actions
  async sendEmail(email: EmailDraft): Promise<void>
  async replyToEmail(emailId: string, reply: EmailDraft): Promise<void>
  async moveEmail(emailId: string, folder: string): Promise<void>
  async deleteEmail(emailId: string): Promise<void>
}
```

---

### 7.2 Calendar System
**Integration:** Google Calendar, Outlook Calendar

**Features:**
- Multi-calendar view (day/week/month)
- Event creation/editing
- Meeting invites
- Reminders/notifications
- Recurring events
- Time zone support
- Calendar sharing

---

### 7.3 Document Management System
**Goal:** Project-based document storage

**Features:**

#### 1. **Project Documents**
- Organize by project/client
- Folder structure
- File upload/download
- Version control
- File preview (PDF, images, docs)
- Comments/annotations
- Sharing permissions

#### 2. **Document Types**
- Contracts
- Proposals
- Reports
- Invoices (auto-filed)
- Receipts
- Presentations
- Spreadsheets

#### 3. **Storage Backend**
- Supabase Storage (cloud)
- Local file system (offline)
- Sync between devices
- Search across documents
- Tags and categories

**Database Schema:**
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects,
  client_id UUID REFERENCES clients,
  name TEXT NOT NULL,
  description TEXT,
  file_type TEXT,
  file_size BIGINT,
  file_url TEXT, -- Supabase Storage URL
  local_path TEXT, -- Electron file path
  version INTEGER DEFAULT 1,
  tags TEXT[],
  uploaded_by UUID REFERENCES employees,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents NOT NULL,
  version INTEGER NOT NULL,
  file_url TEXT,
  changes TEXT,
  uploaded_by UUID REFERENCES employees,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**UI Components:**
- `DocumentLibrary.tsx` - Main document browser
- `DocumentUploader.tsx` - Drag-and-drop upload
- `DocumentViewer.tsx` - Preview documents
- `DocumentVersionHistory.tsx` - Version control UI

---

### 7.4 Note-Taking System
**New Module:** Internal wiki/notes

**Features:**
- Rich text editor (Tiptap/Slate)
- Markdown support
- Code blocks with syntax highlighting
- Embed images/videos
- Link notes together (wiki-style)
- Categories/tags
- Search
- Sharing

---

## PHASE 8: AI CHATBOT ENHANCEMENTS
**Timeline:** Week 13
**Priority:** MEDIUM

### 8.1 Multi-AI Integration
**Current:** Only Ollama (local)
**New:** Multiple AI providers

**Supported Providers:**
- Ollama (local, existing)
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Mistral AI
- Cohere
- Custom API endpoints

**Features:**
- Provider switching
- Model selection per provider
- Cost tracking
- Token usage monitoring
- Conversation history
- Export conversations
- Shared team chats

**Implementation:**
```typescript
// src/services/ai-service.ts
export class AIService {
  private providers: Map<string, AIProvider> = new Map()

  async chat(
    message: string,
    provider: 'ollama' | 'openai' | 'anthropic' | 'google',
    model?: string,
    context?: Conversation
  ): Promise<AIResponse>

  async streamChat(
    message: string,
    provider: string,
    onChunk: (chunk: string) => void
  ): Promise<void>

  getProviderModels(provider: string): Promise<Model[]>
  getUsageStats(): Promise<UsageStats>
}
```

---

### 8.2 AI-Powered Features
**Integrate AI across the platform:**

1. **Invoice Assistant**
   - Auto-fill invoice details from conversation
   - Suggest line items based on project
   - Generate invoice descriptions

2. **Email Assistant**
   - Draft emails
   - Summarize email threads
   - Suggest replies

3. **Document Assistant**
   - Generate reports
   - Summarize documents
   - Extract key information

4. **Code Assistant**
   - Code review suggestions
   - Bug detection
   - Documentation generation

---

## PHASE 9: APPEARANCE CUSTOMIZATION
**Timeline:** Week 14
**Priority:** MEDIUM

### 9.1 Working Theme System
**Current:** Theme store exists but some settings don't apply
**Fix:** Ensure all theme settings work

**Theme Settings to Implement:**
1. **Color Scheme**
   - Accent color picker (full spectrum)
   - Background type (solid/mesh/aurora/deep/cyber)
   - Custom CSS variables

2. **Layout Options**
   - Sidebar position (left/right) ✅ (works)
   - Sidebar width
   - Navigation style (floating/docked/minimal)
   - Compact/comfortable/spacious density

3. **Visual Effects**
   - Blur intensity (0-20px)
   - Opacity (0-100%)
   - Noise texture
   - Border radius (0-20px)
   - Animations on/off
   - Smooth scrolling

4. **Typography**
   - Font family (system/monospace/custom)
   - Font size (small/medium/large)
   - Line height
   - Letter spacing

5. **Dark Mode**
   - Light/dark/auto (system)
   - Custom dark colors
   - Dark mode schedule

**Implementation:**
```typescript
// src/stores/theme-store.ts (enhanced)
interface ThemeState {
  // Colors
  mode: 'light' | 'dark' | 'auto'
  accentColor: string
  backgroundColor: string
  backgroundType: 'solid' | 'mesh' | 'aurora' | 'deep' | 'cyber'

  // Layout
  sidebarPosition: 'left' | 'right'
  sidebarWidth: number // 200-400px
  navStyle: 'floating' | 'docked' | 'minimal'
  density: 'compact' | 'comfortable' | 'spacious'

  // Visual effects
  blur: number
  opacity: number
  noise: number
  radius: number
  animations: boolean
  smoothScroll: boolean

  // Typography
  fontFamily: string
  fontSize: 'small' | 'medium' | 'large'
  lineHeight: number
  letterSpacing: number

  // Apply theme
  applyTheme: () => void
  resetTheme: () => void
  importTheme: (theme: Theme) => void
  exportTheme: () => Theme
}
```

**Theme Marketplace:**
- Pre-built themes (Dark Professional, Light Modern, Neon, etc.)
- Import/export themes (JSON)
- Share themes with team
- Theme preview

---

### 9.2 Custom Branding
**For businesses using FTWOS:**

**Features:**
- Custom logo upload
- Company colors
- Custom fonts (upload .woff2)
- Splash screen customization
- App icon customization (Electron)
- White-label options

---

## PHASE 10: INTEGRATION SETTINGS HUB
**Timeline:** Week 15
**Priority:** HIGH

### 10.1 Centralized Integration Management
**Goal:** One place to manage all API keys and integrations

**New Settings Section:**
```
Settings > Integrations
├── Authentication
│   ├── Supabase (connected ✓)
│   └── Custom OAuth providers
├── Development
│   ├── GitHub (configure org, webhooks)
│   ├── GitLab
│   └── Bitbucket
├── Communication
│   ├── Email (IMAP/SMTP or Gmail/Outlook)
│   ├── Slack
│   ├── Discord
│   └── Microsoft Teams
├── AI & ML
│   ├── OpenAI (API key)
│   ├── Anthropic (API key)
│   ├── Google AI (API key)
│   ├── Ollama (local connection)
│   └── Custom endpoints
├── Finance
│   ├── Stripe (API keys, webhooks)
│   ├── PayPal (client ID/secret)
│   ├── QuickBooks
│   └── Xero
├── Productivity
│   ├── Google Workspace (Calendar, Drive)
│   ├── Microsoft 365 (Calendar, OneDrive)
│   ├── Notion
│   └── Trello
├── Entertainment
│   ├── SoundCloud (API key) ⭐ NEW
│   ├── Spotify (client ID/secret)
│   ├── Steam (API key, user ID)
│   └── Discord Rich Presence
├── Analytics
│   ├── Google Analytics
│   ├── Mixpanel
│   └── Custom analytics
├── Storage
│   ├── Supabase Storage
│   ├── AWS S3
│   ├── Google Cloud Storage
│   └── Dropbox
└── Webhooks
    ├── Incoming webhooks (receive data)
    └── Outgoing webhooks (send events)
```

**Features:**
- Test connection button for each integration
- Status indicators (connected/disconnected/error)
- Usage statistics
- Rate limit monitoring
- Secure credential storage (encrypted)
- Integration logs

---

### 10.2 SoundCloud Integration
**Requested Feature:** Add SoundCloud API key from settings

**Implementation:**
```typescript
// src/stores/settings-store.ts
interface SettingsStore {
  integrations: {
    // Existing
    steamApiKey: string
    steamId: string
    githubToken: string

    // NEW: SoundCloud
    soundcloudClientId: string
    soundcloudClientSecret: string
    soundcloudUsername: string

    // Payment links
    paymentLinks?: { ... }
  }
}

// src/services/soundcloud-service.ts
export class SoundCloudService {
  private clientId: string
  private clientSecret: string

  async authenticate(): Promise<void>
  async getUserPlaylists(username: string): Promise<Playlist[]>
  async getStream(): Promise<Track[]>
  async playTrack(trackId: string): Promise<void>
  async searchTracks(query: string): Promise<Track[]>
}
```

**Widget Update:**
```typescript
// src/components/widgets/core/real/SoundCloudWidget.tsx
const SoundCloudWidget = () => {
  const { soundcloudClientId, soundcloudUsername } = useSettingsStore()
  const { playlists, isLoading } = useSoundCloud(soundcloudClientId, soundcloudUsername)

  if (!soundcloudClientId) {
    return <EmptyState
      icon={Music}
      message="Configure SoundCloud in Settings > Integrations"
      action={() => navigate('/settings/integrations')}
    />
  }

  // ... rest of widget
}
```

---

## PHASE 11: PRINTING SYSTEM
**Timeline:** Week 16
**Priority:** LOW-MEDIUM

### 11.1 Context-Aware Printing
**Goal:** Print whatever you're looking at

**Implementation:**
- Detect current view (invoice, report, document, etc.)
- Apply appropriate print stylesheet
- Print dialog with preview
- Save as PDF option
- Print settings (margins, orientation, headers/footers)

**Print Handlers:**
```typescript
// src/services/print-service.ts
export class PrintService {
  printInvoice(invoice: Invoice, template: Template): void
  printReport(report: Report): void
  printDocument(document: Document): void
  printTimesheet(timesheet: Timesheet): void
  printCustom(element: HTMLElement, options: PrintOptions): void

  // Preview
  showPrintPreview(content: PrintContent): void

  // Settings
  getPrintSettings(): PrintSettings
  updatePrintSettings(settings: Partial<PrintSettings>): void
}
```

**Keyboard Shortcut:**
- `Ctrl+P` / `Cmd+P` - Print current view

---

## PHASE 12: ADDITIONAL FEATURES
**Timeline:** Week 17-20
**Priority:** VARIABLE

### 12.1 Advanced CRM Features
**Enhancements to Client/Lead management:**

1. **Client Portal**
   - Client-facing dashboard
   - View invoices
   - Download documents
   - Submit tickets/requests
   - Pay invoices online

2. **Sales Pipeline**
   - Kanban board for leads
   - Automated follow-ups
   - Email templates
   - Deal stages
   - Win/loss analysis

3. **Client Communication**
   - Email integration (thread view)
   - Call logs
   - Meeting notes
   - Activity timeline

---

### 12.2 Advanced Reporting
**New Reports Module:**

1. **Financial Reports**
   - Profit & Loss
   - Balance Sheet
   - Cash Flow
   - Revenue by client
   - Expense breakdown
   - Tax reports

2. **Time Reports**
   - Employee utilization
   - Project profitability
   - Billable vs non-billable
   - Overtime analysis

3. **Project Reports**
   - Project status
   - Budget vs actual
   - Task completion rates
   - Resource allocation

4. **Custom Reports**
   - Report builder (drag-and-drop)
   - Scheduled reports (email)
   - Export formats (PDF, Excel, CSV)

---

### 12.3 Automation & Workflows
**New Automation Engine:**

**Features:**
- Trigger-based actions
- Scheduled tasks
- Email automation
- Invoice reminders
- Task automation
- Custom workflows

**Examples:**
- Auto-send invoice when marked "sent"
- Create task when invoice is overdue
- Send email when payment received
- Auto-backup data daily
- Generate monthly reports

**Implementation:**
```typescript
// src/services/automation-service.ts
interface AutomationRule {
  id: string
  name: string
  trigger: Trigger
  conditions: Condition[]
  actions: Action[]
  enabled: boolean
}

export class AutomationService {
  createRule(rule: AutomationRule): Promise<void>
  executeRule(ruleId: string, context: any): Promise<void>
  scheduleRule(ruleId: string, schedule: Schedule): Promise<void>
}
```

---

### 12.4 Team Collaboration
**Multi-user features:**

1. **Team Workspace**
   - Shared dashboard
   - Team chat
   - Mentions/notifications
   - Activity feed

2. **Permissions & Roles**
   - Admin, Manager, Employee, Client
   - Granular permissions
   - Resource-level access control

3. **Comments & Mentions**
   - Comment on invoices, tasks, documents
   - @mention team members
   - Notification system

---

### 12.5 Mobile Companion
**Future Enhancement:** Mobile app (React Native or PWA)

**Features:**
- View invoices/clients/tasks
- Time tracking on-the-go
- Quick expense entry
- Photo upload (receipts)
- Push notifications
- Offline mode

---

## PHASE 13: PERFORMANCE & OPTIMIZATION
**Timeline:** Ongoing
**Priority:** HIGH

### 13.1 Performance Enhancements
**Actions:**
1. Virtual scrolling for large lists (invoices, clients)
2. Image lazy loading
3. Code splitting optimization
4. Bundle size reduction
5. Memory leak fixes
6. Database query optimization
7. Caching strategy (Redis for cloud)

---

### 13.2 Offline-First Architecture
**Make app fully functional offline:**
- IndexedDB for local data
- Service worker for caching
- Sync queue for offline changes
- Conflict resolution on reconnect

---

## IMPLEMENTATION ROADMAP

### Sprint Structure (2-week sprints)

**Sprint 1-2:** Foundation & Auth (Phase 1-2)
- Remove mock data
- Implement email/password auth
- Build cross-device sync

**Sprint 3:** Widget Overhaul (Phase 3)
- Refactor all widgets to use real data
- Add empty states
- Build 3 new widgets

**Sprint 4:** Invoice & Time Tracking (Phase 4-5)
- Enhanced invoice generator
- Employee management
- Advanced time tracking

**Sprint 5:** GitHub & Dev Tools (Phase 6)
- GitHub automation
- Webhook integration
- Dev tools module

**Sprint 6:** Office Suite (Phase 7)
- Email client
- Calendar
- Document management

**Sprint 7:** AI & Customization (Phase 8-9)
- Multi-AI integration
- Theme system fixes
- Custom branding

**Sprint 8:** Integrations & Printing (Phase 10-11)
- Integration hub
- SoundCloud integration
- Printing system

**Sprint 9-10:** Advanced Features (Phase 12)
- CRM enhancements
- Reporting
- Automation

**Ongoing:** Performance & Testing (Phase 13)
- Throughout all sprints

---

## TECHNOLOGY STACK ADDITIONS

### New Dependencies

**Frontend:**
```json
{
  "dependencies": {
    // Email
    "imap": "^0.8.19",
    "nodemailer": "^6.9.7",

    // Calendar
    "react-big-calendar": "^1.8.5",
    "ics": "^3.7.0",

    // Rich text editor
    "tiptap": "^2.1.13",
    "@tiptap/extension-*": "latest",

    // AI
    "openai": "^4.20.0",
    "@anthropic-ai/sdk": "^0.9.1",
    "@google/generative-ai": "^0.1.3",

    // Excel
    "exceljs": "^4.3.0",

    // QR codes
    "qrcode": "^1.5.3",

    // File preview
    "react-pdf": "^7.5.1",
    "react-image-lightbox": "^5.1.4",

    // Virtual scrolling
    "react-window": "^1.8.10",

    // Encryption
    "crypto-js": "^4.2.0",

    // Real-time
    "@supabase/realtime-js": "^2.9.0"
  }
}
```

**Backend (Electron):**
```json
{
  "dependencies": {
    // Secure storage
    "electron-store": "^8.1.0",
    "keytar": "^7.9.0",

    // System monitoring
    "systeminformation": "^5.21.20",

    // Network
    "network-speed": "^2.1.1"
  }
}
```

---

## DATABASE SCHEMA UPDATES

### New Tables Needed

```sql
-- Companies (multi-tenant support)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  address JSONB,
  tax_id TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Employees (from Phase 5)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  company_id UUID REFERENCES companies NOT NULL,
  employee_number TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT,
  position TEXT,
  role TEXT DEFAULT 'employee',
  hire_date DATE,
  status TEXT DEFAULT 'active',
  salary DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Time entries
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees NOT NULL,
  project_id UUID REFERENCES projects,
  task_id UUID REFERENCES tasks,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INTEGER, -- seconds
  billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10, 2),
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES employees,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents (from Phase 7)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects,
  client_id UUID REFERENCES clients,
  name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  file_url TEXT,
  version INTEGER DEFAULT 1,
  tags TEXT[],
  uploaded_by UUID REFERENCES employees,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Emails (if storing locally)
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  message_id TEXT UNIQUE,
  from_email TEXT,
  to_email TEXT[],
  cc_email TEXT[],
  subject TEXT,
  body TEXT,
  html_body TEXT,
  attachments JSONB,
  folder TEXT DEFAULT 'inbox',
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  received_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Calendar events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  attendees JSONB,
  recurrence TEXT, -- RRULE format
  reminder INTEGER, -- minutes before
  created_at TIMESTAMP DEFAULT NOW()
);

-- Automation rules (from Phase 12)
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB,
  conditions JSONB,
  actions JSONB,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  provider TEXT NOT NULL, -- ollama, openai, anthropic, etc.
  model TEXT NOT NULL,
  messages JSONB NOT NULL,
  tokens_used INTEGER,
  cost DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Integration settings (encrypted)
CREATE TABLE integration_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  integration_type TEXT NOT NULL, -- github, soundcloud, email, etc.
  config JSONB NOT NULL, -- encrypted JSON
  status TEXT DEFAULT 'active',
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, integration_type)
);

-- Sync log (for debugging cross-device sync)
CREATE TABLE sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- create, update, delete
  device_id TEXT,
  synced_at TIMESTAMP DEFAULT NOW()
);
```

---

## SECURITY ENHANCEMENTS

### Critical Security Tasks

1. **Credential Encryption**
   - Encrypt API keys at rest (electron-store + keytar)
   - Use environment variables for sensitive data
   - Never log credentials

2. **Authentication**
   - JWT token refresh flow
   - Session timeout
   - Multi-factor authentication (optional)
   - Rate limiting on login attempts

3. **Authorization**
   - Row-level security (RLS) on all Supabase tables
   - Role-based access control (RBAC)
   - API key permissions

4. **Data Protection**
   - Encrypt sensitive data in database
   - HTTPS only
   - Content Security Policy (CSP)
   - Input sanitization

5. **Electron Security**
   - Context isolation
   - Sandbox enabled
   - Node integration disabled in renderer
   - Validate all IPC messages

---

## TESTING STRATEGY

### Test Coverage Goals

1. **Unit Tests** (Vitest)
   - All stores (80%+ coverage)
   - Services (80%+ coverage)
   - Utils (100% coverage)

2. **Integration Tests**
   - IPC communication
   - API integrations
   - Database operations

3. **E2E Tests** (Playwright)
   - Critical user flows:
     - Login → Create invoice → Export PDF
     - Add client → Create task → Track time
     - Configure integration → Use widget

4. **Performance Tests**
   - Load 1000+ invoices
   - Real-time sync with latency
   - Widget rendering

---

## DOCUMENTATION

### Documentation to Create

1. **User Documentation**
   - Getting started guide
   - Feature tutorials
   - Integration setup guides
   - Troubleshooting

2. **Developer Documentation**
   - Architecture overview
   - API documentation
   - Widget development guide
   - Contribution guidelines

3. **API Documentation**
   - Electron IPC API
   - Internal service APIs
   - Webhook documentation

---

## MIGRATION PLAN

### Existing Users

1. **Data Migration**
   - Auto-detect seed data
   - Offer to keep or clear
   - Backup before migration
   - Migration wizard UI

2. **Settings Migration**
   - Transfer existing settings to new format
   - Preserve theme customizations
   - Migrate widget layouts

3. **Breaking Changes**
   - Announce in release notes
   - Provide migration scripts
   - Gradual deprecation

---

## SUCCESS METRICS

### KPIs to Track

1. **User Engagement**
   - Daily active users
   - Session duration
   - Feature adoption rates

2. **Performance**
   - App load time (<3s)
   - Widget render time (<100ms)
   - Sync latency (<1s)

3. **Reliability**
   - Crash rate (<0.1%)
   - Sync success rate (>99%)
   - Uptime (>99.9%)

4. **Business Value**
   - Invoices created per user
   - Time tracked per employee
   - Documents stored
   - Integration usage

---

## RELEASE STRATEGY

### Version Naming

- **v2.0.0** - Major refactor (Phase 1-3 complete)
- **v2.1.0** - Invoice & time tracking (Phase 4-5)
- **v2.2.0** - GitHub & dev tools (Phase 6)
- **v2.3.0** - Office suite (Phase 7)
- **v2.4.0** - AI & customization (Phase 8-9)
- **v2.5.0** - Integrations & advanced features (Phase 10-12)

### Beta Testing

- Internal alpha (developers)
- Closed beta (select users)
- Public beta (opt-in)
- Stable release

---

## RISKS & MITIGATION

### Potential Risks

1. **Risk:** Breaking changes alienate existing users
   **Mitigation:** Offer migration wizard, preserve old features as "classic mode"

2. **Risk:** Cross-device sync conflicts
   **Mitigation:** Robust conflict resolution UI, last-write-wins with manual override

3. **Risk:** API rate limits (GitHub, AI providers)
   **Mitigation:** Rate limit monitoring, queue system, user notifications

4. **Risk:** Performance degradation with real data
   **Mitigation:** Virtual scrolling, pagination, lazy loading, performance testing

5. **Risk:** Security vulnerabilities
   **Mitigation:** Security audit, penetration testing, encryption

---

## CONCLUSION

This transformation plan will take **FTWOS from a functional demo to a production-ready enterprise system**. The phased approach ensures gradual, stable progress while maintaining existing functionality.

**Key Deliverables:**
- ❌ Zero mock data - All empty states or real integrations
- 🔐 Secure authentication - Email/password at boot
- 🔄 Cross-device sync - Real-time data synchronization
- 📊 Production widgets - 15+ functional widgets
- 🎨 Working customization - Complete theme control
- 📄 Document management - Project-based organization
- 🤖 Enhanced AI - Multiple provider integrations
- 🏢 Office suite - Email, calendar, notes, documents
- ⚙️ Integration hub - Centralized API management
- 📧 Communication - Email client, notifications
- ⏱️ Time tracking - Professional employee timesheets
- 🔧 GitHub automation - Webhook-based activity tracking

**Timeline:** ~20 weeks (5 months)
**Effort:** 1-2 developers full-time
**Result:** Enterprise-grade business operating system

---

## NEXT STEPS

1. Review this plan with stakeholders
2. Prioritize phases based on business needs
3. Set up development environment
4. Create detailed task breakdown for Phase 1
5. Begin implementation

**Let's build the future of business operating systems.** 🚀
