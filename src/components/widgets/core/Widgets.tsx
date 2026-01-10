import { Play, SkipForward, SkipBack, Disc, Gamepad2, Trophy, TrendingUp, TrendingDown, Bitcoin, CloudRain, Wind, GitCommit, GitBranch, Coffee, Plus, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function SpotifyWidget() {
  return (
    <Card className="bg-gradient-to-br from-green-900 to-black text-white border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center"><Disc className="mr-2 h-4 w-4 animate-spin-slow" /> Now Playing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-white/10 rounded-md flex items-center justify-center text-2xl">🎵</div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm truncate">Deep Focus Beats</p>
            <p className="text-xs text-white/70">Lofi Girl</p>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-4">
          <SkipBack className="h-5 w-5 hover:text-green-400 cursor-pointer" />
          <Play className="h-5 w-5 hover:text-green-400 cursor-pointer" />
          <SkipForward className="h-5 w-5 hover:text-green-400 cursor-pointer" />
        </div>
      </CardContent>
    </Card>
  )
}

export function SteamWidget() {
  return (
    <Card className="bg-gradient-to-br from-blue-900 to-slate-900 text-white border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center"><Gamepad2 className="mr-2 h-4 w-4" /> Steam Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/70">Recently Played</span>
          <span className="text-xs font-bold text-green-400">Online</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-500/20 rounded flex items-center justify-center text-xl">🚀</div>
          <div className="flex-1">
            <p className="text-sm font-bold">Starfield</p>
            <p className="text-xs text-white/50">2.4 hrs last 2 weeks</p>
          </div>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CryptoWidget() {
  return (
    <Card className="bg-slate-900 text-white border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center"><Bitcoin className="mr-2 h-4 w-4 text-orange-500" /> Market Watch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Bitcoin</span>
          <div className="text-right">
            <p className="text-sm font-bold">$42,350.20</p>
            <p className="text-xs text-green-400 flex items-center justify-end"><TrendingUp className="h-3 w-3 mr-1" /> +2.4%</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Ethereum</span>
          <div className="text-right">
            <p className="text-sm font-bold">$2,240.80</p>
            <p className="text-xs text-red-400 flex items-center justify-end"><TrendingDown className="h-3 w-3 mr-1" /> -0.8%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function WeatherWidget() {
  return (
    <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center"><CloudRain className="mr-2 h-4 w-4" /> Weather</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div>
          <p className="text-3xl font-bold">72°F</p>
          <p className="text-xs text-white/80">San Francisco, CA</p>
        </div>
        <div className="text-right">
          <CloudRain className="h-8 w-8 mb-1" />
          <p className="text-xs text-white/80 flex items-center justify-end"><Wind className="h-3 w-3 mr-1" /> 12mph</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function GithubWidget() {
  return (
    <Card className="bg-zinc-900 text-white border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center"><GitCommit className="mr-2 h-4 w-4" /> Contributions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 h-8 items-end mb-2">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`flex-1 rounded-sm ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-zinc-700'}`} style={{ height: `${Math.random() * 100}%` }}></div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-zinc-400">
          <span>32 commits today</span>
          <span className="flex items-center"><GitBranch className="h-3 w-3 mr-1" /> main</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function CaffeineWidget() {
  const [count, setCount] = useState(2)

  return (
    <Card className="bg-amber-100 text-amber-900 border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center"><Coffee className="mr-2 h-4 w-4" /> Caffeine Tracker</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{count} cups</p>
          <p className="text-xs text-amber-700">~{count * 95}mg caffeine</p>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-amber-200" onClick={() => setCount(Math.max(0, count - 1))}><Minus className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-amber-200" onClick={() => setCount(count + 1)}><Plus className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  )
}
