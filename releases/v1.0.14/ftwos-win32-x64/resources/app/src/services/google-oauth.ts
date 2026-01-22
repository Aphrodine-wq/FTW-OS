/**
 * Google OAuth 2.0 Service
 * Handles authentication using Google OAuth credentials stored in secure vault
 */

interface GoogleUser {
  id: string
  email: string
  name: string
  picture?: string
  verified_email: boolean
}

interface GoogleTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
  id_token?: string
}

class GoogleOAuthService {
  private clientId: string | null = null
  private redirectUri: string
  private scopes: string[] = [
    'openid',
    'profile',
    'email'
  ]

  constructor() {
    // Use current origin for redirect (works for Electron and web)
    this.redirectUri = window.location.origin + '/auth/callback'
  }

  /**
   * Initialize OAuth with credentials from secure vault
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    // Import dynamically to avoid circular dependency
    const { useSecureSettings } = await import('@/stores/secure-settings-store')
    const getSecureKey = useSecureSettings.getState().getSecureKey
    
    const clientId = await getSecureKey('googleClientId')
    
    if (!clientId) {
      return {
        success: false,
        error: 'Google Client ID not found. Please configure it in Settings > Integrations.'
      }
    }

    this.clientId = clientId
    return { success: true }
  }

  /**
   * Start OAuth flow - redirects to Google
   */
  async login(): Promise<{ success: boolean; error?: string }> {
    const initResult = await this.initialize()
    if (!initResult.success) {
      return initResult
    }

    if (!this.clientId) {
      return { success: false, error: 'Client ID not configured' }
    }

    try {
      // Generate state for CSRF protection
      const state = this.generateState()
      sessionStorage.setItem('oauth_state', state)
      
      // Generate PKCE code verifier and challenge
      const codeVerifier = this.generateCodeVerifier()
      const codeChallenge = await this.generateCodeChallenge(codeVerifier)
      sessionStorage.setItem('oauth_code_verifier', codeVerifier)

      // Build authorization URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authUrl.searchParams.set('client_id', this.clientId)
      authUrl.searchParams.set('redirect_uri', this.redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', this.scopes.join(' '))
      authUrl.searchParams.set('state', state)
      authUrl.searchParams.set('access_type', 'offline')
      authUrl.searchParams.set('prompt', 'consent')
      authUrl.searchParams.set('code_challenge', codeChallenge)
      authUrl.searchParams.set('code_challenge_method', 'S256')

      // Redirect to Google
      window.location.href = authUrl.toString()

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to initiate OAuth flow' }
    }
  }

  /**
   * Handle OAuth callback - exchange code for tokens
   */
  async handleCallback(url: string): Promise<{ success: boolean; user?: GoogleUser; tokens?: GoogleTokens; error?: string }> {
    try {
      const urlObj = new URL(url)
      const code = urlObj.searchParams.get('code')
      const state = urlObj.searchParams.get('state')
      const error = urlObj.searchParams.get('error')

      if (error) {
        return { success: false, error: `OAuth error: ${error}` }
      }

      if (!code) {
        return { success: false, error: 'Authorization code not found' }
      }

      // Verify state
      const storedState = sessionStorage.getItem('oauth_state')
      if (!storedState || state !== storedState) {
        return { success: false, error: 'Invalid state parameter' }
      }

      // Get code verifier
      const codeVerifier = sessionStorage.getItem('oauth_code_verifier')
      if (!codeVerifier) {
        return { success: false, error: 'Code verifier not found' }
      }

      // Get client secret for token exchange
      const { useSecureSettings } = await import('@/stores/secure-settings-store')
      const getSecureKey = useSecureSettings.getState().getSecureKey
      const clientSecret = await getSecureKey('googleClientSecret')

      if (!clientSecret) {
        return { success: false, error: 'Client secret not configured' }
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId!,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
          code_verifier: codeVerifier,
        }),
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        return { success: false, error: errorData.error_description || 'Failed to exchange code for tokens' }
      }

      const tokens: GoogleTokens = await tokenResponse.json()

      // Get user info
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      })

      if (!userInfoResponse.ok) {
        return { success: false, error: 'Failed to fetch user info' }
      }

      const user: GoogleUser = await userInfoResponse.json()

      // Clean up session storage
      sessionStorage.removeItem('oauth_state')
      sessionStorage.removeItem('oauth_code_verifier')

      return { success: true, user, tokens }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to handle OAuth callback' }
    }
  }

  /**
   * Generate random state for CSRF protection
   */
  private generateState(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Generate PKCE code verifier
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ success: boolean; tokens?: GoogleTokens; error?: string }> {
    const initResult = await this.initialize()
    if (!initResult.success) {
      return initResult
    }

    const { useSecureSettings } = await import('@/stores/secure-settings-store')
    const getSecureKey = useSecureSettings.getState().getSecureKey
    const clientSecret = await getSecureKey('googleClientSecret')

    if (!clientSecret) {
      return { success: false, error: 'Client secret not configured' }
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId!,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error_description || 'Failed to refresh token' }
      }

      const tokens: GoogleTokens = await response.json()
      return { success: true, tokens }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to refresh token' }
    }
  }
}

// Export singleton instance
export const googleOAuth = new GoogleOAuthService()

// Export types
export type { GoogleUser, GoogleTokens }

