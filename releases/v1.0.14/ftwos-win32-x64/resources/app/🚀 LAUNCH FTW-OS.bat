@echo off
REM ============================================
REM   FTW-OS LAUNCHER (AUTO-UPDATE)
REM   Development Mode Launcher
REM   Double-click this file to run FTW-OS
REM ============================================

title FTW-OS Launcher

echo.
echo ========================================
echo   FTW-OS - FairTradeWorker OS
echo   Status: Checking for updates...
echo ========================================
echo.

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM ============================================
REM   AUTO-UPDATE STEP
REM ============================================
echo [UPDATE] Pulling latest changes from git...
git pull
if errorlevel 1 (
    echo.
    echo [WARNING] Git pull failed. Continuing with local version...
    echo.
) else (
    echo [UPDATE] Git pull complete.
    echo.
)

REM ============================================
REM   DEPENDENCY CHECK
REM ============================================
if exist "package.json" (
    echo [DEV MODE] Source files detected
    
    REM Check if node_modules exists
    if not exist "node_modules" (
        echo.
        echo [SETUP] Installing dependencies...
        call npm install
        if errorlevel 1 (
            echo.
            echo ERROR: Failed to install dependencies
            pause
            exit /b 1
        )
    )
    
    echo.
    echo [BOOT] Starting system...
    echo.
    
    REM Run the auto-update launcher
    call npm run dev:auto
    
    exit /b 0
) else (
    echo.
    echo ERROR: package.json not found!
    echo Please ensure you're running this from the project root.
    pause
    exit /b 1
)
