const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    red: "\x1b[31m"
};

function log(message, type = 'info') {
    const color = type === 'success' ? colors.green 
        : type === 'warning' ? colors.yellow 
        : type === 'error' ? colors.red 
        : colors.cyan;
    console.log(`${color}${colors.bright}[FTWOS Deploy] ${message}${colors.reset}`);
}

function killProcess(processName) {
    try {
        execSync(`taskkill /F /IM "${processName}" /T`, { stdio: 'ignore' });
        log(`Stopped running process: ${processName}`, 'warning');
    } catch (e) {
        // Ignore error if process wasn't running
    }
}

try {
    // 1. Read Package Version
    const packageJson = require('../package.json');
    const version = packageJson.version;
    log(`Starting deployment for version ${version}...`);

    // 1.5. Ensure Clean State (Kill Running Processes)
    log('Checking for running instances...');
    killProcess('FTWOS.exe');
    killProcess(`FTWOS ${version}.exe`);
    killProcess('electron.exe');
    // Also kill legacy names just in case
    killProcess('InvoiceForge Pro.exe'); 

    // Wait for processes to fully release locks
    log('Waiting for file locks to release...');
    execSync('powershell -Command "Start-Sleep -Seconds 3"', { stdio: 'inherit' });

    // 1.8. Manual Clean Strategy (Handle Locked Folders)
    log('Cleaning build directories...');
    const foldersToClean = ['dist-electron', 'dist_build'];
    foldersToClean.forEach(folder => {
        const p = path.join(__dirname, '..', folder);
        if (fs.existsSync(p)) {
            try {
                fs.rmSync(p, { recursive: true, force: true });
            } catch (e) {
                log(`Failed to clean ${folder}: ${e.message}`, 'warning');
            }
        }
    });

    // Handle dist_ftwos specially (Rename if locked)
    const distFinal = path.join(__dirname, '..', 'dist_ftwos');
    if (fs.existsSync(distFinal)) {
        try {
            // Try simple delete first
            fs.rmSync(distFinal, { recursive: true, force: true });
        } catch (e) {
            log(`Could not delete dist_ftwos (${e.message}). Attempting to move aside...`, 'warning');
            try {
                const trashPath = path.join(__dirname, '..', `dist_ftwos_trash_${Date.now()}`);
                fs.renameSync(distFinal, trashPath);
                log(`Moved locked dist_ftwos to ${trashPath}`, 'success');
            } catch (moveErr) {
                log(`CRITICAL: Could not move dist_ftwos. Build might fail if files are locked.`, 'error');
            }
        }
    }

    // 2. Run Build (Using a unique output directory to bypass locks)
    const buildId = Date.now();
    const tempOutputDir = `dist_temp_${buildId}`;
    log(`Running build process... (Output: ${tempOutputDir})`);
    
    // We override the output directory in the command line
    // Note: We need to escape the quotes for the shell if needed, but simple strings usually work.
    // For Windows PowerShell/CMD, passing arguments can be tricky.
    // We will use the -c.directories.output option.
    
    try {
        execSync(`tsc -p electron/tsconfig.json && vite build && electron-builder --config .build-config/electron-builder.yml -c.directories.output=${tempOutputDir}`, { stdio: 'inherit' });
        log('Build completed successfully.', 'success');

        // 3. Locate the Executable in the NEW directory
        const distDir = path.join(__dirname, '..', tempOutputDir);
        const destPath = path.join(__dirname, '..', 'FTWOS_v2.exe');
        
        const builtExeName = fs.readdirSync(distDir).find(f => f.endsWith('.exe'));

        if (!builtExeName) throw new Error('No .exe found in build output!');
        
        const sourcePath = path.join(distDir, builtExeName);

        //// 4. Copy to Root
    log(`Copying ${builtExeName} to root as FTWOS_v2.exe...`);
    
    // Force aggressive replacement
    try {
        // If destination exists, try to delete it
        if (fs.existsSync(destPath)) {
            try {
                fs.unlinkSync(destPath);
                log('Deleted old FTWOS_v2.exe', 'info');
            } catch (e) {
                // If we can't delete (locked), rename it out of the way
                const trashName = `FTWOS_v2.exe.trash.${Date.now()}`;
                const trashPath = path.join(__dirname, '..', trashName);
                fs.renameSync(destPath, trashPath);
                log(`Locked FTWOS_v2.exe moved to ${trashName}`, 'warning');
            }
        }
        
        // Copy the new one
        fs.copyFileSync(sourcePath, destPath);
        log('Deployment successful! FTWOS_v2.exe is updated.', 'success');
        
    } catch (err) {
        log(`CRITICAL FAILURE: ${err.message}`, 'error');
        log('MANUAL ACTION REQUIRED: Copy the following file to your root folder manually:', 'warning');
        log(sourcePath, 'warning');
        process.exit(1);
    }

        // 5. Cleanup (Best Effort)
        log('Cleaning up temporary build files...');
        try {
            // Try to delete the temp dir we just created (after copy)
            // But wait, win-unpacked might be locked now if it auto-launched?
            // Usually safe to delete if we just built it.
            // But we might want to keep it for debugging or if the user wants "unpacked"
            // For now, let's leave it or try to delete old ones.
            
            // Let's try to delete old dist_ftwos if possible, just to be tidy
            const oldDist = path.join(__dirname, '..', 'dist_ftwos');
            if (fs.existsSync(oldDist)) {
                 try { fs.rmSync(oldDist, { recursive: true, force: true }); } catch (e) {}
            }
        } catch (e) {
            // Ignore cleanup errors
        }

    } catch (buildError) {
        throw buildError;
    }

} catch (error) {
    log(`Deployment failed: ${error.message}`, 'error');
    process.exit(1);
}
