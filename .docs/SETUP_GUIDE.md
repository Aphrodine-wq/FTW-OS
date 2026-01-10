# InvoiceForge Pro - Setup & Development Guide

Complete guide for setting up, developing, and deploying InvoiceForge Pro.

## Quick Start

### 1. Clone & Install

```bash
# Install dependencies
npm install

# Start development environment
npm run dev
```

This starts both the React dev server (port 5173) and Electron in development mode.

### 2. Building for Production

```bash
# Create production build
npm run build

# Output files:
# - dist_build/        - React frontend bundle
# - dist-electron/     - Compiled Electron main process
# - dist/              - Final installer executable
```

## Detailed Setup Instructions

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18.0.0+ | JavaScript runtime |
| **npm** | 9.0.0+ | Package manager |
| **Git** | Latest | Version control |
| **Python** | 3.x (optional) | Build dependencies |
| **Visual C++ Build Tools** | Latest | Windows native modules |

### Step-by-Step Installation

#### 1. Prepare Environment

```bash
# Verify Node.js installation
node --version  # Should be v18+
npm --version   # Should be v9+

# Create project directory (if needed)
cd "path/to/Invoice Gen"
```

#### 2. Install Dependencies

```bash
# Install all npm dependencies
npm install

# This installs ~500 packages including:
# - React, React-DOM, TypeScript
# - Electron, Electron Builder
# - Vite, Tailwind CSS
# - Zustand, Radix UI components
# - PDF/DOCX export libraries
```

**First-time install may take 5-10 minutes.**

#### 3. Verify Installation

```bash
# Check if all binaries are accessible
npx electron --version
npx vite --version
npx tsc --version
```

### Development Workflow

#### Starting Development Server

```bash
npm run dev
```

This command:
1. Starts Vite dev server on `http://localhost:5173`
2. Watches for file changes in `src/` directory
3. Launches Electron and connects to dev server
4. Hot module replacement (HMR) enabled

**Development builds automatically reload on file save.**

#### Building React Frontend Only

```bash
npm run build:react
```

Output: `dist_build/` folder with compiled React bundle

**Use this for quick testing without full Electron rebuild.**

#### Building Electron Main Process Only

```bash
npm run build:electron
```

Compiles TypeScript in `electron/` folder to `dist-electron/`

**Run this after modifying `electron/*.ts` files.**

#### Full Production Build

```bash
npm run build
```

Complete build process:
1. Clean previous builds: `rimraf dist dist-electron dist_build`
2. Compile Electron TypeScript: `tsc -p electron/tsconfig.json`
3. Build React frontend: `vite build`
4. Package with Electron Builder: `electron-builder`
5. Copy final .exe to root: `npm run copy-exe`

**Takes ~3-5 minutes. Output: `dist/` and `InvoiceForge Pro.exe`**

### Directory Structure Explained

#### Source Directories

**`src/` - React Frontend**
```
src/
├── main.tsx              # React entry point
├── App.tsx               # Root component with initialization
├── index.css             # Global Tailwind CSS
├── seed-data.ts          # Demo data for first launch
├── components/
│   ├── layout/           # Navigation structure
│   │   ├── PhotonNav.tsx # Sidebar navigation (capsule design)
│   │   ├── TopNav.tsx    # Top toolbar
│   │   ├── CommandPalette.tsx
│   │   └── StatusBar.tsx
│   ├── modules/          # Feature modules
│   │   ├── core/dashboard/ # Dashboard widgets & analytics
│   │   ├── finance/        # Invoices, payments, reports
│   │   ├── crm/            # Clients, contacts, relationships
│   │   └── productivity/   # Tasks, projects, tracking
│   ├── ui/               # Reusable components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   └── ... (20+ more)
│   └── ErrorBoundary.tsx # Error handling
├── stores/               # Zustand state management
│   ├── theme-store.ts    # UI theme & appearance
│   ├── settings-store.ts # App settings & preferences
│   ├── invoice-store.ts  # Invoice data
│   ├── client-store.ts   # Client database
│   ├── widget-store.ts   # Dashboard configuration
│   └── template-store.ts # Invoice templates
├── services/             # Business logic
│   ├── pdf-export.ts     # PDF generation
│   ├── docx-export.ts    # DOCX export
│   ├── calculations.ts   # Financial calculations
│   └── validation.ts     # Data validation
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
├── styles/               # CSS modules & themes
│   ├── themes.css        # Theme definitions
│   └── variables.css     # CSS custom properties
├── constants/            # Configuration constants
└── config/               # App configuration

```

**`electron/` - Main Process**
```
electron/
├── main.ts               # Window creation & IPC setup
├── preload.ts            # Context bridge for security
├── storage.ts            # File-based storage handlers
│   └── Methods:
│       ├── db:get-settings
│       ├── db:save-settings
│       ├── db:get-invoices
│       ├── db:save-invoice
│       └── ... (15+ more)
├── supabase.ts           # Optional cloud sync
├── system.ts             # OS integration
├── tracker.ts            # Activity logging
└── tsconfig.json         # TypeScript config for Electron

```

#### Build & Config Directories

**`.build-config/` - Build Configuration**
```
.build-config/
├── electron-builder.yml  # Electron packager settings
├── legacy-build-output/  # Old build artifacts
└── legacy-scripts/       # Previous build scripts

```

**`.docs/` - Documentation**
```
.docs/
├── STRUCTURE.md                # Architecture overview
├── REFACTORING_SUMMARY.md     # Recent changes
├── ROADMAP.md                 # Feature roadmap
├── InvoiceForge_PRD_v1.0.pdf  # Product requirements
└── SETUP_GUIDE.md             # This file

```

#### Output Directories

**`dist_build/` - React Frontend Build**
```
dist_build/
├── index.html            # Compiled HTML
└── assets/
    ├── index-03_JJE2U.js (684KB) # React bundle + dependencies
    └── index-D5Hq4EO0.css (70KB) # Compiled Tailwind CSS

```

**`dist-electron/` - Compiled Electron Code**
```
dist-electron/
├── main.js              # Compiled electron/main.ts
├── preload.js
├── storage.js
├── system.js
└── ...

```

**`dist/` - Final Packaging**
```
dist/
├── InvoiceForge Pro 1.0.0.exe   # Windows installer (86MB)
├── win-unpacked/                # Unpacked application binary
└── resources/
    └── app.asar                 # Packed app resources

```

### Configuration Files

#### `package.json`

Defines dependencies and build scripts:

```json
{
  "main": "dist-electron/main.js",      // Electron entry
  "scripts": {
    "dev": "...",                       // Development
    "build": "...",                     // Production build
    "build:react": "vite build",        // Frontend only
    "build:electron": "tsc -p ...",     // Electron only
  },
  "dependencies": {...},                // Runtime dependencies
  "devDependencies": {...}              // Development tools
}
```

#### `vite.config.ts`

Configures React build:

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": "./src" }            // Import alias
  },
  base: './',                          // Asset path for Electron
  build: {
    outDir: 'dist_build'               // Output directory
  }
})
```

**Important**: `base: './'` is required for Electron to load assets correctly.

#### `tailwind.config.js`

Customizes Tailwind CSS:

```javascript
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],     // Scan files for classes
  darkMode: ["class"],                 // Dark mode support
  theme: {
    extend: {
      colors: {...},                   // Custom colors
      borderRadius: {...}              // Rounded corners
    }
  },
  plugins: [require("tailwindcss-animate")]
}
```

#### `electron-builder.yml`

Configures Windows installer:

```yaml
appId: "com.invoiceforge.app"
productName: "InvoiceForge Pro"
files:
  - dist-electron/**/*              # Include compiled Electron
  - dist_build/**/*                 # Include React frontend
  - node_modules/**/*               # Include dependencies
win:
  certificateFile: null             # Code signing (optional)
```

### State Management (Zustand)

All app state is managed with Zustand stores, persisted to localStorage:

#### Theme Store

```typescript
// src/stores/theme-store.ts
export const useThemeStore = create<ThemeState>(
  persist(
    (set) => ({
      mode: 'monochrome',             // 'monochrome' | 'glass'
      background: 'solid',             // 'solid' | 'gradient'
      setTheme: (mode, background) => set({...})
    }),
    {
      name: 'fairtrade-theme-v3'      // localStorage key
    }
  )
)
```

#### Settings Store

```typescript
// src/stores/settings-store.ts
export const useSettingsStore = create<SettingsState>(
  persist(
    (set) => ({
      companyName: 'My Company',
      taxRate: 0.1,
      currency: 'USD',

      // IPC calls to Electron main process
      loadSettings: async () => {
        const data = await window.ipcRenderer.invoke('db:get-settings')
        set(data)
      }
    }),
    {
      name: 'invoiceforge-settings'
    }
  )
)
```

### IPC Communication

**Security**: Context isolation prevents direct access to Node.js APIs.

#### Preload Bridge

```typescript
// electron/preload.ts
const ipcRenderer = {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, listener) => ipcRenderer.on(channel, listener),
  off: (channel, listener) => ipcRenderer.off(channel, listener),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args)
}

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
```

#### Usage in React

```typescript
// In any React component
const settings = await window.ipcRenderer.invoke('db:get-settings')
await window.ipcRenderer.invoke('db:save-invoice', invoiceData)
```

#### IPC Handlers

All handlers defined in `electron/storage.ts`:

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `db:get-settings` | Request/Response | Load app settings |
| `db:save-settings` | Request/Response | Save preferences |
| `db:get-invoices` | Request/Response | Load all invoices |
| `db:save-invoice` | Request/Response | Create/update invoice |
| `db:delete-invoice` | Request/Response | Delete invoice |
| `db:get-clients` | Request/Response | Load client database |
| `db:export-pdf` | Request/Response | Generate PDF |

## Debugging

### React Development

1. **DevTools**: Right-click → Inspect Element (Dev Tools enabled in dev mode)
2. **React DevTools**: Install React Developer Tools extension
3. **Console Logs**: Use `console.log()` in components
4. **Network Tab**: Monitor IPC calls and HTTP requests

### Electron Development

1. **Main Process Logs**: Check terminal where `npm run dev` is running
2. **Preload Errors**: Look for "ContextBridge" errors in console
3. **IPC Debugging**: Add console.log in handlers

### Common Issues

#### White Screen on Startup

**Symptoms**: App window opens but shows white screen

**Causes**:
- Missing `dist_build/` folder
- IPC preload not loaded
- React failed to initialize

**Solution**:
```bash
npm run build:react
npm run build:electron
npm run dev
```

#### Port Already in Use

**Symptoms**: "Error: Port 5173 is already in use"

**Solution**:
```bash
# Find and kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

#### Module Not Found

**Symptoms**: "Cannot find module '@/components/...'"

**Solutions**:
```bash
# Check vite.config.ts alias is correct
# Verify import paths use correct casing
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

#### Build Fails

**Solution**:
```bash
npm run clean
npm install
npm run build
```

## Testing

### Unit Tests

```bash
npm run test                          # Run all tests
npm run test -- src/utils/           # Run specific folder
npm run test -- --watch              # Watch mode
```

Config: `vite.config.ts` with Vitest

### E2E Tests

```bash
npm run test:e2e                      # Run Playwright tests
npm run test:e2e -- --debug           # Debug mode
```

### Linting

```bash
npm run lint                          # Check code style
npm run lint -- --fix                 # Auto-fix issues
```

## Deployment

### Creating Installer

```bash
npm run build
```

Creates `InvoiceForge Pro 1.0.0.exe` (86MB)

### Code Signing (Optional)

For trusted installer distribution:

1. Get code signing certificate
2. Add to `.build-config/electron-builder.yml`:
```yaml
win:
  certificateFile: path/to/cert.pfx
  certificatePassword: password
```
3. Rebuild: `npm run build`

### Distribution

1. Host `InvoiceForge Pro.exe` on website/S3
2. Users download and run installer
3. Auto-updates can be configured with `electron-updater`

## Environment Variables

Create `.env` file in root (optional):

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=InvoiceForge Pro

# Cloud Integration (Supabase)
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Export Settings
PDF_MARGIN=0.5
PDF_QUALITY=0.95

# Feature Flags
VITE_ENABLE_CLOUD_SYNC=true
VITE_ENABLE_NOTIFICATIONS=true
```

## Performance Tips

### Development

- Keep dev server running (HMR is faster than full rebuild)
- Use React DevTools to profile components
- Check Network tab for slow IPC calls

### Production

- Bundle size: 684KB JS + 70KB CSS (gzipped ~206KB)
- Lazy load feature modules dynamically
- Optimize images and assets
- Use windowed virtualization for large lists

### Build Optimization

```typescript
// vite.config.ts - chunk size limits
build: {
  chunkSizeWarningLimit: 600,
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'ui-vendor': ['@radix-ui/react-*']
      }
    }
  }
}
```

## Maintenance

### Updating Dependencies

```bash
npm update                            # Update all packages
npm outdated                          # Check what's outdated
npm install package@latest            # Update specific package
```

### Checking Security

```bash
npm audit                             # Check vulnerabilities
npm audit fix                         # Auto-fix security issues
```

### Cleaning Up

```bash
npm run clean                         # Remove build artifacts
npm cache clean --force               # Clear npm cache
rm -rf node_modules && npm install    # Fresh install
```

## Next Steps

1. Review `src/App.tsx` to understand startup flow
2. Explore `src/components/modules/` to see feature implementation
3. Check `electron/main.ts` to understand window management
4. Modify `tailwind.config.js` for custom branding
5. Add new features in `src/components/modules/`

## Resources

- [React Documentation](https://react.dev)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues or questions:
1. Check `.docs/STRUCTURE.md` for architecture details
2. Review console logs for error messages
3. Check `.docs/ROADMAP.md` for planned features
4. Contact development team

---

**Last Updated**: January 9, 2026
**Compatible With**: Node.js 18+, npm 9+, Windows 7+
