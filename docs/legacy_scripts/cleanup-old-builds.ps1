# PowerShell Script: Cleanup Old Builds and Prepare for Fresh Build
# This script removes all old build artifacts and prepares for a clean rebuild

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         InvoiceForge Pro - Old Build Cleanup Script           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$projectPath = Get-Location
Write-Host "📁 Project Path: $projectPath" -ForegroundColor Yellow
Write-Host ""

# Define directories to remove
$dirsToRemove = @(
    "dist",
    "dist-electron",
    "dist_build",
    "dist_new"
)

Write-Host "🧹 Cleaning old build directories..." -ForegroundColor Yellow
Write-Host ""

$removedCount = 0
$skippedCount = 0

foreach ($dir in $dirsToRemove) {
    $fullPath = Join-Path $projectPath $dir

    if (Test-Path $fullPath) {
        try {
            Write-Host "  ❌ Removing: $dir" -ForegroundColor Red
            Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
            $removedCount++
            Write-Host "     ✅ Success!" -ForegroundColor Green
        }
        catch {
            Write-Host "     ⚠️  Failed to remove: $_" -ForegroundColor Yellow
            $skippedCount++
        }
    }
    else {
        Write-Host "  ⏭️  Skipped: $dir (doesn't exist)" -ForegroundColor Gray
        $skippedCount++
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Removed: $removedCount directories" -ForegroundColor Green
Write-Host "  ⏭️  Skipped: $skippedCount directories" -ForegroundColor Gray
Write-Host ""

# Optional: Clear npm cache
Write-Host "🔄 Clear npm cache? (y/n)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "  Clearing npm cache..." -ForegroundColor Yellow
    npm cache clean --force
    Write-Host "  ✅ Cache cleared!" -ForegroundColor Green
    Write-Host ""
}

# Check node_modules
Write-Host "📦 Check node_modules status..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    $nmSize = (Get-ChildItem -Path "node_modules" -Recurse | Measure-Object -Sum Length).Sum / 1GB
    Write-Host "  Current size: $($nmSize.ToString('F2')) GB" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔄 Reinstall node_modules? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "  Removing node_modules..." -ForegroundColor Yellow
        Remove-Item -Path "node_modules" -Recurse -Force
        Write-Host "  ✅ Removed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Installing dependencies..." -ForegroundColor Yellow
        npm install
        Write-Host "  ✅ Dependencies installed!" -ForegroundColor Green
    }
}
else {
    Write-Host "  ⏭️  node_modules not found - will be installed with next npm command" -ForegroundColor Gray
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                     Ready for Fresh Build!                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "  1. Run: npm run build" -ForegroundColor Green
Write-Host "  2. Wait for build to complete (~2-3 minutes)" -ForegroundColor Green
Write-Host "  3. Test: .\InvoiceForge Pro.exe" -ForegroundColor Green
Write-Host ""
