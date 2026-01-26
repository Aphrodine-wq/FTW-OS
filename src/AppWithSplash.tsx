import React, { useState, useEffect, Suspense } from 'react'
import { SplashScreen } from '@/components/ui/SplashScreen'
import { LandingGate } from '@/components/ui/LandingGate'
import { Loader2 } from 'lucide-react'

// Lazy load App to prevent circular dependency initialization errors
const MainApp = React.lazy(() => import('./App').then(m => ({ default: m.App })))

export const AppWithSplash: React.FC = () => {
  // Initialize state based on session storage to prevent double boot
  const hasBooted = !!sessionStorage.getItem('hasBooted')
  const [phase, setPhase] = useState<'splash' | 'gate' | 'app'>(hasBooted ? 'gate' : 'splash')

  useEffect(() => {
    if (hasBooted) return;

    // SplashScreen component handles its own completion callback
    // We don't need external progress management
  }, [hasBooted])

  const handleSplashComplete = () => {
    setPhase('gate')
  }

  const handleEnter = () => {
    sessionStorage.setItem('hasBooted', 'true')
    setPhase('app')
  }

  return (
    <>
      {phase === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      {phase === 'gate' && (
        <LandingGate onEnter={handleEnter} />
      )}

      {phase === 'app' && (
        <Suspense fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        }>
          <MainApp />
        </Suspense>
      )}
    </>
  )
}