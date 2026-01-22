import React, { useState, useEffect } from 'react'
import { Quote, RefreshCw, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/services/utils'

const QUOTES = [
  { text: "The people who are crazy enough to think they can change the world are the ones who do.", author: "Steve Jobs" },
  { text: "Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.", author: "Mark Zuckerberg" },
  { text: "It's not about ideas. It's about making ideas happen.", author: "Scott Belsky" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Software is eating the world.", author: "Marc Andreessen" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Optimism is an occupational hazard of programming: feedback is the treatment.", author: "Kent Beck" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" }
]

const QUOTABLE_API = 'https://api.quotable.io/random'

interface QuoteData {
  text: string
  author: string
}

export const WidgetQuote = () => {
  const [quote, setQuote] = useState<QuoteData>(QUOTES[0])
  const [copied, setCopied] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getStoredQuoteDate = (): string | null => {
    return localStorage.getItem('daily-quote-date')
  }

  const getStoredQuote = (): QuoteData | null => {
    const stored = localStorage.getItem('daily-quote')
    return stored ? JSON.parse(stored) : null
  }

  const setStoredQuote = (quoteData: QuoteData) => {
    const today = new Date().toDateString()
    localStorage.setItem('daily-quote-date', today)
    localStorage.setItem('daily-quote', JSON.stringify(quoteData))
  }

  const shouldFetchNewQuote = (): boolean => {
    const lastDate = getStoredQuoteDate()
    const today = new Date().toDateString()
    return lastDate !== today
  }

  const fetchDailyQuote = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(QUOTABLE_API)
      if (!response.ok) throw new Error('Failed to fetch quote')
      const data = await response.json()
      const quoteData: QuoteData = {
        text: data.content,
        author: data.author
      }
      setQuote(quoteData)
      setStoredQuote(quoteData)
    } catch (error) {
      console.error('Failed to fetch daily quote:', error)
      // Fallback to stored quote or random static quote
      const stored = getStoredQuote()
      if (stored) {
        setQuote(stored)
      } else {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check if we need a new quote for today
    if (shouldFetchNewQuote()) {
      fetchDailyQuote()
    } else {
      // Use stored quote for today
      const stored = getStoredQuote()
      if (stored) {
        setQuote(stored)
      } else {
        // Fallback to random static quote
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
      }
    }
  }, [])

  const nextQuote = () => {
    setIsAnimating(true)
    setTimeout(() => {
      fetchDailyQuote()
      setIsAnimating(false)
    }, 300)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`"${quote.text}" - ${quote.author}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden relative group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Quote className="h-24 w-24 rotate-180" />
      </div>

      <div className="flex-1 flex flex-col justify-center p-6 relative z-10">
        <div 
          className={cn(
            "transition-all duration-300 transform",
            isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-white/50" />
            </div>
          ) : (
            <>
              <p className="text-xl md:text-2xl font-serif italic text-white/90 leading-relaxed">
                "{quote.text}"
              </p>
              <p className="mt-4 text-sm font-bold text-[var(--accent-primary)] uppercase tracking-widest">
                — {quote.author}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 flex justify-between items-center border-t border-white/5 bg-black/20">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={copyToClipboard}
          className="text-white/50 hover:text-white hover:bg-white/10"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={nextQuote}
          className="text-white/50 hover:text-white hover:bg-white/10 gap-2"
        >
          <span className="text-xs font-medium uppercase tracking-wider">New Inspiration</span>
          <RefreshCw className={cn("h-3 w-3", isAnimating && "animate-spin")} />
        </Button>
      </div>
    </div>
  )
}