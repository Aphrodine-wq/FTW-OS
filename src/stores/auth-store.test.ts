import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Hoist mocks
const mocks = vi.hoisted(() => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      getSession: vi.fn()
    }
  },
  googleOAuth: {
    login: vi.fn(),
    handleCallback: vi.fn()
  }
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}))

// Mock dependencies using hoisted variables
vi.mock('@/services/supabase', () => ({ supabase: mocks.supabase }))
vi.mock('@/services/google-oauth', () => ({ googleOAuth: mocks.googleOAuth }))

// Mock window
const mockWindow = {
  location: { origin: 'http://localhost:3000' }
}
vi.stubGlobal('window', mockWindow)

// Import store after mocks
import { useAuthStore } from './auth-store'

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      tokens: null
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize listener', () => {
    const unsubscribe = useAuthStore.getState().initializeListener()
    expect(mocks.supabase.auth.onAuthStateChange).toHaveBeenCalled()
    expect(typeof unsubscribe).toBe('function')
  })

  it('should login with google oauth', async () => {
    mocks.googleOAuth.login.mockResolvedValue({ success: true })
    const result = await useAuthStore.getState().loginWithGoogleOAuth()
    expect(result).toEqual({})
    expect(mocks.googleOAuth.login).toHaveBeenCalled()
  })

  it('should handle google callback success', async () => {
    const mockUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      picture: 'avatar.jpg'
    }
    const mockTokens = { access_token: 'abc' }
    
    mocks.googleOAuth.handleCallback.mockResolvedValue({
      success: true,
      user: mockUser,
      tokens: mockTokens
    })

    const result = await useAuthStore.getState().handleGoogleCallback('http://localhost?code=123')
    
    expect(result).toEqual({})
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.id).toBe(mockUser.id)
    expect(state.tokens).toEqual(mockTokens)
  })

  it('should reject guest login in production', () => {
    useAuthStore.getState().loginAsGuest()
    
    // Guest login should NOT authenticate in production
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should logout', async () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: '1' } as any })
    
    await useAuthStore.getState().logout()
    
    expect(mocks.supabase.auth.signOut).toHaveBeenCalled()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
  })

  it('should login with email success', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    }
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: mockUser }, error: null })

    const result = await useAuthStore.getState().loginWithEmail('test@example.com', 'password')
    
    expect(result).toEqual({})
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.email).toBe('test@example.com')
  })

  it('should login with email failure', async () => {
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: { message: 'Invalid credentials' } })

    const result = await useAuthStore.getState().loginWithEmail('test@example.com', 'wrong')
    
    expect(result).toEqual({ error: 'Invalid credentials' })
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
  })
})
