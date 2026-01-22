# FTW-OS Quick Start Guide

## 🚀 Quick Installation

### Option 1: Run Setup (Recommended)
Simply double-click **FTW-OS-Setup.exe** in the root folder to run the latest build.

### Option 2: Build from Source
```bash
npm run build
```
This will:
1. Build the application
2. Package it for Windows
3. Automatically copy the executable to `FTW-OS-Setup.exe` in the root folder

---

## 📦 Build Commands

### Full Build (Creates Setup.exe)
```bash
npm run build
```
- Compiles TypeScript
- Builds React with Vite
- Packages with Electron
- Creates `FTW-OS-Setup.exe` in root folder
- Output: `releases/v1.0.9/ftwos-win32-x64/`

### Create Setup Only (From Existing Build)
```bash
npm run create-setup
```
- Copies latest build to `FTW-OS-Setup.exe`
- No rebuild required
- Fast for testing

### Development Mode
```bash
npm run dev
```
- Hot reload enabled
- Opens at http://localhost:5173
- Electron window launches automatically

---

## 📁 File Locations

### Setup Executable
- **Location**: `FTW-OS-main/FTW-OS-Setup.exe`
- **Auto-updated**: Yes, after every `npm run build`
- **Version**: Always matches latest build

### Full Release
- **Location**: `FTW-OS-main/releases/v1.0.9/ftwos-win32-x64/`
- **Contains**: Full unpacked application
- **Portable**: Yes, can be copied anywhere

---

## 🔧 Troubleshooting

### Setup.exe Not Found
```bash
npm run create-setup
```

### Build Fails
```bash
npm run clean
npm install
npm run build
```

### App Won't Start
1. Close all running instances
2. Delete `%APPDATA%/ftwos` folder
3. Run `FTW-OS-Setup.exe` again

---

## 📊 What's New in v1.0.9

✅ Fixed "Cannot access 'A' before initialization" error
✅ Added 3 new API widgets (Weather, Crypto, News)
✅ Improved dashboard layout
✅ Auto-updating setup.exe in root folder
✅ Enhanced widget overflow handling

---

## 🎯 Next Steps

1. Run `FTW-OS-Setup.exe`
2. Explore the dashboard
3. Add widgets from the Widget Library
4. Customize your layout
5. Check out the new API widgets!

---

**Version**: 1.0.9  
**Last Updated**: January 2025  
**Status**: Production Ready ✅
