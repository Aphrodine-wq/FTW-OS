import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

interface SplashScreenProps {
  onComplete?: () => void
  progress?: number
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  progress = 0
}) => {
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (progress >= 100) {
      setIsComplete(true)
    }
  }, [progress])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isComplete ? 0 : 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-white overflow-hidden will-change-transform"
    >
      {/* Black Gradient Orbs - Subtle Background - GPU Optimized */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.06, 0.12, 0.06],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-black to-transparent rounded-full blur-3xl will-change-transform"
        />
        <motion.div
          animate={{
            scale: [1.05, 1, 1.05],
            opacity: [0.06, 0.12, 0.06],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 0.3, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-black to-transparent rounded-full blur-3xl will-change-transform"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 120, damping: 20 }}
          className="relative will-change-transform"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-30 will-change-transform"
          />
          <div className="relative bg-white/80 rounded-full p-6 backdrop-blur-2xl border border-white/50 shadow-2xl">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="will-change-transform"
            >
              <Zap className="w-12 h-12 text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text" />
            </motion.div>
          </div>
        </motion.div>

        {/* Brand Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-2">
            FTW
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text"
            >
              {' '}OS
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm text-gray-600 font-light tracking-widest"
          >
            INITIALIZING PLATFORM
          </motion.p>
        </motion.div>

        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
          className="w-72 space-y-4"
        >
          {/* Animated Dots */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut'
                }}
                className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 will-change-transform"
              />
            ))}
          </div>

          {/* Progress Bar - Smooth Animation */}
          <div className="mt-8">
            <div className="relative h-2 bg-gray-300/40 rounded-full overflow-hidden border border-gray-200/50 backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-400/50 will-change-transform rounded-full"
              />
            </div>
            <div className="text-center mt-3 text-xs text-gray-600 font-mono font-medium">
              {progress}%
            </div>
          </div>
        </motion.div>

        {/* Floating Particles - Optimized */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -50, 0],
                x: [0, Math.sin(i * 1.5) * 30, 0],
                opacity: [0.05, 0.25, 0.05],
              }}
              transition={{
                duration: 5 + i * 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute w-1.5 h-1.5 rounded-full bg-black/20 will-change-transform"
              style={{
                left: `${20 + i * 12}%`,
                bottom: `${10 + i * 5}%`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
