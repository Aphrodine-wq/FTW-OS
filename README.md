# FTWOS

The Full System designed to run your dev company. Built with Electron, React, and TypeScript.

## Overview

FTWOS is a comprehensive operating system for development companies. It unifies project management, invoicing, CRM, financial analytics, and productivity tools into a single, sleek desktop environment.

### Key Features

- **Dashboard**: Real-time widgets tracking revenue, outstanding invoices, and key metrics
- **Invoice Management**: Create, edit, and export invoices in multiple formats (PDF, DOCX, CSV)
- **CRM System**: Manage clients, contacts, and relationships
- **Financial Analytics**: Charts, reports, and financial metrics
- **Productivity Suite**: Advanced Task management with List/Board views, Kanban boards, and activity tracking
- **Integrations**: Live data from Spotify, Steam, GitHub, and System Health
- **Themes**: Monochrome and Glass themes with full customization
- **Local & Cloud Storage**: Local JSON storage with optional Supabase integration
- **Dark Mode**: Full light/dark mode support with system preference detection
- **Performance**: Optimized build system with chunk splitting and memoized rendering

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Desktop Framework** | Electron 29.1.0 |
| **Frontend Framework** | React 18.2.0 + TypeScript |
| **Build Tool** | Vite 5.1.4 |
| **Styling** | Tailwind CSS 3.4.1 + Radix UI |
| **State Management** | Zustand 4.5.1 |
| **Package Tool** | Electron Builder 24.13.3 |
| **Backend/DB** | Supabase (optional) + Local JSON |
| **Charts & Viz** | Recharts 3.6.0 |
| **Export** | jsPDF 4.0.0, html2canvas 1.4.1, docx 8.5.0 |

## Project Structure

```
FTWOS/
├── src/                          # React Frontend (TypeScript)
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component with initialization
│   ├── index.css                 # Global Tailwind styles
│   ├── components/
│   │   ├── layout/               # Navigation, sidebars, topbar
│   │   ├── modules/              # Feature modules (Dashboard, Finance, CRM, Productivity)
│   │   └── ui/                   # Reusable UI components
│   ├── stores/                   # Zustand state stores
│   ├── services/                 # Business logic & API calls
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript type definitions
│   ├── styles/                   # Theme and CSS modules
│   └── constants/                # Configuration constants
│
├── electron/                     # Electron Main Process (TypeScript)
│   ├── main.ts                   # App entry point & window management
│   ├── preload.ts                # IPC context bridge (security)
│   ├── storage.ts                # IPC handlers for data persistence
│   ├── supabase.ts               # Optional cloud integration
│   ├── tracker.ts                # Activity tracking
│   ├── system.ts                 # System utilities
│   └── integrations.ts           # External API integrations
│
├── dist_build/                   # Compiled React frontend (Vite output)
│   ├── index.html                # Prod HTML with asset references
│   └── assets/                   # Minified JS & CSS bundles
│
├── dist-electron/                # Compiled Electron main process (TypeScript output)
│   ├── main.js
│   ├── preload.js
│   └── ...
│
├── dist/                         # Electron Builder final packages
│   └── FTWOS 1.0.0.exe
│
├── .build-config/                # Build configuration files
│   ├── electron-builder.yml      # Electron packager config
│   └── legacy-*                  # Legacy build outputs
│
├── .docs/                        # Documentation & design files
│
├── .scripts/                     # Utility scripts (legacy)
│   ├── cleanup.bat
│   └── Launch.bat
│
├── package.json                  # Dependencies & npm scripts
├── vite.config.ts                # Vite build configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── tsconfig.json                 # React TypeScript config
└── tsconfig.node.json            # Node TypeScript config

```

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Windows 7+ (for production builds)

### Installation

```bash
# Install dependencies
npm install

# Start development mode (React + Electron)
npm run dev

# Build for production
npm run build
```

### Available Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build React frontend + Electron main + package executable |
| `npm run build:react` | Build only React frontend |
| `npm run build:electron` | Compile only Electron TypeScript |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:e2e` | Run end-to-end tests with Playwright |
| `npm run lint` | Check code with ESLint |

## Development

### Startup Sequence

1. **Electron Main Process** (`electron/main.ts`)
   - Sets up IPC handlers for data persistence
   - Creates frameless window (1400x900px)
   - Loads React app from Vite dev server (`http://localhost:5173`)

2. **React Application** (`src/main.tsx`)
   - Renders root component with error boundary
   - Initializes Zustand stores
   - Loads settings from Electron storage

3. **App Component** (`src/App.tsx`)
   - Restores theme preferences
   - Injects seed data if database is empty
   - Renders main UI with all modules

### IPC Communication

The app uses **Electron preload script** for secure IPC:

```typescript
// In React components:
await window.ipcRenderer.invoke('db:get-settings')
await window.ipcRenderer.invoke('db:save-invoice', invoiceData)

// IPC handlers in electron/storage.ts handle all database operations
```

### State Management

Zustand stores with localStorage persistence:

- **Theme Store**: UI theme, dark mode, background effects
- **Settings Store**: User preferences, integrations
- **Invoice Store**: All invoices with filtering/sorting
- **Client Store**: Client database
- **Widget Store**: Dashboard widget configuration

### File Storage

Local data stored in: `%APPDATA%\FTWOS\data\`

- `settings.json`
- `invoices.json`
- `clients.json`
- `leads.json`
- `tasks.json`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Private - All rights reserved

## Support

For issues or feature requests, open an issue on GitHub or contact the FTWOS development team.

## Changelog

### Version 1.0.0 (Current)
- Initial release as FTWOS
- Full invoice management system
- CRM and client database
- Financial analytics and reporting
- Dashboard with customizable widgets
- Multiple export formats
- Dark mode and theming
- Local and cloud storage support

---

**Last Updated**: January 9, 2026
**Project Status**: Production Ready
**Maintainers**: FTWOS Team
