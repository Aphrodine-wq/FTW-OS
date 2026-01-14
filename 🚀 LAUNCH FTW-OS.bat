@echo off
REM ============================================
REM   FTW-OS LAUNCHER v1.1.0
REM   Double-click this file to run FTW-OS
REM ============================================

title FTW-OS Launcher

echo.
echo ========================================
echo   FTW-OS - FairTradeWorker OS
echo   Version 1.1.0
echo ========================================
echo.
echo Starting FTW-OS...
echo.

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"

REM Try multiple possible locations for the exe
set "EXE_FOUND=0"

REM Location 1: dist_installer/win-unpacked (most common)
if exist "%SCRIPT_DIR%dist_installer\win-unpacked\FairTradeWorker OS.exe" (
    cd /d "%SCRIPT_DIR%dist_installer\win-unpacked"
    set "EXE_FOUND=1"
    goto :launch
)

REM Location 2: releases/v1.1.0/ftwos-win32-x64
if exist "%SCRIPT_DIR%releases\v1.1.0\ftwos-win32-x64\FairTradeWorker OS.exe" (
    cd /d "%SCRIPT_DIR%releases\v1.1.0\ftwos-win32-x64"
    set "EXE_FOUND=1"
    goto :launch
)

REM Location 3: dist_v1.2.5/win-unpacked
if exist "%SCRIPT_DIR%dist_v1.2.5\win-unpacked\FairTradeWorker OS.exe" (
    cd /d "%SCRIPT_DIR%dist_v1.2.5\win-unpacked"
    set "EXE_FOUND=1"
    goto :launch
)

REM If not found in any location
if "%EXE_FOUND%"=="0" (
    echo.
    echo ========================================
    echo   ERROR: FairTradeWorker OS.exe not found!
    echo ========================================
    echo.
    echo Searched in:
    echo   - dist_installer\win-unpacked\
    echo   - releases\v1.1.0\ftwos-win32-x64\
    echo   - dist_v1.2.5\win-unpacked\
    echo.
    echo Please build the application first:
    echo   npm run build
    echo.
    pause
    exit /b 1
)

:launch
REM Launch the application
start "" "FairTradeWorker OS.exe"

echo.
echo ========================================
echo   FTW-OS launched successfully!
echo ========================================
echo.
echo You can close this window.
echo.

REM Wait 2 seconds then close
timeout /t 2 /nobreak >nul
exit
