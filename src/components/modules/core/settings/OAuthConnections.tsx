/**
 * OAuth Connections Component
 * UI for managing OAuth connections in Settings
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { OAuthButton } from '@/components/shared/OAuthButton'
import { Github, Brain, Sparkles, Music, Mail, Gamepad2, Radio } from 'lucide-react'
import { supportsOAuth } from '@/lib/oauth-providers'
import { cn } from '@/lib/utils'

const PROVIDER_CONFIG = [
  { id: 'github', name: 'GitHub', icon: Github, description: 'Access repositories, issues, and pull requests' },
  { id: 'openai', name: 'OpenAI', icon: Brain, description: 'ChatGPT and GPT models (API key required)' },
  { id: 'anthropic', name: 'Anthropic', icon: Sparkles, description: 'Claude AI models (API key required)' },
  { id: 'spotify', name: 'Spotify', icon: Music, description: 'Access your music library and playlists' },
  { id: 'google', name: 'Google', icon: Mail, description: 'Gmail, Calendar, and Google services' },
  { id: 'steam', name: 'Steam', icon: Gamepad2, description: 'Steam profile and game data (API key required)' },
  { id: 'soundcloud', name: 'SoundCloud', icon: Radio, description: 'Your SoundCloud tracks and playlists' }
]

export function OAuthConnections() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Connected Services</h3>
        <p className="text-sm text-muted-foreground">
          Connect your accounts to enable integrations. OAuth connections are secure and can be revoked at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROVIDER_CONFIG.map((provider) => {
          const Icon = provider.icon
          const hasOAuth = supportsOAuth(provider.id)
          
          return (
            <Card key={provider.id} className={cn(
              "transition-all",
              hasOAuth && "hover:shadow-md"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {provider.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <OAuthButton
                  providerId={provider.id}
                  providerName={provider.name}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Some services (OpenAI, Anthropic, Steam) require API keys instead of OAuth. 
          You can still configure these in the Integrations section.
        </p>
      </div>
    </div>
  )
}

