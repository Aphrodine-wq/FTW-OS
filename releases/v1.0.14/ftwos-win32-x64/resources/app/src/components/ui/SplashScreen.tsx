import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Shield, Cpu, Database, Wifi, CheckCircle2, Zap } from 'lucide-react'

const BOOT_LOGS = [
  "Initializing kernel...",
  "Loading system modules...",
  "Mounting file systems...",
  "Checking security protocols...",
  "Verifying integrity...",
  "Starting core services...",
  "Establishing network connection...",
  "Loading user preferences...",
  "System ready."
]

interface SplashScreenProps {
  onComplete?: () => void
  progress?: number
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete
}) => {
  const [logs, setLogs] = useState<string[]>([])
  const [currentLogIndex, setCurrentLogIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  // Log generation effect
  useEffect(() => {
    if (currentLogIndex >= BOOT_LOGS.length) {
      setTimeout(() => onComplete?.(), 800)
      return
    }

    const timeout = setTimeout(() => {
      setLogs(prev => [...prev, BOOT_LOGS[currentLogIndex]])
      setCurrentLogIndex(prev => prev + 1)
    }, 300)

    return () => clearTimeout(timeout)
  }, [currentLogIndex, onComplete])

  // Progress bar effect
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 100))
    }, 30) // ~3 seconds total
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-white text-gray-900 font-mono flex flex-col items-center justify-center p-8 z-[9999] overflow-hidden">
      {/* Background Matrix Effect (Subtle) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(rgba(18,16,14,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,0,0,0.03),rgba(0,0,0,0.01),rgba(0,0,0,0.03))] bg-[length:100%_2px,3px_100%] bg-repeat" />

      <div className="w-full max-w-2xl relative z-10 flex flex-col gap-12">
        {/* Main Logo / Identity */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 border-4 border-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden bg-gray-100"
            >
              <div className="absolute inset-0 bg-gray-800/10 animate-pulse" />
              <Terminal className="w-12 h-12 relative z-10 text-gray-800" />
            </motion.div>

            {/* Morphing Orbits */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-gray-400/30 rounded-full border-dashed"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border border-gray-400/20 rounded-full"
            />
          </div>

          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tighter text-white mb-2"
            >
              FTW<span className="text-gray-600">_OS</span>
            </motion.h1>
            <p className="text-xs text-gray-500 tracking-widest uppercase">System Initialization v2.0</p>
          </div>
        </div>

        {/* Boot Sequence Visualization */}
        <div className="grid grid-cols-4 gap-4">
          {[Shield, Cpu, Database, Wifi].map((Icon, idx) => (
            <div key={idx} className={`flex flex-col items-center gap-2 p-4 rounded bg-gray-100 border border-gray-300 transition-all duration-500 ${currentLogIndex > idx * 2 ? 'opacity-100 border-gray-600' : 'opacity-30'}`}>
              <Icon className="w-6 h-6 text-gray-800" />
              <div className="h-1 w-full bg-gray-300 rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-gray-700"
                  initial={{ width: "0%" }}
                  animate={{ width: currentLogIndex > idx * 2 ? "100%" : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* System Logs */}
        <div className="h-32 bg-gray-50 border border-gray-300 rounded p-4 font-mono text-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50 to-transparent z-10" />
          <div className="flex flex-col justify-end h-full gap-1">
            <AnimatePresence>
              {logs.slice(-5).map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-gray-600">{`>`}</span>
                  <span className="text-gray-800">{log}</span>
                  {i === logs.slice(-5).length - 1 && (
                    <span className="w-2 h-4 bg-gray-700 animate-pulse ml-1" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs uppercase tracking-wider text-gray-500">
            <span>Loading Core</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-gray-300 w-full overflow-hidden">
            <motion.div
              className="h-full bg-gray-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
