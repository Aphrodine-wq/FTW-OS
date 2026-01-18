# ⚡ Quick Commands Reference

Copy & paste these commands to quickly build and deploy your enhanced platform.

---

## 🧹 Clean Old Builds

### Windows (PowerShell)
```powershell
cd "c:\Users\burge\OneDrive\Desktop\Invoice Gen"
npm run clean
```

### Windows (CMD)
```cmd
cd c:\Users\burge\OneDrive\Desktop\Invoice Gen
npm run clean
```

### Mac/Linux
```bash
cd ~/path/to/Invoice\ Gen
npm run clean
```

---

## 🔨 Fresh Build

### One-Command Build (Recommended)
```bash
npm run build
```

This automatically:
1. Cleans old builds
2. Compiles TypeScript
3. Builds React app
4. Packages executable
5. Copies to root folder

**Time:** ~2-3 minutes

---

## 🧪 Test the Build

### Run Executable
```bash
"InvoiceForge Pro.exe"
```

### Development Mode (Hot Reload)
```bash
npm run dev
```

---

## 📦 Individual Build Steps

### Just React
```bash
npm run build:react
```

### Just Electron
```bash
npm run build:electron
```

### Lint Check
```bash
npm run lint
```

### Run Tests
```bash
npm run test
```

---

## 🚀 Full Deploy Sequence

```bash
# 1. Clean everything
npm run clean

# 2. Install dependencies
npm install

# 3. Build fresh
npm run build

# 4. Test locally
"InvoiceForge Pro.exe"

# 5. Distribute
# Copy: InvoiceForge Pro.exe to users/distribution folder
```

**Total time:** ~5-10 minutes

---

## 🤖 Setup Ollama AI (Optional)

### Install Ollama
Visit: https://ollama.ai

### Pull Model
```bash
ollama pull neural-chat
```

### Run Server
```bash
ollama serve
```

Server will be at: `http://localhost:11434`

---

## 🧹 Alternative: Use Cleanup Scripts

### Windows PowerShell
```powershell
.\cleanup-old-builds.ps1
```

### Mac/Linux Bash
```bash
chmod +x cleanup-old-builds.sh
./cleanup-old-builds.sh
```

---

## 📊 Check Build Status

### Verify Node
```bash
node --version
npm --version
```

### Check Dependencies
```bash
npm list
```

### Check Build Artifacts
```bash
ls -la dist/
ls -la dist-electron/
```

---

## 🎯 Troubleshooting Commands

### Clear Node Cache
```bash
npm cache clean --force
```

### Reinstall Dependencies
```bash
rm -rf node_modules
npm install
```

### Check TypeScript
```bash
npm run lint
```

### Full Rebuild
```bash
npm run clean
npm install
npm run build
```

---

## 📁 File Locations

### Source Code
```
src/
├── AppWithSplash.tsx (optimized)
├── components/
│   └── layout/PhotonNav.tsx (redesigned)
└── types/invoice.ts (extended)
```

### New Components
```
src/components/modules/core/dashboard/widgets/real/
├── OllamaChat.tsx
└── MapWidget.tsx

src/components/modules/productivity/tasks/
└── TaskListEnhanced.tsx

src/components/modules/finance/expenses/
└── ExpenseManagerEnhanced.tsx
```

### Documentation
```
FINAL_SUMMARY.md (this overview)
QUICKSTART_GUIDE.md (quick start)
INTEGRATION_GUIDE.md (step-by-step)
BUILD_INSTRUCTIONS.md (build details)
DEPLOYMENT_GUIDE.md (deployment)
QUICK_COMMANDS.md (this file)
```

---

## 🎬 Copy-Paste Ready Commands

### Fastest Path to Production
```bash
cd "c:\Users\burge\OneDrive\Desktop\Invoice Gen" && npm run clean && npm run build && echo "✅ Build Complete!"
```

### Development Workflow
```bash
npm run dev
```
(Opens at http://localhost:5173)

### Quick Test After Build
```bash
"InvoiceForge Pro.exe"
```

---

## 📋 Command Descriptions

| Command | What It Does | Time |
|---------|-------------|------|
| `npm run dev` | Live development mode with hot reload | Instant |
| `npm run clean` | Remove all old builds | 2-3s |
| `npm install` | Install/update dependencies | 30-60s |
| `npm run build:react` | Build React app only | 15-30s |
| `npm run build:electron` | Compile Electron main | 5-10s |
| `npm run build` | Full build with packaging | 2-3 min |
| `npm run lint` | Check TypeScript/ESLint | 10-20s |
| `npm run test` | Run unit tests | 30-60s |
| `npm run copy-exe` | Copy executable to root | 1s |

---

## ✅ Verification Steps

After build, verify:

```bash
# 1. Check executable exists
test -f "InvoiceForge Pro.exe" && echo "✅ Executable found"

# 2. Check React build
test -d "dist" && echo "✅ React build found"

# 3. Check Electron build
test -d "dist-electron" && echo "✅ Electron build found"

# 4. Run application
"InvoiceForge Pro.exe"

# 5. Check for errors
# No red errors in console = ✅ Success!
```

---

## 🎯 Pro Tips

### Faster Iteration During Development
```bash
npm run dev
# Code changes auto-reload
# No need to rebuild
```

### Faster Builds (Skip Cleanup)
```bash
npm run build:react && npm run build:electron
# ~1 minute instead of 2-3
```

### Force Fresh Build
```bash
npm run clean && npm install && npm run build
# Full reset, takes longer but most reliable
```

### Watch for Changes
```bash
npm run build:react -- --watch
# Re-builds on file changes
```

---

## 🚨 If Something Goes Wrong

```bash
# Nuclear option - complete reset
rm -rf node_modules dist dist-electron dist_build
npm cache clean --force
npm install
npm run build
```

---

## 📞 Quick Reference

**Command to execute everything:**
```bash
npm run build
```

**Command to test locally:**
```bash
"InvoiceForge Pro.exe"
```

**Command to develop:**
```bash
npm run dev
```

**Command to clean:**
```bash
npm run clean
```

---

**Ready to build? Run:**
```bash
npm run build
```

**Then test:**
```bash
"InvoiceForge Pro.exe"
```

🚀 That's it!
