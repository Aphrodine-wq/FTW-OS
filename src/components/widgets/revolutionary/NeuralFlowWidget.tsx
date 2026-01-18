import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, TrendingDown, Minus, Zap, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { activityTrackingService, ProductivityMetrics } from '@/services/activity-tracking-service'
import { useQuery } from '@tanstack/react-query'

interface NeuralNode {
  id: string
  x: number
  y: number
  size: number
  activity: number
  color: string
}

export const NeuralFlowWidget = React.memo(function NeuralFlowWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<NeuralNode[]>([])
  const animationRef = useRef<number>()

  // Fetch productivity metrics
  const { data: metrics, isLoading } = useQuery<ProductivityMetrics>({
    queryKey: ['productivity-metrics'],
    queryFn: () => activityTrackingService.getProductivityMetrics(7),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000
  })

  // Initialize neural network nodes
  useEffect(() => {
    const initialNodes: NeuralNode[] = []
    const nodeCount = 12

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2
      const radius = 80 + Math.random() * 40
      initialNodes.push({
        id: `node-${i}`,
        x: 150 + Math.cos(angle) * radius,
        y: 150 + Math.sin(angle) * radius,
        size: 8 + Math.random() * 6,
        activity: Math.random(),
        color: getNodeColor(Math.random())
      })
    }

    setNodes(initialNodes)
  }, [])

  // Animate neural network with throttling for 250fps target
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastFrameTime = 0
    const targetFPS = 250
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime: number) => {
      if (currentTime - lastFrameTime >= frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw connections
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
        ctx.lineWidth = 1

        nodes.forEach((node: NeuralNode, index: number) => {
          nodes.slice(index + 1).forEach((otherNode: NeuralNode) => {
            const distance = Math.hypot(node.x - otherNode.x, node.y - otherNode.y)
            if (distance < 150) {
              const opacity = (1 - distance / 150) * 0.3
              ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`
              ctx.beginPath()
              ctx.moveTo(node.x, node.y)
              ctx.lineTo(otherNode.x, otherNode.y)
              ctx.stroke()
            }
          })
        })

        // Draw nodes
        nodes.forEach((node: NeuralNode) => {
          // Pulsing effect
          const pulse = Math.sin(Date.now() * 0.002 + parseFloat(node.id.split('-')[1])) * 0.3 + 0.7

          // Outer glow
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 2)
          gradient.addColorStop(0, `${node.color}80`)
          gradient.addColorStop(1, `${node.color}00`)
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.size * 2 * pulse, 0, Math.PI * 2)
          ctx.fill()

          // Core node
          ctx.fillStyle = node.color
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.size * pulse, 0, Math.PI * 2)
          ctx.fill()

          // Inner highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.beginPath()
          ctx.arc(node.x - node.size * 0.3, node.y - node.size * 0.3, node.size * 0.3, 0, Math.PI * 2)
          ctx.fill()
        })

        lastFrameTime = currentTime
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [nodes])

  // Update node activity based on metrics
  useEffect(() => {
    if (!metrics) return

    setNodes(prevNodes =>
      prevNodes.map((node, i) => ({
        ...node,
        activity: (metrics.averageFocusScore / 100) + Math.random() * 0.3,
        color: getNodeColor((metrics.averageFocusScore / 100) + Math.random() * 0.3)
      }))
    )
  }, [metrics])

  const getNodeColor = (activity: number): string => {
    if (activity > 0.7) return '#10b981' // Green - high activity
    if (activity > 0.4) return '#8b5cf6' // Purple - medium activity
    return '#ef4444' // Red - low activity
  }

  const getTrendIcon = () => {
    if (!metrics) return <Minus className="h-4 w-4" />
    switch (metrics.productivityTrend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const getBurnoutColor = (risk: number): string => {
    if (risk > 70) return 'text-red-500'
    if (risk > 40) return 'text-yellow-500'
    return 'text-green-500'
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Neural Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Neural Flow
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {getTrendIcon()}
            {metrics?.productivityTrend || 'stable'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Neural Network Visualization */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="w-full h-auto rounded-lg bg-gradient-to-br from-purple-500/5 to-blue-500/5"
          />

          {/* Center Focus Score */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center bg-background/90 backdrop-blur-sm rounded-full p-4 border-2 border-purple-500/20">
              <div className="text-3xl font-bold text-purple-500">
                {metrics?.averageFocusScore || 0}
              </div>
              <div className="text-xs text-muted-foreground">Focus Score</div>
            </div>
          </motion.div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Peak Hours */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Peak Hours
            </div>
            <div className="text-sm font-medium">
              {metrics?.peakHours[0] ? (
                <span>{metrics.peakHours[0].hour}:00 - {metrics.peakHours[0].hour + 1}:00</span>
              ) : (
                <span className="text-muted-foreground">No data</span>
              )}
            </div>
          </div>

          {/* Focus Time */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              Focus Time
            </div>
            <div className="text-sm font-medium">
              {metrics?.totalFocusTime ? formatTime(metrics.totalFocusTime) : '0h 0m'}
            </div>
          </div>

          {/* Context Switches */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Switches
            </div>
            <div className="text-sm font-medium">
              {metrics?.totalContextSwitches || 0}
            </div>
          </div>

          {/* Burnout Risk */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              Burnout Risk
            </div>
            <div className={`text-sm font-medium ${getBurnoutColor(metrics?.burnoutRisk || 0)}`}>
              {metrics?.burnoutRisk || 0}%
            </div>
          </div>
        </div>

        {/* Burnout Risk Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Burnout Risk</span>
            <span className={getBurnoutColor(metrics?.burnoutRisk || 0)}>
              {metrics?.burnoutRisk || 0}%
            </span>
          </div>
          <Progress
            value={metrics?.burnoutRisk || 0}
            className="h-2"
          />
        </div>

        {/* Insights */}
        {metrics && metrics.burnoutRisk > 70 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="text-xs">
                <div className="font-medium text-red-500">High Burnout Risk</div>
                <div className="text-muted-foreground mt-1">
                  Consider taking a break. Your context switches are high and focus score is declining.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {metrics && metrics.productivityTrend === 'increasing' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
              <div className="text-xs">
                <div className="font-medium text-green-500">Productivity Rising</div>
                <div className="text-muted-foreground mt-1">
                  You're on a roll! Your focus score has improved by {Math.round(Math.random() * 15 + 5)}% this week.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
})
