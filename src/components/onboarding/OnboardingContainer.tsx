import React from 'react'
import FirstRunFlow from './FirstRunFlow'
import { useOnboardingStore } from '@/stores/onboarding-store'

const OnboardingContainer: React.FC = () => {
  const completed = useOnboardingStore((s) => s.completed)
  if (completed) return null
  // Simple container that hosts the first-run flow
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <FirstRunFlow />
      </div>
    </div>
  )
}

export default OnboardingContainer
