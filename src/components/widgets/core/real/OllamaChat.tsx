import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send, Terminal, Bot, User, RefreshCw, Settings2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'

import { useSettingsStore } from '@/stores/settings-store'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface OllamaModel {
    name: string
    modified_at: string
    size: number
}

const PERSONAS = {
    'assistant': 'You are a helpful AI assistant.',
    'coder': 'You are an expert senior software engineer. Provide clean, efficient code.',
    'pirate': 'You are a pirate captain. Answer everything with pirate slang.',
    'analyst': 'You are a data analyst. Be precise, factual, and analytical.'
}

export function OllamaChat() {
  const { integrations } = useSettingsStore()
  const ENDPOINT = integrations?.ollamaEndpoint || 'http://localhost:11434'
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [models, setModels] = useState<OllamaModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedPersona, setSelectedPersona] = useState<keyof typeof PERSONAS>('assistant')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [documents, setDocuments] = useState<{ name: string, content: string }[]>([])
  const [ingestionNotice, setIngestionNotice] = useState<string>('')

  const checkConnection = async () => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(`${ENDPOINT}/api/tags`, { signal: controller.signal })
      clearTimeout(timeout)
      if (res.ok) {
        setIsConnected(true)
        const data = await res.json()
        setModels(data.models || [])
        if (data.models?.length > 0 && !selectedModel) {
            setSelectedModel(data.models[0].name)
        }
      } else {
        setIsConnected(false)
      }
    } catch (e) {
      setIsConnected(false)
    }
  }

  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const contextMessages = messages.slice(-30).map(m => ({
          role: m.role,
          content: m.content
      }))
      const searchTerms = input.toLowerCase().split(/\s+/).filter(t => t.length > 1)
      const retrieved: string[] = []
      for (const doc of documents) {
        const lines = doc.content.split(/\n+/)
        const scored = lines.map(line => {
          const text = line.toLowerCase()
          const score = searchTerms.reduce((acc, term) => acc + (text.includes(term) ? 1 : 0), 0)
          return { line, score }
        }).filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(x => x.line)
        retrieved.push(...scored)
      }
      const ragContext = retrieved.slice(0, 6).join('\n')

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      const response = await fetch(`${ENDPOINT}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel || 'llama3',
          messages: [
            { role: 'system', content: PERSONAS[selectedPersona] },
            ...(ragContext ? [{ role: 'system', content: `Use this context if relevant:\n${ragContext}` }] : []),
            ...contextMessages,
            userMsg
          ],
          stream: false 
        }),
        signal: controller.signal
      })
      clearTimeout(timeout)

      const data = await response.json()
      
      // Handle both /api/generate and /api/chat formats just in case
      const replyContent = data.message?.content || data.response 
      
      const assistantMsg: Message = { role: 'assistant', content: replyContent }
      setMessages(prev => [...prev, assistantMsg])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not connect to Ollama.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col border-0 shadow-none bg-transparent">
      <CardHeader className="pb-2 px-4 pt-4 border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Bot className={isConnected ? "text-green-500" : "text-red-500"} />
                <CardTitle className="text-sm font-medium">Local AI</CardTitle>
            </div>
            <div className="flex items-center gap-2">
                <Select value={selectedPersona} onValueChange={(v: any) => setSelectedPersona(v)}>
                    <SelectTrigger className="w-[100px] h-7 text-xs">
                        <SelectValue placeholder="Persona" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(PERSONAS).map(p => (
                            <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-[140px] h-7 text-xs">
                        <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                        {models.length === 0 ? (
                            <SelectItem value="loading" disabled>Loading models...</SelectItem>
                        ) : (
                            models.map(m => (
                                <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={checkConnection}>
                    <RefreshCw className={`h-3 w-3 ${!isConnected ? 'text-red-500' : ''}`} />
                </Button>
                
                <label className="text-xs">
                  <input 
                    type="file" 
                    accept=".txt,.md,.html" 
                    multiple 
                    style={{ display: 'none' }} 
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || [])
                      const loaded: { name: string, content: string }[] = []
                      for (const f of files) {
                        try {
                          const text = await f.text()
                          loaded.push({ name: f.name, content: text })
                        } catch {
                          setIngestionNotice(`Could not read ${f.name}`)
                        }
                      }
                      if (loaded.length > 0) {
                        setDocuments(prev => [...prev, ...loaded])
                        setIngestionNotice(`${loaded.length} document(s) added`)
                      }
                      e.currentTarget.value = ''
                    }}
                  />
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement)
                    input?.click()
                  }}>
                    Add Docs
                  </Button>
                </label>
            </div>
        </div>
        {!isConnected && (
             <div className="text-[10px] text-red-500 bg-red-500/10 p-1 px-2 rounded mt-1 text-center">
                Ollama not detected on port 11434
             </div>
        )}
        {ingestionNotice && (
          <div className="text-[10px] text-emerald-600 bg-emerald-500/10 p-1 px-2 rounded mt-1 text-center">
            {ingestionNotice}
          </div>
        )}
      </CardHeader>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8 space-y-2">
                    <Bot className="h-8 w-8 mx-auto opacity-50" />
                    <p>I'm ready to help. Select a model and start chatting.</p>
                </div>
            )}
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Bot className="h-3 w-3 text-primary" />
                        </div>
                    )}
                    <div className={`rounded-lg p-3 text-sm max-w-[80%] ${
                        msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                        <ReactMarkdown className="prose dark:prose-invert text-xs">
                            {msg.content}
                        </ReactMarkdown>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                    </div>
                </div>
            )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <form 
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
            <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isConnected ? "Ask anything..." : "Connecting to Ollama..."}
                disabled={!isConnected || isLoading}
                className="flex-1 bg-background"
            />
            <Button type="submit" size="icon" disabled={!isConnected || isLoading}>
                <Send className="h-4 w-4" />
            </Button>
        </form>
      </div>
    </Card>
  )
}
