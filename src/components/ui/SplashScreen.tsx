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
    <div className="fixed inset-0 bg-black text-green-500 font-mono flex flex-col items-center justify-center p-8 z-[9999] overflow-hidden">
      {/* Background Matrix Effect (Subtle) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,14,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat" />

      <div className="w-full max-w-2xl relative z-10 flex flex-col gap-12">
        {/* Main Logo / Identity */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 border-4 border-green-500 rounded-lg flex items-center justify-center relative overflow-hidden bg-black/50"
            >
              <div className="absolute inset-0 bg-green-500/20 animate-pulse" />
              <Terminal className="w-12 h-12 relative z-10" />
            </motion.div>

            {/* Morphing Orbits */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-green-500/30 rounded-full border-dashed"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border border-green-500/20 rounded-full"
            />
          </div>

          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tighter text-white mb-2"
            >
              FTW<span className="text-green-500">_OS</span>
            </motion.h1>
            <p className="text-xs text-green-500/60 tracking-widest uppercase">System Initialization v2.0</p>
          </div>
        </div>

        {/* Boot Sequence Visualization */}
        <div className="grid grid-cols-4 gap-4">
          {[Shield, Cpu, Database, Wifi].map((Icon, idx) => (
            <div key={idx} className={`flex flex-col items-center gap-2 p-4 rounded bg-green-950/20 border border-green-900/50 transition-all duration-500 ${currentLogIndex > idx * 2 ? 'opacity-100 border-green-500/50' : 'opacity-30'}`}>
              <Icon className="w-6 h-6" />
              <div className="h-1 w-full bg-green-900/50 rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-green-500"
                  initial={{ width: "0%" }}
                  animate={{ width: currentLogIndex > idx * 2 ? "100%" : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* System Logs */}
        <div className="h-32 bg-black border border-green-900/50 rounded p-4 font-mono text-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black to-transparent z-10" />
          <div className="flex flex-col justify-end h-full gap-1">
            <AnimatePresence>
              {logs.slice(-5).map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-green-700">{`>`}</span>
                  <span>{log}</span>
                  {i === logs.slice(-5).length - 1 && (
                    <span className="w-2 h-4 bg-green-500 animate-pulse ml-1" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs uppercase tracking-wider text-green-500/60">
            <span>Loading Core</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-green-900/30 w-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
