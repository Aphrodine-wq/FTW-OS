import React, { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Zap } from 'lucide-react'
import { revenueService, RevenueMetrics } from '@/services/revenue-service'
import { useQuery } from '@tanstack/react-query'

interface ReactorParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  energy: number
  type: 'revenue' | 'client' | 'alert'
}

export const RevenueReactorWidget = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<ReactorParticle[]>([])
  const [isHovered, setIsHovered] = useState(false)

  // Fetch revenue data
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['revenue-metrics'],
    queryFn: () => revenueService.getRevenueMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000
  })

  const { data: prediction } = useQuery({
    queryKey: ['revenue-prediction'],
    queryFn: () => revenueService.getRevenuePrediction(),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000
  })

  const { data: alerts } = useQuery({
    queryKey: ['revenue-alerts'],
    queryFn: () => revenueService.getRevenueAlerts(),
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 5000
  })

  // Initialize particles
  const initializeParticles = (metrics: RevenueMetrics) => {
    const particles: ReactorParticle[] = []

    // Revenue particles (green)
    const revenueCount = Math.min(Math.max(metrics.monthlyRevenue / 1000, 5), 20)
    for (let i = 0; i < revenueCount; i++) {
      particles.push({
        id: i,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 2,
        color: '#10b981',
        energy: Math.random() * 0.8 + 0.2,
        type: 'revenue'
      })
    }

    // Client particles (blue)
    const clientCount = Math.min(metrics.topClients.length * 2, 10)
    for (let i = 0; i < clientCount; i++) {
      particles.push({
        id: revenueCount + i,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 4 + 3,
        color: '#3b82f6',
        energy: Math.random() * 0.6 + 0.4,
        type: 'client'
      })
    }

    // Alert particles (red/orange)
    const alertCount = Math.min(alerts?.length || 0, 5)
    for (let i = 0; i < alertCount; i++) {
      particles.push({
        id: revenueCount + clientCount + i,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: Math.random() * 5 + 4,
        color: '#ef4444',
        energy: Math.random() * 0.9 + 0.1,
        type: 'alert'
      })
    }

    particlesRef.current = particles
  }

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    particlesRef.current.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Bounce off walls
      if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1
      if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1

      // Keep particles in bounds
      particle.x = Math.max(0, Math.min(canvas.width, particle.x))
      particle.y = Math.max(0, Math.min(canvas.height, particle.y))

      // Draw particle with glow effect
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      )
      gradient.addColorStop(0, particle.color + Math.floor(particle.energy * 255).toString(16).padStart(2, '0'))
      gradient.addColorStop(1, particle.color + '00')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()

      // Draw connections between nearby particles
      particlesRef.current.slice(index + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 80) {
          const opacity = (1 - distance / 80) * 0.3
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(otherParticle.x, otherParticle.y)
          ctx.stroke()
        }
      })
    })

    animationRef.current = requestAnimationFrame(animate)
  }

  // Initialize particles when metrics change
  useEffect(() => {
    if (metrics) {
      initializeParticles(metrics)
    }
  }, [metrics, alerts])

  // Start animation
  useEffect(() => {
    if (canvasRef.current) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Calculate reactor status
  const reactorStatus = useMemo(() => {
    if (!metrics) return { status: 'idle', color: '#6b7280', intensity: 0.3 }

    const healthScore =
      (metrics.paymentVelocity / 100) * 0.4 +
      ((100 - metrics.churnRisk) / 100) * 0.4 +
      (Math.min(metrics.monthlyRevenue / 10000, 1)) * 0.2

    if (healthScore > 0.8) return { status: 'optimal', color: '#10b981', intensity: 0.9 }
    if (healthScore > 0.6) return { status: 'stable', color: '#3b82f6', intensity: 0.7 }
    if (healthScore > 0.4) return { status: 'warning', color: '#f59e0b', intensity: 0.5 }
    return { status: 'critical', color: '#ef4444', intensity: 0.3 }
  }, [metrics])

  if (metricsLoading) {
    return (
      <div className="w-full h-80 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div
      className="w-full h-80 bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-slate-900/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: reactorStatus.color }}
            />
            <h3 className="text-white font-semibold text-sm">Revenue Reactor</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Zap className="w-3 h-3" />
            <span className="capitalize">{reactorStatus.status}</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={320}
        className="w-full h-full"
      />

      {/* Reactor Core */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-white">
            <div className="text-lg font-bold">{formatCurrency(metrics?.monthlyRevenue || 0)}</div>
            <div className="text-xs text-slate-400">This Month</div>
          </div>
          <div className="text-right text-white">
            <div className="text-sm font-semibold">
              {prediction ? `${prediction.confidence}%` : '--%'}
            </div>
            <div className="text-xs text-slate-400">Confidence</div>
          </div>
        </div>

        {/* Mini metrics */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-green-400 font-semibold">
              {formatCurrency(metrics?.outstandingInvoices || 0)}
            </div>
            <div className="text-slate-400">Outstanding</div>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-blue-400 font-semibold">
              {metrics?.paymentVelocity.toFixed(0)}%
            </div>
            <div className="text-slate-400">Velocity</div>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-orange-400 font-semibold">
              {metrics?.churnRisk.toFixed(0)}%
            </div>
            <div className="text-slate-400">Risk</div>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <div className="text-center text-white">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-sm font-semibold">Revenue Intelligence</div>
              <div className="text-xs text-slate-400">
                {prediction?.nextMonth ? formatCurrency(prediction.nextMonth) : 'Analyzing...'} predicted next month
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert indicator */}
      {alerts && alerts.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"
        />
      )}
    </motion.div>
  )
})
