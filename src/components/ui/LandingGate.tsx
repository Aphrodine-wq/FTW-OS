import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/services/utils'
import { FloatingParticles } from './landing/FloatingParticles'
import { LandingHeader } from './landing/LandingHeader'
import { AuthModal } from './landing/AuthModal'
import { useAuthStore } from '@/stores/auth-store'

interface LandingGateProps {
  onEnter: () => void
}

export const LandingGate: React.FC<LandingGateProps> = ({ onEnter }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isEntering, setIsEntering] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const handleContinue = () => {
    if (isAuthenticated) {
      setIsEntering(true)
      setTimeout(onEnter, 800)
    } else {
      setShowAuthModal(true)
    }
  }

  // Watch for successful login
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      setShowAuthModal(false)
      setIsEntering(true)
      setTimeout(onEnter, 800)
    }
  }, [isAuthenticated, showAuthModal, onEnter])

  const handleCloseModal = () => {
    setShowAuthModal(false)
  }

  const handleBypass = () => {
    setShowAuthModal(false)
    setIsEntering(true)
    setTimeout(onEnter, 800)
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: isEntering ? 0 : 1 }}
      className="fixed inset-0 z-[50] flex flex-col items-center justify-center bg-slate-50 overflow-hidden font-sans"
    >
      {/* Complex Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-white to-white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content Container */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 flex flex-col items-center gap-12"
      >
        {/* Header */}
        <LandingHeader />

        {/* Simplified Continue Button */}
        <motion.button
          onClick={handleContinue}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 overflow-hidden"
        >
          <div className="relative z-10 flex items-center gap-2">
             <span className="text-base font-semibold tracking-tight">
                Continue
             </span>
             <ArrowRight className={cn(
               "h-5 w-5 transition-all duration-300",
               isHovered ? "translate-x-1" : ""
             )} />
          </div>
        </motion.button>

      </motion.div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={handleCloseModal} />
    </motion.div>
  )
}
