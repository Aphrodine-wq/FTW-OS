import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '@/stores/settings-store'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/services/utils'
import {
    Github, GitCommit, GitPullRequest, Star, Eye, Code,
    Terminal, Activity, Lock, Unlock, RefreshCw, ExternalLink,
    Cpu, GitFork, AlertCircle, Search
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

const TerminalView = ({ repo }: { repo: Repo }) => {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<XTerm | null>(null)

    useEffect(() => {
        if (!terminalRef.current) return

        const term = new XTerm({
            theme: {
                background: '#09090b',
                foreground: '#f4f4f5',
                cursor: '#2563eb'
            },
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(terminalRef.current)
        fitAddon.fit()

        // Initialize backend PTY
        const termId = `term-${repo.id}`
        window.ipcRenderer.invoke('terminal:create', termId)

        // Handle Input
        term.onData(data => {
            window.ipcRenderer.send('terminal:write', { id: termId, data })
        })

        // Handle Output
        const handleData = (_: any, data: string) => {
            term.write(data)
        }
        window.ipcRenderer.on(`terminal:data:${termId}`, handleData)

        xtermRef.current = term

        // Cleanup
        return () => {
            term.dispose()
            window.ipcRenderer.off(`terminal:data:${termId}`, handleData)
            window.ipcRenderer.invoke('terminal:destroy', termId)
        }
    }, [])

    return (
        <div className="h-full w-full flex flex-col bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                    <span className="text-xs font-mono text-zinc-500 flex items-center justify-center gap-1">
                        <Terminal className="h-3 w-3" />
                        {repo.full_name}
                    </span>
                </div>
            </div>
            <div className="flex-1 relative p-2">
                <div ref={terminalRef} className="h-full w-full" />
            </div>
        </div>
    )
}

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
    const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'activity' | 'terminal'>('overview')

    useEffect(() => {
        if (integrations.githubToken) {
            // Validate token before fetching
            validateAndFetch()
        } else {
            setError("GitHub token not configured. Please connect your GitHub account in Settings.")
        }
    }, [integrations.githubToken])

    const validateAndFetch = async () => {
        if (!integrations.githubToken) {
            setError("GitHub token is required")
            return
        }

        // Basic token validation (GitHub tokens start with 'ghp_' or 'github_pat_')
        const tokenPattern = /^(ghp_|github_pat_)[a-zA-Z0-9_]+$/
        if (!tokenPattern.test(integrations.githubToken)) {
            setError("Invalid GitHub token format. Please check your token.")
            return
        }

        try {
            await fetchData()
        } catch (err: any) {
            setError(err.message || "Failed to fetch GitHub data")
        }
    }

    useEffect(() => {
        if (selectedRepo && integrations.githubToken) {
            fetchRepoStats(selectedRepo)
        }
    }, [selectedRepo])

    const [error, setError] = useState<string | null>(null)

    const fetchData = async (retryCount: number = 0) => {
        setLoading(true)
        setError(null)
        
        const maxRetries = 3
        const retryDelay = 1000 * (retryCount + 1) // Exponential backoff

        try {
            // Fetch User with retry logic
            let userRes: Response
            try {
                userRes = await fetch('https://api.github.com/user', {
                    headers: {
                        Authorization: `Bearer ${integrations.githubToken}`,
                        'X-GitHub-Api-Version': '2022-11-28',
                        'Accept': 'application/vnd.github.v3+json'
                    }
                })
            } catch (networkError) {
                throw new Error("Network error: Unable to connect to GitHub API")
            }

            // Handle rate limiting
            if (userRes.status === 403) {
                const rateLimitRemaining = userRes.headers.get('X-RateLimit-Remaining')
                const rateLimitReset = userRes.headers.get('X-RateLimit-Reset')
                if (rateLimitRemaining === '0') {
                    const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null
                    const resetTimeStr = resetTime ? resetTime.toLocaleTimeString() : 'soon'
                    throw new Error(`Rate limit exceeded. Reset at ${resetTimeStr}. Please wait before trying again.`)
                }
            }

            if (userRes.status === 401) {
                setError("Authentication Failed: Invalid or expired token. Please reconnect your GitHub account.")
                return
            }

            if (!userRes.ok) {
                const errorText = await userRes.text().catch(() => '')
                throw new Error(`GitHub API Error (${userRes.status}): ${userRes.statusText}. ${errorText}`)
            }

            const user = await userRes.json()
            setUserProfile(user)

            // Fetch Repos with retry logic
            let reposRes: Response
            try {
                reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100&type=all', {
                    headers: {
                        Authorization: `Bearer ${integrations.githubToken}`,
                        'X-GitHub-Api-Version': '2022-11-28',
                        'Accept': 'application/vnd.github.v3+json'
                    }
                })
            } catch (networkError) {
                throw new Error("Network error: Unable to fetch repositories")
            }

            // Handle rate limiting for repos
            if (reposRes.status === 403) {
                const rateLimitRemaining = reposRes.headers.get('X-RateLimit-Remaining')
                if (rateLimitRemaining === '0') {
                    throw new Error("Rate limit exceeded while fetching repositories")
                }
            }

            if (reposRes.status === 401) {
                setError("Authentication Failed: Token expired while fetching repositories")
                return
            }

            if (!reposRes.ok) {
                throw new Error(`Failed to fetch repositories: ${reposRes.status} ${reposRes.statusText}`)
            }

            const data = await reposRes.json()

            if (Array.isArray(data)) {
                setRepos(data)
                if (data.length === 0) {
                    setError("No repositories found. Your token may need 'repo' scope permissions.")
                }
            } else {
                throw new Error("Invalid response format: Expected array of repositories")
            }
        } catch (e: any) {
            console.error('GitHub fetch error:', e)
            
            // Retry logic for network errors
            if (retryCount < maxRetries && (e.message?.includes('Network error') || e.message?.includes('fetch'))) {
                console.log(`Retrying GitHub fetch (attempt ${retryCount + 1}/${maxRetries})...`)
                setTimeout(() => {
                    fetchData(retryCount + 1)
                }, retryDelay)
                return
            }
            
            setError(e.message || "Failed to fetch GitHub data. Please check your connection and token.")
        } finally {
            setLoading(false)
        }
    }

    const fetchRepoStats = async (repo: Repo) => {
        setRepoStats(null)
        try {
            const res = await fetch(`https://api.github.com/repos/${repo.full_name}/languages`, {
                headers: { 
                    Authorization: `Bearer ${integrations.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            if (res.ok) {
                const languages = await res.json()
                setRepoStats({ languages })
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
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
                <div className={cn("p-6 rounded-full", mode === 'dark' ? "bg-white/5" : "bg-gray-100")}>
                    <Github className="h-16 w-16 opacity-50" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold">Connect to GitHub</h2>
                    <p className="text-muted-foreground">
                        Access your entire codebase, track issues, and visualize your development velocity directly from your dashboard.
                    </p>
                </div>

                {/* Fallback Direct Input */}
                <div className="w-full max-w-sm space-y-4 pt-4">
                    <div className="flex gap-2">
                        <Input
                            type="password"
                            placeholder="Paste Personal Access Token (ghp_...)"
                            className="flex-1"
                            onChange={(e) => {
                                // Temporary local stash to allow immediate connection
                                const token = e.target.value
                                if (token.length > 10) {
                                    useSettingsStore.setState(state => ({
                                        integrations: { ...state.integrations, githubToken: token }
                                    }))
                                    // Force save to local storage immediately
                                    const currentSettings = JSON.parse(localStorage.getItem('invoiceforge-settings') || '{}')
                                    const newSettings = {
                                        ...currentSettings,
                                        integrations: {
                                            ...(currentSettings.integrations || {}),
                                            githubToken: token
                                        }
                                    }
                                    localStorage.setItem('invoiceforge-settings', JSON.stringify(newSettings))
                                }
                            }}
                        />
                        <Button onClick={() => window.location.reload()}>Connect</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Updates both Settings and Local Storage directly.
                    </p>
                </div>

                <div className="p-4 bg-yellow-500/10 text-yellow-600 rounded-lg text-sm border border-yellow-500/20">
                    Go to <strong>Settings {'>'} Integrations</strong> to manage your Personal Access Token.
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header Stats */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                    <Button variant="outline" size="sm" className="ml-auto" onClick={fetchData}>Retry</Button>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className={cn("p-4 rounded-xl border flex items-center gap-4", mode === 'dark' ? "bg-black/40 border-white/10" : "bg-white border-gray-200")}
                >
                    <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg"><Code className="h-6 w-6" /></div>
                    <div>
                        <p className="text-sm opacity-70">Total Repositories</p>
                        <p className="text-2xl font-bold">{repos.length}</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className={cn("p-4 rounded-xl border flex items-center gap-4", mode === 'dark' ? "bg-black/40 border-white/10" : "bg-white border-gray-200")}
                >
                    <div className="p-3 bg-purple-500/20 text-purple-500 rounded-lg"><Star className="h-6 w-6" /></div>
                    <div>
                        <p className="text-sm opacity-70">Total Stars</p>
                        <p className="text-2xl font-bold">{repos.reduce((acc, r) => acc + r.stargazers_count, 0)}</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className={cn("p-4 rounded-xl border flex items-center gap-4", mode === 'dark' ? "bg-black/40 border-white/10" : "bg-white border-gray-200")}
                >
                    <div className="p-3 bg-green-500/20 text-green-500 rounded-lg"><Activity className="h-6 w-6" /></div>
                    <div>
                        <p className="text-sm opacity-70">Public Activity</p>
                        <p className="text-2xl font-bold">{repos.filter(r => !r.private).length} Repos</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className={cn("p-4 rounded-xl border flex items-center gap-4", mode === 'dark' ? "bg-black/40 border-white/10" : "bg-white border-gray-200")}
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
                <div className={cn("flex-1 flex flex-col rounded-xl border overflow-hidden", mode === 'dark' ? "bg-black/40 border-white/10" : "bg-white border-gray-200")}>
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
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="p-3 rounded-lg border border-transparent bg-gray-100 dark:bg-white/5 animate-pulse">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded" />
                                        <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded" />
                                    </div>
                                    <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded mb-2" />
                                    <div className="flex gap-3">
                                        <div className="h-3 w-12 bg-gray-200 dark:bg-white/10 rounded" />
                                        <div className="h-3 w-12 bg-gray-200 dark:bg-white/10 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            filteredRepos.map(repo => (
                                <motion.div
                                    key={repo.id}
                                    layoutId={`repo-${repo.id}`}
                                    onClick={() => setSelectedRepo(repo)}
                                    className={cn(
                                        "p-3 rounded-lg border cursor-pointer transition-all group",
                                        selectedRepo?.id === repo.id
                                            ? "bg-blue-500/10 border-blue-500/50"
                                            : "border-transparent hover:bg-gray-100 dark:hover:bg-white/5 active:scale-[0.98]"
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
                            ))
                        )}
                    </div>
                </div>

                {/* Details Panel */}
                <div className={cn("w-96 rounded-xl border flex flex-col overflow-hidden", mode === 'dark' ? "bg-black/40 border-white/10" : "bg-white border-gray-200")}>
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
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setActiveTab('issues')}>
                                        <AlertCircle className="h-4 w-4 mr-2" /> Issues
                                    </Button>
                                </div>
                            </div>

                            <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700 flex gap-4">
                                {['overview', 'issues', 'activity', 'terminal'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={cn(
                                            "py-2 text-sm font-medium border-b-2 transition-colors capitalize",
                                            activeTab === tab
                                                ? "border-blue-500 text-blue-500"
                                                : "border-transparent text-gray-500 hover:text-gray-700"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-hidden relative">
                                {activeTab === 'overview' && (
                                    <div className="absolute inset-0 overflow-y-auto p-6 space-y-6">
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
                                )}

                                {activeTab === 'issues' && (
                                    <div className="absolute inset-0 overflow-y-auto p-6 space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center p-8 text-center text-gray-500 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                                <div>
                                                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm font-medium">Issue Tracking</p>
                                                    <p className="text-xs opacity-70 mt-1">
                                                        {selectedRepo.open_issues_count > 0
                                                            ? `${selectedRepo.open_issues_count} open issues found.`
                                                            : "No open issues."}
                                                    </p>
                                                    <Button size="sm" variant="link" className="mt-2" onClick={() => window.open(`${selectedRepo.html_url}/issues`, '_blank')}>
                                                        View on GitHub <ExternalLink className="h-3 w-3 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'activity' && (
                                    <div className="absolute inset-0 overflow-y-auto p-6 space-y-6">
                                        <div className="space-y-4">
                                            <div className="relative pl-4 border-l border-gray-200 dark:border-gray-700 space-y-6">
                                                <div className="relative">
                                                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-black" />
                                                    <p className="text-xs opacity-50 mb-1">Today</p>
                                                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg text-sm">
                                                        <span className="font-mono text-xs text-blue-500">feat:</span> Updated dashboard layout
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-white dark:ring-black" />
                                                    <p className="text-xs opacity-50 mb-1">Yesterday</p>
                                                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg text-sm">
                                                        <span className="font-mono text-xs text-purple-500">fix:</span> Resolved issue #42
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-center opacity-50 italic">
                                                Showing recent activity simulation. Connect webhook for real-time events.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'terminal' && (
                                    <div className="absolute inset-0 bg-black">
                                        <TerminalView repo={selectedRepo} />
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
