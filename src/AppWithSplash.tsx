import React, { useState, useEffect, Suspense } from 'react'
import { SplashScreen } from '@/components/ui/SplashScreen'
import { LandingGate } from '@/components/ui/LandingGate'
import { Loader2 } from 'lucide-react'

// Lazy load App to prevent circular dependency initialization errors
const MainApp = React.lazy(() => import('./App').then(m => ({ default: m.App })))

export const AppWithSplash: React.FC = () => {
  // Initialize state based on session storage to prevent double boot
  const hasBooted = !!sessionStorage.getItem('hasBooted')
  const [phase, setPhase] = useState<'splash' | 'gate' | 'app'>(hasBooted ? 'app' : 'splash')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (hasBooted) return;

    // Splash Loading Sequence
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 2
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(interval)
        setTimeout(() => setPhase('gate'), 800) // Wait for splash exit animation
      }
    }, 40) // Slightly slower for cinematic feel

    return () => clearInterval(interval)
  }, [hasBooted])

  const handleEnter = () => {
    sessionStorage.setItem('hasBooted', 'true')
    setPhase('app')
  }

  return (
    <>
      {phase === 'splash' && (
        <SplashScreen
          progress={progress}
        />
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