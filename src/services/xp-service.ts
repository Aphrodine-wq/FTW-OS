import { supabase } from './supabase'

export interface UserLevel {
  userId: string
  level: number
  currentXp: number
  totalXp: number
  rank: string
  createdAt: string
  updatedAt: string
}

export interface XpEvent {
  id: string
  userId: string
  action: string
  xpEarned: number
  createdAt: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  requirements: any
  icon: string
  createdAt: string
}

export interface UserAchievement {
  userId: string
  achievementId: string
  unlockedAt: string
  achievement?: Achievement
}

export interface LeaderboardEntry {
  userId: string
  username: string
  avatar?: string
  level: number
  totalXp: number
  rank: number
  change: number // rank change from last period
}

class XpService {
  // XP values for different actions
  private readonly XP_VALUES = {
    // Tasks
    task_completed: 10,
    task_created: 2,
    task_updated: 1,

    // Invoices
    invoice_created: 5,
    invoice_paid: 25,
    invoice_overdue: -10,

    // Clients
    client_added: 15,
    client_contacted: 3,

    // Time tracking
    time_logged: 1, // per minute
    focus_session: 20,

    // Daily bonuses
    daily_login: 5,
    streak_bonus: 10, // per day in streak

    // Social
    team_collaboration: 8,
    feedback_given: 5,

    // Achievements
    achievement_unlocked: 50,

    // Special events
    first_sale: 100,
    revenue_milestone: 200,
    productivity_record: 75
  }

  // Level thresholds (cumulative XP required)
  private readonly LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    1000,   // Level 5
    1750,   // Level 6
    2750,   // Level 7
    4000,   // Level 8
    5500,   // Level 9
    7500,   // Level 10
    10000,  // Level 11
    13500,  // Level 12
    18000,  // Level 13
    23500,  // Level 14
    30000   // Level 15
  ]

  // Rank titles
  private readonly RANKS = [
    'Intern',
    'Junior Developer',
    'Developer',
    'Senior Developer',
    'Lead Developer',
    'Tech Lead',
    'Engineering Manager',
    'Director of Engineering',
    'VP of Engineering',
    'CTO',
    'Chief Architect',
    'Innovation Lead',
    'Visionary',
    'Legend',
    'Digital Immortal'
  ]

  // Award XP for an action
  async awardXp(userId: string, action: string, multiplier: number = 1, metadata?: any): Promise<{
    xpEarned: number
    newLevel: number
    leveledUp: boolean
    newRank?: string
  }> {
    try {
      const baseXp = this.XP_VALUES[action as keyof typeof this.XP_VALUES] || 0
      const xpEarned = Math.round(baseXp * multiplier)

      if (xpEarned === 0) return { xpEarned: 0, newLevel: 1, leveledUp: false }

      // Record XP event
      const { error: eventError } = await supabase
        .from('xp_events')
        .insert({
          user_id: userId,
          action,
          xp_earned: xpEarned,
          metadata
        })

      if (eventError) throw eventError

      // Update user level
      const { data: currentLevel, error: levelError } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (levelError && levelError.code !== 'PGRST116') throw levelError

      const newTotalXp = (currentLevel?.total_xp || 0) + xpEarned
      const newLevel = this.calculateLevel(newTotalXp)
      const newRank = this.RANKS[Math.min(newLevel - 1, this.RANKS.length - 1)]
      const leveledUp = newLevel > (currentLevel?.level || 1)

      if (currentLevel) {
        // Update existing level
        const { error: updateError } = await supabase
          .from('user_levels')
          .update({
            level: newLevel,
            current_xp: newTotalXp - this.LEVEL_THRESHOLDS[newLevel - 1],
            total_xp: newTotalXp,
            rank: newRank,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (updateError) throw updateError
      } else {
        // Create new level record
        const { error: insertError } = await supabase
          .from('user_levels')
          .insert({
            user_id: userId,
            level: newLevel,
            current_xp: newTotalXp - this.LEVEL_THRESHOLDS[newLevel - 1],
            total_xp: newTotalXp,
            rank: newRank
          })

        if (insertError) throw insertError
      }

      return {
        xpEarned,
        newLevel,
        leveledUp,
        newRank: leveledUp ? newRank : undefined
      }
    } catch (error) {
      console.error('Error awarding XP:', error)
      throw error
    }
  }

  // Get user level
  async getUserLevel(userId: string): Promise<UserLevel | null> {
    try {
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (!data) return null

      return {
        userId: data.user_id,
        level: data.level,
        currentXp: data.current_xp,
        totalXp: data.total_xp,
        rank: data.rank,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error getting user level:', error)
      throw error
    }
  }

  // Get XP events for user
  async getXpEvents(userId: string, limit: number = 50): Promise<XpEvent[]> {
    try {
      const { data, error } = await supabase
        .from('xp_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data.map((event: any) => ({
        id: event.id,
        userId: event.user_id,
        action: event.action,
        xpEarned: event.xp_earned,
        createdAt: event.created_at
      }))
    } catch (error) {
      console.error('Error getting XP events:', error)
      throw error
    }
  }

  // Calculate level from total XP
  private calculateLevel(totalXp: number): number {
    for (let i = this.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalXp >= this.LEVEL_THRESHOLDS[i]) {
        return i + 1
      }
    }
    return 1
  }

  // Get XP needed for next level
  getXpForNextLevel(currentLevel: number): number {
    if (currentLevel >= this.LEVEL_THRESHOLDS.length) {
      return 0 // Max level reached
    }
    return this.LEVEL_THRESHOLDS[currentLevel] - this.LEVEL_THRESHOLDS[currentLevel - 1]
  }

  // Get leaderboard
  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time', limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      let query = supabase
        .from('user_levels')
        .select(`
          user_id,
          level,
          total_xp,
          rank,
          auth.users!inner(username, avatar_url)
        `)
        .order('total_xp', { ascending: false })
        .limit(limit)

      // For time-based periods, we'd need to filter XP events by date
      // This is a simplified version - in production you'd want proper time-based filtering
      if (period !== 'all-time') {
        // This would require more complex queries with date filtering
        // For now, return all-time leaderboard
      }

      const { data, error } = await query

      if (error) throw error

      return data.map((entry: any, index: number) => ({
        userId: entry.user_id,
        username: entry.users?.username || 'Anonymous',
        avatar: entry.users?.avatar_url,
        level: entry.level,
        totalXp: entry.total_xp,
        rank: index + 1,
        change: 0 // Would need historical data to calculate
      }))
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      throw error
    }
  }

  // Initialize achievements
  async initializeAchievements(): Promise<void> {
    try {
      const achievements = [
        // Productivity achievements
        {
          name: 'First Steps',
          description: 'Complete your first task',
          category: 'productivity',
          rarity: 'common' as const,
          points: 10,
          requirements: { tasks_completed: 1 },
          icon: 'target'
        },
        {
          name: 'Task Master',
          description: 'Complete 100 tasks',
          category: 'productivity',
          rarity: 'rare' as const,
          points: 50,
          requirements: { tasks_completed: 100 },
          icon: 'zap'
        },
        {
          name: 'Productivity Legend',
          description: 'Complete 1000 tasks',
          category: 'productivity',
          rarity: 'legendary' as const,
          points: 200,
          requirements: { tasks_completed: 1000 },
          icon: 'crown'
        },

        // Financial achievements
        {
          name: 'First Sale',
          description: 'Create your first invoice',
          category: 'finance',
          rarity: 'common' as const,
          points: 15,
          requirements: { invoices_created: 1 },
          icon: 'money'
        },
        {
          name: 'Revenue Generator',
          description: 'Generate $10,000 in revenue',
          category: 'finance',
          rarity: 'epic' as const,
          points: 100,
          requirements: { revenue_generated: 10000 },
          icon: 'rocket'
        },

        // Client achievements
        {
          name: 'Network Builder',
          description: 'Add 10 clients',
          category: 'crm',
          rarity: 'rare' as const,
          points: 30,
          requirements: { clients_added: 10 },
          icon: 'handshake'
        },

        // Time tracking achievements
        {
          name: 'Time Keeper',
          description: 'Log 100 hours of work',
          category: 'productivity',
          rarity: 'rare' as const,
          points: 40,
          requirements: { hours_logged: 100 },
          icon: 'clock'
        },

        // Social achievements
        {
          name: 'Team Player',
          description: 'Collaborate on 50 tasks',
          category: 'social',
          rarity: 'rare' as const,
          points: 35,
          requirements: { collaborations: 50 },
          icon: 'users'
        },

        // Special achievements
        {
          name: 'Early Bird',
          description: 'Log in for 7 consecutive days',
          category: 'engagement',
          rarity: 'rare' as const,
          points: 25,
          requirements: { consecutive_logins: 7 },
          icon: 'bird'
        },
        {
          name: 'Centurion',
          description: 'Reach level 100',
          category: 'progression',
          rarity: 'legendary' as const,
          points: 500,
          requirements: { level_reached: 100 },
          icon: 'hundred'
        }
      ]

      for (const achievement of achievements) {
        const { error } = await supabase
          .from('achievements')
          .upsert({
            name: achievement.name,
            description: achievement.description,
            category: achievement.category,
            rarity: achievement.rarity,
            points: achievement.points,
            requirements: achievement.requirements,
            icon: achievement.icon
          }, {
            onConflict: 'name'
          })

        if (error) throw error
      }
    } catch (error) {
      console.error('Error initializing achievements:', error)
      throw error
    }
  }

  // Check and unlock achievements
  async checkAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      // Get user stats (this would need to be implemented based on your data structure)
      const userStats = await this.getUserStats(userId)

      // Get all achievements
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')

      if (error) throw error

      // Get already unlocked achievements
      const { data: unlocked, error: unlockError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)

      if (unlockError) throw unlockError

      const unlockedIds = new Set(unlocked.map((u: any) => u.achievement_id))
      const newAchievements: UserAchievement[] = []

      for (const achievement of achievements) {
        if (unlockedIds.has(achievement.id)) continue

        // Check if requirements are met
        const requirementsMet = this.checkRequirements(achievement.requirements, userStats)

        if (requirementsMet) {
          // Unlock achievement
          const { error: insertError } = await supabase
            .from('user_achievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id
            })

          if (insertError) throw insertError

          newAchievements.push({
            userId,
            achievementId: achievement.id,
            unlockedAt: new Date().toISOString(),
            achievement: {
              id: achievement.id,
              name: achievement.name,
              description: achievement.description,
              category: achievement.category,
              rarity: achievement.rarity,
              points: achievement.points,
              requirements: achievement.requirements,
              icon: achievement.icon,
              createdAt: achievement.created_at
            }
          })

          // Award XP for achievement
          await this.awardXp(userId, 'achievement_unlocked', 1, { achievement: achievement.name })
        }
      }

      return newAchievements
    } catch (error) {
      console.error('Error checking achievements:', error)
      throw error
    }
  }

  // Get user stats for achievement checking
  private async getUserStats(userId: string): Promise<any> {
    // This would aggregate stats from various tables
    // Simplified version for now
    const level = await this.getUserLevel(userId)

    return {
      level: level?.level || 1,
      total_xp: level?.totalXp || 0,
      tasks_completed: 0, // Would need to count from tasks table
      invoices_created: 0, // Would need to count from invoices table
      clients_added: 0, // Would need to count from clients table
      hours_logged: 0, // Would need to sum from time_entries table
      revenue_generated: 0, // Would need to sum from invoices table
      collaborations: 0, // Would need to count shared tasks
      consecutive_logins: 0 // Would need login tracking
    }
  }

  // Check if achievement requirements are met
  private checkRequirements(requirements: any, stats: any): boolean {
    for (const [key, value] of Object.entries(requirements)) {
      if ((stats[key] || 0) < (value as number)) {
        return false
      }
    }
    return true
  }

  // Get user achievements
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          user_id,
          achievement_id,
          unlocked_at,
          achievements (*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })

      if (error) throw error

      return data.map((item: any) => ({
        userId: item.user_id,
        achievementId: item.achievement_id,
        unlockedAt: item.unlocked_at,
        achievement: item.achievements ? {
          id: item.achievements.id,
          name: item.achievements.name,
          description: item.achievements.description,
          category: item.achievements.category,
          rarity: item.achievements.rarity,
          points: item.achievements.points,
          requirements: item.achievements.requirements,
          icon: item.achievements.icon,
          createdAt: item.achievements.created_at
        } : undefined
      }))
    } catch (error) {
      console.error('Error getting user achievements:', error)
      throw error
    }
  }
}

export const xpService = new XpService()
