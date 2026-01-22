import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Mic, MicOff, Command, Loader2
} from 'lucide-react'
import { cn } from '@/services/utils'

export function VoiceCommand() {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')

  const toggleListen = () => {
    if (listening) {
        setListening(false)
        setTranscript('')
    } else {
        setListening(true)
        // Mock listening
        setTimeout(() => setTranscript("Create invoice for Acme Corp..."), 1000)
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="relative">
            {listening && (
                <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20" />
            )}
            <Button 
                size="icon" 
                className={cn(
                    "h-24 w-24 rounded-full transition-all duration-300 shadow-xl",
                    listening ? "bg-red-500 hover:bg-red-600" : "bg-purple-600 hover:bg-purple-700"
                )}
                onClick={toggleListen}
            >
                {listening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
            </Button>
        </div>

        <div className="mt-8 text-center space-y-2">
            <h2 className="text-2xl font-bold">
                {listening ? 'Listening...' : 'Tap to Speak'}
            </h2>
            <p className="text-slate-500">
                {transcript || "Try saying \"Check my emails\" or \"New Project\""}
            </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4">
            {['Create Invoice', 'Search Docs', 'Toggle Dark Mode', 'Deploy App'].map(cmd => (
                <div key={cmd} className="p-3 bg-slate-50 border rounded-lg text-sm text-slate-600 flex items-center gap-2 cursor-pointer hover:bg-slate-100">
                    <Command className="h-3 w-3" /> {cmd}
                </div>
            ))}
        </div>
    </div>
  )
}
