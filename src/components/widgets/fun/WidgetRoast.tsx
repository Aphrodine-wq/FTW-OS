import React, { useState, useEffect } from 'react'
import { AppWidget } from '../AppWidget'
import { Flame, RefreshCw } from 'lucide-react'
import { cn } from '@/services/utils'
import { useThemeStore } from '@/stores/theme-store'

const INSULTS = [
    "I've seen better code in a fortune cookie.",
    "Your code is so messy, even the garbage collector is confused.",
    "Is this code or a cry for help?",
    "You write code like you're paid by the bug.",
    "This looks like it was written by a drunk AI.",
    "Your commit messages are the only funny thing about this project.",
    "I bet you test in production.",
    "This function is so long, it has its own zip code.",
    "You should comment your code, not your life choices.",
    "Did you copy this from Stack Overflow or a crime scene?"
]

export function WidgetRoast({ id, onRemove }: { id?: string, onRemove?: () => void }) {
    const [insult, setInsult] = useState(INSULTS[0])
    const { mode } = useThemeStore()

    const roast = () => {
        const random = INSULTS[Math.floor(Math.random() * INSULTS.length)]
        setInsult(random)
    }

    return (
        <AppWidget title="Daily Roast" icon={Flame} id={id || 'roast'} onRemove={onRemove}>
            <div className="h-full flex flex-col items-center justify-center p-4 text-center relative group">
                <p className={cn("text-lg font-bold italic leading-tight transition-all", mode === 'glass' ? "text-red-200" : "text-red-600")}>
                    "{insult}"
                </p>
                <button 
                    onClick={roast}
                    className="absolute bottom-2 right-2 p-2 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <RefreshCw className="h-4 w-4" />
                </button>
            </div>
        </AppWidget>
    )
}
