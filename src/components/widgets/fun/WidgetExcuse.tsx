import React, { useState } from 'react'
import { AppWidget } from '@/components/modules/core/dashboard/widgets/AppWidget'
import { Quote, Copy } from 'lucide-react'
import { cn } from '@/services/utils'
import { useThemeStore } from '@/stores/theme-store'
import { useToast } from '@/components/ui/use-toast'

const EXCUSES = [
    "It works on my machine.",
    "I didn't anticipate that user behavior.",
    "It's a feature, not a bug.",
    "The API documentation was outdated.",
    "I thought you signed off on that?",
    "It must be a caching issue.",
    "The third-party library is broken.",
    "I haven't had my coffee yet.",
    "That was a temporary fix.",
    "The universe is not aligned correctly."
]

export function WidgetExcuse({ id, onRemove }: { id?: string, onRemove?: () => void }) {
    const [excuse, setExcuse] = useState(EXCUSES[0])
    const { mode } = useThemeStore()
    const { toast } = useToast()

    const generate = () => {
        const random = EXCUSES[Math.floor(Math.random() * EXCUSES.length)]
        setExcuse(random)
    }

    const copy = () => {
        navigator.clipboard.writeText(excuse)
        toast({ title: "Copied", description: "Excuse ready for deployment." })
    }

    return (
        <AppWidget title="Excuse Gen" icon={Quote} id={id || 'excuse'} onRemove={onRemove}>
            <div className="h-full flex flex-col items-center justify-center p-4 text-center relative cursor-pointer" onClick={generate}>
                <p className={cn("text-md font-medium leading-relaxed", mode === 'glass' ? "text-white" : "text-gray-800")}>
                    "{excuse}"
                </p>
                <p className="text-[10px] mt-2 opacity-50 uppercase tracking-widest">Click to Regenerate</p>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); copy() }}
                    className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-white/10 opacity-50 hover:opacity-100 transition-opacity"
                >
                    <Copy className="h-3 w-3" />
                </button>
            </div>
        </AppWidget>
    )
}
