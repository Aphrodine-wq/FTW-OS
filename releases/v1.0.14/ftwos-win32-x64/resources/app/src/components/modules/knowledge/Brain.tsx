import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, Plus, Search, MoreHorizontal, 
  FileText, Hash, List, Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/services/utils'

const NOTES = [
  { id: '1', title: 'Project Ideas 2026', preview: 'AI Agent for code reviews...', tag: 'Ideas', updated: '2h ago' },
  { id: '2', title: 'Meeting Notes: Client X', preview: 'Discussed timeline and budget...', tag: 'Work', updated: 'Yesterday' },
  { id: '3', title: 'React Performance Tips', preview: 'Use useMemo sparingly...', tag: 'Learning', updated: '3 days ago' },
]

export function Brain() {
  const [activeNote, setActiveNote] = useState<string | null>(null)

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Second Brain</h2>
          <p className="text-muted-foreground">Personal Knowledge Management</p>
        </div>
        <Button className="gap-2 bg-pink-600 hover:bg-pink-700 text-white">
            <Plus className="h-4 w-4" /> New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Sidebar */}
        <Card className="lg:col-span-1 flex flex-col h-full">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search notes..." className="pl-9" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {NOTES.map(note => (
                    <div 
                        key={note.id}
                        onClick={() => setActiveNote(note.id)}
                        className={cn(
                            "p-3 rounded-lg cursor-pointer transition-colors",
                            activeNote === note.id ? "bg-slate-100" : "hover:bg-slate-50"
                        )}
                    >
                        <h4 className="font-bold text-sm truncate">{note.title}</h4>
                        <p className="text-xs text-slate-500 truncate mt-1">{note.preview}</p>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                {note.tag}
                            </span>
                            <span className="text-[10px] text-slate-400">{note.updated}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>

        {/* Editor Area */}
        <Card className="lg:col-span-3 flex flex-col h-full">
            {activeNote ? (
                <>
                    <div className="p-4 border-b flex justify-between items-center">
                        <Input 
                            value={NOTES.find(n => n.id === activeNote)?.title} 
                            className="border-none shadow-none text-xl font-bold px-0 focus-visible:ring-0"
                        />
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5 text-slate-400" />
                        </Button>
                    </div>
                    <div className="flex-1 p-6 bg-slate-50/30">
                        <div className="max-w-2xl mx-auto space-y-4">
                            <p className="text-slate-400 italic">Start typing...</p>
                            {/* Mock Block Editor Controls */}
                            <div className="flex gap-2 p-2 bg-white border rounded-lg shadow-sm w-fit opacity-50 hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8"><FileText className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Hash className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><List className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><ImageIcon className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <BookOpen className="h-16 w-16 mb-4 opacity-20" />
                    <p>Select a note to view</p>
                </div>
            )}
        </Card>
      </div>
    </div>
  )
}
