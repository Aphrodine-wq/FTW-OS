"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIntegrationHandlers = setupIntegrationHandlers;
const electron_1 = require("electron");
function setupIntegrationHandlers() {
    // Spotify Integration
    electron_1.ipcMain.handle('spotify:now-playing', async (_, { token }) => {
        try {
            const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 204)
                return null; // Nothing playing
            if (res.status === 401)
                throw new Error('Token expired');
            const data = await res.json();
            return {
                name: data.item.name,
                artist: data.item.artists.map((a) => a.name).join(', '),
                album: data.item.album.name,
                image: data.item.album.images[0]?.url,
                isPlaying: data.is_playing,
                progress: data.progress_ms,
                duration: data.item.duration_ms,
                link: data.item.external_urls.spotify
            };
        }
        catch (e) {
            console.error('Spotify Error:', e);
            throw e;
        }
    });
    electron_1.ipcMain.handle('spotify:control', async (_, { token, command }) => {
        try {
            // command: 'next', 'previous', 'play', 'pause'
            const method = command === 'next' ? 'POST' : command === 'previous' ? 'POST' : 'PUT';
            const endpoint = command === 'play' ? 'play' : command === 'pause' ? 'pause' : command;
            await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
                method: method,
                headers: { Authorization: `Bearer ${token}` }
            });
            return true;
        }
        catch (e) {
            return false;
        }
    });
    electron_1.ipcMain.handle('spotify:get-profile', async (_, { token }) => {
        try {
            const res = await fetch('https://api.spotify.com/v1/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                throw new Error(`Spotify API Error: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            return data;
        }
        catch (e) {
            console.error('Spotify Profile Error:', e);
            throw e;
        }
    });
    // Steam Integration
    electron_1.ipcMain.handle('steam:get-player-summary', async (_, { steamId, apiKey }) => {
        try {
            const res = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`);
            const data = await res.json();
            return data.response.players[0];
        }
        catch (e) {
            console.error('Steam Error:', e);
            return null;
        }
    });
    electron_1.ipcMain.handle('steam:recent-games', async (_, { steamId, apiKey }) => {
        try {
            const res = await fetch(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json`);
            const data = await res.json();
            return data.response.games || [];
        }
        catch (e) {
            return [];
        }
    });
    // Local Spotify (Window Title Fallback)
    electron_1.ipcMain.handle('spotify:local-now-playing', async () => {
        try {
            // PowerShell command to get Spotify window title
            const { exec } = require('child_process');
            const util = require('util');
            const execPromise = util.promisify(exec);
            const command = `powershell -Command "Get-Process spotify -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -ne ''} | Select-Object -ExpandProperty MainWindowTitle -First 1"`;
            const { stdout } = await execPromise(command);
            const title = stdout.trim();
            if (!title || title === 'Spotify' || title === 'Spotify Premium')
                return null;
            // Usually format is "Artist - Song"
            if (title.includes(' - ')) {
                const parts = title.split(' - ');
                return {
                    name: parts.slice(1).join(' - '), // Song might have hyphens
                    artist: parts[0],
                    isPlaying: true,
                    isLocal: true
                };
            }
            return {
                name: title,
                artist: 'Spotify',
                isPlaying: true,
                isLocal: true
            };
        }
        catch (e) {
            return null;
        }
    });
}
