import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/services/utils'

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
      setTimeout(() => setIsComplete(true), 800)
    }
  }, [progress])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isComplete ? 0 : 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 flex items-center justify-center bg-white overflow-hidden font-sans z-[9999]"
      style={{ willChange: 'opacity' }}
    >
      {/* Ultra-fast CSS Grid Background - GPU Accelerated */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          willChange: 'transform'
        }}
      />

      {/* Minimal Geometric Accents - Static for Performance */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-blue-500/10 rounded-full" />
      <div className="absolute top-40 right-32 w-3 h-3 bg-purple-500/10 rounded-full" />
      <div className="absolute bottom-32 left-40 w-2 h-2 bg-cyan-500/10 rounded-full" />
      <div className="absolute bottom-20 right-20 w-3 h-3 bg-pink-500/10 rounded-full" />
      
      {/* Subtle Corner Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-500/5 to-transparent" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-pink-500/5 to-transparent" />

      <div className="relative z-10 flex flex-col items-center gap-16">
        
        {/* Morphing Pulsing Dot Loader - Pure CSS for 200fps */}
        <div className="relative flex items-center justify-center">
          {/* Main Morphing Dot */}
          <div 
            className="relative w-20 h-20"
            style={{ willChange: 'transform' }}
          >
            {/* Core Pulsing Dot with Morph */}
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-cyan-500 shadow-2xl shadow-blue-500/20"
              style={{
                animation: 'morphPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                willChange: 'transform, border-radius'
              }}
            />
            
            {/* Outer Glow Ring */}
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400 via-purple-400 to-cyan-400 opacity-40 blur-xl"
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                willChange: 'transform, opacity'
              }}
            />

            {/* Rotating Orbit Ring */}
            <div 
              className="absolute inset-[-20px]"
              style={{
                animation: 'spin 8s linear infinite',
                willChange: 'transform'
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
            </div>

            {/* Counter Rotating Orbit */}
            <div 
              className="absolute inset-[-20px]"
              style={{
                animation: 'spinReverse 6s linear infinite',
                willChange: 'transform'
              }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
            </div>

            {/* Progress Ring */}
            <svg 
              className="absolute inset-[-30px] w-[140px] h-[140px] -rotate-90"
              style={{ willChange: 'transform' }}
            >
              <circle
                cx="70"
                cy="70"
                r="65"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="1"
                opacity="0.2"
              />
              <circle
                cx="70"
                cy="70"
                r="65"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="408"
                strokeDashoffset={408 - (408 * progress) / 100}
                style={{
                  transition: 'stroke-dashoffset 0.1s linear',
                  willChange: 'stroke-dashoffset'
                }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-5xl font-black tracking-tight text-slate-900"
          >
            FTW<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">OS</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex items-center gap-3 justify-center"
          >
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-300" />
            <p className="text-xs text-slate-400 tracking-[0.3em] uppercase font-bold">
              Initializing
            </p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-300" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-sm text-slate-500 font-medium"
          >
            {progress}%
          </motion.p>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes morphPulse {
          0%, 100% {
            transform: scale(1);
            border-radius: 50%;
          }
          25% {
            transform: scale(1.1);
            border-radius: 40%;
          }
          50% {
            transform: scale(0.95);
            border-radius: 50%;
          }
          75% {
            transform: scale(1.05);
            border-radius: 45%;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.2;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  )
}
