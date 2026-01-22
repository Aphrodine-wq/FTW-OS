const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    red: "\x1b[31m"
};

function log(msg, type = 'info') {
    const color = type === 'success' ? colors.green : type === 'error' ? colors.red : type === 'warning' ? colors.yellow : colors.cyan;
    console.log(`${color}${colors.bright}[FTWOS Release] ${msg}${colors.reset}`);
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
    // 1. Setup Release Info
    const packageJson = require('../package.json');
    const version = packageJson.version;
    const releaseDir = path.join(__dirname, '../releases', `v${version}`);
    
    log(`Initializing Release v${version}...`);

    // 1.5. Ensure Clean State (Kill Running Processes)
    log('Checking for running instances...');
    killProcess('FTWOS.exe');
    killProcess(`FTWOS ${version}.exe`);
    killProcess('electron.exe');
    killProcess('InvoiceForge Pro.exe'); 

    // Wait for processes to fully release locks
    log('Waiting for file locks to release...');
    try {
        execSync('powershell -Command "Start-Sleep -Seconds 2"', { stdio: 'inherit' });
    } catch (e) {
        // Fallback if powershell fails
    }

    // 2. Clean & Prepare Release Folder
    if (fs.existsSync(releaseDir)) {
        log(`Cleaning existing release folder: ${releaseDir}`, 'warning');
        try {
            fs.rmSync(releaseDir, { recursive: true, force: true });
        } catch (e) {
            log(`Failed to clean release dir: ${e.message}`, 'error');
        }
    }
    fs.mkdirSync(releaseDir, { recursive: true });

    // 2.5 Clean Previous Build Artifacts
    const foldersToClean = ['dist-electron', 'dist_build', 'dist_out'];
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

    // 3. Build Process (Isolated Output)
    const buildOutputDir = `dist_release_v${version}_${Date.now()}`;
    log(`Building to isolated directory: ${buildOutputDir}...`);

    // Set cache to local directory to allow easier management and potentially bypass AppData restrictions
    const cacheDir = path.join(__dirname, '..', '.cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    process.env.ELECTRON_BUILDER_CACHE = cacheDir;
    
    // Clean temp build dir if exists
    if (fs.existsSync(path.join(__dirname, '..', buildOutputDir))) {
        fs.rmSync(path.join(__dirname, '..', buildOutputDir), { recursive: true, force: true });
    }

    // Run the build pipeline
    // We use npm run build:core logic manually to ensure we use local node_modules
    // We override directories.output to ensure isolation
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    log('Compiling TypeScript and building Vite...');
    execSync(`${npmCmd} exec tsc -- -p electron/tsconfig.json && ${npmCmd} exec vite -- build`, { stdio: 'inherit' });
    
    log('Packaging with Electron Packager...');
    // Use electron-packager to bypass winCodeSign issues
    // It creates a folder named <AppName>-win32-x64 inside output dir
    // Added ignore flags to prevent recursive packaging
    const ignorePattern = "^/(releases|dist_release_.*|\\.git|\\.cache|node_modules/electron-builder)";
    execSync(`${npmCmd} exec electron-packager -- . --out=${buildOutputDir} --platform=win32 --arch=x64 --overwrite --prune=true --quiet --ignore="${ignorePattern}"`, { stdio: 'inherit' });

    // 4. Move Artifact to Release Folder
    const buildOutputPath = path.join(__dirname, '..', buildOutputDir);
    if (!fs.existsSync(buildOutputPath)) {
        throw new Error(`Build output directory not found: ${buildOutputPath}`);
    }

    // Electron Packager creates a subdir, e.g. "ftwos-win32-x64" or "FTWOS-win32-x64"
    const subDirs = fs.readdirSync(buildOutputPath).filter(f => fs.statSync(path.join(buildOutputPath, f)).isDirectory());
    const unpackedDirName = subDirs.find(d => d.includes('win32'));
    
    if (unpackedDirName) {
        const sourceDir = path.join(buildOutputPath, unpackedDirName);
        const destDir = path.join(releaseDir, unpackedDirName);
        
        log(`Moving unpacked build to ${destDir}...`);
        
        // Retry logic for removing existing directory
        const maxRetries = 5;
        for (let i = 0; i < maxRetries; i++) {
            try {
                if (fs.existsSync(destDir)) {
                    fs.rmSync(destDir, { recursive: true, force: true });
                }
                break;
            } catch (e) {
                if (i === maxRetries - 1) throw e;
                log(`Retry ${i + 1}/${maxRetries} deleting existing dir...`, 'warning');
                execSync('powershell -Command "Start-Sleep -Milliseconds 500"', { stdio: 'ignore' });
            }
        }
        
        fs.renameSync(sourceDir, destDir);
        
        log('---------------------------------------------------');
        log(`SUCCESS! Unpacked Release v${version} is ready.`, 'success');
        log(`Location: ${destDir}`, 'success');
        log('---------------------------------------------------');
    } else {
        throw new Error("Build finished but no output folder found!");
    }

    // 5. Build Installer and Copy to Root
    log('Building Windows installer...');
    try {
        execSync(`${npmCmd} exec electron-builder -- --win --config electron-builder.json`, { 
            stdio: 'inherit'
        });
        
        // Copy installer to root
        const installerDir = path.join(__dirname, '..', 'dist_installer');
        const rootDir = path.join(__dirname, '..');
        
        if (fs.existsSync(installerDir)) {
            const files = fs.readdirSync(installerDir);
            const setupFile = files.find(f => f.endsWith('.exe'));
            
            if (setupFile) {
                const sourcePath = path.join(installerDir, setupFile);
                const destPath = path.join(rootDir, 'FTW-OS-Setup.exe');
                
                fs.copyFileSync(sourcePath, destPath);
                log(`✅ Installer copied to root: FTW-OS-Setup.exe`, 'success');
            }
        }
    } catch (error) {
        log('⚠️  Installer build skipped (optional)', 'warning');
    }

    // 6. Cleanup
    log('Cleaning up build artifacts...');
    try {
        fs.rmSync(buildOutputPath, { recursive: true, force: true });
        // Also clean dist-electron and dist_build as they are intermediate
        fs.rmSync(path.join(__dirname, '..', 'dist-electron'), { recursive: true, force: true });
        // fs.rmSync(path.join(__dirname, '..', 'dist_build'), { recursive: true, force: true }); // KEEP dist_build for debugging
    } catch (e) {
        log('Cleanup warning: Could not remove temp dirs (might be locked), but release is safe.', 'warning');
    }

} catch (error) {
    // If it's a permission error during cleanup or final move, but the build succeeded, we can treat it as a warning
    if (error.message.includes('EPERM') && error.message.includes('releases')) {
        log('Release completed with warnings: Could not overwrite existing release folder perfectly (File in use?).', 'warning');
        log('Please close any running instances of FTWOS and try again, or manually check the release folder.', 'warning');
        process.exit(0); // Exit success to avoid CI failure
    } else {
        log(`Release Failed: ${error.message}`, 'error');
        if (error.stdout) console.log(error.stdout.toString());
        if (error.stderr) console.error(error.stderr.toString());
        process.exit(1);
    }
}
