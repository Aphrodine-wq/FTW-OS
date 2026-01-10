import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Command, Cpu, Hash } from 'lucide-react'

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
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 flex items-center justify-center bg-[#F5F5F7] overflow-hidden"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-pink-400/20 to-orange-500/20 blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Main Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative mb-12"
        >
          {/* Glowing Ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-20" />
          
          <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-white/50 backdrop-blur-xl flex items-center justify-center">
            <motion.div
              animate={{ 
                boxShadow: ["0 0 0 0px rgba(59, 130, 246, 0)", "0 0 0 10px rgba(59, 130, 246, 0.1)", "0 0 0 20px rgba(59, 130, 246, 0)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl"
            />
            <Zap className="w-16 h-16 text-transparent bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text" />
          </div>

          {/* Orbiting Icons */}
          {[Command, Cpu, Hash].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-full h-full -ml-[50%] -mt-[50%]"
              animate={{ rotate: 360 }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
            >
              <div className="absolute -top-6 left-1/2 -ml-3 bg-white p-1.5 rounded-lg shadow-md border border-gray-100">
                <Icon className="w-4 h-4 text-gray-400" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Text Content */}
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-black tracking-tighter text-gray-900"
          >
            FTW<span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">OS</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-3 text-sm font-medium text-gray-500 uppercase tracking-widest"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Initializing
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "300px" }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12"
        >
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50 }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-400">
            <span>LOADING MODULES...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
