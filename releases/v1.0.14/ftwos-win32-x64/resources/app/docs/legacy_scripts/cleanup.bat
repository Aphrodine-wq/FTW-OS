@echo off
echo ===================================================
echo InvoiceForge Pro - Advanced Cleanup Script
echo ===================================================
echo.
echo This script will remove redundant build folders and temporary files.
echo Please ensure InvoiceForge Pro is CLOSED before proceeding.
echo.
pause

echo Cleaning up redundant build directories...
if exist "_deleted_builds" rmdir /s /q "_deleted_builds"
if exist "build_clean" rmdir /s /q "build_clean"
if exist "build_output" rmdir /s /q "build_output"
if exist "build_release" rmdir /s /q "build_release"
if exist "build_v2" rmdir /s /q "build_v2"
if exist "dist_final" rmdir /s /q "dist_final"
if exist "dist_new" rmdir /s /q "dist_new"
if exist "dist_out" rmdir /s /q "dist_out"
if exist "dist_build" rmdir /s /q "dist_build"

echo.
echo Cleaning up legacy source files...
if exist "src\lib" rmdir /s /q "src\lib"

echo.
echo Attempting to remove problematic 'nul' file...
if exist "nul" del /f /q "\\?\%~dp0nul"

echo.
echo Cleanup complete!
echo You can now run 'npm run build' to generate a fresh version.
echo.
pause
