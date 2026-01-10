import React, { useState, useEffect, useRef } from 'react'
import { SplashScreen } from '@/components/ui/SplashScreen'
import App from './App'

export const AppWithSplash: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)

  useEffect(() => {
    // Simulate initialization stages with smooth progress
    const stages = [
      { target: 15, delay: 100 },   // DOM ready
      { target: 35, delay: 300 },   // Stores hydrating
      { target: 65, delay: 600 },   // Seed data loaded
      { target: 90, delay: 800 },   // Assets loaded
      { target: 100, delay: 1000 }, // Complete
    ]

    let stageIndex = 0
    let animationFrameId: number

    const animate = () => {
      if (stageIndex < stages.length) {
        const currentStage = stages[stageIndex]
        const diff = currentStage.target - progressRef.current
        
        // Snap to target if we're close enough (fixes Zeno's paradox infinite loop)
        if (diff < 0.5) {
            progressRef.current = currentStage.target
            stageIndex++

            if (currentStage.target === 100) {
                setProgress(100)
                setTimeout(() => {
                    setShowSplash(false)
                }, 300)
                return
            }
        } else {
            // Smooth approach
            const increment = Math.max(0.1, diff * 0.05) // Ensure minimum speed
            progressRef.current += increment
        }

        setProgress(Math.round(progressRef.current))
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <>
      {showSplash && (
        <SplashScreen
          progress={progress}
          onComplete={() => setShowSplash(false)}
        />
      )}
      {!showSplash && <App />}
    </>
  )
}
