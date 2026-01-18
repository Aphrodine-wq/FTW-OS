import React, { useState, useEffect } from 'react'
import { AppWidget } from '@/components/widgets/core/AppWidget'
import { Telescope, RefreshCw } from 'lucide-react'
import { cn } from '@/services/utils'

interface NasaAPOD {
    title: string
    url: string
    hdurl?: string
    explanation: string
    date: string
    media_type: string
}

export function WidgetNasa({ id, onRemove }: { id?: string, onRemove?: () => void }) {
    const [data, setData] = useState<NasaAPOD | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const fetchAPOD = async () => {
        try {
            setLoading(true)
            setError(false)

            // Using NASA APOD API with DEMO_KEY (rate limited but works for testing)
            // Users can get their own API key from https://api.nasa.gov/
            const response = await fetch(
                'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY'
            )

            if (!response.ok) throw new Error('Failed to fetch')

            const apodData = await response.json()
            setData(apodData)
            setError(false)
        } catch (err) {
            console.error('NASA APOD fetch error:', err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAPOD()
    }, [])

    if (loading && !data) {
        return (
            <AppWidget title="NASA APOD" icon={Telescope} id={id || 'nasa'} onRemove={onRemove}>
                <div className="h-full w-full flex items-center justify-center bg-black/5">
                    <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                        <p className="text-xs text-slate-500">Loading today's astronomy picture...</p>
                    </div>
                </div>
            </AppWidget>
        )
    }

    if (error && !data) {
        return (
            <AppWidget title="NASA APOD" icon={Telescope} id={id || 'nasa'} onRemove={onRemove}>
                <div className="h-full w-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <p className="text-xs text-red-500 font-medium">Failed to load NASA APOD</p>
                    <button
                        onClick={fetchAPOD}
                        className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </AppWidget>
        )
    }

    return (
        <AppWidget title="NASA APOD" icon={Telescope} id={id || 'nasa'} onRemove={onRemove}>
            <div className="h-full w-full relative group overflow-hidden">
                {data?.media_type === 'image' ? (
                    <>
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${data.url})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <h4 className="font-bold text-sm truncate mb-1">{data.title}</h4>
                            <p className="text-[10px] opacity-80 line-clamp-2 leading-relaxed">
                                {data.explanation}
                            </p>
                            <p className="text-[9px] opacity-60 mt-1">{data.date}</p>
                        </div>
                    </>
                ) : (
                    <div className="h-full w-full flex items-center justify-center p-4 text-center">
                        <div>
                            <h4 className="font-bold text-sm mb-2">{data?.title}</h4>
                            <p className="text-xs text-slate-600">Today's APOD is a video. Visit NASA's website to view it.</p>
                        </div>
                    </div>
                )}
            </div>
        </AppWidget>
    )
}
