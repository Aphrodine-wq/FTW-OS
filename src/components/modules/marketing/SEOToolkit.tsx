import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, Globe, AlertTriangle, CheckCircle, 
  ArrowUp, ArrowDown, ExternalLink, RefreshCw
} from 'lucide-react'
import { cn } from '@/services/utils'

const KEYWORDS = [
  { keyword: 'freelance os', rank: 3, volume: '1.2k', diff: 'Medium', url: '/features/os' },
  { keyword: 'invoice generator', rank: 12, volume: '45k', diff: 'Hard', url: '/tools/invoice' },
  { keyword: 'project management for devs', rank: 5, volume: '800', diff: 'Easy', url: '/solutions/devs' },
  { keyword: 'react dashboard template', rank: 8, volume: '12k', diff: 'Hard', url: '/' },
]

export function SEOToolkit() {
  const [siteUrl, setSiteUrl] = useState('https://ftw-os.com')
  const [analyzing, setAnalyzing] = useState(false)

  const handleAudit = () => {
    setAnalyzing(true)
    setTimeout(() => setAnalyzing(false), 2000)
  }

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SEO Toolkit</h2>
          <p className="text-muted-foreground">Monitor rankings and site health</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Audit Card */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" /> Site Audit
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-2">
                    <Input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} className="font-mono text-sm" />
                    <Button onClick={handleAudit} disabled={analyzing}>
                        {analyzing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                        {analyzing ? 'Analyzing...' : 'Run Audit'}
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                        <div className="text-3xl font-bold text-green-600">92</div>
                        <div className="text-xs text-green-800 font-medium mt-1">Health Score</div>
                    </div>
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                        <div className="text-3xl font-bold text-red-600">3</div>
                        <div className="text-xs text-red-800 font-medium mt-1">Critical Errors</div>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                        <div className="text-3xl font-bold text-yellow-600">12</div>
                        <div className="text-xs text-yellow-800 font-medium mt-1">Warnings</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-medium">Top Issues</h4>
                    {[
                        { type: 'error', msg: '3 pages have duplicate title tags' },
                        { type: 'error', msg: 'Homepage missing H1 tag' },
                        { type: 'warning', msg: '5 images missing alt text' },
                        { type: 'warning', msg: 'Low text-to-HTML ratio on /blog' },
                    ].map((issue, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-slate-50">
                            {issue.type === 'error' 
                                ? <AlertTriangle className="h-4 w-4 text-red-500" /> 
                                : <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            }
                            <span className="text-sm text-slate-700">{issue.msg}</span>
                            <Button variant="ghost" size="sm" className="ml-auto text-xs h-6">Fix</Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Domain Authority</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">42</div>
                    <p className="text-xs text-muted-foreground mt-1">Top 15% of niche</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Backlinks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">1.2k</div>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                        <ArrowUp className="h-3 w-3 mr-1" /> +45 this month
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Keyword Tracker */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-500" /> Rank Tracker
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-left">
                        <tr>
                            <th className="p-3 font-medium">Keyword</th>
                            <th className="p-3 font-medium">Position</th>
                            <th className="p-3 font-medium">Volume</th>
                            <th className="p-3 font-medium">Difficulty</th>
                            <th className="p-3 font-medium">URL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {KEYWORDS.map((k, i) => (
                            <tr key={i} className="group hover:bg-slate-50">
                                <td className="p-3 font-medium">{k.keyword}</td>
                                <td className="p-3">
                                    <div className="flex items-center gap-1">
                                        <span className={cn(
                                            "font-bold",
                                            k.rank <= 3 ? "text-green-600" : k.rank <= 10 ? "text-blue-600" : "text-slate-600"
                                        )}>#{k.rank}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-slate-500">{k.volume}</td>
                                <td className="p-3">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                        k.diff === 'Easy' ? "bg-green-100 text-green-700" :
                                        k.diff === 'Medium' ? "bg-yellow-100 text-yellow-700" :
                                        "bg-red-100 text-red-700"
                                    )}>{k.diff}</span>
                                </td>
                                <td className="p-3 text-slate-400 font-mono text-xs flex items-center gap-1">
                                    {k.url} <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
