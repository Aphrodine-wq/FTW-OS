import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Bot, Send, Search, FileText, Sparkles, 
  ArrowRight, Loader2
} from 'lucide-react'
import { cn } from '@/services/utils'

export function ResearchAgent() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | { summary: string, sources: string[] }>(null)

  const handleSearch = () => {
    if (!query) return
    setLoading(true)
    // Mock API call
    setTimeout(() => {
        setLoading(false)
        setResult({
            summary: "Based on recent documentation, the new React Compiler (React Forget) automatically optimizes re-renders by memoizing values without explicit useMemo/useCallback hooks. It's currently in beta and requires a Babel plugin.",
            sources: ['react.dev/blog/compiler', 'github.com/facebook/react', 'youtube.com/react-conf']
        })
    }, 2000)
  }

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Research Agent</h2>
          <p className="text-muted-foreground">Autonomous web browsing & summarization</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full space-y-8 mt-8">
        <div className="flex gap-2">
            <Input 
                value={query} 
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask me to research anything..." 
                className="h-12 text-lg shadow-sm"
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Button size="lg" className="h-12 w-12 p-0 bg-indigo-600 hover:bg-indigo-700" onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            </Button>
        </div>

        {result && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg">Analysis Result</h3>
                            <p className="leading-relaxed text-slate-700">{result.summary}</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t">
                        <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Sources</h4>
                        <div className="space-y-2">
                            {result.sources.map((src, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer">
                                    <GlobeIcon className="h-3 w-3" /> {src}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {!result && !loading && (
            <div className="grid grid-cols-2 gap-4">
                {['Latest Electron security patches', 'Competitor analysis for "Task App"', 'Summarize Next.js 14 release', 'Find freelance tax deductions'].map(q => (
                    <Button key={q} variant="outline" className="justify-start h-auto py-3 px-4" onClick={() => { setQuery(q); }}>
                        <Search className="h-4 w-4 mr-2 text-slate-400" /> {q}
                    </Button>
                ))}
            </div>
        )}
      </div>
    </div>
  )
}

function GlobeIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
}
