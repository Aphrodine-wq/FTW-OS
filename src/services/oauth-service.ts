/**
 * OAuth Service
 * Handles OAuth flows for all integrations
 */

import { getOAuthProvider, getAuthUrl, supportsOAuth } from '@/lib/oauth-providers'

export interface OAuthToken {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  scope?: string
  expires_at?: number
}

export interface OAuthState {
  provider: string
  timestamp: number
  nonce: string
}

class OAuthService {
  private pendingAuths = new Map<string, OAuthState>()
  private tokenStorage = new Map<string, OAuthToken>()

  /**
   * Generate a random state/nonce for OAuth
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * Store OAuth state for verification
   */
  private storeState(provider: string, state: string): void {
    const oauthState: OAuthState = {
      provider,
      timestamp: Date.now(),
      nonce: state
    }
    this.pendingAuths.set(state, oauthState)
    // Clean up old states after 10 minutes
    setTimeout(() => {
      this.pendingAuths.delete(state)
    }, 10 * 60 * 1000)
  }

  /**
   * Verify OAuth state
   */
  private verifyState(state: string): OAuthState | null {
    const oauthState = this.pendingAuths.get(state)
    if (!oauthState) return null

    // Check if state is expired (10 minutes)
    if (Date.now() - oauthState.timestamp > 10 * 60 * 1000) {
      this.pendingAuths.delete(state)
      return null
    }

    return oauthState
  }

  /**
   * Initiate OAuth flow
   */
  async initiateOAuth(providerId: string): Promise<void> {
    if (!supportsOAuth(providerId)) {
      throw new Error(`Provider ${providerId} does not support OAuth`)
    }

    const provider = getOAuthProvider(providerId)
    if (!provider || !provider.clientId) {
      throw new Error(`OAuth not configured for ${providerId}. Please set client ID in settings.`)
    }

    const state = this.generateState()
    this.storeState(providerId, state)

    const authUrl = getAuthUrl(providerId, state)
    if (!authUrl) {
      throw new Error(`Failed to generate auth URL for ${providerId}`)
    }

    // Open OAuth URL in external browser (Electron)
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke('oauth:open-auth-url', authUrl)
    } else {
      // Fallback for web
      window.open(authUrl, '_blank', 'width=600,height=700')
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(providerId: string, code: string, state: string): Promise<OAuthToken> {
    const oauthState = this.verifyState(state)
    if (!oauthState || oauthState.provider !== providerId) {
      throw new Error('Invalid OAuth state')
    }

    const provider = getOAuthProvider(providerId)
    if (!provider) {
      throw new Error(`Unknown provider: ${providerId}`)
    }

    // Exchange code for token
    const token = await this.exchangeCodeForToken(providerId, code)
    
    // Store token
    this.tokenStorage.set(providerId, token)
    
    // Save to secure storage via Electron
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke('oauth:save-token', providerId, token)
    }

    // Clean up state
    this.pendingAuths.delete(state)

    return token
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(providerId: string, code: string): Promise<OAuthToken> {
    const provider = getOAuthProvider(providerId)
    if (!provider) {
      throw new Error(`Unknown provider: ${providerId}`)
    }

    // Use Electron main process to exchange token (handles client secret securely)
    if (window.ipcRenderer) {
      const token = await window.ipcRenderer.invoke('oauth:exchange-token', providerId, code)
      return token
    }

    // Fallback for web (would need client secret - not recommended)
    throw new Error('Token exchange must be handled by Electron main process')
  }

  /**
   * Get stored OAuth token
   */
  async getToken(providerId: string): Promise<OAuthToken | null> {
    // Check in-memory cache first
    if (this.tokenStorage.has(providerId)) {
      const token = this.tokenStorage.get(providerId)!
      // Check if token is expired
      if (token.expires_at && token.expires_at < Date.now()) {
        // Try to refresh
        if (token.refresh_token) {
          return await this.refreshToken(providerId, token.refresh_token)
        }
        this.tokenStorage.delete(providerId)
        return null
      }
      return token
    }

    // Load from secure storage
    if (window.ipcRenderer) {
      const token = await window.ipcRenderer.invoke('oauth:get-token', providerId)
      if (token) {
        this.tokenStorage.set(providerId, token)
        return token
      }
    }

    return null
  }

  /**
   * Refresh OAuth token
   */
  async refreshToken(providerId: string, refreshToken: string): Promise<OAuthToken> {
    if (window.ipcRenderer) {
      const token = await window.ipcRenderer.invoke('oauth:refresh-token', providerId, refreshToken)
      if (token) {
        this.tokenStorage.set(providerId, token)
        return token
      }
    }
    throw new Error('Failed to refresh token')
  }

  /**
   * Revoke OAuth token
   */
  async revokeToken(providerId: string): Promise<void> {
    this.tokenStorage.delete(providerId)
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke('oauth:revoke-token', providerId)
    }
  }

  /**
   * Check if provider is connected
   */
  async isConnected(providerId: string): Promise<boolean> {
    const token = await this.getToken(providerId)
    return token !== null
  }
}

export const oauthService = new OAuthService()

