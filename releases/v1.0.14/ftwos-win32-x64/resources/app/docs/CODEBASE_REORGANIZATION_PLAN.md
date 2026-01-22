# Codebase Reorganization Plan

## Current Structure Issues

1. **Flat module structure** - All modules in `src/components/modules/` without clear feature boundaries
2. **Mixed concerns** - Components, stores, services, and utilities all at root level
3. **Barrel exports** - Some barrel exports may cause large bundles
4. **Circular dependencies** - Some modules still have potential circular dependency issues

## Proposed New Structure

```
src/
├── core/                    # Core app logic
│   ├── App.tsx
│   ├── main.tsx
│   └── AppWithSplash.tsx
│
├── features/                # Feature modules (renamed from modules/)
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts         # Feature-specific exports
│   ├── finance/
│   │   ├── invoices/
│   │   ├── expenses/
│   │   └── index.ts
│   ├── productivity/
│   │   ├── tasks/
│   │   ├── projects/
│   │   └── index.ts
│   └── ...
│
├── shared/                  # Shared code
│   ├── components/          # Shared UI components
│   │   ├── ui/              # Base UI components
│   │   ├── layout/          # Layout components
│   │   └── empty-states/
│   ├── hooks/                # Shared hooks
│   ├── lib/                 # Utilities and helpers
│   │   ├── utils.ts
│   │   ├── module-router.tsx
│   │   ├── module-preloader.ts
│   │   ├── widget-loader.ts
│   │   └── service-loader.ts
│   └── stores/              # Zustand stores
│
├── infrastructure/          # Infrastructure code
│   ├── services/            # Business logic services
│   └── electron/           # Electron-specific code
│
└── widgets/                 # Widget components
    ├── core/
    ├── api/
    ├── fun/
    └── revolutionary/
```

## Migration Strategy

### Phase 1: Create Feature Index Files (Low Risk)
- Create `index.ts` files for each feature module
- Export only what's needed
- Update imports gradually

### Phase 2: Move Shared Code (Medium Risk)
- Move shared components to `shared/components/`
- Move shared hooks to `shared/hooks/`
- Update imports

### Phase 3: Reorganize Features (Higher Risk)
- Move modules to `features/` directory
- Update all imports
- Test thoroughly

### Phase 4: Move Infrastructure (Low Risk)
- Move services to `infrastructure/services/`
- Move electron code to `infrastructure/electron/`

## Benefits

1. **Clearer boundaries** - Features are self-contained
2. **Better code splitting** - Features can be split more easily
3. **Easier maintenance** - Related code is grouped together
4. **Reduced circular dependencies** - Clear dependency hierarchy

## Implementation Notes

- Use TypeScript path aliases to maintain compatibility during migration
- Update Vite config to support new structure
- Update imports incrementally
- Test after each phase

## Current Status

- ✅ Created widget-loader.ts (shared/lib)
- ✅ Created module-preloader.ts (shared/lib)
- ✅ Created service-loader.ts (shared/lib)
- ⏳ Full reorganization pending (requires careful migration)

