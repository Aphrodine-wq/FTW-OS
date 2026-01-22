import React from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/services/utils'
import { SyncStatus } from '../sync/SyncStatus'

const QUOTABLE_API = 'https://api.quotable.io/random'
const FALLBACK_QUOTE = "Efficiency is doing things right; effectiveness is doing the right things."

interface QuoteData {
  text: string
  author: string
}

export function HeaderWidgets() {
  const [time, setTime] = React.useState(new Date())
  const [quote, setQuote] = React.useState<QuoteData>({ text: FALLBACK_QUOTE, author: "Peter Drucker" })
  const { mode } = useThemeStore()

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  React.useEffect(() => {
    const getStoredQuoteDate = (): string | null => {
      return localStorage.getItem('daily-quote-date')
    }

    const getStoredQuote = (): QuoteData | null => {
      const stored = localStorage.getItem('daily-quote')
      return stored ? JSON.parse(stored) : null
    }

    const shouldFetchNewQuote = (): boolean => {
      const lastDate = getStoredQuoteDate()
      const today = new Date().toDateString()
      return lastDate !== today
    }

    const fetchDailyQuote = async () => {
      try {
        const response = await fetch(QUOTABLE_API)
        if (!response.ok) throw new Error('Failed to fetch quote')
        const data = await response.json()
        const quoteData: QuoteData = {
          text: data.content,
          author: data.author
        }
        setQuote(quoteData)
      } catch (error) {
        console.error('Failed to fetch daily quote:', error)
        const stored = getStoredQuote()
        if (stored) {
          setQuote(stored)
        }
      }
    }

    if (shouldFetchNewQuote()) {
      fetchDailyQuote()
    } else {
      const stored = getStoredQuote()
      if (stored) {
        setQuote(stored)
      }
    }
  }, [])

  return (
    <div className="flex flex-col md:flex-row items-end justify-between gap-6 relative">
      {/* Clock */}
      <div className="flex flex-col relative z-10">
        <h1 className={cn(
          "text-7xl md:text-9xl font-light tracking-tighter leading-none transition-colors duration-500",
          mode === 'dark' ? "text-white drop-shadow-2xl" : "text-slate-900"
        )}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </h1>
        <p className={cn(
          "text-2xl font-light tracking-widest uppercase ml-2 opacity-80",
          mode === 'dark' ? "text-white" : "text-slate-500"
        )}>
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Quote / Status */}
      <div className="hidden md:block max-w-2xl text-right relative z-10">
        <div className="flex justify-end mb-4">
            <SyncStatus />
        </div>
        <blockquote className={cn(
          "text-xl md:text-2xl font-light italic mb-4 transition-colors duration-500 leading-relaxed",
          mode === 'dark' ? "text-white/90 drop-shadow-md" : "text-slate-700"
        )}>
          "{quote.text}"
        </blockquote>
        <div className={cn(
          "h-1.5 w-24 ml-auto rounded-full",
          mode === 'dark' ? "bg-white/40 shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "bg-slate-400"
        )} />
      </div>
    </div>
  )
}
