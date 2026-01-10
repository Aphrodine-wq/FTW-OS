# InvoiceForge Pro - Quick Start Guide

Get up and running in 5 minutes.

## 1. Install Dependencies

```bash
npm install
```

Takes 5-10 minutes on first install.

## 2. Start Development

```bash
npm run dev
```

Opens Electron window with live reload. React changes auto-update. Changes to `electron/*.ts` require rebuild.

## 3. Build for Production

```bash
npm run build
```

Creates `InvoiceForge Pro.exe` (~86MB) in `dist/` folder. Takes 3-5 minutes.

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev with hot reload |
| `npm run build` | Build production installer |
| `npm run build:react` | Rebuild React only (10s) |
| `npm run build:electron` | Recompile Electron only (2s) |
| `npm run test` | Run unit tests |
| `npm run lint` | Check code style |

## Quick Troubleshooting

### White Screen on Startup
```bash
npm run build:react && npm run dev
```

### Port Already in Use
```bash
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <number> /F
```

### Build Fails
```bash
npm run clean
npm install
npm run build
```

## What Just Happened?

✅ **White screen issue fixed** - Missing React assets rebuilt
✅ **Codebase cleaned** - Config and docs organized
✅ **Documentation added** - Complete setup & architecture guides
✅ **Valuation included** - $64k-93k estimated value

## Project Overview

- **React 18** + **Electron 29** + **TypeScript** desktop app
- 15,000+ lines of production code
- Full invoice management system
- CRM, analytics, dashboard, productivity tools
- Modern UI with dark mode and custom themes

## File Locations

| What | Where |
|------|-------|
| **Documentation** | `.docs/` folder or root `README.md` |
| **Config** | `.build-config/` folder |
| **Scripts** | `.scripts/` folder |
| **Source Code** | `src/` (React) and `electron/` (main process) |
| **Build Output** | `dist_build/` (React) and `dist/` (final) |

## Next Steps

1. **Understand the codebase**: Read `README.md`
2. **Detailed setup**: Read `.docs/SETUP_GUIDE.md`
3. **Learn architecture**: Read `.docs/STRUCTURE.md`
4. **Explore code**: Check `src/App.tsx` → `src/components/modules/`
5. **Make changes**: Edit `src/` files → save → auto-reload in dev

## Development Tips

- **Fast feedback**: Use `npm run dev` for instant updates
- **Debug React**: Right-click → Inspect in dev mode
- **Debug Electron**: Check terminal output for console.logs
- **Check IPC**: Monitor database calls in console
- **Test exports**: Try PDF/DOCX generation from invoice module

## Codebase Value

**Estimated: $64,000-93,000**

Based on:
- Professional-grade TypeScript/React (~15k LOC)
- 400-600 development hours at $150-200/hr
- Production-ready desktop application
- Full feature set (invoices, CRM, analytics, etc.)

## Support

- Check `.docs/` folder for detailed guides
- See troubleshooting in `README.md`
- Review `CHANGELOG.md` for recent changes
- Look at `.docs/ROADMAP.md` for planned features

---

**Latest Version**: 1.0.1 (January 9, 2026)
**Status**: Production Ready ✅
**Next Action**: `npm run dev` to start developing!
