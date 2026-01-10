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
    const color = type === 'success' ? colors.green : type === 'error' ? colors.red : colors.cyan;
    console.log(`${color}${colors.bright}[FTWOS Release] ${msg}${colors.reset}`);
}

try {
    // 1. Setup Release Info
    const packageJson = require('../package.json');
    const version = packageJson.version;
    const releaseDir = path.join(__dirname, '../releases', `v${version}`);
    
    log(`Initializing Release v${version}...`);

    // 2. Clean & Prepare Release Folder
    if (fs.existsSync(releaseDir)) {
        fs.rmSync(releaseDir, { recursive: true, force: true });
    }
    fs.mkdirSync(releaseDir, { recursive: true });

    // 3. Build Process (Isolated Output)
    const buildOutputDir = `dist_release_v${version}`;
    log(`Building to isolated directory: ${buildOutputDir}...`);
    
    // Clean temp build dir if exists
    if (fs.existsSync(path.join(__dirname, '..', buildOutputDir))) {
        fs.rmSync(path.join(__dirname, '..', buildOutputDir), { recursive: true, force: true });
    }

    // Run the build pipeline
    // Use npm run build:core logic manually to ensure we use local node_modules
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    execSync(`${npmCmd} exec tsc -- -p electron/tsconfig.json && ${npmCmd} exec vite -- build && ${npmCmd} exec electron-builder -- --config .build-config/electron-builder.yml -c.directories.output=${buildOutputDir}`, { stdio: 'inherit' });

    // 4. Move Artifact to Release Folder
    const builtExe = fs.readdirSync(path.join(__dirname, '..', buildOutputDir)).find(f => f.endsWith('.exe'));
    
    if (!builtExe) throw new Error("Build finished but no .exe found!");

    const source = path.join(__dirname, '..', buildOutputDir, builtExe);
    const dest = path.join(releaseDir, `FTWOS_v${version}.exe`);

    fs.copyFileSync(source, dest);
    
    log('---------------------------------------------------');
    log(`SUCCESS! Release v${version} is ready.`, 'success');
    log(`Location: ${dest}`, 'success');
    log('---------------------------------------------------');

    // 5. Cleanup
    log('Cleaning up build artifacts...');
    try {
        fs.rmSync(path.join(__dirname, '..', buildOutputDir), { recursive: true, force: true });
    } catch (e) {
        log('Cleanup warning: Could not remove temp dir (might be locked), but release is safe.', 'warning');
    }

} catch (error) {
    log(`Release Failed: ${error.message}`, 'error');
    process.exit(1);
}