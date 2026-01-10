#!/bin/bash

# Bash Script: Cleanup Old Builds and Prepare for Fresh Build
# This script removes all old build artifacts and prepares for a clean rebuild

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         InvoiceForge Pro - Old Build Cleanup Script           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Get current directory
PROJECT_PATH=$(pwd)
echo "📁 Project Path: $PROJECT_PATH"
echo ""

# Define directories to remove
DIRS_TO_REMOVE=("dist" "dist-electron" "dist_build" "dist_new")

echo "🧹 Cleaning old build directories..."
echo ""

REMOVED_COUNT=0
SKIPPED_COUNT=0

for dir in "${DIRS_TO_REMOVE[@]}"; do
    FULL_PATH="$PROJECT_PATH/$dir"

    if [ -d "$FULL_PATH" ]; then
        echo "  ❌ Removing: $dir"
        rm -rf "$FULL_PATH"
        if [ $? -eq 0 ]; then
            ((REMOVED_COUNT++))
            echo "     ✅ Success!"
        else
            echo "     ⚠️  Failed to remove"
            ((SKIPPED_COUNT++))
        fi
    else
        echo "  ⏭️  Skipped: $dir (doesn't exist)"
        ((SKIPPED_COUNT++))
    fi
done

echo ""
echo "📊 Summary:"
echo "  ✅ Removed: $REMOVED_COUNT directories"
echo "  ⏭️  Skipped: $SKIPPED_COUNT directories"
echo ""

# Optional: Clear npm cache
read -p "🔄 Clear npm cache? (y/n) " response
if [[ "$response" == "y" || "$response" == "Y" ]]; then
    echo "  Clearing npm cache..."
    npm cache clean --force
    echo "  ✅ Cache cleared!"
    echo ""
fi

# Check node_modules
echo "📦 Check node_modules status..."
if [ -d "node_modules" ]; then
    NM_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo "  Current size: $NM_SIZE"
    echo ""
    read -p "🔄 Reinstall node_modules? (y/n) " response
    if [[ "$response" == "y" || "$response" == "Y" ]]; then
        echo "  Removing node_modules..."
        rm -rf node_modules
        echo "  ✅ Removed!"
        echo ""
        echo "  Installing dependencies..."
        npm install
        echo "  ✅ Dependencies installed!"
    fi
else
    echo "  ⏭️  node_modules not found - will be installed with next npm command"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     Ready for Fresh Build!                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Run: npm run build"
echo "  2. Wait for build to complete (~2-3 minutes)"
echo "  3. Test: ./dist/InvoiceForge Pro (or .exe on Windows)"
echo ""
