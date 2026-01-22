import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Code2, Copy, Plus, Search, 
  Terminal, Hash, FileJson
} from 'lucide-react'
import { cn } from '@/services/utils'

const SNIPPETS = [
  { id: '1', title: 'React Hook Form Wrapper', lang: 'typescript', tags: ['react', 'forms'], code: 'export function useForm<T>(...) { ... }' },
  { id: '2', title: 'Docker Compose Setup', lang: 'yaml', tags: ['devops', 'docker'], code: 'version: "3.8"\nservices:\n  web: ...' },
  { id: '3', title: 'Utility: Date Format', lang: 'javascript', tags: ['utils'], code: 'export const formatDate = (d) => ...' },
]

export function SnippetLibrary() {
  const [activeSnippet, setActiveSnippet] = useState<string | null>(null)

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Snippet Library</h2>
          <p className="text-muted-foreground">Reusable code blocks</p>
        </div>
        <Button className="gap-2 bg-slate-900 text-white">
            <Plus className="h-4 w-4" /> New Snippet
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* List */}
        <Card className="flex flex-col h-full">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search snippets..." className="pl-9" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {SNIPPETS.map(snip => (
                    <div 
                        key={snip.id}
                        onClick={() => setActiveSnippet(snip.id)}
                        className={cn(
                            "p-3 rounded-lg cursor-pointer transition-colors border",
                            activeSnippet === snip.id ? "bg-slate-100 border-slate-300" : "hover:bg-slate-50 border-transparent"
                        )}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm truncate">{snip.title}</h4>
                            {snip.lang === 'typescript' && <Code2 className="h-4 w-4 text-blue-500" />}
                            {snip.lang === 'yaml' && <FileJson className="h-4 w-4 text-red-500" />}
                            {snip.lang === 'javascript' && <Hash className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {snip.tags.map(t => (
                                <span key={t} className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">#{t}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Card>

        {/* Preview */}
        <Card className="lg:col-span-2 flex flex-col h-full bg-[#1e1e1e] text-white border-slate-800">
            {activeSnippet ? (
                <>
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-slate-800 rounded">
                                <Terminal className="h-4 w-4 text-slate-400" />
                            </div>
                            <span className="font-mono text-sm">{SNIPPETS.find(s => s.id === activeSnippet)?.title}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                    </div>
                    <div className="flex-1 p-6 overflow-auto font-mono text-sm">
                        <pre className="text-green-400">
                            {SNIPPETS.find(s => s.id === activeSnippet)?.code}
                        </pre>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <Code2 className="h-16 w-16 mb-4 opacity-20" />
                    <p>Select a snippet to view code</p>
                </div>
            )}
        </Card>
      </div>
    </div>
  )
}
