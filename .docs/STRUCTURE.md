# InvoiceForge Pro - Project Structure

## Overview
InvoiceForge Pro is a desktop invoicing application built with Electron, React, and TypeScript.

## Directory Structure

```
Invoice Gen/
├── src/                          # React Frontend Source
│   ├── components/
│   │   ├── layout/              # Layout components (TopNav, CommandPalette)
│   │   ├── modules/             # Feature modules
│   │   │   ├── core/            # Dashboard, Settings
│   │   │   ├── finance/         # Invoices, Expenses, Products
│   │   │   ├── crm/             # Clients, Leads Pipeline
│   │   │   ├── productivity/    # Tasks, Time Tracker, Documents
│   │   │   └── intelligence/    # AI Integration
│   │   ├── ui/                  # Reusable Radix UI Components
│   │   └── ErrorBoundary.tsx
│   ├── stores/                  # Zustand State Management
│   │   ├── invoice-store.ts
│   │   ├── settings-store.ts
│   │   ├── template-store.ts
│   │   └── template-registry.ts
│   ├── services/                # Business Logic & Utilities
│   │   ├── generator/           # Invoice generation logic
│   │   └── parser/              # Data parsing utilities
│   ├── hooks/                   # Custom React Hooks
│   │   └── useInvoice.ts
│   ├── types/                   # TypeScript Type Definitions
│   │   └── invoice.ts
│   ├── config/                  # Configuration Files
│   ├── constants/               # Application Constants
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── seed-data.ts             # Initial data for development
│   └── vite-env.d.ts
│
├── electron/                    # Electron Main Process
│   ├── database/                # Database Migrations
│   │   └── migrations/
│   ├── main.ts                  # Electron entry point
│   ├── preload.ts               # Context isolation bridge
│   ├── storage.ts               # Local storage handler
│   ├── supabase.ts              # Database integration
│   ├── tracker.ts               # Activity tracking
│   └── tsconfig.json
│
├── dist/                        # Production Build Output
│   ├── .icon-ico/
│   ├── assets/
│   ├── win-unpacked/            # Electron app binary
│   └── InvoiceForge Pro 1.0.0.exe
│
├── dist-electron/               # Compiled Electron Code (JS)
│   ├── main.js
│   ├── preload.js
│   ├── storage.js
│   ├── supabase.js
│   └── tracker.js
│
├── resources/                   # Static Assets
│   └── icons/
│       ├── icon.ico
│       ├── icon.png
│       └── icon.svg
│
├── scripts/                     # Build & Utility Scripts
│   └── create-icon.js
│
├── tests/                       # Test Files (placeholder for future tests)
│
├── .trae/                       # AI Assistant Documentation (26 files)
│   └── documents/
│
├── .idea/                       # JetBrains IDE Configuration
│
├── Configuration Files
│   ├── electron-builder.yml
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── Launch InvoiceForge.bat      # Launch Script
└── InvoiceForge Pro.exe         # Main Application Executable

```

## Key Improvements Made

### Deleted Redundant Directories
- ❌ `build_clean/` (187 MB)
- ❌ `build_output/` (182 MB)
- ❌ `build_release/` (182 MB)
- ❌ `build_v2/` (182 MB)
- ❌ `dist/` (359 MB)
- ❌ `.zencoder/` (empty)
- ❌ `.zenflow/` (empty)

**Total Disk Space Freed: ~1.1 GB**

### Cleaned Up Empty Directories
- ❌ `electron/ipc/` (empty placeholder)
- ❌ `electron/utils/` (empty placeholder)
- ❌ `src/utils/` (empty placeholder)

### Organized Structure
- ✅ Moved `database/` → `electron/database/` (keeps backend resources together)
- ✅ Moved `core/templates` → `src/core/templates` (keeps frontend assets with frontend)
- ✅ Consolidated `lib/` utilities (removed redundant directory)
- ✅ Created `src/config/` directory for configuration files
- ✅ Created `src/constants/` directory for application constants
- ✅ Restructured `tests/` as placeholder for future test implementation

## Architecture

### Frontend (React + TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Library**: Radix UI
- **Version**: React 18.2.0

### Backend (Electron)
- **Framework**: Electron 29.1.0
- **Database**: Supabase
- **IPC Communication**: Preload bridge for context isolation
- **Storage**: Local filesystem + Supabase

### Dependencies Highlight
- jsPDF & html2canvas (PDF generation)
- Puppeteer (rendering)
- Twilio (SMS integration)
- Supabase (Backend)

## Development Workflow

1. **Frontend Development**: Edit files in `src/`
2. **Backend Development**: Edit files in `electron/`
3. **Building**: `npm run build` generates `build/` directory
4. **Distribution**: Built executable in `build/`

## File Organization Best Practices

- **Components**: Organized by feature/module in `src/components/modules/`
- **Business Logic**: In `src/services/`
- **State**: Centralized in `src/stores/`
- **Types**: Single `src/types/invoice.ts` for type definitions
- **Styles**: Global styles in `src/index.css`, component styles with Tailwind classes
- **Assets**: Icons in `resources/icons/`

---

**Project**: InvoiceForge Pro v1.0.0  
**Last Updated**: 2026-01-08
