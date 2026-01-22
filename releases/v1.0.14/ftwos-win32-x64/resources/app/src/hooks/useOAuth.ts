/**
 * OAuth Hook
 * React hook for OAuth connection management
 */

import { useState, useCallback, useEffect } from 'react'
import { oauthService } from '@/services/oauth-service'
import { supportsOAuth } from '@/lib/oauth-providers'

export interface UseOAuthReturn {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  checkConnection: () => Promise<void>
}

export function useOAuth(providerId: string): UseOAuthReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkConnection = useCallback(async () => {
    if (!supportsOAuth(providerId)) {
      setIsConnected(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const connected = await oauthService.isConnected(providerId)
      setIsConnected(connected)
    } catch (err: any) {
      setError(err.message || 'Failed to check connection')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [providerId])

  const connect = useCallback(async () => {
    if (!supportsOAuth(providerId)) {
      setError(`${providerId} does not support OAuth`)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await oauthService.initiateOAuth(providerId)
      // Connection status will be updated via callback handler
    } catch (err: any) {
      setError(err.message || 'Failed to initiate OAuth')
      setIsLoading(false)
    }
  }, [providerId])

  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      await oauthService.revokeToken(providerId)
      setIsConnected(false)
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect')
    } finally {
      setIsLoading(false)
    }
  }, [providerId])

  // Check connection on mount
  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  return {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    checkConnection
  }
}

