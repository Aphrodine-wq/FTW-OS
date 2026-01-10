@echo off
REM ============================================================================
REM InvoiceForge Pro - Smart Launcher v2.0
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0\.."

REM Configuration
set APP_NAME=InvoiceForge Pro
set APP_EXE=%CD%\InvoiceForge Pro.exe
set LOG_FILE=%CD%\.scripts\launch.log

REM ============================================================================
REM Clear screen and show header
REM ============================================================================
cls
echo.
echo ============================================================================
echo                    %APP_NAME% - Smart Launcher v2.0
echo ============================================================================
echo.

REM ============================================================================
REM Check if app already running
REM ============================================================================
tasklist /FI "IMAGENAME=InvoiceForge Pro.exe" 2>nul | find /I /N "InvoiceForge Pro.exe" >nul
if %errorlevel%==0 (
    echo [*] Application is already running!
    echo.
    echo Exiting launcher...
    timeout /t 2 /nobreak >nul
    exit /b 0
)

REM ============================================================================
REM Check if executable exists
REM ============================================================================
if not exist "%APP_EXE%" (
    echo [ERROR] Application executable not found!
    echo Path: %APP_EXE%
    echo.
    echo To fix:
    echo 1. Run: npm run build
    echo 2. Or restore from backup: InvoiceForge Pro.exe.old
    echo.
    pause
    exit /b 1
)

REM ============================================================================
REM Launch application
REM ============================================================================
echo [*] Launching %APP_NAME%...
echo [*] Executable: %APP_EXE%
echo.

start "" "%APP_EXE%"

if errorlevel 1 (
    echo [ERROR] Failed to launch application!
    echo Please check the executable file exists and is not corrupted.
    echo.
    pause
    exit /b 1
)

REM ============================================================================
REM Success
REM ============================================================================
echo [+] %APP_NAME% launched successfully!
echo.
echo Closing launcher in 3 seconds...
timeout /t 3 /nobreak >nul

exit /b 0
