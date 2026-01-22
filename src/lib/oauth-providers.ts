/**
 * OAuth Provider Configuration
 * Centralized configuration for all OAuth providers
 */

export interface OAuthProvider {
  id: string
  name: string
  authUrl: string
  tokenUrl: string
  clientId: string
  scopes: string[]
  redirectUri: string
  supportsOAuth: boolean
  requiresClientSecret?: boolean
  apiKeyFallback?: boolean // Some providers may still need API key fallback
}

// OAuth redirect URI for Electron app
const REDIRECT_URI = 'ftwos://oauth/callback'

// Note: In production, these should be stored securely or provided via environment variables
// For now, we'll use placeholder values that need to be configured
export const OAUTH_PROVIDERS: Record<string, OAuthProvider> = {
  github: {
    id: 'github',
    name: 'GitHub',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    clientId: '', // Should be set via environment or settings
    scopes: ['repo', 'user', 'read:org'],
    redirectUri: REDIRECT_URI,
    supportsOAuth: true,
    requiresClientSecret: true
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    authUrl: '', // OpenAI doesn't support OAuth, uses API keys
    tokenUrl: '',
    clientId: '',
    scopes: [],
    redirectUri: REDIRECT_URI,
    supportsOAuth: false,
    apiKeyFallback: true
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    authUrl: '', // Anthropic doesn't support OAuth, uses API keys
    tokenUrl: '',
    clientId: '',
    scopes: [],
    redirectUri: REDIRECT_URI,
    supportsOAuth: false,
    apiKeyFallback: true
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    authUrl: 'https://accounts.spotify.com/authorize',
    tokenUrl: 'https://accounts.spotify.com/api/token',
    clientId: '', // Should be set via environment or settings
    scopes: ['user-read-private', 'user-read-email', 'user-read-playback-state'],
    redirectUri: REDIRECT_URI,
    supportsOAuth: true,
    requiresClientSecret: true
  },
  google: {
    id: 'google',
    name: 'Google',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientId: '', // Should be set via environment or settings
    scopes: ['openid', 'profile', 'email'],
    redirectUri: REDIRECT_URI,
    supportsOAuth: true,
    requiresClientSecret: true
  },
  steam: {
    id: 'steam',
    name: 'Steam',
    authUrl: 'https://steamcommunity.com/openid/login',
    tokenUrl: '',
    clientId: '',
    scopes: [],
    redirectUri: REDIRECT_URI,
    supportsOAuth: false, // Steam uses OpenID, not OAuth 2.0
    apiKeyFallback: true
  },
  soundcloud: {
    id: 'soundcloud',
    name: 'SoundCloud',
    authUrl: 'https://soundcloud.com/connect',
    tokenUrl: 'https://api.soundcloud.com/oauth2/token',
    clientId: '', // Should be set via environment or settings
    scopes: ['non-expiring'],
    redirectUri: REDIRECT_URI,
    supportsOAuth: true,
    requiresClientSecret: true
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    clientId: '', // Should be set via environment or settings
    scopes: ['tweet.read', 'users.read'],
    redirectUri: REDIRECT_URI,
    supportsOAuth: true,
    requiresClientSecret: true
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    clientId: '', // Should be set via environment or settings
    scopes: ['r_liteprofile', 'r_emailaddress'],
    redirectUri: REDIRECT_URI,
    supportsOAuth: true,
    requiresClientSecret: true
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    clientId: '', // Should be set via environment or settings
    scopes: ['user_profile', 'user_media'],
    redirectUri: REDIRECT_URI,
    supportsOAuth: true,
    requiresClientSecret: true
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    clientId: '', // Should be set via environment or settings
    scopes: ['public_profile', 'email', 'pages_read_engagement'],
    redirectUri: REDIRECT_URI,
    supportsOAuth: true,
    requiresClientSecret: true
  }
}

/**
 * Get OAuth provider configuration
 */
export function getOAuthProvider(providerId: string): OAuthProvider | null {
  return OAUTH_PROVIDERS[providerId] || null
}

/**
 * Check if provider supports OAuth
 */
export function supportsOAuth(providerId: string): boolean {
  const provider = getOAuthProvider(providerId)
  return provider?.supportsOAuth || false
}

/**
 * Generate OAuth authorization URL
 */
export function getAuthUrl(providerId: string, state?: string): string | null {
  const provider = getOAuthProvider(providerId)
  if (!provider || !provider.supportsOAuth || !provider.clientId) {
    return null
  }

  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: provider.redirectUri,
    scope: provider.scopes.join(' '),
    response_type: 'code',
    ...(state && { state })
  })

  return `${provider.authUrl}?${params.toString()}`
}

