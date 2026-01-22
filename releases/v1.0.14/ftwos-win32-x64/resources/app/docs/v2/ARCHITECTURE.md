# FTWOS v2 Architecture

FTWOS is built on a modern stack combining web technologies with native desktop capabilities.

## Core Stack
*   **Runtime**: Electron (Main Process) + Chromium (Renderer)
*   **Frontend**: React, TypeScript, TailwindCSS, Framer Motion
*   **State Management**: Zustand (Persist Middleware)
*   **Build Tool**: Vite

## System Bridge (Electron)
The Main Process (`electron/main.ts`) communicates with the Renderer via `ipcMain` and `ipcRenderer`.

### Modules
1.  **File System (`electron/fs-handlers.ts`)**
    *   `fs:ls`: List directory contents with metadata.
    *   `fs:read`: Read file content.
    *   `fs:write`: Write file content.
2.  **Vault (`electron/vault.ts`)**
    *   Secure AES-256 storage for API keys and passwords.
    *   Data stored in `ftw_vault.enc`.
3.  **Mail Engine (`electron/mail.ts`)**
    *   SMTP sending via `nodemailer`.
    *   IMAP fetching via `imap-simple`.
4.  **Terminal (`electron/terminal.ts`)**
    *   Spawns `powershell.exe` (or `bash`) and streams IO to `xterm.js` frontend.

## Data Persistence
*   **User Preferences**: stored in `localStorage` via Zustand persist.
*   **Sensitive Data**: stored in encrypted Vault file.
*   **File Data**: accessed directly from Host OS filesystem.

## Code Splitting & Performance

### Lazy Loading Strategy

FTW-OS implements aggressive code splitting at multiple levels:

1. **Widget-Level Splitting** (`src/lib/widget-loader.ts`)
   - Widgets load on-demand when rendered
   - Preloading for visible widgets
   - Widget-level Suspense boundaries

2. **Module-Level Splitting** (`src/lib/module-preloader.ts`)
   - Modules lazy loaded via React.lazy
   - Prefetching on navigation hover/focus
   - Priority-based preloading system
   - Category-based chunk grouping

3. **Service-Level Splitting** (`src/lib/service-loader.ts`)
   - Services load on-demand
   - Heavy services split into separate chunks
   - Critical services preloaded

4. **Store Initialization** (`src/hooks/useStoreInitialization.ts`)
   - Parallel store loading
   - Dynamic imports to avoid circular dependencies

### Chunk Organization

Vite configuration splits code into optimized chunks:

- **Vendor Chunks**: Split by library (React, Radix UI components, etc.)
- **Module Chunks**: Split by feature category (core, finance, productivity, etc.)
- **Widget Chunks**: Split by widget category (core, api, fun, etc.)
- **Service Chunks**: Heavy services in separate chunks

### Performance Monitoring

The `performance-service.ts` tracks:
- Bundle size
- Chunk load times
- Memory usage
- Performance budgets
- Load time metrics

See `docs/OPTIMIZATION_AUDIT.md` for detailed performance metrics and optimization strategies.

### Best Practices

1. **Widget Loading**:
   ```typescript
   import { getWidgetComponent } from '@/lib/widget-loader'
   const LazyComponent = getWidgetComponent(widgetType)
   ```

2. **Module Preloading**:
   ```typescript
   import { prefetchModule } from '@/lib/module-preloader'
   // Prefetch on hover
   onMouseEnter={() => prefetchModule(moduleId)}
   ```

3. **Service Loading**:
   ```typescript
   import { loadService } from '@/lib/service-loader'
   const service = await loadService('workflow-engine')
   ```

### Performance Budgets

- Initial Load: < 2000ms
- Chunk Load: < 500ms
- Memory Usage: < 150MB
- Bundle Size: < 5MB initial

See `docs/OPTIMIZATION_AUDIT.md` for complete optimization details.
