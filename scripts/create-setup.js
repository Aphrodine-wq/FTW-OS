const fs = require('fs');
const path = require('path');

console.log('[Setup Creator] Creating FTW-OS-Setup.exe in root...');

try {
  // Find the latest release
  const releasesDir = path.join(__dirname, '..', 'releases');
  const versions = fs.readdirSync(releasesDir).filter(f => f.startsWith('v'));
  
  if (versions.length === 0) {
    console.error('[Setup Creator] No releases found. Run "npm run build" first.');
    process.exit(1);
  }
  
  // Get the latest version
  const latestVersion = versions.sort().reverse()[0];
  const releaseDir = path.join(releasesDir, latestVersion);
  
  // Find the ftwos-win32-x64 folder
  const folders = fs.readdirSync(releaseDir);
  const appFolder = folders.find(f => f.includes('win32-x64'));
  
  if (!appFolder) {
    console.error('[Setup Creator] No win32-x64 folder found in release.');
    process.exit(1);
  }
  
  // Find the .exe file
  const appPath = path.join(releaseDir, appFolder);
  const files = fs.readdirSync(appPath);
  const exeFile = files.find(f => f.endsWith('.exe'));
  
  if (!exeFile) {
    console.error('[Setup Creator] No .exe file found in release.');
    process.exit(1);
  }
  
  // Copy to root as FTW-OS-Setup.exe
  const sourcePath = path.join(appPath, exeFile);
  const destPath = path.join(__dirname, '..', 'FTW-OS-Setup.exe');
  
  fs.copyFileSync(sourcePath, destPath);
  
  console.log(`[Setup Creator] ✅ Success!`);
  console.log(`[Setup Creator] Source: ${sourcePath}`);
  console.log(`[Setup Creator] Destination: FTW-OS-Setup.exe`);
  console.log(`[Setup Creator] Version: ${latestVersion}`);
  
} catch (error) {
  console.error('[Setup Creator] Error:', error.message);
  process.exit(1);
}
