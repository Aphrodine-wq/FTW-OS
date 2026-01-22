import { ipcMain, shell } from 'electron'
import twilio from 'twilio'

export function setupIntegrationHandlers() {
  // OAuth Handlers
  ipcMain.handle('oauth:open-auth-url', async (_, authUrl: string) => {
    try {
      await shell.openExternal(authUrl)
      return { success: true }
    } catch (error: any) {
      console.error('Failed to open OAuth URL:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('oauth:exchange-token', async (_, providerId: string, code: string) => {
    try {
      // This would exchange the code for a token
      // For now, return a placeholder - actual implementation would call the provider's token endpoint
      console.log(`Exchanging token for ${providerId} with code: ${code.substring(0, 10)}...`)
      // In a real implementation, you'd make an HTTP request to the provider's token endpoint
      return {
        access_token: 'placeholder_token',
        token_type: 'Bearer',
        expires_in: 3600
      }
    } catch (error: any) {
      console.error('Token exchange failed:', error)
      throw error
    }
  })

  ipcMain.handle('oauth:save-token', async (_, providerId: string, token: any) => {
    try {
      // Save token to secure storage
      // This would use the vault or secure storage system
      console.log(`Saving token for ${providerId}`)
      return { success: true }
    } catch (error: any) {
      console.error('Failed to save token:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('oauth:get-token', async (_, providerId: string) => {
    try {
      // Get token from secure storage
      // This would retrieve from vault
      console.log(`Getting token for ${providerId}`)
      return null // Return null if not found
    } catch (error: any) {
      console.error('Failed to get token:', error)
      return null
    }
  })

  ipcMain.handle('oauth:revoke-token', async (_, providerId: string) => {
    try {
      // Revoke token and remove from storage
      console.log(`Revoking token for ${providerId}`)
      return { success: true }
    } catch (error: any) {
      console.error('Failed to revoke token:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('oauth:refresh-token', async (_, providerId: string, refreshToken: string) => {
    try {
      // Refresh the token using refresh token
      console.log(`Refreshing token for ${providerId}`)
      return {
        access_token: 'new_placeholder_token',
        token_type: 'Bearer',
        expires_in: 3600
      }
    } catch (error: any) {
      console.error('Failed to refresh token:', error)
      throw error
    }
  })
  // GitHub Integration - Moved to github.ts
  
  // Spotify Integration
  ipcMain.handle('spotify:now-playing', async (_, { token }) => {
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.status === 204) return null // Nothing playing
      if (res.status === 401) throw new Error('Token expired')
      
      const data = await res.json()
      return {
        name: data.item.name,
        artist: data.item.artists.map((a: any) => a.name).join(', '),
        album: data.item.album.name,
        image: data.item.album.images[0]?.url,
        isPlaying: data.is_playing,
        progress: data.progress_ms,
        duration: data.item.duration_ms,
        link: data.item.external_urls.spotify
      }
    } catch (e) {
      console.error('Spotify Error:', e)
      throw e
    }
  })

  ipcMain.handle('spotify:control', async (_, { token, command }) => {
    try {
      // command: 'next', 'previous', 'play', 'pause'
      const method = command === 'next' ? 'POST' : command === 'previous' ? 'POST' : 'PUT'
      const endpoint = command === 'play' ? 'play' : command === 'pause' ? 'pause' : command
      
      await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
        method: method,
        headers: { Authorization: `Bearer ${token}` }
      })
      return true
    } catch (e) {
      return false
    }
  })

  ipcMain.handle('spotify:get-profile', async (_, { token }) => {
    try {
      const res = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) {
        throw new Error(`Spotify API Error: ${res.status} ${res.statusText}`)
      }
      
      const data = await res.json()
      return data
    } catch (e) {
      console.error('Spotify Profile Error:', e)
      throw e
    }
  })

  // Steam Integration
  ipcMain.handle('steam:get-player-summary', async (_, { steamId, apiKey }) => {
    try {
      const res = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`)
      const data = await res.json()
      return data.response.players[0]
    } catch (e) {
      console.error('Steam Error:', e)
      return null
    }
  })

  ipcMain.handle('steam:recent-games', async (_, { steamId, apiKey }) => {
    try {
      const res = await fetch(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json`)
      const data = await res.json()
      return data.response.games || []
    } catch (e) {
      return []
    }
  })

  // Local Spotify (Window Title Fallback)
  ipcMain.handle('spotify:local-now-playing', async () => {
    try {
      // PowerShell command to get Spotify window title
      const { exec } = require('child_process')
      const util = require('util')
      const execPromise = util.promisify(exec)
      
      const command = `powershell -Command "Get-Process spotify -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -ne ''} | Select-Object -ExpandProperty MainWindowTitle -First 1"`
      
      const { stdout } = await execPromise(command)
      const title = stdout.trim()
      
      if (!title || title === 'Spotify' || title === 'Spotify Premium') return null

      // Usually format is "Artist - Song"
      if (title.includes(' - ')) {
        const parts = title.split(' - ')
        return {
          name: parts.slice(1).join(' - '), // Song might have hyphens
          artist: parts[0],
          isPlaying: true,
          isLocal: true
        }
      }
      
      return {
        name: title,
        artist: 'Spotify',
        isPlaying: true,
        isLocal: true
      }
    } catch (e) {
      return null
    }
  })

  // Twilio SMS Handler - Moved to storage.ts for better config management
  // ipcMain.handle('send-sms', async (_, { to, body }) => { ... })
}
