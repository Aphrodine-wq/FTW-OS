const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[FTW-OS Installer] Starting installer build process...');

try {
  // Step 1: Build the Vite app
  console.log('[FTW-OS Installer] Step 1: Building Vite app...');
  execSync('npm exec vite build', { stdio: 'inherit' });

  // Step 2: Compile TypeScript for Electron
  console.log('[FTW-OS Installer] Step 2: Compiling Electron TypeScript...');
  execSync('npm exec tsc -- -p electron/tsconfig.json', { stdio: 'inherit' });

  // Step 3: Build installer with electron-builder
  console.log('[FTW-OS Installer] Step 3: Building Windows installer...');
  execSync('npm exec electron-builder --win --config electron-builder.json', { stdio: 'inherit' });

  // Step 4: Copy setup.exe to root
  console.log('[FTW-OS Installer] Step 4: Copying installer to root...');
  const installerDir = path.join(__dirname, '..', 'dist_installer');
  const rootDir = path.join(__dirname, '..');
  
  // Find the setup file
  const files = fs.readdirSync(installerDir);
  const setupFile = files.find(f => f.endsWith('.exe'));
  
  if (setupFile) {
    const sourcePath = path.join(installerDir, setupFile);
    const destPath = path.join(rootDir, 'FTW-OS-Setup.exe');
    
    fs.copyFileSync(sourcePath, destPath);
    console.log(`[FTW-OS Installer] ✅ Installer copied to: ${destPath}`);
    console.log('[FTW-OS Installer] ---------------------------------------------------');
    console.log('[FTW-OS Installer] SUCCESS! Setup file is ready in the root folder.');
    console.log('[FTW-OS Installer] File: FTW-OS-Setup.exe');
    console.log('[FTW-OS Installer] ---------------------------------------------------');
  } else {
    console.error('[FTW-OS Installer] ❌ Setup file not found in dist_installer');
  }

} catch (error) {
  console.error('[FTW-OS Installer] ❌ Build failed:', error.message);
  process.exit(1);
}
