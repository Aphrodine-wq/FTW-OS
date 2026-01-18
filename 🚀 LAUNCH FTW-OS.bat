@echo off
REM ============================================
REM   FTW-OS LAUNCHER
REM   Development Mode Launcher
REM   Double-click this file to run FTW-OS
REM ============================================

title FTW-OS Launcher

echo.
echo ========================================
echo   FTW-OS - FairTradeWorker OS
echo   Development Mode Launcher
echo ========================================
echo.

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Check if we're in development mode (source files exist)
if exist "src" if exist "electron" if exist "package.json" (
    echo [DEV MODE] Source files detected
    echo.
    echo Starting development launcher...
    echo This will:
    echo   - Watch for file changes
    echo   - Auto-rebuild when files change
    echo   - Launch Electron with latest build
    echo.
    echo Press Ctrl+C to stop
    echo.
    
    REM Check if node_modules exists
    if not exist "node_modules" (
        echo.
        echo Installing dependencies...
        call npm install
        if errorlevel 1 (
            echo.
            echo ERROR: Failed to install dependencies
            pause
            exit /b 1
        )
    )
    
    REM Run the auto-update launcher
    call npm run dev:auto
    
    exit /b 0
) else (
    echo.
    echo ========================================
    echo   ERROR: Source files not found!
    echo ========================================
    echo.
    echo This launcher requires:
    echo   - src/ folder
    echo   - electron/ folder
    echo   - package.json
    echo.
    echo Please ensure you're running this from the
    echo FTW-OS project root directory.
    echo.
    pause
    exit /b 1
)
