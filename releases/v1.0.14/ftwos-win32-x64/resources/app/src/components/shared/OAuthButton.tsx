/**
 * OAuth Button Component
 * Reusable button for OAuth connections
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react'
import { useOAuth } from '@/hooks/useOAuth'
import { supportsOAuth } from '@/lib/oauth-providers'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface OAuthButtonProps {
  providerId: string
  providerName: string
  onConnect?: () => void
  onDisconnect?: () => void
  className?: string
}

export function OAuthButton({ 
  providerId, 
  providerName, 
  onConnect, 
  onDisconnect,
  className 
}: OAuthButtonProps) {
  const { isConnected, isLoading, connect, disconnect } = useOAuth(providerId)
  const supportsOAuthFlow = supportsOAuth(providerId)
  const { toast } = useToast()

  const handleConnect = async () => {
    try {
      await connect()
      onConnect?.()
    } catch (err) {
      console.error('OAuth connect error:', err)
      toast({
        title: 'Connection Failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      onDisconnect?.()
    } catch (err) {
      console.error('OAuth disconnect error:', err)
      toast({
        title: 'Connection Failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (!supportsOAuthFlow) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        OAuth not available for {providerName}. API key required.
      </div>
    )
  }

  if (isLoading) {
    return (
      <Button
        disabled
        className={className}
        aria-busy="true"
        aria-label={isConnected ? `Disconnecting from ${providerName}` : `Connecting to ${providerName}`}
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
        {isConnected ? 'Disconnecting...' : 'Connecting...'}
      </Button>
    )
  }

  if (isConnected) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          onClick={handleDisconnect}
          className="flex items-center gap-2"
          aria-label={`Disconnect from ${providerName}`}
        >
          <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
          Disconnect
        </Button>
        <div className="flex items-center gap-1 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>Connected</span>
        </div>
      </div>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      className={cn("flex items-center gap-2", className)}
      aria-label={`Connect to ${providerName}`}
    >
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
      Connect {providerName}
    </Button>
  )
}

