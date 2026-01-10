import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '@/stores/settings-store'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/services/utils'
import { 
  Github, GitCommit, GitPullRequest, Star, Eye, Code, 
  Terminal, Activity, Lock, Unlock, RefreshCw, ExternalLink,
  Cpu, GitFork, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Repo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string
  private: boolean
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string
  updated_at: string
  open_issues_count: number
  topics: string[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function DevHQ() {
  const { integrations } = useSettingsStore()
  const { mode } = useThemeStore()
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)
  const [repoStats, setRepoStats] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    if (integrations.githubToken) {
      fetchData()
    }
  }, [integrations.githubToken])

  useEffect(() => {
    if (selectedRepo && integrations.githubToken) {
      fetchRepoStats(selectedRepo)
    }
  }, [selectedRepo])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch User
      const user = await window.ipcRenderer.invoke('github:user', { token: integrations.githubToken })
      setUserProfile(user)

      // Fetch Repos
      const data = await window.ipcRenderer.invoke('github:repos', { token: integrations.githubToken })
      if (Array.isArray(data)) {
        setRepos(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchRepoStats = async (repo: Repo) => {
    setRepoStats(null)
    const [owner, name] = repo.full_name.split('/')
    const stats = await window.ipcRenderer.invoke('github:repo-stats', { 
        token: integrations.githubToken,
        owner, 
        repo: name 
    })
    setRepoStats(stats)
  }

  const filteredRepos = useMemo(() => {
    return repos.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase()) || 
                            repo.description?.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === 'all' 
                            ? true 
                            : filter === 'private' ? repo.private : !repo.private
      return matchesSearch && matchesFilter
    })
  }, [repos, search, filter])

  // Language Stats
  const languageData = useMemo(() => {
    const stats: Record<string, number> = {}
    repos.forEach(repo => {
      if (repo.language) {
        stats[repo.language] = (stats[repo.language] || 0) + 1
      }
    })
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [repos])

  if (!integrations.githubToken) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className={cn("p-6 rounded-full", mode === 'glass' ? "bg-white/5" : "bg-gray-100")}>
          <Github className="h-16 w-16 opacity-50" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold">Connect to GitHub</h2>
          <p className="text-muted-foreground">
            Access your entire codebase, track issues, and visualize your development velocity directly from your dashboard.
          </p>
        </div>
        <div className="p-4 bg-yellow-500/10 text-yellow-600 rounded-lg text-sm border border-yellow-500/20">
          Go to <strong>Settings {'>'} Integrations</strong> to add your Personal Access Token.
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={cn("p-4 rounded-xl border flex items-center gap-4", mode === 'glass' ? "bg-black/40 border-white/10" : "bg-white border-gray-200")}
        >
            <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg"><Code className="h-6 w-6" /></div>
            <div>
                <p className="text-sm opacity-70">Total Repositories</p>
                <p className="text-2xl font-bold">{repos.length}</p>
            </div>
        </motion.div>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={cn("p-4 rounded-xl border flex items-center gap-4", mode === 'glass' ? "bg-black/40 border-white/10" : "bg-white border-gray-200")}
        >
            <div className="p-3 bg-purple-500/20 text-purple-500 rounded-lg"><Star className="h-6 w-6" /></div>
            <div>
                <p className="text-sm opacity-70">Total Stars</p>
                <p className="text-2xl font-bold">{repos.reduce((acc, r) => acc + r.stargazers_count, 0)}</p>
            </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={cn("p-4 rounded-xl border flex items-center gap-4", mode === 'glass' ? "bg-black/40 border-white/10" : "bg-white border-gray-200")}
        >
            <div className="p-3 bg-green-500/20 text-green-500 rounded-lg"><Activity className="h-6 w-6" /></div>
            <div>
                <p className="text-sm opacity-70">Public Activity</p>
                <p className="text-2xl font-bold">{repos.filter(r => !r.private).length} Repos</p>
            </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={cn("p-4 rounded-xl border flex items-center gap-4", mode === 'glass' ? "bg-black/40 border-white/10" : "bg-white border-gray-200")}
        >
            {userProfile && (
                <>
                <img src={userProfile.avatar_url} className="h-12 w-12 rounded-lg" alt="Profile" />
                <div>
                    <p className="text-sm font-bold">{userProfile.login}</p>
                    <p className="text-xs opacity-60">{userProfile.bio || 'Developer'}</p>
                </div>
                </>
            )}
        </motion.div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Repo List */}
        <div className={cn("flex-1 flex flex-col rounded-xl border overflow-hidden", mode === 'glass' ? "bg-black/40 border-white/10" : "bg-white border-gray-200")}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                    <Input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search repositories..."
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                    {['all', 'public', 'private'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all",
                                filter === f 
                                    ? "bg-white dark:bg-black shadow-sm text-blue-500" 
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {filteredRepos.map(repo => (
                    <motion.div
                        key={repo.id}
                        layoutId={`repo-${repo.id}`}
                        onClick={() => setSelectedRepo(repo)}
                        className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all group",
                            selectedRepo?.id === repo.id
                                ? "bg-blue-500/10 border-blue-500/50"
                                : "border-transparent hover:bg-gray-100 dark:hover:bg-white/5"
                        )}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={cn("font-bold text-sm flex items-center gap-2", selectedRepo?.id === repo.id ? "text-blue-500" : "")}>
                                {repo.private ? <Lock className="h-3 w-3 opacity-50" /> : <Unlock className="h-3 w-3 opacity-50" />}
                                {repo.name}
                            </h3>
                            <span className="text-[10px] opacity-50">{new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs opacity-60 line-clamp-1 mb-2">{repo.description || 'No description'}</p>
                        <div className="flex gap-3 text-xs opacity-50">
                            {repo.language && <span className="flex items-center gap-1"><Code className="h-3 w-3" /> {repo.language}</span>}
                            <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {repo.stargazers_count}</span>
                            <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {repo.forks_count}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Details Panel */}
        <div className={cn("w-96 rounded-xl border flex flex-col overflow-hidden", mode === 'glass' ? "bg-black/40 border-white/10" : "bg-white border-gray-200")}>
            {selectedRepo ? (
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-2 break-all">{selectedRepo.name}</h2>
                        <p className="text-sm opacity-60 mb-4">{selectedRepo.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedRepo.topics.map(t => (
                                <span key={t} className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-medium">
                                    #{t}
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => window.open(selectedRepo.html_url, '_blank')}>
                                <Github className="h-4 w-4 mr-2" /> View
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => window.open(`${selectedRepo.html_url}/issues`, '_blank')}>
                                <AlertCircle className="h-4 w-4 mr-2" /> Issues
                            </Button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 text-center">
                                <p className="text-xs opacity-50">Open Issues</p>
                                <p className="text-xl font-bold">{selectedRepo.open_issues_count}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 text-center">
                                <p className="text-xs opacity-50">Watchers</p>
                                <p className="text-xl font-bold">{selectedRepo.watchers_count}</p>
                            </div>
                        </div>

                        {/* Languages Chart */}
                        {repoStats?.languages && Object.keys(repoStats.languages).length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-3">Languages</h4>
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(repoStats.languages).map(([name, value]) => ({ name, value }))}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={60}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {Object.keys(repoStats.languages).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 mt-2">
                                    {Object.keys(repoStats.languages).slice(0, 4).map((lang, i) => (
                                        <div key={lang} className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-xs opacity-70">{lang}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-50">
                    <Terminal className="h-16 w-16 mb-4" />
                    <p>Select a repository to view details</p>
                    
                    <div className="mt-12 w-full">
                        <h4 className="text-sm font-medium mb-4">Top Languages</h4>
                        <div className="h-40">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={languageData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {languageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
