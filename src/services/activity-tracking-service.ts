import { supabase } from './supabase'

export interface ActivityLog {
  id?: string
  user_id: string
  activity_type: 'task_start' | 'task_complete' | 'focus_session' | 'break' | 'context_switch' | 'interruption'
  duration?: number // in seconds
  focus_score?: number // 0-100
  context_switches?: number
  metadata?: Record<string, any>
  created_at?: string
}

export interface ProductivityMetrics {
  peakHours: { hour: number; score: number }[]
  averageFocusScore: number
  totalContextSwitches: number
  totalFocusTime: number
  burnoutRisk: number // 0-100
  productivityTrend: 'increasing' | 'stable' | 'decreasing'
}

class ActivityTrackingService {
  private currentSession: {
    startTime: Date
    activityType: string
    contextSwitches: number
  } | null = null

  // Log an activity
  async logActivity(activity: Omit<ActivityLog, 'user_id' | 'id' | 'created_at'>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          ...activity,
          created_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  // Start a focus session
  startFocusSession(activityType: string = 'focus_session'): void {
    this.currentSession = {
      startTime: new Date(),
      activityType,
      contextSwitches: 0
    }
  }

  // Record a context switch
  recordContextSwitch(): void {
    if (this.currentSession) {
      this.currentSession.contextSwitches++
    }
  }

  // End focus session and log it
  async endFocusSession(focusScore?: number): Promise<void> {
    if (!this.currentSession) return

    const duration = Math.floor((Date.now() - this.currentSession.startTime.getTime()) / 1000)
    
    await this.logActivity({
      activity_type: 'focus_session',
      duration,
      focus_score: focusScore,
      context_switches: this.currentSession.contextSwitches,
      metadata: {
        session_type: this.currentSession.activityType
      }
    })

    this.currentSession = null
  }

  // Get recent activity logs
  async getRecentActivity(limit: number = 100): Promise<ActivityLog[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch activity:', error)
      return []
    }
  }

  // Calculate productivity metrics
  async getProductivityMetrics(days: number = 7): Promise<ProductivityMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      const activities = data || []

      // Calculate peak hours
      const hourlyScores = new Map<number, { total: number; count: number }>()
      let totalFocusScore = 0
      let focusScoreCount = 0
      let totalContextSwitches = 0
      let totalFocusTime = 0

      activities.forEach((activity: ActivityLog) => {
        const hour = new Date(activity.created_at!).getHours()
        
        if (activity.focus_score !== null && activity.focus_score !== undefined) {
          const current = hourlyScores.get(hour) || { total: 0, count: 0 }
          hourlyScores.set(hour, {
            total: current.total + activity.focus_score,
            count: current.count + 1
          })
          totalFocusScore += activity.focus_score
          focusScoreCount++
        }

        if (activity.context_switches) {
          totalContextSwitches += activity.context_switches
        }

        if (activity.duration && activity.activity_type === 'focus_session') {
          totalFocusTime += activity.duration
        }
      })

      // Calculate peak hours
      const peakHours = Array.from(hourlyScores.entries())
        .map(([hour, { total, count }]) => ({
          hour,
          score: Math.round(total / count)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

      // Calculate burnout risk
      const avgContextSwitches = activities.length > 0 ? totalContextSwitches / activities.length : 0
      const avgFocusScore = focusScoreCount > 0 ? totalFocusScore / focusScoreCount : 50
      const burnoutRisk = Math.min(100, Math.max(0, 
        (avgContextSwitches * 10) + (100 - avgFocusScore)
      ))

      // Calculate trend
      const recentActivities = activities.slice(0, Math.floor(activities.length / 2))
      const olderActivities = activities.slice(Math.floor(activities.length / 2))
      
      const recentAvg = recentActivities.reduce((sum: number, a: ActivityLog) => sum + (a.focus_score || 0), 0) / recentActivities.length || 0
      const olderAvg = olderActivities.reduce((sum: number, a: ActivityLog) => sum + (a.focus_score || 0), 0) / olderActivities.length || 0
      
      let productivityTrend: 'increasing' | 'stable' | 'decreasing' = 'stable'
      if (recentAvg > olderAvg + 5) productivityTrend = 'increasing'
      else if (recentAvg < olderAvg - 5) productivityTrend = 'decreasing'

      return {
        peakHours,
        averageFocusScore: Math.round(avgFocusScore),
        totalContextSwitches,
        totalFocusTime,
        burnoutRisk: Math.round(burnoutRisk),
        productivityTrend
      }
    } catch (error) {
      console.error('Failed to calculate metrics:', error)
      return {
        peakHours: [],
        averageFocusScore: 0,
        totalContextSwitches: 0,
        totalFocusTime: 0,
        burnoutRisk: 0,
        productivityTrend: 'stable'
      }
    }
  }

  // Get hourly productivity pattern
  async getHourlyPattern(): Promise<Map<number, number>> {
    const activities = await this.getRecentActivity(500)
    const hourlyScores = new Map<number, number[]>()

    activities.forEach(activity => {
      if (activity.focus_score !== null && activity.focus_score !== undefined) {
        const hour = new Date(activity.created_at!).getHours()
        const scores = hourlyScores.get(hour) || []
        scores.push(activity.focus_score)
        hourlyScores.set(hour, scores)
      }
    })

    const pattern = new Map<number, number>()
    hourlyScores.forEach((scores, hour) => {
      const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length
      pattern.set(hour, Math.round(avg))
    })

    return pattern
  }

  // Predict best time for a task type
  async predictBestTime(taskType: string): Promise<{ hour: number; confidence: number }> {
    const pattern = await this.getHourlyPattern()
    
    if (pattern.size === 0) {
      return { hour: 10, confidence: 0 } // Default to 10 AM
    }

    let bestHour = 10
    let bestScore = 0

    pattern.forEach((score, hour) => {
      if (score > bestScore) {
        bestScore = score
        bestHour = hour
      }
    })

    const confidence = Math.min(100, (pattern.size / 24) * 100)

    return { hour: bestHour, confidence: Math.round(confidence) }
  }
}

export const activityTrackingService = new ActivityTrackingService()
