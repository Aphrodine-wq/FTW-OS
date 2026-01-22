import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, TrendingUp, Award, Zap, Crown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { xpService, UserLevel, UserAchievement, LeaderboardEntry } from '@/services/xp-service'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

interface GamificationPanelProps {
  className?: string
}

export const GamificationPanel: React.FC<GamificationPanelProps> = ({ className }) => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('level')

  // Fetch user level
  const { data: userLevel, isLoading: levelLoading } = useQuery({
    queryKey: ['userLevel', user?.id],
    queryFn: () => user?.id ? xpService.getUserLevel(user.id) : null,
    enabled: !!user?.id,
    refetchInterval: 30000 // Refetch every 30 seconds
  })

  // Fetch user achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['userAchievements', user?.id],
    queryFn: () => user?.id ? xpService.getUserAchievements(user.id) : [],
    enabled: !!user?.id
  })

  // Fetch leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => xpService.getLeaderboard('all-time', 10),
    refetchInterval: 60000 // Refetch every minute
  })

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500'
      case 'rare': return 'bg-blue-500'
      case 'epic': return 'bg-purple-500'
      case 'legendary': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="w-3 h-3" />
      case 'rare': return <Award className="w-3 h-3" />
      case 'epic': return <Crown className="w-3 h-3" />
      case 'legendary': return <Zap className="w-3 h-3" />
      default: return <Star className="w-3 h-3" />
    }
  }

  const getXpProgress = (level: UserLevel) => {
    const currentLevelThreshold = xpService.getXpForNextLevel(level.level - 1)
    const nextLevelThreshold = xpService.getXpForNextLevel(level.level)
    const progressInLevel = level.currentXp
    const totalForLevel = nextLevelThreshold - currentLevelThreshold

    return totalForLevel > 0 ? (progressInLevel / totalForLevel) * 100 : 100
  }

  if (!user) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Please log in to view gamification</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Gamification Hub
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="level">Level</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="level" className="space-y-4">
            {levelLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : userLevel ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Level Display */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    Level {userLevel.level}
                  </div>
                  <div className="text-lg text-muted-foreground mb-2">
                    {userLevel.rank}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {userLevel.totalXp.toLocaleString()} XP Total
                  </div>
                </div>

                {/* XP Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level Progress</span>
                    <span>{userLevel.currentXp} / {xpService.getXpForNextLevel(userLevel.level)} XP</span>
                  </div>
                  <Progress value={getXpProgress(userLevel)} className="h-2" />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {userLevel.totalXp}
                    </div>
                    <div className="text-xs text-muted-foreground">Total XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {achievements?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Start completing tasks to earn XP and level up!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {achievementsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : achievements && achievements.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.achievementId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="text-2xl">
                        {achievement.achievement?.icon || '🏆'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{achievement.achievement?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {achievement.achievement?.description}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={cn("text-xs", getRarityColor(achievement.achievement?.rarity || 'common'))}
                          >
                            {getRarityIcon(achievement.achievement?.rarity || 'common')}
                            {achievement.achievement?.rarity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No achievements unlocked yet. Keep working to earn your first badge!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            {leaderboardLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg",
                      entry.userId === user.id ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 ? "bg-yellow-500 text-black" :
                      index === 1 ? "bg-gray-400 text-black" :
                      index === 2 ? "bg-amber-600 text-white" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{entry.username}</div>
                      <div className="text-sm text-muted-foreground">
                        Level {entry.level} • {entry.totalXp.toLocaleString()} XP
                      </div>
                    </div>
                    {entry.userId === user.id && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No leaderboard data available yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
