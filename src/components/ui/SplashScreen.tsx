import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, Cpu, Database, CheckCircle } from 'lucide-react'
import { FloatingParticles } from './landing/FloatingParticles'

type BootStage = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  duration: number
  color: string
}

const BOOT_STAGES: BootStage[] = [
  { id: 'security', label: 'Initializing Security', icon: Shield, duration: 800, color: '#3b82f6' },
  { id: 'core', label: 'Loading Core Systems', icon: Cpu, duration: 600, color: '#8b5cf6' },
  { id: 'database', label: 'Connecting Database', icon: Database, duration: 700, color: '#10b981' },
  { id: 'modules', label: 'Loading Modules', icon: Zap, duration: 900, color: '#f59e0b' },
  { id: 'ready', label: 'Ready to Launch', icon: CheckCircle, duration: 500, color: '#06b6d4' }
]

interface SplashScreenProps {
  onComplete?: () => void
  progress?: number
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  progress = 0
}) => {
  const [currentStage, setCurrentStage] = useState(0)
  const [stageProgress, setStageProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => setIsComplete(true), 800)
      return
    }

    let timer: NodeJS.Timeout
    let progressTimer: NodeJS.Timeout
    
    const stage = BOOT_STAGES[currentStage]
    
    // Progress animation for current stage
    const increment = 100 / (stage.duration / 16) // 60fps
    progressTimer = setInterval(() => {
      setStageProgress(p => {
        const newProgress = Math.min(p + increment, 100)
        return newProgress
      })
    }, 16)
    
    // Stage transition
    timer = setTimeout(() => {
      if (currentStage < BOOT_STAGES.length - 1) {
        setCurrentStage(c => c + 1)
        setStageProgress(0)
      }
    }, stage.duration)
    
    return () => {
      clearTimeout(timer)
      clearInterval(progressTimer)
    }
  }, [currentStage, progress])

  const stage = BOOT_STAGES[currentStage]
  const Icon = stage.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isComplete ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-white flex items-center justify-center overflow-hidden font-sans z-[9999]"
    >
      {/* Background Ambience (Matched to Enter Screen) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-white to-white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8 px-8">
        {/* Logo with pulse - colored accent */}
        <motion.div
          className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-black"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #10b981)'
          }}
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 20px rgba(59, 130, 246, 0.3)',
              '0 0 60px rgba(139, 92, 246, 0.5)',
              '0 0 20px rgba(59, 130, 246, 0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-12 h-12 text-white" />
        </motion.div>

        {/* Title */}
        <div>
          <h1 className="text-4xl font-bold text-black mb-2">FTW-OS</h1>
          <p className="text-gray-600 text-sm">Version 2.0.0</p>
        </div>

        {/* Boot stages */}
        <div className="space-y-4 w-80">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-3 text-black"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Icon className="w-5 h-5" style={{ color: stage.color }} />
              </motion.div>
              <span className="text-sm font-medium">{stage.label}</span>
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full"
              style={{ 
                width: `${stageProgress}%`,
                background: `linear-gradient(90deg, ${stage.color}, ${BOOT_STAGES[(currentStage + 1) % BOOT_STAGES.length]?.color || stage.color})`
              }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Stage indicators */}
          <div className="flex justify-center gap-2">
            {BOOT_STAGES.map((s, i) => (
              <div
                key={s.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < currentStage
                    ? 'bg-green-500'
                    : i === currentStage
                    ? 'scale-125'
                    : 'bg-gray-300'
                }`}
                style={i === currentStage ? { backgroundColor: stage.color } : {}}
              />
            ))}
          </div>
        </div>

        {/* System info */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>Build: {import.meta.env.VITE_BUILD_NUMBER || '20250114'}</p>
          <p>
            Electron {(typeof process !== 'undefined' && (process as any).versions?.electron) || 'N/A'} • 
            Node {(typeof process !== 'undefined' && (process as any).versions?.node) || 'N/A'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
